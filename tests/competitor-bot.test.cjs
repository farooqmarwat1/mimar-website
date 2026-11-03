const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// Values built inside the loaded module come from another realm; compare them as plain data.
const plain = value => JSON.parse(JSON.stringify(value));
const intel = () => load('src/lib/ai/competitor-intel.ts');

// ---- Reading a page ------------------------------------------------------------

const PAGE = `<html><head>
  <title>What drives 3D rendering cost | Studio Name</title>
  <meta property="og:title" content="What drives 3D rendering cost &amp; why | Studio Name">
  <meta name="description" content="A guide to 3D rendering pricing.">
  <meta property="article:published_time" content="2026-09-14T08:00:00+00:00">
  </head><body><nav><h2>Menu heading</h2></nav>
  <article><h1>What drives 3D rendering cost</h1>
    <p>Secret paragraph text that must never be kept.</p>
    <h2>Scope and views</h2><h2>Turnaround <b>time</b></h2><h2>Scope and views</h2>
  </article>
  <aside><h2>Newsletter</h2></aside></body></html>`;

test('a post yields its title, heading, section headings, description and date, never its text', () => {
  const page = intel().parseArticlePage(PAGE, 'studio.example');
  assert.equal(page.title, 'What drives 3D rendering cost & why');
  assert.equal(page.h1, 'What drives 3D rendering cost');
  assert.equal(page.description, 'A guide to 3D rendering pricing.');
  assert.deepEqual(plain(page.headings), ['Scope and views', 'Turnaround time'], 'menus and sidebars left out, repeats dropped');
  assert.equal(page.publishedAt, '2026-09-14T08:00:00.000Z');
  assert.doesNotMatch(JSON.stringify(page), /Secret paragraph/);
});

test('the site name is taken off a title only when it is the site name', () => {
  const { cleanTitle } = intel();
  assert.equal(cleanTitle('How to brief a renderer | Visengine', 'visengine.com'), 'How to brief a renderer');
  assert.equal(cleanTitle('How to brief a renderer - Visengine', 'visengine.com'), 'How to brief a renderer');
  assert.equal(cleanTitle('Rendering - a buyer guide', 'visengine.com'), 'Rendering - a buyer guide', 'a dash that is not the brand stays');
  assert.equal(cleanTitle('Plain title', 'visengine.com'), 'Plain title');
});

test('the posts a site promotes as popular are found, on its own site only', () => {
  const { popularLinks } = intel();
  const html = `<div class="side"><h4>Popular Posts</h4><ul>
    <li><a href="/how-much-does-rendering-cost/">Cost</a></li>
    <li><a href="https://www.studio.example/vr-for-real-estate/">VR</a></li>
    <li><a href="https://other.example/elsewhere/">Elsewhere</a></li>
    <li><a href="#top">Top</a></li></ul></div><h4>Latest news</h4><a href="/not-popular/">No</a>`;
  assert.deepEqual(plain(popularLinks(html, 'https://studio.example/blog/', 'studio.example')), [
    'https://studio.example/how-much-does-rendering-cost/', 'https://www.studio.example/vr-for-real-estate/',
  ], 'the widget ends at the next heading');
});

// ---- robots.txt ------------------------------------------------------------------

test('robots.txt is obeyed: our own group beats *, the longest rule wins, wildcards work', () => {
  const { robotsAllows, robotsCrawlDelay } = intel();
  const robots = `User-agent: *
Disallow: /private/
Disallow: /*?replytocom=
Allow: /private/public/
Crawl-delay: 3

User-agent: MimarStudiosBot
Disallow: /secret/
`;
  assert.equal(robotsAllows(robots, '/blog/post/'), true);
  assert.equal(robotsAllows(robots, '/secret/page'), false, 'the group that names us applies');
  assert.equal(robotsAllows(robots, '/private/x'), true, 'and * does not');
  const star = robots.split('User-agent: MimarStudiosBot')[0];
  assert.equal(robotsAllows(star, '/private/x'), false);
  assert.equal(robotsAllows(star, '/private/public/x'), true, 'longest match wins');
  assert.equal(robotsAllows(star, '/post/?replytocom=5'), false, 'wildcard');
  assert.equal(robotsCrawlDelay(star), 3);
  assert.equal(robotsCrawlDelay(robots), 0, 'our group has no delay');
  assert.equal(robotsAllows('User-agent: *\nDisallow: /', '/anything'), false);
  assert.equal(robotsAllows('User-agent: *\nDisallow:', '/anything'), true, 'an empty Disallow allows everything');
  assert.equal(robotsAllows(null, '/anything'), true);
});

