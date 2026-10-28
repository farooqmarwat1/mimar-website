const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// In-memory Firestore: what src/lib/visits.ts and src/lib/leads.ts use, plus transactions.
const FieldValue = { delete: () => ({ __delete: true }), arrayUnion: (...items) => ({ __union: items }) };

function fakeDb() {
  const store = new Map();
  let next = 1;
  const snapshot = key => ({ id: key.split('/')[1], exists: store.has(key), data: () => structuredClone(store.get(key)) });
  const doc = (name, id) => {
    const key = `${name}/${id}`;
    return {
      key,
      get: async () => snapshot(key),
      set: async data => void store.set(key, structuredClone(data)),
      update: async patch => Object.assign(store.get(key), structuredClone(patch)),
    };
  };
  return {
    store,
    runTransaction: async fn => fn({ get: ref => ref.get(), set: (ref, data) => void store.set(ref.key, structuredClone(data)) }),
    collection: name => ({
      orderBy: (field, direction) => ({
        limit: n => ({
          get: async () => {
            const keys = [...store.keys()].filter(key => key.startsWith(`${name}/`));
            keys.sort((a, b) => (direction === 'desc' ? -1 : 1) * String(store.get(a)[field]).localeCompare(String(store.get(b)[field])));
            return { docs: keys.slice(0, n).map(snapshot) };
          },
        }),
      }),
      doc: id => doc(name, id),
      add: async data => {
        const id = `doc${next++}`;
        store.set(`${name}/${id}`, structuredClone(data));
        return { id };
      },
    }),
  };
}

const mocks = db => ({
  '@/lib/firebase/admin': { adminDb: () => db, isFirebaseConfigured: true },
  'firebase-admin/firestore': { FieldValue },
});

const headers = (map = {}) => {
  const lower = Object.fromEntries(Object.entries(map).map(([k, v]) => [k.toLowerCase(), v]));
  return { get: name => lower[name.toLowerCase()] ?? null };
};

const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const EDGE = `${CHROME} Edg/126.0`;
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ANDROID_PHONE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36';
const ANDROID_TABLET = 'Mozilla/5.0 (Linux; Android 14; SM-X900) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const visitor = (over = {}) => headers({ 'x-real-ip': '203.0.113.7', 'user-agent': CHROME, 'accept-language': 'en-US,en;q=0.9', 'x-vercel-ip-country': 'pk', 'x-vercel-ip-city': 'Islamabad', ...over });

test('the visitor hash is stable within a day and changes with the day, address, browser and secret', () => {
  const { visitorHash } = load('src/lib/visits.ts', mocks(fakeDb()));
  const base = visitorHash('203.0.113.7', CHROME, '20261028', 's1');
  assert.equal(base, visitorHash('203.0.113.7', CHROME, '20261028', 's1'));
  assert.equal(base.length, 32);
  for (const other of [
    visitorHash('203.0.113.7', CHROME, '20261029', 's1'),
    visitorHash('203.0.113.8', CHROME, '20261028', 's1'),
    visitorHash('203.0.113.7', IPHONE, '20261028', 's1'),
    visitorHash('203.0.113.7', CHROME, '20261028', 's2'),
  ]) assert.notEqual(base, other);
  assert.ok(!base.includes('203'), 'the IP must not be readable from the hash');
});

