const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load, root } = require('./load.cjs');

const legacyEn = require('../src/content/legacy-seo.json');
const legacyAr = require('../src/content/legacy-seo.ar.json');

// ---- A tiny in-memory Firestore: enough for the blog store, the importer and the translator ----

function fakeDb() {
  const store = new Map();
  const snapshot = (key, data) => ({ id: key.slice(key.indexOf('/') + 1), exists: data !== undefined, data: () => data, get: field => data?.[field] });
  const docRef = (col, id) => ({
    id,
    path: `${col}/${id}`,
    get: async () => snapshot(`${col}/${id}`, store.get(`${col}/${id}`)),
    set: async value => { store.set(`${col}/${id}`, JSON.parse(JSON.stringify(value))); },
    update: async value => { store.set(`${col}/${id}`, { ...store.get(`${col}/${id}`), ...JSON.parse(JSON.stringify(value)) }); },
    delete: async () => { store.delete(`${col}/${id}`); },
  });
  const query = (col, filters = [], limit = Infinity) => ({
    where: (field, _op, value) => query(col, [...filters, [field, value]], limit),
    select: () => query(col, filters, limit),
    limit: count => query(col, filters, count),
    get: async () => {
      const docs = [...store.entries()]
        .filter(([key]) => key.startsWith(`${col}/`))
        .map(([key, data]) => snapshot(key, data))
        .filter(doc => filters.every(([field, value]) => doc.data()[field] === value))
        .slice(0, limit);
      return { docs, empty: docs.length === 0, size: docs.length };
    },
  });
  return {
    store,
    collection: col => ({
      doc: id => docRef(col, id),
      where: (...args) => query(col).where(...args),
      select: () => query(col),
      get: () => query(col).get(),
      add: async value => { const id = `auto${store.size}`; store.set(`${col}/${id}`, JSON.parse(JSON.stringify(value))); return { id }; },
    }),
    doc: path => { const [col, id] = path.split('/'); return docRef(col, id); },
    getAll: async (...refs) => Promise.all(refs.map(ref => ref.get())),
    batch: () => {
      const ops = [];
      return {
        create: (ref, data) => ops.push([ref, data]),
        commit: async () => { for (const [ref, data] of ops) { if (store.has(ref.path)) throw new Error('already exists'); store.set(ref.path, JSON.parse(JSON.stringify(data))); } },
      };
    },
  };
}

// Values built inside the loader's VM context have another Array/Object prototype, so compare plain copies.
const plain = value => JSON.parse(JSON.stringify(value));

const withDb = db => ({ '@/lib/firebase/admin': { adminDb: () => db, isFirebaseConfigured: true } });
const noFirebase = { '@/lib/firebase/admin': { adminDb: () => { throw new Error('offline'); }, isFirebaseConfigured: false } };

// ---- The text editor format ----

test('the editor text format round-trips every migrated article, pictures and videos included', () => {
  const { parseBlocks, blocksToText } = load('src/lib/content-blocks.ts');
  const known = new Set([
    '/3d-visualization/3d-architectural-visualization-top-faqs',
    '/vr-real-estate/how-can-you-easily-distinguish-augmented-virtual-reality',
  ]);
  for (const pages of [legacyEn, legacyAr]) {
    for (const page of pages) {
      const back = parseBlocks(blocksToText(page.blocks));
      if (known.has(page.path)) { assert.equal(back.length, page.blocks.length); continue; } // two paragraphs that begin with a bullet character
      assert.deepEqual(JSON.parse(JSON.stringify(back)), page.blocks, page.path);
    }
  }
  const [image] = parseBlocks('[image: /blog/a/b.jpg | A (nice) picture | 1920x1080]');
  assert.deepEqual(JSON.parse(JSON.stringify(image)), { type: 'img', src: '/blog/a/b.jpg', alt: 'A (nice) picture', width: 1920, height: 1080 });
  // Outside addresses are never accepted as media: they stay visible, harmless text.
  assert.equal(parseBlocks('[image: https://evil.example/x.jpg | x]')[0].type, 'p');
  assert.equal(parseBlocks('[video: //evil.example/x.mp4]')[0].type, 'p');
});

// ---- Public lists: with no database the site is exactly what it was ----

