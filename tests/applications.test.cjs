const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

function fakeDb() {
  const store = new Map();
  let next = 1;
  const snap = key => ({ id: key.split('/')[1], exists: store.has(key), data: () => structuredClone(store.get(key)) });
  const query = filter => ({
    select: () => query(filter),
    get: async () => {
      const docs = [...store.keys()].filter(key => filter(store.get(key))).map(snap);
      return { docs, size: docs.length };
    },
  });
  const collection = name => ({
    add: async data => {
      const id = `app${next++}`;
      store.set(`${name}/${id}`, structuredClone(data));
      return { id };
    },
    where: (field, _op, value) => query(data => data[field] === value),
    get: async () => {
      const docs = [...store.keys()].filter(key => key.startsWith(`${name}/`)).map(snap);
      return { docs, size: docs.length };
    },
    doc: id => ({
      get: async () => snap(`${name}/${id}`),
      update: async patch => Object.assign(store.get(`${name}/${id}`), structuredClone(patch)),
      delete: async () => void store.delete(`${name}/${id}`),
    }),
  });
  return { store, collection };
}

const firebase = (db, configured = true) => ({
  '@/lib/firebase/admin': { adminDb: () => db, isFirebaseConfigured: configured },
});

const applicant = {
  firstName: 'Noor',
  lastName: 'Khan',
  email: 'noor@example.com',
  role: 'Senior 3D Artist',
  portfolioUrl: 'https://www.behance.net/noor',
  message: 'Five years of archviz work.',
};

test('createApplication saves a new application and drops empty fields', async () => {
  const db = fakeDb();
  const apps = load('src/lib/applications.ts', firebase(db));
  const id = await apps.createApplication({ ...applicant, phone: '', lang: 'ar' });
  const saved = await apps.getApplicationAdmin(id);
  assert.equal(saved.status, 'new');
  assert.equal(saved.lang, 'ar');
  assert.equal(saved.phone, undefined);
  assert.equal(saved.role, 'Senior 3D Artist');
  assert.equal(saved.portfolioUrl, 'https://www.behance.net/noor');
  assert.ok(saved.createdAt);
});

test('updateApplication sets the status and a private note, and reports a missing application', async () => {
  const db = fakeDb();
  const apps = load('src/lib/applications.ts', firebase(db));
  const id = await apps.createApplication(applicant);
  assert.equal(await apps.updateApplication(id, { status: 'shortlisted', note: 'Strong reel' }, 'hr@mim.archi'), true);
  let saved = await apps.getApplicationAdmin(id);
  assert.equal(saved.status, 'shortlisted');
  assert.equal(saved.note, 'Strong reel');
  assert.equal(saved.updatedBy, 'hr@mim.archi');
  await apps.updateApplication(id, { status: 'reviewing', note: null }, 'hr@mim.archi');
  saved = await apps.getApplicationAdmin(id);
  assert.equal(saved.note, null);
  assert.equal(await apps.updateApplication('missing', { status: 'hired', note: null }, 'hr@mim.archi'), false);
  await apps.deleteApplication(id);
  assert.equal(await apps.getApplicationAdmin(id), null);
});

test('the dashboard count only counts new applications and never throws without Firebase', async () => {
  const db = fakeDb();
  const apps = load('src/lib/applications.ts', firebase(db));
  const a = await apps.createApplication(applicant);
  await apps.createApplication({ ...applicant, email: 'two@example.com' });
  await apps.updateApplication(a, { status: 'rejected', note: null }, 'hr@mim.archi');
  assert.equal(await apps.countNewApplications(), 1);
  assert.equal(await load('src/lib/applications.ts', firebase(db, false)).countNewApplications(), 0);
});

test('filterApplications combines status and a text search', async () => {
  const db = fakeDb();
  const apps = load('src/lib/applications.ts', firebase(db));
  await apps.createApplication(applicant);
  await apps.createApplication({ ...applicant, firstName: 'Omar', email: 'omar@example.com', role: 'Interior Designer', message: 'Revit and Enscape' });
  const rows = await apps.listApplicationsAdmin();
  const names = filters => apps.filterApplications(rows, filters).map(r => r.firstName).sort().join();
  assert.equal(names({}), 'Noor,Omar');
  assert.equal(names({ q: 'enscape' }), 'Omar');
  assert.equal(names({ q: 'INTERIOR' }), 'Omar');
  assert.equal(names({ status: 'hired' }), '');
  assert.equal(names({ status: 'new', q: 'noor@' }), 'Noor');
});

test('only http(s) portfolio links are ever treated as links', () => {
  const { isWebUrl } = load('src/lib/applications.ts', firebase(fakeDb()));
  assert.equal(isWebUrl('https://drive.google.com/x'), true);
  assert.equal(isWebUrl('http://example.com'), true);
  assert.equal(isWebUrl('javascript:alert(1)'), false);
  assert.equal(isWebUrl('data:text/html,<script>'), false);
  assert.equal(isWebUrl('ftp://example.com'), false);
});

