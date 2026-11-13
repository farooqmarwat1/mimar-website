const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// Values built inside the loaded module come from another realm; compare them as plain data.
const plain = value => JSON.parse(JSON.stringify(value));

const plan = () => load('src/lib/ai/idea-plan.ts');
const now = new Date('2026-11-03T12:00:00.000Z');
const daysAgo = days => new Date(now.getTime() - days * 86_400_000).toISOString();
const idea = over => ({
  id: 'i1', approach: 'community', source: 'reddit', title: 'How much does a 3d walkthrough cost for an off plan launch?', keyword: '3d walkthrough cost',
  evidence: { score: 10, comments: 4 }, seedUrls: [], status: 'new', createdAt: daysAgo(2), expiresAt: daysAgo(-30), ...over,
});

test('the mix defaults to search-heavy, ignores nonsense and never ends up empty', () => {
  const { parseMix } = plan();
  assert.deepEqual(plain(parseMix(undefined)), { search: 3, competitors: 1, community: 1, social: 1, customers: 1, news: 1, keywords: 1 });
  assert.deepEqual(plain(parseMix('search:2, news:1, bogus:5, social:x')), { search: 2, competitors: 0, community: 0, social: 0, customers: 0, news: 1, keywords: 0 });
  assert.deepEqual(plain(parseMix('search:0,news:0')), plain(parseMix(undefined)), 'all zero falls back to the default');
});

test('approaches are taken in proportion to the mix, only when they have ideas ready', () => {
  const { nextApproach, parseMix } = plan();
  const mix = parseMix(undefined);
  const all = ['community', 'social', 'customers', 'news'];
  assert.equal(nextApproach([], all, mix, now), 'search', 'nothing yet: search first');
  assert.equal(nextApproach([{ approach: 'search', createdAt: daysAgo(1) }], all, mix, now), 'community', 'search has used its share');
  const fourSearch = [1, 2, 3, 4].map(d => ({ approach: 'search', createdAt: daysAgo(d) }));
  assert.equal(nextApproach([...fourSearch, { approach: 'community', createdAt: daysAgo(0.5) }], all, mix, now), 'social');
  assert.equal(nextApproach([{ approach: 'search', createdAt: daysAgo(1) }], [], mix, now), 'search', 'no ideas anywhere: search');
  assert.equal(nextApproach([{ approach: 'search', createdAt: daysAgo(1) }], ['news'], mix, now), 'news');
  assert.equal(nextApproach([{ approach: 'news', createdAt: daysAgo(40) }, { approach: 'search', createdAt: daysAgo(1) }], ['news'], mix, now), 'news', 'older than 30 days does not count');
});

test('the best fresh idea wins: evidence, freshness and the rotation region all count', () => {
  const { pickIdea } = plan();
  const ideas = [
    idea({ id: 'weak', evidence: { score: 1 } }),
    idea({ id: 'strong', title: 'Should developers show 360 tours before construction starts?', keyword: '360 tour before construction', evidence: { score: 400, comments: 120, count: 4 } }),
    idea({ id: 'used', status: 'used', evidence: { score: 9999 } }),
    idea({ id: 'expired', expiresAt: daysAgo(1), evidence: { score: 9999 } }),
    idea({ id: 'other-approach', approach: 'news', evidence: { score: 9999 } }),
  ];
  assert.equal(pickIdea(ideas, { approach: 'community', now }).id, 'strong');
  assert.equal(pickIdea(ideas, { approach: 'community', used: ['Should developers show 360 tours before construction starts'], now }).id, 'weak', 'covered topics are skipped');
  const local = [idea({ id: 'uae', region: 'UAE' }), idea({ id: 'ksa', title: 'Villa design approvals explained', keyword: 'villa design approvals', region: 'Saudi Arabia' })];
  assert.equal(pickIdea(local, { approach: 'community', region: 'Saudi Arabia', now }).id, 'ksa');
  assert.equal(pickIdea([], { approach: 'community', now }), null);
});

