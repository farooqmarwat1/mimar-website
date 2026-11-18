/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node script, run outside Next.js */
// Saves the 16 hand-written Deliverable 6 articles (docs/blog-briefs/articles) as blog posts, one per
// weekday: the first is published now, the rest wait as drafts with `scheduledFor` dates, and the
// weekday job (/api/cron/publish-scheduled) publishes one each Monday-Friday.
//
//   node --env-file=.env.local scripts/schedule-deliverable-6.cjs            dry run: checks and prints the schedule
//   node --env-file=.env.local scripts/schedule-deliverable-6.cjs --write    saves to Firestore (BLOG_POSTS_COLLECTION, default sitePosts)
//
// Re-running updates the same posts (matched by brief ref) and never publishes a second one the same day.
// Every post goes through the same publish checks as the editor's Publish button.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const write = process.argv.includes('--write');

// ---- A small TypeScript loader: "@/" paths, Next's cache stubbed out (it only works inside Next). ----
const stubs = {
  'server-only': {},
  react: { cache: (fn) => fn },
  'next/cache': { unstable_cache: (fn) => fn, revalidatePath() {}, revalidateTag() {}, updateTag() {} },
  'next/server': { after() {} },
};
const registry = new Map();
function resolve(from, id) {
  let base;
  if (id.startsWith('@/')) base = path.join(root, 'src', id.slice(2));
  else if (id.startsWith('./') || id.startsWith('../')) base = path.resolve(path.dirname(from), id);
  else return null;
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), base]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}
function load(file) {
  if (registry.has(file)) return registry.get(file).exports;
  const mod = { exports: {} };
  registry.set(file, mod);
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) return (mod.exports = JSON.parse(text));
  const js = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const nodeRequire = Module.createRequire(file);
  const localRequire = (id) => (id in stubs ? stubs[id] : resolve(file, id) ? load(resolve(file, id)) : nodeRequire(id));
  vm.runInThisContext(Module.wrap(js), { filename: file })(mod.exports, localRequire, mod, file, path.dirname(file));
  return mod.exports;
}
const src = (name) => load(path.join(root, 'src', name));

// ---- The articles ----
const ORDER = ['D6-B1', 'D6-B2', 'D6-B5', 'D6-B3', 'D6-B4', 'D6-B6', 'D6-A1', 'D6-A3', 'D6-B7', 'D6-A5', 'D6-A7', 'D6-B8', 'D6-A2', 'D6-A4', 'D6-A6', 'D6-A8'];

function parseArticle(ref) {
  const text = fs.readFileSync(path.join(root, 'docs/blog-briefs/articles', `${ref}.md`), 'utf8').replace(/\r\n/g, '\n');
  const [head, rest] = text.split('\n---\n');
  const [body, faqText = ''] = rest.split('\n=== FAQ\n');
  const meta = Object.fromEntries(head.split('\n').filter(Boolean).map((line) => [line.slice(0, line.indexOf(':')).trim(), line.slice(line.indexOf(':') + 1).trim()]));
  const list = (value) => (value || '').split(';').map((item) => item.trim()).filter(Boolean);
  const faq = faqText
    .split(/\nQ: /)
    .map((chunk) => chunk.replace(/^Q: /, '').trim())
    .filter(Boolean)
    .map((chunk) => {
      const [question, answer] = chunk.split('\nA: ');
      return { question: question.trim(), answer: (answer || '').trim() };
    });
  return { keywords: list(meta.keywords), geoTerms: list(meta.geoTerms), related: list(meta.related).map((item) => ({ path: item.split('|')[0].trim(), label: item.split('|')[1].trim() })), body: body.trim(), faq };
}