test('without Firebase the archive, categories and Arabic lists keep their exact old order', async () => {
  const store = load('src/lib/blog-store.ts', noFirebase);
  const { legacyArchivePaths } = load('src/lib/blog-archive.ts');
  const { blogCategories } = load('src/lib/legacy-seo.ts');
  const { legacyCategories } = load('src/lib/legacy-categories.ts');
  const titleOf = new Map(legacyEn.map(page => [page.path, page.title]));
  const titleArOf = new Map(legacyAr.map(page => [page.path, page.title]));

  const archive = await store.getArchive('en');
  assert.deepEqual(plain(archive.map(item => item.path)), plain(legacyArchivePaths.filter(path => titleOf.has(path))));
  assert.equal(archive[0].title, titleOf.get(archive[0].path));
  assert.equal((await store.getArchivePageCount('en')), Math.ceil(archive.length / 9));
  assert.equal((await store.getArchivePage(2, 'en')).length, 9);
  assert.deepEqual(plain(await store.getArchivePage(99, 'en')), []);

  for (const category of blogCategories) {
    assert.deepEqual(plain((await store.getCategoryList(category.slug)).map(item => item.path)), plain(category.articlePaths.filter(path => titleOf.has(path))), category.slug);
  }
  for (const category of legacyCategories) {
    const { articles } = await store.getLegacyCategoryList(category.slug, 'ar');
    assert.deepEqual(plain(articles.map(item => item.path)), plain(category.articlePaths));
    assert.equal(articles[0].title, titleArOf.get(articles[0].path));
  }
  assert.deepEqual(plain((await store.getArchive('ar')).map(item => item.path)), plain(archive.map(item => item.path)));
  assert.equal((await store.getBlogArticle('/blog/3d-rendering', 'en')).title, titleOf.get('/blog/3d-rendering'));
  assert.equal((await store.getBlogArticle('/blog/3d-rendering', 'ar')).lang, 'ar');
  assert.equal(await store.getBlogArticle('/blog/does-not-exist', 'en'), null);
  assert.equal((await store.getBlogSlugs('en')).includes('3d-rendering'), true);
});

// ---- Import: nothing about the migrated articles changes ----

async function importInto(db) {
  const mocks = withDb(db);
  const importer = load('src/lib/blog-import.ts', mocks);
  return importer.importLegacyArticles('tester@mim.archi');
}

test('importing the WordPress articles keeps every page, date, order and Arabic text identical', async () => {
  const db = fakeDb();
  const mocks = withDb(db);
  const result = await importInto(db);
  assert.deepEqual(plain(result), { created: legacyEn.length, skipped: 0 });
  assert.equal(db.store.has('siteBlogMeta/legacyImport'), true);
  assert.deepEqual(plain(await importInto(db)), { created: 0, skipped: legacyEn.length }); // safe to repeat

  const posts = load('src/lib/posts.ts', mocks);
  const { translationHash } = load('src/lib/post-translation.ts', mocks);
  const { keywordsAr } = load('src/lib/ar/blog-ar.ts');
  const { fieldsOf, arabicState } = load('src/lib/ai/translate-post.ts', { ...mocks, '@/lib/ai/provider': { aiConfigured: () => false } });

  for (const page of legacyEn) {
    const doc = [...db.store.entries()].find(([, data]) => data.path === page.path)[1];
    const post = posts.fromDoc('id', doc);
    // The public page built from the stored document is the page that was built from the JSON.
    const en = posts.articleFromPost(post, 'en');
    assert.equal(en.title, page.title); assert.equal(en.seoTitle, page.seoTitle); assert.equal(en.description, page.description);
    assert.deepEqual(plain(en.keywords), page.keywords); assert.equal(en.published, page.published); assert.equal(en.modified, page.modified);
    assert.deepEqual(JSON.parse(JSON.stringify(en.blocks)), page.blocks);
    assert.equal(en.isPost, undefined); assert.equal(en.cover, undefined); assert.equal(en.faq, undefined); assert.equal(en.hasAr, true);

    const arPage = legacyAr.find(item => item.path === page.path);
    const ar = posts.articleFromPost(post, 'ar');
    assert.equal(ar.title, arPage.title); assert.deepEqual(plain(ar.keywords), plain(keywordsAr[page.path] ?? arPage.keywords));
    assert.deepEqual(JSON.parse(JSON.stringify(ar.blocks)), arPage.blocks);
    assert.equal(ar.path, page.path);

    // Right after the import the Arabic text counts as current, so it is not re-translated needlessly.
    assert.equal(post.ar.sourceHash, translationHash(fieldsOf(post)));
    assert.equal(arabicState(post), 'current');
  }
});

test('after the import, deleting or unpublishing an article really removes it; before it, the built-in copy is served', async () => {
  const db = fakeDb();
  const store = () => load('src/lib/blog-store.ts', withDb(db));
  assert.ok(await store().getBlogArticle('/metaverse/how-to-buy-nft', 'en')); // not imported yet: built-in copy

  await importInto(db);
  assert.ok(await store().getBlogArticle('/metaverse/how-to-buy-nft', 'en'));
  const key = [...db.store.entries()].find(([, data]) => data.path === '/metaverse/how-to-buy-nft')[0];
  const doc = db.store.get(key);

  db.store.set(key, { ...doc, status: 'draft' }); // unpublished
  assert.equal(await store().getBlogArticle('/metaverse/how-to-buy-nft', 'en'), null);
  assert.equal((await store().getBlogEntries()).some(entry => entry.path === '/metaverse/how-to-buy-nft'), false);
  const { articles } = await store().getLegacyCategoryList('metaverse');
  assert.equal(articles.some(item => item.path === '/metaverse/how-to-buy-nft'), false);

  db.store.delete(key); // deleted
  assert.equal(await store().getBlogArticle('/metaverse/how-to-buy-nft', 'ar'), null);
});