test('search ideas only match the blog type they read as', () => {
  const { pickIdea, ideaStrategy } = plan();
  const ideas = [
    idea({ id: 'q', approach: 'search', source: 'autocomplete', title: 'how to choose an architect in dubai', keyword: 'how to choose an architect' }),
    idea({ id: 'b', approach: 'search', source: 'autocomplete', title: '3d rendering cost dubai', keyword: '3d rendering cost dubai' }),
  ];
  assert.equal(pickIdea(ideas, { approach: 'search', strategy: 'question', now }).id, 'q');
  assert.equal(pickIdea(ideas, { approach: 'search', strategy: 'buyer-intent', now }).id, 'b');
  assert.equal(pickIdea(ideas, { approach: 'search', strategy: 'quick-win', now }), null, 'quick wins need a Google position');
  assert.equal(ideaStrategy({ title: 'Japandi interiors are trending in Gulf villas' }), 'question', 'default type');
});

test('autocomplete suggestions are kept only when they are a question or buying search about our services, here', () => {
  const { parseAutocomplete, usefulSuggestion } = plan();
  assert.deepEqual(plain(parseAutocomplete(['3d rendering cost', ['3d rendering cost', '3d rendering cost per hour']])), ['3d rendering cost', '3d rendering cost per hour']);
  assert.deepEqual(plain(parseAutocomplete({ nope: true })), []);
  assert(usefulSuggestion('3d rendering cost per hour'));
  assert(usefulSuggestion('how to design a villa'));
  assert(!usefulSuggestion('3d rendering cost in india'), 'another market');
  assert(!usefulSuggestion('3d rendering jobs dubai'), 'jobs are not clients');
  assert(!usefulSuggestion('mimar studios 3d rendering price'), 'branded');
  assert(!usefulSuggestion('best pizza in dubai'), 'off topic');
  assert(!usefulSuggestion('best architectural visualization software'), 'people doing it themselves');
  assert(!usefulSuggestion('how house design'), 'autocomplete noise, not a question');
  assert(!usefulSuggestion('how much does a 3d architectural rendering cost per view in dubai'), 'longer than the 6-word keyword rule');
});

test('Reddit listings keep the public link, never NSFW, stickied or removed posts', () => {
  const { parseRedditListing } = plan();
  const child = data => ({ data: { title: 'How do I brief an architect?', selftext: 'We are building a villa', permalink: '/r/dubai/comments/x/how/', subreddit: 'dubai', score: 12, num_comments: 5, created_utc: 1761955200, author: 'someone', ...data } });
  const posts = parseRedditListing({ data: { children: [child({}), child({ stickied: true }), child({ over_18: true }), child({ removed_by_category: 'moderator' }), child({ permalink: 'https://evil.example' })] } });
  assert.equal(posts.length, 1);
  assert.deepEqual(plain(posts[0]), { title: 'How do I brief an architect?', text: 'We are building a villa', url: 'https://www.reddit.com/r/dubai/comments/x/how/', subreddit: 'dubai', score: 12, comments: 5, createdAt: '2025-11-01T00:00:00.000Z' });
  assert.equal('author' in posts[0], false, 'usernames are not kept');
  assert.deepEqual(plain(parseRedditListing(null)), []);
});

test('RSS and Atom feeds parse, with CDATA, entities and escaped HTML cleaned up', () => {
  const { parseFeed } = plan();
  const rss = `<rss><channel><title>Feed</title>
    <item><title><![CDATA[NEOM &amp; the line]]></title><link>https://news.example/a</link><pubDate>Mon, 02 Nov 2026 08:00:00 GMT</pubDate>
      <description>&lt;p&gt;New &lt;b&gt;towers&lt;/b&gt; planned&lt;/p&gt;</description></item>
    <item><title>No link</title><link>http://insecure.example/b</link></item>
  </channel></rss>`;
  assert.deepEqual(plain(parseFeed(rss)), [{ title: 'NEOM & the line', link: 'https://news.example/a', publishedAt: '2026-11-02T08:00:00.000Z', summary: 'New towers planned' }]);
  const atom = `<feed><entry><title>Dubai off-plan rules</title><link rel="alternate" href="https://news.example/c"/><updated>2026-11-01T10:00:00Z</updated><summary>Escrow changes</summary></entry></feed>`;
  assert.deepEqual(plain(parseFeed(atom)), [{ title: 'Dubai off-plan rules', link: 'https://news.example/c', publishedAt: '2026-11-01T10:00:00.000Z', summary: 'Escrow changes' }]);
});

