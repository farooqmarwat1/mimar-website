const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// A tiny in-memory Firestore: just what src/lib/leads.ts uses.
const DELETE = { __delete: true };
const FieldValue = { delete: () => DELETE, arrayUnion: (...items) => ({ __union: items }) };

function fakeDb() {
  const docs = new Map();
  let next = 1;
  const snapshot = id => ({ id, exists: docs.has(id), data: () => structuredClone(docs.get(id)) });
  const query = filter => ({
    select: () => query(filter),
    get: async () => ({ docs: [...docs.keys()].filter(id => filter(docs.get(id))).map(snapshot) }),
  });
  const collection = {
    add: async data => {
      const id = `lead${next++}`;
      docs.set(id, structuredClone(data));
      return { id };
    },
    select: () => query(() => true),
    where: (field, _op, value) => query(data => data[field] === value),
    doc: id => ({
      get: async () => snapshot(id),
      delete: async () => void docs.delete(id),
      update: async patch => {
        const data = docs.get(id);
        for (const [key, value] of Object.entries(patch)) {
          if (value === DELETE) delete data[key];
          else if (value && value.__union) data[key] = [...(data[key] ?? []), ...value.__union];
          else data[key] = value;
        }
      },
    }),
  };
  return { collection: () => collection, docs };
}

const mocks = db => ({
  '@/lib/firebase/admin': { adminDb: () => db, isFirebaseConfigured: true },
  'firebase-admin/firestore': { FieldValue },
});

const person = { firstName: 'Sara', lastName: 'Khan', email: 'Sara@Example.com', message: 'Need a villa design.' };

test('createLead stores the enquiry as a new lead with a first timeline entry', async () => {
  const db = fakeDb();
  const leads = load('src/lib/leads.ts', mocks(db));
  const id = await leads.createLead({ ...person, phone: '', service: 'Architecture', lang: 'ar' });
  const lead = await leads.getLeadAdmin(id);
  assert.equal(lead.status, 'new');
  assert.equal(lead.priority, 'normal');
  assert.equal(lead.emailLower, 'sara@example.com');
  assert.equal(lead.lang, 'ar');
  assert.equal(lead.phone, undefined);
  assert.equal(lead.activities.length, 1);
  assert.equal(lead.activities[0].by, 'website');
});

test('setMailStatus records delivery without touching the timeline', async () => {
  const db = fakeDb();
  const leads = load('src/lib/leads.ts', mocks(db));
  const id = await leads.createLead(person);
  await leads.setMailStatus(id, 'failed');
  const lead = await leads.getLeadAdmin(id);
  assert.equal(lead.mailStatus, 'failed');
  assert.equal(lead.activities.length, 1);
});

test('updateLead logs status, owner and follow-up changes and stamps the first contact once', async () => {
  const db = fakeDb();
  const leads = load('src/lib/leads.ts', mocks(db));
  const id = await leads.createLead(person);

  assert.equal(await leads.updateLead(id, { status: 'contacted', assignee: 'a@mim.archi', nextFollowUpAt: '2026-11-02' }, 'boss@mim.archi'), true);
  let lead = await leads.getLeadAdmin(id);
  assert.equal(lead.status, 'contacted');
  assert.equal(lead.assignee, 'a@mim.archi');
  assert.equal(lead.updatedBy, 'boss@mim.archi');
  assert.ok(lead.firstContactedAt);
  assert.deepEqual(lead.activities.map(entry => entry.type).slice(1).sort(), ['assignment', 'followup', 'status']);

  const first = lead.firstContactedAt;
  await leads.updateLead(id, { status: 'qualified', assignee: null, nextFollowUpAt: null }, 'boss@mim.archi');
  lead = await leads.getLeadAdmin(id);
  assert.equal(lead.firstContactedAt, first);
  assert.equal(lead.assignee, undefined);
  assert.equal(lead.nextFollowUpAt, undefined);
});

test('updateLead writes nothing to the timeline when nothing changed, and reports a missing lead', async () => {
  const db = fakeDb();
  const leads = load('src/lib/leads.ts', mocks(db));
  const id = await leads.createLead(person);
  await leads.updateLead(id, { status: 'new', priority: 'normal', tags: ['villa'] }, 'a@mim.archi');
  const lead = await leads.getLeadAdmin(id);
  assert.equal(lead.activities.length, 1);
  assert.deepEqual(lead.tags, ['villa']);
  assert.equal(await leads.updateLead('missing', { status: 'won' }, 'a@mim.archi'), false);
});