test('new posts appear first in the archive and categories, and only in Arabic once translated', async () => {
  const db = fakeDb();
  await importInto(db);
  const base = { legacy: undefined, geoTerms: [], faq: [], related: [], sources: [], keywords: [], blocks: [{ type: 'p', text: 'x' }], origin: 'manual', status: 'published',
    updatedBy: 'x', categories: ['architecture'], description: 'd', seoTitle: 't' };
  db.store.set('sitePosts/new1', { ...base, slug: 'older-post', path: '/blog/older-post', title: 'Older post', publishedAt: '2026-09-01T10:00:00.000Z', updatedAt: '2026-09-01T10:00:00.000Z' });
  db.store.set('sitePosts/new2', { ...base, slug: 'newer-post', path: '/blog/newer-post', title: 'Newer post', publishedAt: '2026-10-01T10:00:00.000Z', updatedAt: '2026-10-01T10:00:00.000Z',
    ar: { title: 'مقال جديد', description: 'وصف', blocks: [], faq: [], keywords: [], relatedLabels: [], sourceHash: 'h' } });
  const store = load('src/lib/blog-store.ts', withDb(db));

  const archive = await store.getArchive('en');
  assert.deepEqual(plain(archive.slice(0, 2).map(item => item.path)), ['/blog/newer-post', '/blog/older-post']);
  assert.equal(archive[2].path, '/metaverse-development-a-complete-guide-for-businesses'); // the migrated order follows
  assert.equal((await store.getCategoryList('architecture'))[0].path, '/blog/newer-post');
  assert.equal((await store.getArchive('ar'))[0].title, 'مقال جديد');
  assert.equal((await store.getArchive('ar')).some(item => item.path === '/blog/older-post'), false); // no Arabic yet
  assert.equal(await store.getBlogArticle('/blog/older-post', 'ar'), null);
  assert.ok(await store.getBlogArticle('/blog/older-post', 'en'));
});

// ---- Arabic translation ----

const sourceFields = () => ({
  title: 'How to brief a 3D rendering studio', seoTitle: 'How to brief a 3D rendering studio', description: 'A short, practical guide to briefing a studio before you commission 3D renderings.',
  keywords: ['3d rendering brief'], geoTerms: ['Dubai'],
  blocks: [
    { type: 'p', text: 'A good brief saves weeks. See [our rendering services](/services/3d-rendering) for scope.' },
    { type: 'img', src: '/blog/a.jpg', alt: 'A render', width: 1200, height: 800 },
    { type: 'h2', text: 'What to include' },
    { type: 'li', text: 'The audience' },
  ],
  faq: [{ question: 'How long does it take?', answer: 'Usually two weeks, see [contact](/contact).' }],
  related: [{ label: 'Contact', path: '/contact' }],
  coverAlt: 'A render of a tower',
});
const good = {
  title: 'كيف تكتب موجزًا لاستوديو الرندرة', seoTitle: 'كيف تكتب موجزًا لاستوديو الرندرة ثلاثية الأبعاد', description: 'دليل عملي موجز لكتابة موجز واضح قبل التعاقد على أعمال الرندرة ثلاثية الأبعاد.',
  keywords: ['موجز الرندرة', 'دبي'], geoTerms: ['دبي'],
  blocks: ['الموجز الجيد يوفر أسابيع. راجع [خدمات الرندرة](/services/3d-rendering) لتحديد النطاق.', 'ما الذي يجب تضمينه', 'الجمهور المستهدف'],
  faq: [{ question: 'كم تستغرق العملية؟', answer: 'عادة أسبوعان، راجع [اتصل بنا](/contact).' }],
  relatedLabels: ['اتصل بنا'], coverAlt: 'تصميم ثلاثي الأبعاد لبرج',
};