test('sitemaps and robots.txt give article URLs, and article slugs become phrases', () => {
  const { parseSitemap, parseRobotsSitemaps, slugPhrase } = plan();
  const index = '<sitemapindex><sitemap><loc>https://rival.example/post-sitemap.xml</loc></sitemap></sitemapindex>';
  assert.deepEqual(plain(parseSitemap(index)), { urls: [], sitemaps: ['https://rival.example/post-sitemap.xml'] });
  const set = '<urlset><url><loc>https://rival.example/blog/how-much-does-3d-rendering-cost/</loc></url><url><loc>https://rival.example/about</loc></url></urlset>';
  assert.deepEqual(plain(parseSitemap(set).urls), ['https://rival.example/blog/how-much-does-3d-rendering-cost/', 'https://rival.example/about']);
  assert.deepEqual(plain(parseRobotsSitemaps('User-agent: *\nSitemap: https://rival.example/sitemap_index.xml\nsitemap: http://insecure.example/s.xml')), ['https://rival.example/sitemap_index.xml']);
  assert.equal(slugPhrase('https://rival.example/blog/how-much-does-3d-rendering-cost/'), 'how much does 3d rendering cost');
  assert.equal(slugPhrase('https://rival.example/insights/villa_design_trends_2026.html'), 'villa design trends');
  assert.equal(slugPhrase('https://rival.example/about-us'), null, 'not an article');
  assert.equal(slugPhrase('https://rival.example/blog/news'), null, 'too short to be a subject');
});

test('regions are recognised from the text', () => {
  const { regionForText } = plan();
  assert.equal(regionForText('New villa rules in Riyadh'), 'Saudi Arabia');
  assert.equal(regionForText('Abu Dhabi launches'), 'UAE');
  assert.equal(regionForText('Housing in Lahore'), 'Pakistan');
  assert.equal(regionForText('Austin, Texas towers'), 'USA');
  assert.equal(regionForText('A house in Lisbon'), undefined);
});

test('enquiry text loses contact details and names before the AI sees it, and leaky output is caught', () => {
  const { scrubLeadText, leaksPersonalData } = plan();
  const message = 'Hi, my name is Sara Khan from Acme. We need 3D renders for 12 villas, how long does it take? Call +971 50 123 4567 or sara@acme.ae, see www.acme.ae. Regards, Sara Khan, CEO';
  const clean = scrubLeadText(message, ['Sara', 'Khan']);
  assert.doesNotMatch(clean, /sara|khan|@|\d{3} \d{4}|www\./i);
  assert.match(clean, /how long does it take\?/);
  assert.equal(scrubLeadText('x'.repeat(2000)).length, 600);
  assert(leaksPersonalData('Answering Sara about villa renders', ['Sara']));
  assert(leaksPersonalData('Call 0501234567 for renders', []));
  assert(!leaksPersonalData('How long do villa renders take?', ['Sara', 'Al']));
});

test('duplicate ideas are recognised by wording, not just exact text', () => {
  const { isDuplicateIdea } = plan();
  assert(isDuplicateIdea('How much does 3D rendering cost in Dubai?', ['how much does 3d rendering cost in dubai']));
  assert(isDuplicateIdea('3D rendering cost in Dubai explained', ['What drives 3D rendering cost in Dubai']));
  assert(!isDuplicateIdea('Japandi interiors for Gulf villas', ['How much does 3D rendering cost in Dubai?']));
});

test('each idea expires after its approach lifetime', () => {
  const { expiryFor } = plan();
  assert.equal(expiryFor('news', now), '2026-12-03T12:00:00.000Z');
  assert.equal(expiryFor('customers', now), '2027-05-02T12:00:00.000Z');
});

