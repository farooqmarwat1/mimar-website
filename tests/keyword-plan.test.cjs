const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// Values built inside the loaded module come from another realm; compare them as plain data.
const plain = value => JSON.parse(JSON.stringify(value));

const plan = () => load('src/lib/ai/keyword-plan.ts');
const row = over => ({ query: '3d rendering cost dubai', country: 'are', page: '/3d-visualization-services-uae', clicks: 1, impressions: 100, position: 12, ...over });

test('Search Console countries map onto the four region pages', () => {
  const { COUNTRY_TO_REGION } = plan();
  assert.deepEqual({ ...COUNTRY_TO_REGION }, { are: 'UAE', usa: 'USA', sau: 'Saudi Arabia', pak: 'Pakistan' });
});

test('a search belongs to a service group by its words first, then by the page Google showed', () => {
  const { groupForQuery } = plan();
  assert.equal(groupForQuery('3d virtual tour for apartments'), 'interactive-services');
  assert.equal(groupForQuery('architecture firm branding'), 'branding');
  assert.equal(groupForQuery('exterior rendering price'), '3d-visualization');
  assert.equal(groupForQuery('interior design company riyadh'), 'architectural-design');
  assert.equal(groupForQuery('real estate seo agency'), 'marketing');
  assert.equal(groupForQuery('cost per square foot', '/services/3d-visualization/exterior-rendering'), '3d-visualization');
  assert.equal(groupForQuery('cost per square foot'), null);
});

test('blog types: quick wins sit on page 2-3 with real impressions; questions and buyer searches by their words', () => {
  const { classifyStrategies } = plan();
  assert.deepEqual(plain(classifyStrategies({ query: 'how long does a 3d rendering take', impressions: 50, position: 15 })), ['quick-win', 'question']);
  assert.deepEqual(plain(classifyStrategies({ query: '3d rendering cost dubai', impressions: 50, position: 4 })), ['buyer-intent']);
  assert.deepEqual(plain(classifyStrategies({ query: 'architectural walkthrough examples', impressions: 5, position: 15 })), [], 'too few impressions for a quick win');
  assert.deepEqual(plain(classifyStrategies({ query: 'architectural walkthrough examples', impressions: 50, position: 31 })), [], 'page 4 is not a quick win');
});

test('trimRows keeps only target countries, unbranded 2-6 word searches, busiest first', () => {
  const { trimRows } = plan();
  const kept = trimRows([
    row({ query: 'mimar studios dubai', impressions: 900 }),
    row({ query: 'rendering', impressions: 800 }),
    row({ country: 'gbr', impressions: 700 }),
    row({ query: 'interior rendering company', impressions: 20 }),
    row({ impressions: 60 }),
  ]);
  assert.deepEqual(kept.map(r => r.impressions), [60, 20]);
});

test('pickKeyword picks the best search for the type, region and service, and skips covered and branded ones', () => {
  const { pickKeyword } = plan();
  const rows = [
    row({ query: '3d rendering cost dubai', impressions: 300, position: 6 }),
    row({ query: '3d rendering cost dubai', page: '/services/3d-visualization', impressions: 100, position: 10, clicks: 4 }),
    row({ query: 'rendering company dubai', impressions: 200, position: 9 }),
    row({ query: 'mimar 3d rendering price', impressions: 999, position: 3 }),
    row({ query: 'interior design company dubai', impressions: 500, position: 5, page: '/services/architectural-design' }),
    row({ query: '3d rendering cost usa', country: 'usa', impressions: 1000, position: 7 }),
  ];
  const pick = pickKeyword(rows, { strategy: 'buyer-intent', region: 'UAE', group: '3d-visualization', used: [] });
  assert.equal(pick.keyword, '3d rendering cost dubai');
  assert.equal(pick.stats.impressions, 400, 'rows of one search are added up across pages');
  assert.equal(pick.stats.clicks, 5);
  assert.equal(pick.stats.position, 7, 'position is weighted by impressions');
  assert.equal(pick.stats.page, '/3d-visualization-services-uae');
  assert.ok(pick.related.includes('rendering company dubai'));

  const next = pickKeyword(rows, { strategy: 'buyer-intent', region: 'UAE', group: '3d-visualization', used: ['How much does 3D rendering cost in Dubai'] });
  assert.equal(next.keyword, 'rendering company dubai', 'a search close to an existing title is skipped');
  assert.equal(pickKeyword(rows, { strategy: 'question', region: 'UAE', used: [] }), null);
  assert.equal(pickKeyword(rows, { strategy: 'buyer-intent', region: 'UAE', used: [] }).keyword, 'interior design company dubai', 'any service when none is given');
});