// ---- Is a subject established? -----------------------------------------------------

test('fame counts competitors, featured posts, recency, autocomplete and our own impressions', () => {
  const { fameScore, isEstablished, demandSignals } = intel();
  assert.deepEqual(plain(fameScore({ competitors: 1, featured: 0, recent: 0, autocomplete: false, impressions: 0 })), { fame: 8, notes: ['1 competitor covers it'] });
  const strong = fameScore({ competitors: 6, featured: 3, recent: 2, autocomplete: true, impressions: 1000 });
  assert.equal(strong.fame, 40 + 20 + 10 + 15 + 15, 'capped per signal');
  assert.equal(strong.notes.length, 5);
  assert.equal(fameScore({ competitors: 9, featured: 9, recent: 9, autocomplete: true, impressions: 10 ** 9 }).fame <= 100, true);
  assert(isEstablished({ competitors: 2, featured: 0, recent: 0, autocomplete: false, impressions: 0 }), 'two studios');
  assert(isEstablished({ competitors: 1, featured: 1, recent: 0, autocomplete: false, impressions: 0 }), 'one studio and it is featured');
  assert(isEstablished({ competitors: 1, featured: 0, recent: 0, autocomplete: true, impressions: 0 }), 'one studio and Google suggests it');
  assert(!isEstablished({ competitors: 1, featured: 0, recent: 1, autocomplete: false, impressions: 0 }), 'one studio alone is not established');
  assert(!isEstablished({ competitors: 0, featured: 0, recent: 0, autocomplete: true, impressions: 99 }), 'no competitor at all');

  const demand = demandSignals('3d rendering cost', ['3d rendering cost per hour'], [{ query: '3d rendering cost dubai', impressions: 120 }, { query: 'villa design', impressions: 500 }]);
  assert.deepEqual(plain(demand), { autocomplete: true, impressions: 120 });
  assert.deepEqual(plain(demandSignals('villa lighting', [], [])), { autocomplete: false, impressions: 0 });
});

test('sitemap entries carry their last-modified date', () => {
  const { parseSitemapEntries } = load('src/lib/ai/idea-plan.ts');
  const xml = '<urlset><url><loc>https://a.example/x-y-z/</loc><lastmod>2026-10-01T10:00:00+00:00</lastmod></url><url><loc>https://a.example/p-q-r/</loc></url><url><loc>http://insecure.example/s</loc></url></urlset>';
  assert.deepEqual(plain(parseSitemapEntries(xml)), [{ loc: 'https://a.example/x-y-z/', lastmod: '2026-10-01T10:00:00.000Z' }, { loc: 'https://a.example/p-q-r/', lastmod: '' }]);
});

// ---- The crawler, on a fake site -----------------------------------------------------

function fakeWeb(site) {
  const requests = [];
  return {
    requests,
    fetchFeed: async url => { requests.push(url); return site[url] ?? null; },
    fetchHtml: async url => { requests.push(url); return site[url] ? { url, html: site[url] } : null; },
  };
}

const post = (title, extra = '') => `<html><head><title>${title} | Studio</title><meta property="article:published_time" content="2026-10-01T00:00:00Z"></head><body><article><h1>${title}</h1><h2>First section</h2></article>${extra}</body></html>`;