// ---- The planner, with the database and the AI faked -------------------------

function plannerWith({ ideas = [], history = [], rows = [], suggest }) {
  const statuses = {};
  const auto = load('src/lib/ai/auto-topic.ts', {
    '@/lib/generation': { listTopics: async () => history },
    '@/lib/blog-store': { getBlogEntries: async () => [{ title: 'An existing article about project delivery', path: '/blog/existing' }] },
    '@/lib/ideas/store': { listIdeas: async () => ideas, setIdeaStatus: async (id, status) => { statuses[id] = status; } },
    '@/lib/search-console': { getKeywordRows: async () => rows },
  });
  const prompts = [];
  const provider = { suggest: async ({ prompt }) => { prompts.push(prompt); return suggest(prompt); } };
  return { auto, provider, prompts, statuses };
}

const usage = () => ({ inputTokens: 0, outputTokens: 0, searches: 0 });
const searchHistory = [{ source: 'auto', status: 'done', approach: 'search', strategy: 'question', topic: 'Branding for Dubai developers', group: 'branding', region: 'UAE', createdAt: daysAgo(1) }];

test('when it is an approach with ideas, the planner writes from the best idea and tags it', async () => {
  const news = idea({ id: 'n1', approach: 'news', source: 'rss', title: 'Saudi Arabia tightens off-plan escrow rules', keyword: 'off plan escrow rules', region: 'Saudi Arabia', group: 'marketing', evidence: { url: 'https://news.example/escrow', note: 'Saudi Gazette: escrow rules' }, seedUrls: ['https://news.example/escrow'] });
  const { auto, provider, prompts, statuses } = plannerWith({
    ideas: [news], history: searchHistory,
    suggest: () => ({ topic: 'What the new off plan escrow rules mean for Saudi developers', keyword: 'off plan escrow rules' }),
  });
  const topic = await auto.planAutoTopic(provider, usage());
  assert.equal(topic.approach, 'news');
  assert.equal(topic.ideaId, 'n1');
  assert.equal(topic.region, 'Saudi Arabia');
  assert.equal(topic.group, 'marketing');
  assert.equal(topic.keywordSource, 'ai');
  assert.deepEqual(plain(topic.seedUrls), ['https://news.example/escrow']);
  assert.equal(topic.ideaUrl, 'https://news.example/escrow');
  assert.match(topic.ideaBrief, /^Industry news \(News feed\): "Saudi Arabia tightens off-plan escrow rules"/);
  assert.match(prompts[0], /Where the idea comes from: Industry news/);
  assert.equal(statuses.n1, 'queued');
});

test('with no Search Console keyword, search falls back to an autocomplete keyword word for word', async () => {
  const suggestion = idea({ id: 'a1', approach: 'search', source: 'autocomplete', title: 'how to choose an architect', keyword: 'how to choose an architect', region: undefined, group: 'architectural-design', evidence: { count: 3, note: 'Suggested by Google autocomplete in UAE' } });
  const { auto, provider, prompts, statuses } = plannerWith({
    ideas: [suggestion],
    // The last draft was a quick win, so this one is a question guide.
    history: [{ source: 'auto', status: 'done', approach: 'search', strategy: 'quick-win', topic: 'Quick win topic', group: 'branding', region: 'UAE', createdAt: daysAgo(1) }],
    suggest: () => ({ topic: 'How to choose an architect for a villa in Dubai', keyword: 'ignored by the planner' }),
  });
  const topic = await auto.planAutoTopic(provider, usage());
  assert.equal(topic.approach, 'search');
  assert.equal(topic.keyword, 'how to choose an architect');
  assert.equal(topic.keywordSource, 'autocomplete');
  assert.equal(topic.strategy, 'question');
  assert.match(prompts[0], /Required primary keyword \(a real Google search; use it word for word\): "how to choose an architect"/);
  assert.equal(statuses.a1, 'queued');
});