test('logging a call moves a new lead to contacted; a note does not', async () => {
  const db = fakeDb();
  const leads = load('src/lib/leads.ts', mocks(db));
  const id = await leads.createLead(person);

  await leads.addActivity(id, { type: 'note', text: 'Looks promising' }, 'a@mim.archi');
  let lead = await leads.getLeadAdmin(id);
  assert.equal(lead.status, 'new');
  assert.equal(lead.lastContactedAt, undefined);

  await leads.addActivity(id, { type: 'call', text: 'Spoke for ten minutes' }, 'a@mim.archi');
  lead = await leads.getLeadAdmin(id);
  assert.equal(lead.status, 'contacted');
  assert.ok(lead.lastContactedAt);
  assert.ok(lead.firstContactedAt);
  assert.equal(lead.activities.filter(entry => entry.type === 'status').length, 1);
});

test('getRelatedByEmail finds repeat enquiries from the same address, ignoring case', async () => {
  const db = fakeDb();
  const leads = load('src/lib/leads.ts', mocks(db));
  const a = await leads.createLead(person);
  const b = await leads.createLead({ ...person, email: 'sara@example.com' });
  await leads.createLead({ ...person, email: 'other@example.com' });
  const related = await leads.getRelatedByEmail('SARA@example.com', a);
  assert.deepEqual(related.map(row => row.id), [b]);
});

test('isOverdue only counts open leads whose follow-up date is before today', () => {
  const { isOverdue, isDueToday } = load('src/lib/leads.ts', mocks(fakeDb()));
  const now = new Date('2026-10-27T10:00:00Z');
  assert.equal(isOverdue({ status: 'contacted', nextFollowUpAt: '2026-10-26' }, now), true);
  assert.equal(isOverdue({ status: 'contacted', nextFollowUpAt: '2026-10-27' }, now), false);
  assert.equal(isOverdue({ status: 'won', nextFollowUpAt: '2026-10-01' }, now), false);
  assert.equal(isOverdue({ status: 'new' }, now), false);
  assert.equal(isDueToday({ status: 'new', nextFollowUpAt: '2026-10-27' }, now), true);
});

const row = (over = {}) => ({
  id: 'x', firstName: 'A', lastName: 'B', email: 'a@b.co', message: 'hi', lang: 'en', origin: 'website',
  status: 'new', priority: 'normal', tags: [], createdAt: '2026-10-05T08:00:00.000Z', updatedAt: '2026-10-05T08:00:00.000Z',
  ...over,
});

test('computeStats summarises the pipeline', () => {
  const { computeStats } = load('src/lib/leads.ts', mocks(fakeDb()));
  const now = new Date('2026-10-27T10:00:00Z');
  const rows = [
    row({ id: '1', value: 1000, source: 'Google', service: 'Architecture' }),
    row({ id: '2', status: 'contacted', value: 500, nextFollowUpAt: '2026-10-20', firstContactedAt: '2026-10-05T10:00:00.000Z', source: 'Google' }),
    row({ id: '3', status: 'won', value: 9000, firstContactedAt: '2026-10-05T14:00:00.000Z' }),
    row({ id: '4', status: 'lost' }),
    row({ id: '5', createdAt: '2026-09-30T08:00:00.000Z' }),
  ];
  const stats = computeStats(rows, now);
  assert.equal(stats.total, 5);
  assert.equal(stats.newThisMonth, 4);
  assert.equal(stats.pipelineValue, 1500);
  assert.equal(stats.winRate, 0.5);
  assert.equal(stats.overdue, 1);
  assert.equal(stats.byStatus.new, 2);
  assert.equal(stats.avgFirstContactHours, 4);
  // Leads with no source are grouped together instead of being dropped.
  assert.equal(stats.bySource.map(s => `${s.label}:${s.count}`).join(','), 'Not specified:3,Google:2');
});

test('computeStats copes with an empty list', () => {
  const { computeStats } = load('src/lib/leads.ts', mocks(fakeDb()));
  const stats = computeStats([]);
  assert.equal(stats.winRate, null);
  assert.equal(stats.avgFirstContactHours, null);
  assert.equal(stats.pipelineValue, 0);
});