const SITE = {
  'https://studio.example/robots.txt': 'User-agent: *\nDisallow: /blog/draft-\nSitemap: https://studio.example/post-sitemap.xml\n',
  'https://studio.example/post-sitemap.xml': `<urlset>
    <url><loc>https://studio.example/how-much-does-3d-rendering-cost/</loc><lastmod>2026-10-20T00:00:00Z</lastmod></url>
    <url><loc>https://studio.example/blog/draft-3d-rendering-secret-plans/</loc><lastmod>2026-10-25T00:00:00Z</lastmod></url>
    <url><loc>https://studio.example/vr-tours-for-real-estate-sales/</loc><lastmod>2026-09-01T00:00:00Z</lastmod></url>
    <url><loc>https://studio.example/already-known-rendering-guide-post/</loc><lastmod>2026-10-10T00:00:00Z</lastmod></url>
    <url><loc>https://elsewhere.example/3d-rendering-copied-from-elsewhere/</loc><lastmod>2026-10-10T00:00:00Z</lastmod></url>
  </urlset>`,
  'https://studio.example/': '<html><body><h4>Most Read</h4><a href="/how-much-does-3d-rendering-cost/">Cost</a></body></html>',
  'https://studio.example/how-much-does-3d-rendering-cost/': post('How much does 3D rendering cost'),
  'https://studio.example/vr-tours-for-real-estate-sales/': post('VR tours for real estate sales', '<h4>Popular Posts</h4><a href="/vr-tours-for-real-estate-sales/">VR</a>'),
};

function crawler(site) {
  const web = fakeWeb(site);
  const crawl = load('src/lib/ideas/competitor-crawl.ts', { '@/lib/ai/safe-fetch': web });
  return { web, crawl };
}

test('the crawler reads new posts newest first, skips what robots.txt forbids and what it already holds', async () => {
  const { web, crawl } = crawler(SITE);
  const known = new Set(['https://studio.example/already-known-rendering-guide-post/']);
  const result = await crawl.crawlCompetitor('studio.example', { perSite: 10, delayMs: 0, deadline: Date.now() + 60000, known, now: new Date('2026-11-03T00:00:00Z') });
  assert.equal(result.discovered, 4, 'posts on the site only (the other host is ignored)');
  assert.equal(result.blocked, 1, 'robots.txt');
  assert.deepEqual(plain(result.pages.map(page => page.url)), ['https://studio.example/how-much-does-3d-rendering-cost/', 'https://studio.example/vr-tours-for-real-estate-sales/']);
  assert.equal(web.requests.some(url => url.includes('draft-3d-rendering')), false, 'the forbidden page was never requested');
  assert.equal(web.requests.some(url => url.includes('already-known')), false);
  assert.equal(web.requests.some(url => url.includes('elsewhere.example')), false);
  const first = result.pages[0];
  assert.equal(first.title, 'How much does 3D rendering cost');
  assert.deepEqual(plain(first.headings), ['First section']);
  assert.equal(first.publishedAt, '2026-10-01T00:00:00.000Z');
  assert.equal(first.lastmod, '2026-10-20T00:00:00.000Z');
  assert.equal('text' in first, false);
  assert.deepEqual(plain(result.featured.sort()), ['https://studio.example/how-much-does-3d-rendering-cost/', 'https://studio.example/vr-tours-for-real-estate-sales/']);
});

test('the crawler reads only perSite posts per run, stops at the deadline, and records pages it cannot read', async () => {
  const { crawl } = crawler(SITE);
  const one = await crawl.crawlCompetitor('studio.example', { perSite: 1, delayMs: 0, deadline: Date.now() + 60000, known: new Set() });
  assert.equal(one.added, 1);
  const late = await crawl.crawlCompetitor('studio.example', { perSite: 10, delayMs: 0, deadline: Date.now() - 1, known: new Set() });
  assert.equal(late.pages.length, 0, 'out of time');

  const broken = { ...SITE, 'https://studio.example/how-much-does-3d-rendering-cost/': undefined };
  const { crawl: brokenCrawl } = crawler(broken);
  const known = new Set(['https://studio.example/already-known-rendering-guide-post/']);
  const result = await brokenCrawl.crawlCompetitor('studio.example', { perSite: 10, delayMs: 0, deadline: Date.now() + 60000, known });
  assert.equal(result.failed, 1);
  assert.equal(result.added, 1, 'the other readable post is still kept');
  assert.equal(result.pages.find(page => page.failed).title, '');
});

