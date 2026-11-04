const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./load.cjs');

// Values built inside the loaded module come from another realm; compare them as plain data.
const plain = value => JSON.parse(JSON.stringify(value));

const seo = () => load('src/lib/legacy-seo.ts');

// ---- The four categories hold every article -------------------------------------

test('every article in the blog archive is listed on a category page, and the old order is kept', () => {
  const { blogCategories } = seo();
  const { legacyArchivePaths } = load('src/lib/blog-archive.ts');
  const filed = new Set(blogCategories.flatMap(category => category.articlePaths));
  assert.deepEqual(plain(legacyArchivePaths.filter(path => !filed.has(path))), [], 'no archive article is in no category');
  assert.deepEqual(plain(blogCategories.map(category => category.slug)), ['3d-visualization', 'vr-real-estate', 'architecture', 'real-estate-tech']);
  // Articles that were already filed keep their position; the new ones go on the end.
  const byslug = Object.fromEntries(blogCategories.map(category => [category.slug, category.articlePaths]));
  assert.equal(byslug['3d-visualization'][0], '/blog/best-architects-in-islamabad');
  assert.equal(byslug['3d-visualization'][12], '/3d-visualization/why-you-need-real-estate-renders-to-sell-your-property');
  assert.equal(byslug['architecture'][5], '/blog/architecture/stages-of-architectural-design');
  assert.equal(byslug['real-estate-tech'][6], '/blog/real-estate-tech/commercial-real-estate-technology');
});

test('the eleven old articles that had no category are filed where they belong', () => {
  const { blogCategories } = seo();
  const where = path => plain(blogCategories.filter(category => category.articlePaths.includes(path)).map(category => category.slug));
  for (const path of ['/metaverse-development-a-complete-guide-for-businesses', '/metaverse/how-to-become-a-metaverse-developer', '/metaverse/technologies-in-metaverse', '/metaverse/top-six-faqs-about-real-estate-in-the-metaverse', '/metaverse/top-6-questions-about-the-metaverse']) {
    assert.deepEqual(where(path), ['vr-real-estate'], path);
  }
  assert.deepEqual(where('/blog/rendering-techniques'), ['3d-visualization']);
  assert.deepEqual(where('/blog/3d-rendering'), ['3d-visualization']);
  assert.deepEqual(where('/blog/architectural-services'), ['architecture']);
  assert.deepEqual(where('/blog/importance-of-architectural-design-services-in-uae'), ['architecture']);
  assert.deepEqual(where('/blog/brand-vs-company'), ['real-estate-tech']);
  assert.deepEqual(where('/metaverse/how-to-buy-nft'), ['real-estate-tech']);
});

// ---- Which category an AI draft gets ------------------------------------------------

test('a category follows from what the text is about, for every service group', () => {
  const { categoryForText, CATEGORY_FOR_GROUP } = load('src/lib/ai/keyword-plan.ts');
  assert.equal(categoryForText('3d rendering cost for villas'), '3d-visualization');
  assert.equal(categoryForText('how a 360 virtual tour helps off-plan sales'), 'vr-real-estate');
  assert.equal(categoryForText('stages of architectural design'), 'architecture');
  assert.equal(categoryForText('real estate branding guide'), 'real-estate-tech');
  assert.equal(categoryForText('real estate social media marketing'), 'real-estate-tech');
  assert.equal(categoryForText('best pizza in dubai'), null);
  const { blogCategories } = seo();
  for (const slug of Object.values(CATEGORY_FOR_GROUP)) assert(blogCategories.some(category => category.slug === slug), slug);
});

test('the planner uses the same category for each service group', () => {
  const { CATEGORY_FOR_GROUP } = load('src/lib/ai/keyword-plan.ts');
  const auto = load('src/lib/ai/auto-topic.ts', {
    '@/lib/generation': { listTopics: async () => [] },
    '@/lib/blog-store': { getBlogEntries: async () => [] },
    '@/lib/ideas/store': { listIdeas: async () => [], setIdeaStatus: async () => {} },
    '@/lib/search-console': { getKeywordRows: async () => [] },
  });
  for (const group of auto.SERVICE_GROUPS) assert.equal(group.category, CATEGORY_FOR_GROUP[group.key], group.key);
});