test('an idea the AI cannot turn into a fresh topic is dismissed and the planner falls back to search', async () => {
  const stale = idea({ id: 's1', approach: 'social', source: 'instagram', title: 'Handover timelines are trending', keyword: 'handover timelines' });
  let calls = 0;
  const { auto, provider, statuses } = plannerWith({
    ideas: [stale], history: searchHistory,
    suggest: () => (++calls <= 2 ? { topic: 'An existing article about project delivery', keyword: 'project delivery' } : { topic: 'How long does a 3D walkthrough take to produce', keyword: '3D walkthrough' }),
  });
  const topic = await auto.planAutoTopic(provider, usage());
  assert.equal(statuses.s1, 'dismissed');
  assert.equal(topic.approach, 'search');
  assert.equal(topic.keywordSource, 'ai');
});

test('ideas with no market stay general rather than borrowing one', async () => {
  const general = idea({ id: 'g1', approach: 'customers', source: 'leads', title: 'What is included in a 3D walkthrough package?', keyword: '3d walkthrough package', region: undefined, group: '3d-visualization', evidence: { count: 3, note: 'Asked in 3 enquiries in the last 90 days' } });
  const { auto, provider, prompts } = plannerWith({ suggest: () => ({ topic: 'What is included in a 3D walkthrough package', keyword: '3D walkthrough package' }) });
  const topic = await auto.planTopicFromIdea(provider, usage(), general);
  assert.equal(topic.geo, undefined);
  assert.equal(topic.region, undefined);
  assert.equal(topic.approach, 'customers');
  assert.match(prompts[0], /Keep the topic general and mention no place/);
  assert.equal(topic.ideaUrl, undefined, 'customer ideas never link anywhere');
});

// ---- Competitor sitemaps ------------------------------------------------------

test('post sitemaps are recognised, and their root-level slugs count as articles', () => {
  const { isPostSitemap, slugPhrase } = plan();
  for (const url of ['https://a.example/post-sitemap.xml', 'https://a.example/post-sitemap2.xml', 'https://a.example/wp-sitemap-posts-post-1.xml', 'https://a.example/sitemap-blog.xml', 'https://a.example/news-sitemap.xml']) {
    assert(isPostSitemap(url), url);
  }
  for (const url of ['https://a.example/page-sitemap.xml', 'https://a.example/category-sitemap.xml', 'https://a.example/post_tag-sitemap.xml', 'https://a.example/author-sitemap.xml', 'https://a.example/projects-sitemap.xml', 'https://a.example/sitemap-geo-rendering.xml', 'https://a.example/sitemap_index.xml']) {
    assert(!isPostSitemap(url), url);
  }
  const root = 'https://rival.example/how-much-does-3d-rendering-cost/';
  assert.equal(slugPhrase(root), null, 'a root-level page is not an article unless its sitemap says so');
  assert.equal(slugPhrase(root, true), 'how much does 3d rendering cost');
  assert.equal(slugPhrase('https://rival.example/hello-world/', true), null, 'too short to be a subject');
});

test('a long blog is sampled across its whole length', () => {
  const { sampleEvenly } = plan();
  const items = Array.from({ length: 100 }, (_, index) => index);
  assert.deepEqual(plain(sampleEvenly(items, 5)), [0, 20, 40, 60, 80]);
  assert.deepEqual(plain(sampleEvenly([1, 2, 3], 5)), [1, 2, 3]);
});

test('the starter competitor list is clean: unique domains, within the limit, none of our own', () => {
  const { DEFAULT_COMPETITORS, MAX_COMPETITORS } = load('src/lib/ideas/competitor-seeds.ts');
  assert(DEFAULT_COMPETITORS.length > 0 && DEFAULT_COMPETITORS.length <= MAX_COMPETITORS);
  assert.equal(new Set(DEFAULT_COMPETITORS).size, DEFAULT_COMPETITORS.length);
  for (const domain of DEFAULT_COMPETITORS) {
    assert.match(domain, /^[a-z0-9-]+(\.[a-z0-9-]+)+$/, domain);
    assert(!domain.endsWith('mim.archi'));
    assert(!domain.startsWith('www.'));
  }
});
