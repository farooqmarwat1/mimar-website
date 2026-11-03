const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// Values built inside the loaded module come from another realm; compare them as plain data.
const plain = value => JSON.parse(JSON.stringify(value));
const score = () => load('src/lib/ai/approach-score.ts');

// ---- When an article is checked ------------------------------------------------------

test('each article is checked over its first 30 and 90 days, three days after the window, and only once', () => {
  const { checkpointWindow, dueCheckpoints } = score();
  assert.deepEqual(plain(checkpointWindow('2026-10-01T09:30:00.000Z', 30)), { start: '2026-10-01', end: '2026-10-30', dueAt: '2026-11-03' });
  assert.deepEqual(plain(checkpointWindow('2026-10-01T09:30:00.000Z', 90)), { start: '2026-10-01', end: '2026-12-29', dueAt: '2027-01-02' });
  const at = day => new Date(`${day}T12:00:00.000Z`);
  assert.deepEqual(plain(dueCheckpoints('2026-10-01T09:30:00.000Z', {}, at('2026-11-02'))), [], 'not before day 33');
  assert.deepEqual(plain(dueCheckpoints('2026-10-01T09:30:00.000Z', {}, at('2026-11-03'))), [30]);
  assert.deepEqual(plain(dueCheckpoints('2026-10-01T09:30:00.000Z', { d30: { takenAt: 'x' } }, at('2026-11-20'))), [], 'never taken twice');
  assert.deepEqual(plain(dueCheckpoints('2026-10-01T09:30:00.000Z', {}, at('2027-01-05'))), [30, 90], 'a late run catches up both');
  assert.deepEqual(plain(dueCheckpoints(undefined, {}, at('2027-01-05'))), []);
});

// ---- Scoring and ranking -------------------------------------------------------------------

const snap = over => ({ takenAt: 't', indexed: true, keywordPosition: 8, countryPosition: null, clicks: 10, impressions: 200, position: 9, views: 50, organic: 20, leads: 0, gsc: 'ok', ...over });
const rows = (approach, list) => list.map(snapshot => ({ approach, snapshot: snap(snapshot) }));

test('approaches are scored from indexing, page-1 keyword ranks, clicks and leads, and ranked best first', () => {
  const { scoreApproaches } = score();
  const result = scoreApproaches([
    ...rows('search', [{ keywordPosition: 2, clicks: 40, leads: 1 }, { keywordPosition: 6, clicks: 20 }, { keywordPosition: 25, indexed: false, clicks: 0 }]),
    ...rows('competitors', [{ keywordPosition: 3, clicks: 10, leads: 2 }, { keywordPosition: 4, clicks: 10, leads: 1 }, { keywordPosition: 9, clicks: 10 }]),
    ...rows('news', [{}, {}]),
  ], ['search', 'competitors', 'community', 'news']);
  const by = Object.fromEntries(result.map(entry => [entry.approach, entry]));
  // search: 2/3 indexed... 2 of 3 indexed, 2 of 3 on page 1, 1 of 3 top 3, 20 clicks/article (best), 1/3 lead per article.
  assert.equal(by.search.indexedRate.toFixed(3), (2 / 3).toFixed(3));
  assert.equal(by.search.page1Rate.toFixed(3), (2 / 3).toFixed(3));
  assert.equal(by.search.top3Rate.toFixed(3), (1 / 3).toFixed(3));
  assert.equal(by.search.clicksPerArticle, 20);
  assert.equal(by.search.points.clicks, 20, 'the best approach gets the full clicks points');
  // competitors: all indexed, all on page 1, 1 of 3 in the top 3, 10 clicks, 1 lead per article (best).
  assert.equal(by.competitors.points.leads, 25);
  assert.equal(by.competitors.points.clicks, 10);
  assert.equal(by.competitors.score, Math.round(15 + 30 + (1 / 3) * 10 + 10 + 25));
  assert.equal(by.search.score, Math.round((2 / 3) * 15 + (2 / 3) * 30 + (1 / 3) * 10 + 20 + ((1 / 3) / 1) * 25));
  assert.deepEqual(plain(result.map(entry => [entry.approach, entry.rank])), [['competitors', 1], ['search', 2], ['community', null], ['news', null]]);
  assert.equal(by.news.score, null, 'two articles are too few to rank');
  assert.equal(by.community.articles, 0);
});

test('a page that never showed for its keyword counts as not on page 1, and ties go to leads', () => {
  const { scoreApproaches } = score();
  const result = scoreApproaches([
    ...rows('a', [{ keywordPosition: null }, { keywordPosition: null }, { keywordPosition: null }]),
    ...rows('b', [{ keywordPosition: null }, { keywordPosition: null }, { keywordPosition: null, leads: 0 }]),
  ], ['a', 'b']);
  assert.equal(result[0].page1Rate, 0);
  assert.equal(result[0].score, result[1].score);
  const tie = scoreApproaches([...rows('a', [{}, {}, {}]), ...rows('b', [{}, {}, { leads: 3 }])], ['a', 'b']);
  assert.equal(tie[0].approach, 'b', 'more leads wins');
});

test('without Search Console the Google parts are left out and the rest is scaled to 100', () => {
  const { scoreApproaches } = score();
  const off = over => ({ gsc: 'off', indexed: null, keywordPosition: null, clicks: 0, ...over });
  const result = scoreApproaches([...rows('a', [off({ leads: 2 }), off({}), off({})]), ...rows('b', [off({}), off({}), off({ leads: 1 })])], ['a', 'b']);
  assert.equal(result[0].approach, 'a');
  assert.equal(result[0].score, 100, 'leads are the only part, so the best gets 100');
  assert.equal(result[1].score, 50);
  assert.equal(result[0].indexedRate, null);
  assert.equal(result[0].page1Rate, null);
});