const generator = () => load('src/lib/ai/generate-post.ts', {
  '@/lib/ai/provider': { aiConfigured: () => true, getProvider: () => ({}) },
  '@/lib/ai/safe-fetch': { fetchPageText: async () => null },
  '@/lib/ai/translate-post': { translateToArabic: async () => ({}) },
  '@/lib/blog-store': { getBlogEntries: async () => [] },
  '@/lib/generation': { getJob: async () => null, updateJob: async () => {} },
  '@/lib/internal-paths': { knownInternalPaths: async () => new Set(), normalizePath: p => p },
  '@/lib/post-validation': { checkPost: async () => ({ errors: {}, warnings: [] }) },
  '@/lib/posts': { isReservedSlug: () => false, isPostSlugTaken: async () => false, postPath: slug => '/blog/' + slug, savePost: async () => 'x' },
  '@/lib/regions': { regionList: [] }, '@/lib/service-details': { servicePath: s => '/services/' + s },
  '@/lib/site-config': { offices: [], services: [], siteConfig: {} },
});

test('a draft is always filed: the planned category, else the writer\'s, else what the article is about', () => {
  const { resolveCategory } = generator();
  const article = over => ({ category: '', title: 'How much do 3D architectural renderings cost?', keywords: ['3d rendering cost'], ...over });
  assert.equal(resolveCategory('vr-real-estate', article({ category: 'architecture' })), 'vr-real-estate', 'planned wins');
  assert.equal(resolveCategory('', article({ category: 'architecture' })), 'architecture', 'the writer\'s choice when nothing was planned');
  assert.equal(resolveCategory(undefined, article({ category: 'not-a-category' })), '3d-visualization', 'an invented category is replaced by what the article is about');
  assert.equal(resolveCategory('made-up', article()), '3d-visualization');
  assert.equal(resolveCategory(undefined, article({ title: 'A quiet day', keywords: ['nothing'] })), '', 'nothing to go on');
});

// ---- Publishing needs one main category -------------------------------------------------

const validate = () => load('src/lib/post-validation.ts', { '@/lib/internal-paths': { findUnknownPaths: async () => [], collectLinkedPaths: () => [] } }).checkPost;

const goodPost = over => ({
  title: 'What drives 3D rendering cost for villas', seoTitle: 'What drives 3D rendering cost for villas',
  description: 'A clear guide to what makes a 3D rendering project cost more or less, and how to brief a studio well.',
  categories: ['3d-visualization'], faq: [], related: [], sources: [],
  blocks: [{ type: 'h2', text: 'Scope' }, { type: 'p', text: 'word '.repeat(200).trim() }],
  ...over,
});

test('a new post needs exactly one category; an imported article only gets a warning', async () => {
  const checkPost = validate();
  assert.deepEqual(plain((await checkPost(goodPost())).errors), {});
  assert.match((await checkPost(goodPost({ categories: [] }))).errors.category, /Choose a category/);
  assert.match((await checkPost(goodPost({ categories: ['architecture', '3d-visualization'] }))).errors.category, /one main category/);
  assert.match((await checkPost(goodPost({ categories: ['nonsense'] }))).errors.category, /Unknown category/);
  const old = await checkPost(goodPost({ categories: [], legacy: true }));
  assert.equal(old.errors.category, undefined);
  assert(old.warnings.some(warning => /no blog category/.test(warning)));
  assert.deepEqual(plain((await checkPost(goodPost({ categories: ['architecture', '3d-visualization'], legacy: true }))).errors), {}, 'imported articles may be in several');
});

// ---- The article shows and declares its category ------------------------------------------