test('with no robots.txt the crawler falls back to /sitemap.xml and reads /blog/ posts', async () => {
  const site = {
    'https://studio.example/sitemap.xml': '<urlset><url><loc>https://studio.example/blog/vr-tours-for-real-estate-sales/</loc></url><url><loc>https://studio.example/about-us/</loc></url></urlset>',
    'https://studio.example/blog/vr-tours-for-real-estate-sales/': post('VR tours for real estate sales'),
  };
  const { crawl } = crawler(site);
  const result = await crawl.crawlCompetitor('studio.example', { perSite: 5, delayMs: 0, deadline: Date.now() + 60000, known: new Set() });
  assert.equal(result.discovered, 1, 'only the blog post, not the about page');
  assert.equal(result.added, 1);
});

// ---- The whole collector -----------------------------------------------------------------

function collectorWith({ domains, stored = [], crawls = [], ideas = [], rows = [], suggestions }) {
  const saved = { pages: [], featured: null, aiItems: null };
  const collector = load('src/lib/ideas/collectors/competitors.ts', {
    '@/lib/ideas/store': { getCompetitors: async () => domains, listIdeas: async () => ideas },
    '@/lib/search-console': { getKeywordRows: async () => rows },
    '@/lib/ideas/competitor-crawl': { crawlCompetitor: async domain => crawls.find(crawl => crawl.domain === domain) ?? { domain, discovered: 0, added: 0, failed: 0, blocked: 0, featured: [], pages: [] } },
    '@/lib/ideas/competitor-pages': {
      listCompetitorPages: async () => [...stored, ...saved.pages.map((page, index) => ({ ...page, id: 'n' + index }))],
      saveCompetitorPages: async pages => { saved.pages.push(...pages); },
      getFeatured: async names => Object.fromEntries(names.map(name => [name, (saved.featured ?? {})[name] ?? []])),
      setFeatured: async byDomain => { saved.featured = byDomain; },
      pruneCompetitorPages: async () => 0,
    },
    '@/lib/ideas/ai': {
      off: message => ({ state: 'off', ideas: [], message }),
      inBatches: async (items, _limit, task) => Promise.all(items.map(task)),
      toIdea: (suggestion, approach, source, evidence) => ({ approach, source, title: suggestion.title, keyword: suggestion.keyword, evidence }),
      aiIdeas: async (_ctx, input) => { saved.aiItems = input.items; return suggestions(input.items); },
    },
  }).competitorsCollector;
  return { collector, saved };
}

const page = (domain, title, extra = {}) => ({ id: domain + title, domain, url: `https://${domain}/${title.toLowerCase().replace(/\W+/g, '-')}/`, title, headings: ['Section one'], publishedAt: '2026-10-01T00:00:00.000Z', firstSeenAt: '2026-11-01T00:00:00.000Z', fetchedAt: '2026-11-01T00:00:00.000Z', ...extra });
const ctx = { provider: {}, usage: {}, covered: ['What is rendering'], now: new Date('2026-11-03T00:00:00Z') };

test('only subjects that are established become ideas, with the reasons attached', async () => {
  const stored = [
    page('a.example', '3D rendering cost guide for villas'),
    page('b.example', 'What affects 3D rendering cost for villa projects', { url: 'https://b.example/cost/' }),
    page('c.example', 'Virtual tour software for real estate sellers'),
    page('c.example', 'Unreadable', { failed: true, title: '' }),
  ];
  const { collector, saved } = collectorWith({
    domains: ['a.example', 'b.example', 'c.example', 'd.example'],
    stored,
    ideas: [{ source: 'autocomplete', keyword: '3d rendering cost villa', title: '3d rendering cost villa' }],
    rows: [{ query: '3d rendering cost villa dubai', impressions: 200 }],
    crawls: [{ domain: 'a.example', discovered: 5, added: 1, failed: 0, blocked: 2, featured: ['https://a.example/3d-rendering-cost-guide-for-villas/'], pages: [] }],
    suggestions: items => [
      { title: 'What drives 3D rendering cost for villas', keyword: '3d rendering cost villa', region: '', note: '', sources: [0, 1] },
      { title: 'Virtual tour software for sellers', keyword: 'virtual tour software', region: '', note: '', sources: [2] },
    ],
  });
  const result = await collector.collect(ctx);
  assert.equal(result.state, 'ok');
  assert.equal(result.ideas.length, 1, 'a subject only one studio covers, with no other signal, is dropped');
  const idea = result.ideas[0];
  assert.equal(idea.evidence.count, 2);
  assert.equal(idea.evidence.fame, 16 + 10 + 10 + 15 + 14, '2 studios, 1 featured, recent, autocomplete, 200 impressions');
  assert.deepEqual(plain(idea.evidence.signals), [
    '2 competitors cover it', '1 featured as popular on the competitor\'s own site', 'written about in the last year', 'Google autocomplete suggests it', 'our site was shown 200 times for similar searches',
  ]);
  assert.match(idea.evidence.note, /Covered by a\.example, b\.example/);
  assert.match(result.message, /1 new posts read, 2 skipped because robots\.txt/);
  assert.match(result.message, /dropped as covered by one site only/);
  assert.match(result.message, /no readable blog for d\.example/);
  assert(saved.aiItems.every(line => !/Unreadable/.test(line)), 'failed pages never reach the AI');
  assert(saved.aiItems.some(line => /covers: Section one/.test(line)), 'the AI sees the first headings');
  assert.deepEqual(plain(saved.featured['a.example']), ['https://a.example/3d-rendering-cost-guide-for-villas/']);
});