// ---- Search Console answers ----------------------------------------------------------------

const searchConsole = () => load('src/lib/search-console.ts', {
  '@/lib/firebase/admin': { adminDb: () => ({}) },
  '@/lib/firebase/credentials': { resolveCredentials: () => ({ ok: false }) },
});

test('the keyword rank is impression-weighted across countries, with the target market on its own', () => {
  const { keywordPositionFromRows } = searchConsole();
  const rows = [
    { keys: ['are'], clicks: 2, impressions: 100, position: 6 },
    { keys: ['usa'], clicks: 0, impressions: 300, position: 18 },
  ];
  assert.deepEqual(plain(keywordPositionFromRows(rows, 'are')), { position: 15, clicks: 2, impressions: 400, countryPosition: 6 });
  assert.equal(keywordPositionFromRows(rows, 'sau').countryPosition, null, 'no impressions in the target market');
  assert.equal(keywordPositionFromRows([], 'are'), null, 'never shown for the keyword');
});

test('the URL inspection answer becomes indexed or not, with Google\'s own wording', () => {
  const { indexStatusFromInspection } = searchConsole();
  assert.deepEqual(plain(indexStatusFromInspection({ inspectionResult: { indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed', lastCrawlTime: '2026-10-30T10:00:00Z' } } })), {
    indexed: true, coverage: 'Submitted and indexed', lastCrawl: '2026-10-30T10:00:00Z',
  });
  assert.deepEqual(plain(indexStatusFromInspection({ inspectionResult: { indexStatusResult: { verdict: 'NEUTRAL', coverageState: 'Crawled - currently not indexed' } } })), {
    indexed: false, coverage: 'Crawled - currently not indexed',
  });
  assert.equal(indexStatusFromInspection({}).coverage, 'Unknown');
});

// ---- Competitor topics as the sixth approach ------------------------------------------------

test('competitor topics are their own approach, for new ideas, old stored ideas and old drafts', () => {
  const { APPROACH_KEYS, parseMix } = load('src/lib/ai/idea-plan.ts');
  assert(APPROACH_KEYS.includes('competitors'));
  assert.equal(parseMix(undefined).competitors, 1);

  const { normalizeIdea } = load('src/lib/ideas/store.ts', { '@/lib/firebase/admin': { adminDb: () => ({}) } });
  assert.equal(normalizeIdea({ source: 'competitor', approach: 'search' }).approach, 'competitors');
  assert.equal(normalizeIdea({ source: 'autocomplete', approach: 'search' }).approach, 'search');

  const { approachOf } = load('src/lib/blog-performance.ts', {
    '@/lib/firebase/admin': { adminDb: () => ({}) },
    '@/lib/leads': { listLeadJourneys: async () => [] },
    '@/lib/posts': { POSTS_COLLECTION: 'posts' },
    '@/lib/search-console': {},
    '@/lib/visits': { BLOG_DAILY_COLLECTION: 'daily' },
  });
  assert.equal(approachOf({ approach: 'search', strategy: 'question', keywordSource: 'competitor' }), 'competitors', 'drafted before the split');
  assert.equal(approachOf({ approach: 'search', strategy: 'question', keywordSource: 'search-console' }), 'search');
  assert.equal(approachOf({ strategy: 'question' }), 'search');
  assert.equal(approachOf(undefined), 'other');
});

test('a competitor idea is planned as competitor topics, with the writer choosing the keyword', async () => {
  const statuses = {};
  const idea = { id: 'c1', approach: 'competitors', source: 'competitor', title: 'What drives 3D rendering cost for villas', keyword: '3d rendering cost villa', group: '3d-visualization', evidence: { count: 4, fame: 60, note: 'Covered by a.example, b.example' }, seedUrls: [], status: 'new', createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() };
  const auto = load('src/lib/ai/auto-topic.ts', {
    '@/lib/generation': { listTopics: async () => [{ source: 'auto', status: 'done', approach: 'search', strategy: 'question', topic: 'Older topic', group: 'branding', region: 'UAE', createdAt: new Date(Date.now() - 86_400_000).toISOString() }] },
    '@/lib/blog-store': { getBlogEntries: async () => [] },
    '@/lib/ideas/store': { listIdeas: async () => [idea], setIdeaStatus: async (id, status) => { statuses[id] = status; } },
    '@/lib/search-console': { getKeywordRows: async () => [] },
  });
  const prompts = [];
  const provider = { suggest: async ({ prompt }) => { prompts.push(prompt); return { topic: 'How much does a villa 3D rendering cost in Dubai', keyword: 'villa 3d rendering cost' }; } };
  const topic = await auto.planAutoTopic(provider, { inputTokens: 0, outputTokens: 0, searches: 0 });
  assert.equal(topic.approach, 'competitors');
  assert.equal(topic.keywordSource, 'competitor');
  assert.equal(topic.keyword, 'villa 3d rendering cost', 'not forced word for word: it is not a real search');
  assert.doesNotMatch(prompts[0], /Required primary keyword/);
  assert.match(prompts[0], /Where the idea comes from: Competitor topics/);
  assert.equal(statuses.c1, 'queued');
});