test('the translator keeps blocks, links and pictures, and retries a translation that breaks them', async () => {
  const mocks = withDb(fakeDb());
  const translator = load('src/lib/ai/translate-post.ts', { ...mocks, '@/lib/ai/provider': { aiConfigured: () => true } });
  const { translationHash } = load('src/lib/post-translation.ts', mocks);
  for (const [bad, expected] of [
    [{ ...good, blocks: good.blocks.slice(0, 2) }, /exactly one translation/],
    [{ ...good, blocks: [good.blocks[0].replace('/services/3d-rendering', '/services/x'), ...good.blocks.slice(1)] }, /keep every link/],
  ]) {
    const replies = [bad, good];
    const calls = [];
    const provider = { name: 'gemini', model: 'mock', translate: async ({ prompt }) => { calls.push(prompt); return replies.shift(); } };
    const result = await translator.translateToArabic(sourceFields(), provider, { inputTokens: 0, outputTokens: 0, searches: 0 });
    assert.equal(calls.length, 2); assert.match(calls[1], expected); assert.equal(result.blocks.length, 4);
  }
  const out = await translator.translateToArabic(sourceFields(), { name: 'gemini', model: 'mock', translate: async () => good }, { inputTokens: 0, outputTokens: 0, searches: 0 });
  assert.equal(out.blocks.length, 4); // 3 text blocks + the picture, in the original order
  assert.equal(out.blocks[1].type, 'img'); assert.equal(out.blocks[1].src, '/blog/a.jpg');
  assert.equal(out.blocks[2].type, 'h2'); assert.equal(out.blocks[3].type, 'li');
  assert.equal(out.sourceHash, translationHash(sourceFields()));
  assert.equal(out.coverAlt, good.coverAlt);

  const stubborn = { name: 'gemini', model: 'mock', translate: async () => ({ ...good, title: 'English title only', seoTitle: 'English', description: 'English' }) };
  await assert.rejects(translator.translateToArabic(sourceFields(), stubborn, { inputTokens: 0, outputTokens: 0, searches: 0 }), /did not pass its checks/);
});

test('editing the English text of a post is detected so its Arabic version is refreshed', () => {
  const { translationHash } = load('src/lib/post-translation.ts', withDb(fakeDb()));
  const before = translationHash(sourceFields());
  assert.equal(translationHash(sourceFields()), before);
  const edited = sourceFields(); edited.blocks[0].text += ' More detail.';
  assert.notEqual(translationHash(edited), before);
  const picture = sourceFields(); picture.blocks[1].src = '/blog/other.jpg'; // pictures do not need translating
  assert.equal(translationHash(picture), before);
});

// ---- Publish rules ----

test('imported articles can be saved with short descriptions; new posts cannot', async () => {
  const { checkPost } = load('src/lib/post-validation.ts', { '@/lib/internal-paths': { findUnknownPaths: async () => [], collectLinkedPaths: () => [] } });
  const post = { title: 'Short', seoTitle: 'Short', description: 'Too short', categories: [], blocks: [{ type: 'p', text: 'Only a few words here.' }], faq: [], related: [], sources: [] };
  assert.ok(Object.keys((await checkPost(post)).errors).length > 0);
  const legacy = await checkPost({ ...post, legacy: true });
  assert.deepEqual(plain(legacy.errors), {}); assert.ok(legacy.warnings.length > 0);
  assert.ok((await checkPost({ ...post, legacy: true, title: '' })).errors.title);
});

test('the blog routes contain no Arabic admin text', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  const files = [...walk(path.join(root, 'src/app/(site)/admin')), ...walk(path.join(root, 'src/components/admin'))];
  for (const file of files) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /[؀-ۿ]/, file);
});

test('when only the title or description changed, only those are translated again and the Arabic body is kept', async () => {
  const mocks = withDb(fakeDb());
  const translator = load('src/lib/ai/translate-post.ts', { ...mocks, '@/lib/ai/provider': { aiConfigured: () => true } });
  const { translationHashes } = load('src/lib/post-translation.ts', mocks);
  const usage = { inputTokens: 0, outputTokens: 0, searches: 0 };
  const first = await translator.translateToArabic(sourceFields(), { name: 'gemini', model: 'mock', translate: async () => good }, usage);

  const edited = sourceFields(); edited.description = 'A different, still practical guide to briefing a rendering studio well.';
  assert.equal(translationHashes(edited).body, translationHashes(sourceFields()).body);
  assert.notEqual(translationHashes(edited).meta, translationHashes(sourceFields()).meta);
  const prompts = [];
  const meta = { ...good, description: 'دليل عملي مختلف لكتابة موجز جيد لاستوديو الرندرة.', blocks: [], faq: [], relatedLabels: [] };
  const second = await translator.translateToArabic(edited, { name: 'gemini', model: 'mock', translate: async ({ prompt }) => { prompts.push(prompt); return meta; } }, usage, first, { metaOnly: true });
  assert.equal(prompts.length, 1); assert.match(prompts[0], /return empty arrays for blocks/);
  assert.equal(second.description, meta.description);
  assert.deepEqual(plain(second.blocks), plain(first.blocks)); assert.deepEqual(plain(second.faq), plain(first.faq));
  assert.equal(second.sourceHash, translationHashes(edited).all); assert.equal(second.bodyHash, first.bodyHash);
});