test('the HR email escapes applicant text, and the confirmation does not repeat it back', () => {
  const { buildApplicationEmail, buildApplicationConfirmation } = load('src/lib/application-email.ts', {});
  const email = buildApplicationEmail({
    ...applicant,
    firstName: 'Evil<script>',
    lastName: 'Name\r\nBcc: x@y.z',
    role: 'Role"><img src=x>',
    message: '<b>hi</b> & bye',
  });
  assert.ok(!email.subject.includes('\n') && !email.subject.includes('\r'), 'no header injection through the subject');
  assert.match(email.subject, /^New job application from /);
  assert.ok(!email.html.includes('<script>') && !email.html.includes('<img'), 'applicant HTML is escaped');
  assert.ok(email.html.includes('&lt;b&gt;hi&lt;/b&gt; &amp; bye'));
  assert.ok(email.text.includes('Behance') || email.text.includes('behance.net/noor'));

  const confirmation = buildApplicationConfirmation({ firstName: 'Noor' }, 'hr@mim.archi');
  assert.ok(confirmation.text.includes('hr@mim.archi'));
  assert.ok(!confirmation.text.includes('Five years') && !confirmation.html.includes('behance'));
});

test('a job cannot take the address of the application form', () => {
  const { RESERVED_JOB_SLUGS } = load('src/lib/jobs.ts', firebase(fakeDb()));
  assert.ok(RESERVED_JOB_SLUGS.includes('apply'));
});

// ---- The endpoint ----

function endpoint({ db = fakeDb(), configured = true, mailer, allowed = true } = {}) {
  const sent = [];
  const mail = mailer === null ? null : { name: 'smtp', defaultFrom: 'Site <site@mim.archi>', send: async m => { if (mailer === 'fail') throw new Error('smtp down'); sent.push(m); } };
  const route = load('src/app/api/careers/apply/route.ts', {
    ...firebase(db, configured),
    'next/server': { NextResponse: { json: (body, init = {}) => ({ status: init.status ?? 200, body, headers: init.headers ?? {} }) } },
    '@/lib/mailer': { getMailer: () => mail },
    '@/lib/rate-limit': { checkRateLimit: async () => (allowed ? { allowed: true } : { allowed: false, retryAfterSec: 30 }) },
  });
  const post = body => route.POST({ headers: { get: name => (name === 'x-forwarded-for' ? '203.0.113.9' : null) }, json: async () => body });
  return { db, sent, post };
}

const savedApps = db => [...db.store.entries()].filter(([key]) => key.startsWith('siteApplications/')).map(([, value]) => value);

test('a valid application is saved, emailed to HR, and confirmed to the applicant', async () => {
  const { db, sent, post } = endpoint({ mailer: 'ok' });
  const res = await post({ ...applicant, phone: '+92 300 1234567', lang: 'en' });
  assert.equal(res.status, 200);
  assert.equal(savedApps(db).length, 1);
  assert.equal(savedApps(db)[0].mailStatus, 'sent');
  assert.equal(sent.length, 2);
  assert.equal(sent[0].to, 'hr@mim.archi');
  assert.equal(sent[0].replyTo, 'noor@example.com');
  assert.match(sent[0].subject, /Noor Khan - Senior 3D Artist/);
  assert.equal(sent[1].to, 'noor@example.com');
  assert.equal(sent[1].replyTo, 'hr@mim.archi');
  assert.equal(sent[1].headers['Auto-Submitted'], 'auto-replied');
});

test('the application never goes to the client enquiry address', async () => {
  const { sent, post } = endpoint({ mailer: 'ok' });
  await post(applicant);
  assert.ok(sent.every(m => m.to !== 'info@mim.archi'));
});

test('bad data is rejected: javascript links, missing fields, and an invalid email', async () => {
  const { db, sent, post } = endpoint({ mailer: 'ok' });
  for (const bad of [
    { ...applicant, portfolioUrl: 'javascript:alert(1)' },
    { ...applicant, portfolioUrl: 'drive.google.com/x' },
    { ...applicant, portfolioUrl: '' },
    { ...applicant, message: '' },
    { ...applicant, email: 'not-an-email' },
    { ...applicant, firstName: '' },
    { ...applicant, role: '' },
    { ...applicant, message: 'x'.repeat(3001) },
  ]) assert.equal((await post(bad)).status, 422, JSON.stringify(bad).slice(0, 80));
  assert.equal(savedApps(db).length, 0);
  assert.equal(sent.length, 0);
});

test('the honeypot answers ok but saves and sends nothing', async () => {
  const { db, sent, post } = endpoint({ mailer: 'ok' });
  const res = await post({ ...applicant, company: 'Acme' });
  assert.equal(res.status, 200);
  assert.equal(savedApps(db).length, 0);
  assert.equal(sent.length, 0);
});

test('a rate-limited caller gets a 429 and nothing is saved', async () => {
  const { db, post } = endpoint({ mailer: 'ok', allowed: false });
  const res = await post(applicant);
  assert.equal(res.status, 429);
  assert.equal(res.headers['Retry-After'], '30');
  assert.equal(savedApps(db).length, 0);
});

test('if the HR email fails the saved application is kept and the applicant still sees success', async () => {
  const { db, post } = endpoint({ mailer: 'fail' });
  const res = await post(applicant);
  assert.equal(res.status, 200);
  assert.equal(savedApps(db).length, 1);
  assert.equal(savedApps(db)[0].mailStatus, 'failed');
});

test('with no mailer the application is saved and flagged, not lost', async () => {
  const { db, post } = endpoint({ mailer: null });
  const res = await post(applicant);
  assert.equal(res.status, 200);
  assert.equal(savedApps(db)[0].mailStatus, 'skipped');
});

test('if neither saving nor email works the applicant is told, so nothing is silently dropped', async () => {
  const { post } = endpoint({ mailer: 'fail', configured: false });
  const res = await post(applicant);
  assert.equal(res.status, 502);
  assert.match(res.body.error, /hr@mim\.archi/);
});