async function main() {
  const { adminDb, isFirebaseConfigured } = src('lib/firebase/admin.ts');
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured (run with --env-file=.env.local).');
  const posts = src('lib/posts.ts');
  const { normalizeBrief } = src('lib/ai/blog-brief.ts');
  const { ideaStrategy } = src('lib/ai/idea-plan.ts');
  const { parseTextBlocks } = src('lib/content-blocks.ts');
  const { checkPost } = src('lib/post-validation.ts');
  const { selectBlogCover } = src('lib/blog-covers.ts');
  const { libraryCoverAlt } = src('lib/ai/image-prompt.ts');
  const { articleSlug } = src('lib/slug.ts');
  const { karachiDay, weekdayDates } = src('lib/publish-schedule.ts');
  const briefs = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(root, 'src/content/briefs/deliverable-6.json'), 'utf8')).briefs.map((raw) => [raw.ref, normalizeBrief(raw)]));

  const collection = adminDb().collection(posts.POSTS_COLLECTION);
  const now = new Date();
  const today = karachiDay(now);
  const dates = weekdayDates(today, ORDER.length);
  console.log(`Collection ${posts.POSTS_COLLECTION}, Pakistan date ${today}${write ? '' : ' (dry run)'}`);

  const existingByRef = new Map();
  for (const doc of (await collection.get()).docs) {
    const ref = doc.get('generation.brief.ref');
    if (ref) existingByRef.set(ref, { id: doc.id, ...doc.data() });
  }
  const publishedToday = [...existingByRef.values()].some((post) => post.status === 'published' && post.publishedAt && karachiDay(new Date(post.publishedAt)) === today);

  let failures = 0;
  const toTranslate = [];
  for (const [index, ref] of ORDER.entries()) {
    const brief = briefs[ref];
    const article = parseArticle(ref);
    const existing = existingByRef.get(ref);
    if (existing?.status === 'published') {
      console.log(`${ref} already published at ${existing.path}; left as it is.`);
      continue;
    }
    // The first not-yet-published post goes live now, unless one already went live today.
    const publishNow = index === 0 && !publishedToday;
    const date = dates[index];

    let slug = existing?.slug ?? articleSlug(brief.title);
    for (let n = 2; !existing && (posts.isReservedSlug(slug) || (await posts.isPostSlugTaken(slug))); n++) slug = `${articleSlug(brief.title)}-${n}`;
    const library = selectBlogCover({ title: brief.title, category: brief.category });
    const blocks = parseTextBlocks(article.body);
    const post = {
      slug,
      path: posts.postPath(slug),
      title: brief.title,
      seoTitle: brief.seoTitle,
      description: brief.description,
      keywords: article.keywords,
      geoTerms: article.geoTerms,
      categories: [brief.category],
      blocks,
      faq: article.faq,
      related: article.related,
      coverImage: { ...library, alt: libraryCoverAlt(library.alt, brief.keyword, brief.geo?.split(',')[0]) },
      sources: [],
      origin: 'ai',
      status: publishNow ? 'published' : 'draft',
      ...(publishNow ? { publishedAt: now.toISOString() } : { scheduledFor: date }),
      updatedAt: now.toISOString(),
      updatedBy: `Claude (written from SEO brief ${ref})`,
      generation: {
        topic: brief.title,
        geo: brief.geo,
        model: 'anthropic:claude-opus-5-5 (written in Claude Code from the SEO brief; no automated web research)',
        notes: [
          `Written from SEO brief ${ref} (Deliverable 6) and published on the weekday schedule. It passed the same editorial and SEO checks as AI drafts.`,
          'No automated web research: claims are kept general and use only the verified facts about Mimar Studios. Check any regulation it mentions against the authority before relying on it.',
          ...(brief.visual ? [`Planned visuals: ${brief.visual}`] : []),
        ],
        keyword: brief.keyword,
        strategy: ideaStrategy({ title: brief.title, keyword: brief.keyword }),
        keywordSource: 'research',
        approach: 'keywords',
        ideaBrief: `SEO brief ${ref}: "${brief.title}"`,
        brief,
      },
    };

    const check = await checkPost({ ...post, geo: brief.geo });
    const errors = Object.entries(check.errors);
    const seoWarnings = check.warnings.filter((warning) => warning.startsWith('SEO:'));
    console.log(`${ref} ${publishNow ? 'PUBLISH NOW' : `scheduled ${date}`}  ${post.path}${errors.length ? `  ERRORS: ${errors.map(([k, v]) => `${k}: ${v}`).join('; ')}` : ''}${seoWarnings.length ? `  (${seoWarnings.length} SEO notes: ${seoWarnings.join(' | ')})` : ''}`);
    if (errors.length) {
      failures++;
      continue;
    }
    if (!write) continue;
    const id = await posts.savePost(existing?.id ?? null, post);
    if (publishNow) toTranslate.push({ id, ref });
  }

  if (failures) throw new Error(`${failures} post(s) failed the publish checks; nothing else to do until they are fixed.`);
  if (write && toTranslate.length) {
    const { ensureArabic } = src('lib/ai/translate-post.ts');
    for (const { id, ref } of toTranslate) {
      try {
        const result = await ensureArabic(id);
        console.log(`${ref} Arabic version: ${result.status}${result.reason ? ` (${result.reason})` : ''}`);
      } catch (err) {
        console.log(`${ref} Arabic version failed: ${err instanceof Error ? err.message : err}. It is retried when the post is saved in /admin/blog.`);
      }
    }
  }
  console.log(write ? 'Saved.' : 'Dry run only; add --write to save.');
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  },
);