test('a quick win whose ranking page is already an article is left for updating that article', () => {
  const { pickKeyword } = plan();
  const rows = [
    row({ query: 'walkthrough animation price', page: '/blog/walkthrough-animation-guide', impressions: 500, position: 11 }),
    row({ query: 'aerial rendering services', page: '/services/3d-visualization', impressions: 80, position: 14 }),
  ];
  assert.equal(pickKeyword(rows, { strategy: 'quick-win', region: 'UAE', used: [] }).keyword, 'aerial rendering services');
  const legacy = pickKeyword([row({ query: 'aerial rendering services', page: '/old-article', impressions: 80, position: 14 })], {
    strategy: 'quick-win', region: 'UAE', used: [], isArticlePage: path => path === '/old-article',
  });
  assert.equal(legacy, null);
});

test('blog types are taken in turn, the least used in the last 30 days first', () => {
  const { nextStrategy } = plan();
  const now = new Date('2026-10-28T00:00:00Z');
  const item = (strategy, day) => ({ strategy, createdAt: `2026-10-${day}T05:00:00.000Z` });
  assert.equal(nextStrategy([], now), 'quick-win');
  assert.equal(nextStrategy([item('quick-win', '20')], now), 'question');
  assert.equal(nextStrategy([item('quick-win', '20'), item('question', '23')], now), 'buyer-intent');
  assert.equal(nextStrategy([item('quick-win', '20'), item('question', '23'), item('buyer-intent', '26')], now), 'quick-win');
  assert.equal(nextStrategy([item('question', '20'), item('question', '23'), item('buyer-intent', '26')], now), 'quick-win', 'the least used catches up');
  assert.equal(nextStrategy([{ strategy: 'question', createdAt: '2026-08-01T00:00:00.000Z' }, { createdAt: '2026-10-20T00:00:00.000Z' }], now), 'quick-win', 'old and untagged topics do not count');
});

const performance = () => load('src/lib/blog-performance.ts', {
  'firebase-admin/firestore': { FieldPath: {} }, '@/lib/firebase/admin': {}, '@/lib/leads': {}, '@/lib/posts': {}, '@/lib/search-console': {}, '@/lib/visits': {},
});

test('an article is measured over its first 28 days, English and Arabic together', () => {
  const { measureWindow, sumCounters } = performance();
  const now = new Date('2026-10-28T12:00:00Z');
  assert.equal(measureWindow('2026-10-25T09:00:00.000Z', now).ageDays, 4);
  const old = measureWindow('2026-08-01T09:00:00.000Z', now);
  assert.equal(old.ageDays, 28);
  assert.equal(old.end.toISOString().slice(0, 10), '2026-08-28');

  const daily = {
    20261025: { views: { '/blog/a': 3, '/ar/blog/a': 2, '/blog/b': 9 }, organic: { '/blog/a': 1 }, seconds: { '/blog/a': 90 } },
    20261026: { views: { '/blog/a': 1 } },
    20261024: { views: { '/blog/a': 100 } },
  };
  const { start, end } = measureWindow('2026-10-25T09:00:00.000Z', now);
  assert.deepEqual(plain(sumCounters(daily, '/blog/a', start, end)), { views: 6, organic: 1, seconds: 90 });
});

test('blog types are compared per article per week, with Google position weighted by impressions', () => {
  const { summarize } = performance();
  const post = over => ({ status: 'published', group: 'question', ageDays: 7, views: 0, organic: 0, seconds: 0, leads: 0, gsc: null, ...over });
  const groups = summarize([
    post({ views: 14, organic: 7, seconds: 140, leads: 1, keywordSource: 'search-console', gsc: { clicks: 3, impressions: 100, ctr: 0.03, position: 10 } }),
    post({ ageDays: 14, views: 14, organic: 0, gsc: { clicks: 1, impressions: 300, ctr: 0, position: 20 } }),
    post({ status: 'draft', ageDays: 0 }),
    post({ group: 'other', views: 70 }),
  ]);
  const question = groups.find(g => g.key === 'question');
  assert.deepEqual(plain(groups.map(g => g.key)), ['quick-win', 'question', 'buyer-intent', 'other']);
  assert.equal(question.published, 2);
  assert.equal(question.drafts, 1);
  assert.equal(question.realKeywords, 1);
  assert.equal(question.viewsPerWeek, 10.5, '(14 + 7) / 2 per week');
  assert.equal(question.organicPerWeek, 3.5);
  assert.equal(question.avgSeconds, 5);
  assert.equal(question.leads, 1);
  assert.equal(question.impressions, 400);
  assert.equal(question.position, 17.5);
  assert.equal(groups.find(g => g.key === 'quick-win').published, 0);
});