test('a site featuring a post puts it first, and subjects we already cover are not offered', async () => {
  const stored = [
    page('a.example', 'Old 3D rendering post from 2019', { publishedAt: '2019-01-01T00:00:00.000Z' }),
    page('a.example', 'Fresh 3D rendering post this month'),
    page('a.example', 'What is rendering'),
  ];
  const { collector, saved } = collectorWith({ domains: ['a.example'], stored, suggestions: () => [] });
  await collector.collect({ ...ctx, covered: ['What is rendering'] });
  assert.equal(saved.aiItems.length, 2, 'the covered subject is dropped');
  assert.match(saved.aiItems[0], /^Fresh 3D rendering post this month/);
});

test('when no blog can be read at all it says so, and without an AI provider it is off', async () => {
  const none = collectorWith({ domains: ['a.example'], stored: [], suggestions: () => [] });
  const result = await none.collector.collect(ctx);
  assert.equal(result.state, 'error');
  assert.match(result.message, /No blog posts could be read/);
  assert.equal((await none.collector.collect({ ...ctx, provider: null })).state, 'off');
  assert.equal((await collectorWith({ domains: [], suggestions: () => [] }).collector.collect(ctx)).state, 'off');
});

// ---- Page furniture, translations, non-blog "popular" links -------------------------

test('headings that are page furniture are dropped, and the page language is read', () => {
  const { parseArticlePage } = intel();
  const html = '<html lang="fr-FR"><head><title>Rendu 3D</title></head><body><article><h1>Rendu 3D</h1><h2>Why lighting matters</h2><h2>You might also like</h2><h2>Our Services</h2><h2>Leave a comment</h2></article></body></html>';
  const page = parseArticlePage(html, 'studio.example');
  assert.deepEqual(plain(page.headings), ['Why lighting matters']);
  assert.equal(page.lang, 'fr');
  assert.equal(parseArticlePage('<html><head><title>x y z</title></head></html>', 'studio.example').lang, '', 'no language stated');
});

test('translated posts are not kept, and only blog posts count as the featured ones', async () => {
  const site = {
    ...SITE,
    'https://studio.example/': '<html><body><h4>Most Read</h4><a href="/how-much-does-3d-rendering-cost/">Cost</a><a href="/services/exterior-rendering/">Service</a></body></html>',
    'https://studio.example/vr-tours-for-real-estate-sales/': post('VR tours for real estate sales').replace('<html>', '<html lang="it">'),
  };
  const { crawl } = crawler(site);
  const known = new Set(['https://studio.example/already-known-rendering-guide-post/']);
  const result = await crawl.crawlCompetitor('studio.example', { perSite: 10, delayMs: 0, deadline: Date.now() + 60000, known });
  assert.deepEqual(plain(result.pages.filter(p => !p.failed).map(p => p.url)), ['https://studio.example/how-much-does-3d-rendering-cost/']);
  assert.equal(result.failed, 1, 'the Italian copy is recorded as not worth reading, so it is not fetched again');
  assert.deepEqual(plain(result.featured), ['https://studio.example/how-much-does-3d-rendering-cost/'], 'the service page is not a post');
});