test('filterLeads combines filters and searches names, messages and tags', () => {
  const { filterLeads } = load('src/lib/leads.ts', mocks(fakeDb()));
  const now = new Date('2026-10-27T10:00:00Z');
  const rows = [
    row({ id: '1', firstName: 'Sara', assignee: 'a@mim.archi', service: 'Interior' }),
    row({ id: '2', status: 'contacted', message: 'Rooftop terrace', tags: ['vip'], nextFollowUpAt: '2026-10-01' }),
    row({ id: '3', lang: 'ar' }),
  ];
  const ids = filters => filterLeads(rows, filters, now).map(r => r.id);
  assert.deepEqual(ids({ q: 'sara' }), ['1']);
  assert.deepEqual(ids({ q: 'TERRACE' }), ['2']);
  assert.deepEqual(ids({ q: 'vip' }), ['2']);
  assert.deepEqual(ids({ assignee: 'unassigned' }), ['2', '3']);
  assert.deepEqual(ids({ assignee: 'a@mim.archi' }), ['1']);
  assert.deepEqual(ids({ overdue: true }), ['2']);
  assert.deepEqual(ids({ lang: 'ar' }), ['3']);
  assert.deepEqual(ids({ status: 'new', lang: 'en' }), ['1']);
});

test('CSV export quotes cells and neutralises spreadsheet formulas', () => {
  const { leadsToCsv, csvCell } = load('src/lib/leads.ts', mocks(fakeDb()));
  assert.equal(csvCell('plain'), 'plain');
  assert.equal(csvCell('a, b'), '"a, b"');
  assert.equal(csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(csvCell('=HYPERLINK("http://evil")'), '"\'=HYPERLINK(""http://evil"")"');
  assert.equal(csvCell('+923001234567'), '+923001234567');
  assert.equal(csvCell('+92 (300) 123-4567'), '+92 (300) 123-4567');
  assert.equal(csvCell('+cmd|calc'), "'+cmd|calc");
  assert.equal(csvCell('-1+SUM(A1)'), "'-1+SUM(A1)");
  assert.equal(csvCell('@SUM(A1)'), "'@SUM(A1)");
  assert.equal(csvCell(undefined), '');

  const csv = leadsToCsv([row({ message: 'line one\nline two', tags: ['a', 'b'], value: 250 })]);
  const lines = csv.split('\r\n');
  assert.ok(lines[0].startsWith('Created,First name'));
  assert.ok(csv.includes('"line one\nline two"'));
  assert.ok(csv.includes('a; b'));
});

test('getLeadBadgeCounts returns zeros without Firebase instead of throwing', async () => {
  const leads = load('src/lib/leads.ts', {
    '@/lib/firebase/admin': { adminDb: () => { throw new Error('offline'); }, isFirebaseConfigured: false },
    'firebase-admin/firestore': { FieldValue },
  });
  const counts = await leads.getLeadBadgeCounts();
  assert.equal(counts.newCount, 0);
  assert.equal(counts.overdue, 0);
});

test('every role sees exactly its own areas: hr has jobs, editors have blog and visitors, admins have everything', () => {
  const { canAccess } = load('src/lib/admin/auth.ts', {
    '@/lib/firebase/admin': { adminAuth: () => ({}), isFirebaseConfigured: true },
    'next/headers': { cookies: async () => ({ get() {} }) },
    'next/navigation': { redirect() {} },
  });
  const areas = ['jobs', 'blog', 'visitors', 'leads'];
  const allowed = role => areas.filter(area => canAccess(role, area)).join(',');
  assert.equal(allowed('hr'), 'jobs');
  assert.equal(allowed('editor'), 'blog,visitors');
  assert.equal(allowed('admin'), 'jobs,blog,visitors,leads');
  assert.equal(canAccess('editor', 'jobs'), false, 'editors never see jobs or applications');
  assert.equal(canAccess('hr', 'visitors'), false, 'HR cannot see visitors, so no IP addresses');
  assert.equal(canAccess('editor', 'leads'), false, 'leads stay admin only');
});

test('staff may not reach leads unless they are admins', () => {
  const { canAccess } = load('src/lib/admin/auth.ts', {
    '@/lib/firebase/admin': { adminAuth: () => ({}), isFirebaseConfigured: true },
    'next/headers': { cookies: async () => ({ get() {} }) },
    'next/navigation': { redirect() {} },
  });
  assert.equal(canAccess('admin', 'leads'), true);
  assert.equal(canAccess('hr', 'leads'), false);
  assert.equal(canAccess('editor', 'leads'), false);
  assert.equal(canAccess('hr', 'jobs'), true);
});