test('the article trail is Home > Blog > Category > Article, in both languages, for new posts only', () => {
  const siteConfig = { url: 'https://mim.archi', name: 'Mimar Studios', locale: 'en_US', ogImage: '/og.jpg' };
  const seoLib = load('src/lib/seo.ts', { './site-config': { siteConfig }, './service-details': {} });
  const blog = load('src/lib/blog-seo.ts', { '@/lib/seo': seoLib, '@/lib/site-config': { siteConfig } });
  const page = over => ({ path: '/blog/rendering-guide', title: 'Rendering guide', seoTitle: 'Rendering guide', description: 'A useful guide', keywords: [], published: '2026-10-22 10:00:00', modified: '2026-10-22 11:00:00', blocks: [{ type: 'p', text: 'Text.' }], isPost: true, hasAr: false, lang: 'en', categories: ['3d-visualization'], ...over });
  const trail = data => plain(data[0].itemListElement.map(item => [item.name, item.item]));
  assert.deepEqual(trail(blog.articleStructuredData(page())), [
    ['Home', 'https://mim.archi/'], ['Blog', 'https://mim.archi/blog/'], ['3D Visualization', 'https://mim.archi/blog/3d-visualization/'], ['Rendering guide', 'https://mim.archi/blog/rendering-guide/'],
  ]);
  const arabic = trail(blog.articleStructuredData(page({ lang: 'ar', path: '/blog/rendering-guide' })));
  assert.equal(arabic.length, 4);
  assert.equal(arabic[2][1], 'https://mim.archi/ar/blog/3d-visualization/');
  assert.notEqual(arabic[2][0], '3D Visualization', 'the category name is translated');
  assert.equal(trail(blog.articleStructuredData(page({ categories: [] }))).length, 3, 'no category, no extra level');
  assert.equal(trail(blog.articleStructuredData(page({ isPost: undefined }))).length, 2, 'imported articles keep their old trail');
});

// ---- Filing the old articles in the live data ----------------------------------------------

function fakeStore(docs) {
  const updates = [];
  const db = {
    collection: () => ({ doc: id => ({ id, path: id }) }),
    getAll: async (...refs) => refs.map(ref => ({ id: ref.id, ref, exists: ref.id in docs, get: field => (docs[ref.id] ?? {})[field] })),
    batch: () => ({ update: (ref, data) => updates.push([ref.id, plain(data)]), commit: async () => {} }),
  };
  const importer = load('src/lib/blog-import.ts', {
    '@/lib/firebase/admin': { adminDb: () => db },
    '@/lib/posts': { IMPORT_MARKER: 'marker', POSTS_COLLECTION: 'posts', isoFromLegacyDate: value => value },
    '@/lib/post-translation': { translationHashes: () => ({}) },
  });
  return { importer, updates };
}

test('old articles in no category are filed once, and an article that already has categories is never touched', async () => {
  const docs = {
    'legacy-blog__brand-vs-company': { categories: [] },
    'legacy-blog__3d-rendering': {},
    'legacy-metaverse__how-to-buy-nft': { categories: ['architecture'] },
    'legacy-blog__best-architects-in-islamabad': { categories: ['3d-visualization'] },
  };
  const { importer, updates } = fakeStore(docs);
  assert.equal(await importer.countLegacyNeedingCategory(), 2);
  assert.deepEqual(plain(await importer.categorizeLegacyArticles()), { updated: 2 });
  const byId = Object.fromEntries(updates);
  assert.deepEqual(Object.keys(byId).sort(), ['legacy-blog__3d-rendering', 'legacy-blog__brand-vs-company']);
  assert.deepEqual(byId['legacy-blog__brand-vs-company'].categories, ['real-estate-tech']);
  assert.equal(typeof byId['legacy-blog__brand-vs-company'].categoryRanks['real-estate-tech'], 'number');
  assert.deepEqual(byId['legacy-blog__3d-rendering'].categories, ['3d-visualization']);
  assert.equal('legacy-metaverse__how-to-buy-nft' in byId, false, 'the editor\'s own category stays');
});

test('with nothing to file, nothing is written', async () => {
  const { importer, updates } = fakeStore({ 'legacy-blog__3d-rendering': { categories: ['3d-visualization'] } });
  assert.deepEqual(plain(await importer.categorizeLegacyArticles()), { updated: 0 });
  assert.equal(updates.length, 0);
});