test('the IP comes from platform headers only, preferring the ones a client cannot forge', () => {
  const { clientIp } = load('src/lib/visits.ts', mocks(fakeDb()));
  assert.equal(clientIp(headers({ 'x-vercel-forwarded-for': '198.51.100.9', 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '1.1.1.1' })), '198.51.100.9');
  assert.equal(clientIp(headers({ 'x-real-ip': '203.0.113.7', 'x-forwarded-for': '1.1.1.1' })), '203.0.113.7');
  assert.equal(clientIp(headers({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' })), '1.1.1.1');
  assert.equal(clientIp(headers({ 'x-real-ip': '::ffff:203.0.113.7' })), '203.0.113.7');
  assert.equal(clientIp(headers({ 'x-real-ip': 'not an ip', 'x-forwarded-for': '<script>' })), null);
  assert.equal(clientIp(headers()), null);
});

test('describeRequest reads geography, language and device from the request alone', () => {
  const { describeRequest } = load('src/lib/visits.ts', mocks(fakeDb()));
  const info = describeRequest(visitor({ 'x-vercel-ip-city': 'San%20Francisco', 'x-vercel-ip-country-region': 'CA' }));
  assert.equal(info.ip, '203.0.113.7');
  assert.equal(info.country, 'PK');
  assert.equal(info.city, 'San Francisco');
  assert.equal(info.region, 'CA');
  assert.equal(info.lang, 'en-us');
  assert.equal(info.browser, 'Chrome');
  assert.equal(info.os, 'Windows');
  assert.equal(info.deviceType, 'desktop');

  const arabic = describeRequest(visitor({ 'x-vercel-ip-city': encodeURIComponent('الرياض'), 'accept-language': 'ar-SA,ar;q=0.9' }));
  assert.equal(arabic.city, 'الرياض');
  assert.equal(arabic.lang, 'ar-sa');

  assert.equal(describeRequest(visitor({ 'x-vercel-ip-country': 'ZZZ' })).country, undefined);
  assert.equal(describeRequest(visitor({ 'x-vercel-ip-city': '%E0%A4%A' })).city, '%E0%A4%A');
});

test('user agents: Edge is not reported as Chrome, phones and tablets are told apart', () => {
  const { parseUserAgent } = load('src/lib/visits.ts', mocks(fakeDb()));
  assert.equal(parseUserAgent(EDGE).browser, 'Edge');
  assert.equal(parseUserAgent(CHROME).browser, 'Chrome');
  assert.equal(parseUserAgent(IPHONE).browser, 'Safari');
  assert.equal(parseUserAgent(IPHONE).deviceType, 'mobile');
  assert.equal(parseUserAgent(IPHONE).os, 'iOS');
  assert.equal(parseUserAgent(IPAD).deviceType, 'tablet');
  assert.equal(parseUserAgent(ANDROID_PHONE).deviceType, 'mobile');
  assert.equal(parseUserAgent(ANDROID_PHONE).os, 'Android');
  assert.equal(parseUserAgent(ANDROID_TABLET).deviceType, 'tablet');
  assert.equal(parseUserAgent('').browser, 'Other');
});

test('channels come from UTM tags first, then from who sent the visitor', () => {
  const { classifyChannel } = load('src/lib/visits.ts', mocks(fakeDb()));
  const host = 'mim.archi';
  assert.equal(classifyChannel(undefined, undefined, host), 'direct');
  assert.equal(classifyChannel(undefined, 'https://mim.archi/about-us', host), 'direct');
  assert.equal(classifyChannel(undefined, 'https://www.google.com/', host), 'organic');
  assert.equal(classifyChannel(undefined, 'https://www.bing.com/search', host), 'organic');
  assert.equal(classifyChannel(undefined, 'https://l.instagram.com/?u=x', host), 'social');
  assert.equal(classifyChannel(undefined, 'https://lnkd.in/abc', host), 'social');
  assert.equal(classifyChannel(undefined, 'https://t.co/abc', host), 'social');
  assert.equal(classifyChannel(undefined, 'https://some-blog.example/post', host), 'referral');
  assert.equal(classifyChannel({ medium: 'cpc', source: 'google' }, 'https://www.google.com/', host), 'paid');
  assert.equal(classifyChannel({ medium: 'email' }, undefined, host), 'email');
  assert.equal(classifyChannel({ source: 'newsletter' }, undefined, host), 'email');
  assert.equal(classifyChannel({ source: 'facebook' }, undefined, host), 'social');
  assert.equal(classifyChannel({ medium: 'social' }, undefined, host), 'social');
  assert.equal(classifyChannel(undefined, 'garbage', host), 'direct');
});

test('paths, referrers and UTM tags from the browser are cleaned before they are stored', () => {
  const { cleanPath, cleanReferrer, cleanUtm } = load('src/lib/visits.ts', mocks(fakeDb()));
  assert.equal(cleanPath('/services/branding?x=1#top'), '/services/branding');
  assert.equal(cleanPath('//evil.example'), null);
  assert.equal(cleanPath('services'), null);
  assert.equal(cleanPath(42), null);
  assert.equal(cleanPath(`/${'a'.repeat(500)}`).length, 120);
  assert.equal(cleanReferrer('https://www.google.com/search?q=secret&token=abc'), 'https://www.google.com/search');
  assert.equal(cleanReferrer('javascript:alert(1)'), undefined);
  assert.equal(cleanReferrer(''), undefined);
  assert.equal(cleanUtm({ source: ' ig\u0000 ', medium: '', campaign: 'x'.repeat(200) }).campaign.length, 80);
  assert.equal(cleanUtm({ source: ' ig\u0000 ' }).source, 'ig');
  assert.equal(cleanUtm({ medium: '' }), undefined);
  assert.equal(cleanUtm(undefined), undefined);
});

const req = (over = {}) => ({ ip: '203.0.113.7', userAgent: CHROME, deviceType: 'desktop', browser: 'Chrome', os: 'Windows', country: 'PK', city: 'Islamabad', lang: 'en-us', ...over });
const at = iso => new Date(iso);

test('applyEvent builds the journey page by page and ignores duplicates and orphan exits', () => {
  const { applyEvent } = load('src/lib/visits.ts', mocks(fakeDb()));
  const day = '20261028';
  const first = applyEvent(null, { kind: 'view', path: '/', referrer: 'https://www.google.com/search?q=x', utm: { source: 'g', medium: 'cpc' }, tz: 'Asia/Karachi', screenWidth: 390 }, req(), day, at('2026-10-28T10:00:00Z'), 'mim.archi');
  assert.equal(first.landingPath, '/');
  assert.equal(first.channel, 'paid');
  assert.equal(first.referrer, 'https://www.google.com/search');
  assert.equal(first.pageCount, 1);
  assert.equal(first.country, 'PK');
  assert.equal(first.screenWidth, 390);

  assert.equal(applyEvent(first, { kind: 'view', path: '/', referrer: undefined }, req(), day, at('2026-10-28T10:00:01Z')), null, 'a double fire is not a second view');

  const second = applyEvent(first, { kind: 'view', path: '/careers' }, req(), day, at('2026-10-28T10:00:30Z'));
  assert.equal(second.pageCount, 2);
  assert.equal(second.pages.length, 2);
  assert.equal(second.landingPath, '/', 'landing page and channel are fixed by the first view');
  assert.equal(second.channel, 'paid');

  const left = applyEvent(second, { kind: 'leave', path: '/careers', seconds: 42 }, req(), day, at('2026-10-28T10:01:12Z'));
  assert.equal(left.pages[1].s, 42);
  assert.equal(left.activeSeconds, 42);
  assert.equal(applyEvent(left, { kind: 'leave', path: '/careers', seconds: 99999 }, req(), day, at('2026-10-28T10:02:00Z')).pages[1].s, 1800);
  assert.equal(applyEvent(null, { kind: 'leave', path: '/', seconds: 5 }, req(), day, at('2026-10-28T10:00:00Z')), null);
});

test('applyEvent caps the stored pages but keeps counting views', () => {
  const { applyEvent, MAX_PAGES } = load('src/lib/visits.ts', mocks(fakeDb()));
  let visit = applyEvent(null, { kind: 'view', path: '/p0' }, req(), '20261028', at('2026-10-28T10:00:00Z'));
  for (let i = 1; i < MAX_PAGES + 10; i += 1) visit = applyEvent(visit, { kind: 'view', path: `/p${i}` }, req(), '20261028', at(`2026-10-28T10:${String(i % 60).padStart(2, '0')}:00Z`)) ?? visit;
  assert.equal(visit.pages.length, MAX_PAGES);
  assert.equal(visit.pageCount, MAX_PAGES + 10);
});

test('recordVisit stores one document per visitor-day, never the IP, and skips opt-outs, bots and a missing secret', async () => {
  const db = fakeDb();
  const visits = load('src/lib/visits.ts', mocks(db));
  const view = { kind: 'view', path: '/', referrer: 'https://www.google.com/' };

  assert.equal(await visits.recordVisit(visitor({ dnt: '1' }), view, 'mim.archi'), false);
  assert.equal(await visits.recordVisit(visitor({ 'sec-gpc': '1' }), view, 'mim.archi'), false);
  assert.equal(await visits.recordVisit(visitor({ 'user-agent': 'Googlebot/2.1' }), view, 'mim.archi'), false);
  assert.equal(await visits.recordVisit(visitor({ 'user-agent': 'python-requests/2.31' }), view, 'mim.archi'), false);
  assert.equal(await visits.recordVisit(visitor({ 'user-agent': '' }), view, 'mim.archi'), false);
  assert.equal(await visits.recordVisit(headers({ 'user-agent': CHROME }), view, 'mim.archi'), false, 'no readable IP');
  assert.equal(db.store.size, 0);

  assert.equal(await visits.recordVisit(visitor(), view, 'mim.archi', at('2026-10-28T10:00:00Z')), true);
  assert.equal(await visits.recordVisit(visitor(), { kind: 'view', path: '/contact' }, 'mim.archi', at('2026-10-28T10:00:20Z')), true);
  assert.equal(db.store.size, 1);
  const [key, saved] = [...db.store.entries()][0];
  assert.match(key, /^siteVisitors\/20261028_[0-9a-f]{32}$/);
  assert.equal(saved.pageCount, 2);
  assert.ok(saved.expireAt instanceof Date);
  assert.ok(saved.expireAt.getTime() - Date.parse('2026-10-28T10:00:20Z') > 29 * 86_400_000);
  assert.equal(saved.ip, '203.0.113.7', 'the admin Visitors page shows the IP, so it is kept with the visit for the retention period');
  assert.ok(!key.includes('203.0.113.7'), 'but never in the document id, which is only the hash');

  assert.equal(await visits.recordVisit(visitor({ 'x-real-ip': '203.0.113.99' }), view, 'mim.archi', at('2026-10-28T11:00:00Z')), true);
  assert.equal(db.store.size, 2, 'a different address is a different visitor');

  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    assert.equal(visits.trackingEnabled(), false, 'production with no secret switches tracking off');
    assert.equal(await visits.recordVisit(visitor({ 'x-real-ip': '203.0.113.50' }), view, 'mim.archi'), false);
  } finally {
    process.env.NODE_ENV = before;
  }
});

test('findVisitForRequest returns the same visitor\'s journey, and yesterday\'s only if it ended minutes ago', async () => {
  const db = fakeDb();
  const visits = load('src/lib/visits.ts', mocks(db));
  await visits.recordVisit(visitor(), { kind: 'view', path: '/careers', referrer: 'https://www.google.com/' }, 'mim.archi', at('2026-10-28T10:00:00Z'));
  await visits.recordVisit(visitor(), { kind: 'view', path: '/contact' }, 'mim.archi', at('2026-10-28T10:00:40Z'));

  const found = await visits.findVisitForRequest(visitor(), at('2026-10-28T10:02:00Z'));
  assert.equal(found.landingPath, '/careers');
  assert.equal(found.pages.length, 2);
  assert.equal(found.expireAt, undefined, 'the cleanup timestamp is not copied onto a lead');
  assert.equal(found.ip, undefined, 'the IP is not copied into the lead snapshot; the lead keeps its own');
  assert.equal(await visits.findVisitForRequest(visitor({ 'user-agent': IPHONE }), at('2026-10-28T10:02:00Z')), null);
  assert.equal(await visits.findVisitForRequest(visitor({ 'x-real-ip': '198.51.100.1' }), at('2026-10-28T10:02:00Z')), null);

  // A visit that crossed UTC midnight: it ended at 23:50, and the form is sent at 00:30 the next day.
  const night = { 'x-real-ip': '203.0.113.88' };
  await visits.recordVisit(visitor(night), { kind: 'view', path: '/' }, 'mim.archi', at('2026-10-28T23:40:00Z'));
  await visits.recordVisit(visitor(night), { kind: 'view', path: '/contact' }, 'mim.archi', at('2026-10-28T23:50:00Z'));
  assert.ok(await visits.findVisitForRequest(visitor(night), at('2026-10-29T00:30:00Z')), 'yesterday is accepted when it ended under two hours ago');
  assert.equal(await visits.findVisitForRequest(visitor(night), at('2026-10-29T09:00:00Z')), null, 'but not when it ended hours ago');
  assert.equal(await visits.findVisitForRequest(visitor(), at('2026-10-29T00:30:00Z')), null, 'a visit from the morning is not linked the next day');
});

test('the Visitors page lists the newest visits first, with the IP and without the cleanup timestamp', async () => {
  const db = fakeDb();
  const visits = load('src/lib/visits.ts', mocks(db));
  await visits.recordVisit(visitor({ 'x-real-ip': '203.0.113.1' }), { kind: 'view', path: '/' }, 'mim.archi', at('2026-10-28T08:00:00Z'));
  await visits.recordVisit(visitor({ 'x-real-ip': '203.0.113.2' }), { kind: 'view', path: '/services' }, 'mim.archi', at('2026-10-28T10:00:00Z'));
  await visits.recordVisit(visitor({ 'x-real-ip': '203.0.113.3' }), { kind: 'view', path: '/contact' }, 'mim.archi', at('2026-10-28T09:00:00Z'));
  const rows = await visits.listVisitsAdmin();
  assert.equal(rows.map(r => r.ip).join(), '203.0.113.2,203.0.113.3,203.0.113.1');
  assert.ok(rows.every(r => r.id && r.expireAt === undefined));
  assert.equal((await visits.listVisitsAdmin(2)).length, 2);
});

test('visit stats count today, who is active now, and rank channels, countries and pages', () => {
  const { computeVisitStats, isActiveNow } = load('src/lib/visits.ts', mocks(fakeDb()));
  const now = at('2026-10-28T12:00:00Z');
  const visit = over => ({
    day: '20261028', firstSeenAt: '2026-10-28T08:00:00.000Z', lastSeenAt: '2026-10-28T08:00:00.000Z', landingPath: '/', channel: 'direct',
    pageCount: 1, pages: [{ p: '/', at: '2026-10-28T08:00:00.000Z', s: 0 }], activeSeconds: 0, deviceType: 'desktop', browser: 'Chrome', os: 'Windows', ...over,
  });
  const rows = [
    visit({ country: 'PK', channel: 'organic', pageCount: 3, pages: [{ p: '/', s: 0 }, { p: '/careers', s: 0 }, { p: '/contact', s: 0 }], lastSeenAt: '2026-10-28T11:58:00.000Z' }),
    visit({ country: 'PK', pageCount: 2, pages: [{ p: '/', s: 0 }, { p: '/careers', s: 0 }] }),
    visit({ country: 'AE', channel: 'social', day: '20261027', pageCount: 5, lastSeenAt: '2026-10-27T20:00:00.000Z' }),
    visit({}),
  ];
  const stats = computeVisitStats(rows, now);
  assert.equal(stats.visitorsToday, 3);
  assert.equal(stats.viewsToday, 3 + 2 + 1);
  assert.equal(stats.activeNow, 1);
  assert.equal(stats.byCountry.map(s => `${s.label}:${s.count}`).join(), 'PK:2,AE:1,Unknown:1');
  assert.equal(stats.byChannel[0].label, 'Direct');
  assert.equal(stats.byPage[0].label, '/');
  assert.equal(stats.byPage[0].count, 4);
  assert.equal(stats.byPage[1].label, '/careers');
  assert.equal(stats.byPage[1].count, 2);
  assert.equal(isActiveNow({ lastSeenAt: '2026-10-28T11:56:00.000Z' }, now), true);
  assert.equal(isActiveNow({ lastSeenAt: '2026-10-28T11:50:00.000Z' }, now), false);
  assert.equal(computeVisitStats([], now).visitorsToday, 0);
});

test('visit filters cover today, the last week, and a search over IP, place, page and browser', () => {
  const { filterVisits } = load('src/lib/visits.ts', mocks(fakeDb()));
  const now = at('2026-10-28T12:00:00Z');
  const v = (id, over) => ({ id, day: '20261028', lastSeenAt: '2026-10-28T10:00:00.000Z', landingPath: '/', pages: [{ p: '/' }], browser: 'Chrome', os: 'Windows', ...over });
  const rows = [
    v('a', { ip: '203.0.113.7', city: 'Dubai', country: 'AE' }),
    v('b', { day: '20261025', lastSeenAt: '2026-10-25T10:00:00.000Z', ip: '198.51.100.2', city: 'Karachi', country: 'PK', pages: [{ p: '/careers' }] }),
    v('c', { day: '20261001', lastSeenAt: '2026-10-01T10:00:00.000Z', browser: 'Safari' }),
  ];
  const ids = f => filterVisits(rows, f, now).map(r => r.id).join();
  assert.equal(ids({ range: 'today' }), 'a');
  assert.equal(ids({ range: '7d' }), 'a,b');
  assert.equal(ids({ range: 'all' }), 'a,b,c');
  assert.equal(ids({ range: 'all', q: '198.51' }), 'b');
  assert.equal(ids({ range: 'all', q: 'dubai' }), 'a');
  assert.equal(ids({ range: 'all', q: '/careers' }), 'b');
  assert.equal(ids({ range: 'all', q: 'safari' }), 'c');
  assert.equal(ids({ range: 'all', q: 'nothing-matches' }), '');
});

test('findVisitForRequest never throws when the database is down', async () => {
  const visits = load('src/lib/visits.ts', {
    '@/lib/firebase/admin': { adminDb: () => { throw new Error('offline'); }, isFirebaseConfigured: true },
    'firebase-admin/firestore': { FieldValue },
  });
  assert.equal(await visits.findVisitForRequest(visitor()), null);
});

test('the tracking endpoint rejects other origins, records nothing for opt-outs, and always answers without a body or cookie', async () => {
  const db = fakeDb();
  const route = load('src/app/api/track/route.ts', {
    ...mocks(db),
    '@/lib/rate-limit': { checkRateLimit: async () => ({ allowed: true }) },
  });
  const post = (body, extra = {}) => ({
    headers: headers({ origin: 'https://mim.archi', host: 'mim.archi', 'x-real-ip': '203.0.113.7', 'user-agent': CHROME, ...extra }),
    json: async () => body,
  });
  const view = { kind: 'view', path: '/', referrer: 'https://www.google.com/' };

  const ok = await route.POST(post(view));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('set-cookie'), null);
  assert.equal(db.store.size, 1);

  assert.equal((await route.POST(post(view, { origin: 'https://evil.example' }))).status, 403);
  assert.equal((await route.POST(post(view, { origin: '' }))).status, 403, 'no origin and no same-origin fetch metadata');
  assert.equal((await route.POST(post(view, { origin: '', 'sec-fetch-site': 'same-origin' }))).status, 204);

  const size = db.store.size;
  assert.equal((await route.POST(post(view, { dnt: '1' }))).status, 204);
  assert.equal((await route.POST(post({ kind: 'view', path: '/admin/leads' }))).status, 204);
  assert.equal((await route.POST(post({ kind: 'view', path: 'no-slash' }))).status, 204);
  assert.equal((await route.POST(post({ kind: 'nope' }))).status, 204);
  assert.equal((await route.POST(post({ kind: 'leave', path: '/', seconds: -5 }))).status, 204);
  assert.equal((await route.POST(post({ kind: 'view', path: '/x', ip: '8.8.8.8', country: 'US' }, { 'x-real-ip': '203.0.113.60' }))).status, 204);
  const stored = [...db.store.values()].map(v => JSON.stringify(v)).join('');
  assert.ok(!stored.includes('8.8.8.8'), 'an address sent in the body is ignored');
  assert.ok(!stored.includes('"US"'), 'a country sent in the body is ignored');
  assert.equal(db.store.size, size + 1);
});

test('the tracking endpoint stops recording once a visitor is rate limited', async () => {
  const db = fakeDb();
  const route = load('src/app/api/track/route.ts', { ...mocks(db), '@/lib/rate-limit': { checkRateLimit: async () => ({ allowed: false, retryAfterSec: 30 }) } });
  const res = await route.POST({
    headers: headers({ origin: 'https://mim.archi', host: 'mim.archi', 'x-real-ip': '203.0.113.7', 'user-agent': CHROME }),
    json: async () => ({ kind: 'view', path: '/' }),
  });
  assert.equal(res.status, 204);
  assert.equal(db.store.size, 0);
});

// ---- Lead side: job-seeker flag, visitor data on a lead, filters, stats, export ----

test('classifyLead flags job seekers from strong signals only, in English and Arabic', () => {
  const { classifyLead } = load('src/lib/leads.ts', mocks(fakeDb()));
  const likely = message => classifyLead({ message }).likely;
  for (const message of [
    'Hi, I am attaching my CV for the architect position',
    'Looking for an internship in your studio',
    'Do you have any job openings?',
    'Please find my résumé',
    'We are hiring? or are you? Send my resume',
    'I want to join your team as a 3D artist',
    'السلام عليكم، أرفق سيرتي الذاتية، هل لديكم وظيفة شاغرة؟',
    'أبحث عن فرصة عمل',
  ]) assert.equal(likely(message), true, message);
  for (const message of [
    'We need 3D renders for our new tower in Dubai',
    'Mobile application for our real estate brand',
    'Brand positioning and the showroom opening next month',
    'Our cvc pipe project needs visualisation',
    'نحتاج تصميم فيلا',
  ]) assert.equal(likely(message), false, message);

  const landed = classifyLead({ message: 'Hello there', landingPath: '/careers/senior-architect' });
  assert.equal(landed.likely, true);
  assert.match(landed.reasons[0], /careers/);
  assert.equal(classifyLead({ message: 'Hello', landingPath: '/ar/careers' }).likely, true);
  assert.equal(classifyLead({ message: 'Hello', landingPath: '/services', pages: ['/services', '/careers'] }).likely, false, 'visiting careers after landing elsewhere is not enough on its own');
  assert.match(classifyLead({ message: 'my cv', landingPath: '/', pages: ['/', '/careers'] }).reasons.join(), /also visited a careers page/);
});

test('a website lead keeps the request details and visit, and a job seeker is tagged without changing its status', async () => {
  const db = fakeDb();
  const visits = load('src/lib/visits.ts', mocks(db));
  const leads = load('src/lib/leads.ts', mocks(db));
  await visits.recordVisit(visitor(), { kind: 'view', path: '/careers', referrer: 'https://www.google.com/', utm: { source: 'g', medium: 'organic' } }, 'mim.archi');

  const client = visits.describeRequest(visitor());
  const visit = await visits.findVisitForRequest(visitor());
  const id = await leads.createLead({ firstName: 'Sam', lastName: 'Lee', email: 'sam@example.com', message: 'Attached is my CV', client, visit });
  const lead = [...db.store.entries()].find(([key]) => key.startsWith('siteLeads/'))[1];

  assert.equal(lead.client.ip, '203.0.113.7');
  assert.equal(lead.client.country, 'PK');
  assert.equal(lead.visit.landingPath, '/careers');
  assert.equal(lead.visit.channel, 'organic');
  assert.equal(lead.jobSeeker, true);
  assert.equal(lead.status, 'new');
  assert.equal(lead.tags.join(), 'job-seeker');
  assert.ok(lead.jobSeekerReasons.length >= 1);
  assert.ok(lead.activities.some(entry => /likely job seeker/.test(entry.text)));
  assert.ok(id);

  const client2 = visits.describeRequest(visitor({ 'x-real-ip': '198.51.100.4' }));
  await leads.createLead({ firstName: 'Ann', lastName: 'Ray', email: 'ann@example.com', message: 'We need renders for a tower', client: client2, visit: null });
  const clean = [...db.store.entries()].filter(([key]) => key.startsWith('siteLeads/')).map(([, value]) => value).find(v => v.email === 'ann@example.com');
  assert.equal(clean.jobSeeker, false);
  assert.equal(clean.tags.length, 0);
  assert.equal(clean.visit, undefined, 'no visit is stored when tracking saw nothing');
  assert.equal(clean.client.country, 'PK', 'but the request details still are');

  await leads.createLead({ firstName: 'Man', lastName: 'Ual', email: 'man@example.com', message: 'Called about a job', origin: 'manual', by: 'a@mim.archi' });
  const manual = [...db.store.entries()].filter(([key]) => key.startsWith('siteLeads/')).map(([, value]) => value).find(v => v.email === 'man@example.com');
  assert.equal(manual.jobSeeker, undefined, 'a lead typed in by staff is never auto-flagged');
});

const row = (over = {}) => ({
  id: 'x', firstName: 'A', lastName: 'B', email: 'a@b.co', message: 'hi', lang: 'en', origin: 'website',
  status: 'new', priority: 'normal', tags: [], createdAt: '2026-10-05T08:00:00.000Z', updatedAt: '2026-10-05T08:00:00.000Z', ...over,
});

test('filters and stats cover channel, country, landing page and job seekers', () => {
  const { filterLeads, computeStats } = load('src/lib/leads.ts', mocks(fakeDb()));
  const rows = [
    row({ id: '1', client: { country: 'PK' }, visit: { channel: 'organic', landingPath: '/services/branding' } }),
    row({ id: '2', client: { country: 'AE' }, visit: { channel: 'social', landingPath: '/careers' }, jobSeeker: true }),
    row({ id: '3', client: { country: 'PK' }, visit: { channel: 'organic', landingPath: '/careers' }, jobSeeker: true }),
    row({ id: '4' }),
  ];
  const ids = f => filterLeads(rows, f).map(r => r.id).join();
  assert.equal(ids({ channel: 'organic' }), '1,3');
  assert.equal(ids({ country: 'PK' }), '1,3');
  assert.equal(ids({ country: 'unknown' }), '4');
  assert.equal(ids({ jobSeekers: 'only' }), '2,3');
  assert.equal(ids({ jobSeekers: 'hide' }), '1,4');
  assert.equal(ids({ jobSeekers: 'hide', channel: 'organic' }), '1');

  const stats = computeStats(rows);
  assert.equal(stats.jobSeekers, 2);
  assert.equal(stats.byChannel.map(s => `${s.label}:${s.count}`).join(), 'Search:2,Social:1,Not tracked:1');
  assert.equal(stats.byCountry.map(s => `${s.label}:${s.count}`).join(), 'PK:2,AE:1,Unknown:1');
  assert.equal(stats.byLanding[0].label, '/careers');
  assert.equal(stats.byLanding[0].count, 2);
  assert.equal(computeStats([]).jobSeekers, 0);
});

test('the CSV export carries where a lead came from but never the IP address', () => {
  const { leadsToCsv } = load('src/lib/leads.ts', mocks(fakeDb()));
  const csv = leadsToCsv([
    row({
      jobSeeker: true,
      client: { country: 'PK', city: 'Islamabad', ip: '203.0.113.7', userAgent: CHROME },
      visit: { channel: 'organic', landingPath: '/careers', referrer: 'https://www.google.com/', utm: { source: 'g', medium: 'organic', campaign: 'spring' } },
    }),
  ]);
  const [header, line] = csv.split('\r\n');
  for (const column of ['Likely job seeker', 'Country', 'City', 'Channel', 'Landing page', 'Referrer', 'UTM source', 'UTM medium', 'UTM campaign']) assert.ok(header.includes(column), column);
  assert.ok(line.includes('Islamabad') && line.includes('/careers') && line.includes('Search') && line.includes('spring'));
  assert.ok(!csv.includes('203.0.113.7'), 'IP must not be exported');
  assert.ok(!csv.includes('Mozilla'), 'user agent must not be exported');
  assert.equal(header.split(',').length, line.split(',').length, 'every row has a cell for every column');
});

test('job applications go to the careers address, including roles saved with the old studio default', () => {
  const { jobApplyEmail } = load('src/lib/jobs.ts', mocks(fakeDb()));
  assert.equal(jobApplyEmail({}), 'hr@mim.archi');
  assert.equal(jobApplyEmail({ applyEmail: undefined }), 'hr@mim.archi');
  assert.equal(jobApplyEmail({ applyEmail: 'info@mim.archi' }), 'hr@mim.archi', 'the old default is upgraded');
  assert.equal(jobApplyEmail({ applyEmail: 'INFO@mim.archi' }), 'hr@mim.archi');
  assert.equal(jobApplyEmail({ applyEmail: 'recruiting@partner.example' }), 'recruiting@partner.example', 'an address an admin chose is kept');
  assert.equal(jobApplyEmail({ applyEmail: 'hr@mim.archi' }), 'hr@mim.archi');
});

test('the nav badge counts what is really in the collection: new leads, and open leads past their follow-up date', async () => {
  const rows = (day) => [
    { status: 'new' },
    { status: 'new', nextFollowUpAt: '2020-01-01' },
    { status: 'contacted', nextFollowUpAt: '2020-01-01' },
    { status: 'won', nextFollowUpAt: '2020-01-01' },
    { status: 'lost', nextFollowUpAt: '2020-01-01' },
    { status: 'proposal', nextFollowUpAt: '2999-01-01' },
    { status: 'qualified' },
  ];
  const db = {
    collection: () => ({
      where: (field, op, value) => {
        const hits = rows().filter(d => (op === '==' ? d[field] === value : d[field] !== undefined && d[field] < value));
        return {
          count: () => ({ get: async () => ({ data: () => ({ count: hits.length }) }) }),
          select: () => ({ get: async () => ({ docs: hits.map(d => ({ data: () => d })) }) }),
        };
      },
    }),
  };
  const counts = await load('src/lib/leads.ts', mocks(db)).getLeadBadgeCounts();
  assert.equal(counts.newCount, 2);
  assert.equal(counts.overdue, 2, 'new + contacted past their date; won, lost and future dates do not count');

  const empty = { collection: () => ({ where: () => ({ count: () => ({ get: async () => ({ data: () => ({ count: 0 }) }) }), select: () => ({ get: async () => ({ docs: [] }) }) }) }) };
  const none = await load('src/lib/leads.ts', mocks(empty)).getLeadBadgeCounts();
  assert.equal(none.newCount, 0);
  assert.equal(none.overdue, 0, 'an empty collection shows no badge, whatever another collection once held');
});

test('the contact page offers the careers address and keeps both languages in step', () => {
  const { contactContent } = load('src/content/pages/contact.ts', {});
  const { contact } = load('src/lib/site-config.ts', {});
  assert.equal(contact.hrEmail, 'hr@mim.archi');
  assert.equal(contact.email, 'info@mim.archi');
  for (const lang of ['en', 'ar']) {
    assert.ok(contactContent[lang].careersLabel.length > 0, lang);
    assert.ok(contactContent[lang].careersNote.length > 20, lang);
    assert.ok(!contactContent[lang].careersNote.includes('@'), 'the address itself is rendered as a link, not repeated in the sentence');
  }
});
