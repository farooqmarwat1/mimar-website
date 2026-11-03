import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { legacyArchivePaths } from "@/lib/blog-archive";
import { getLegacySeoPageAr } from "@/lib/ar/blog-ar";
import { blogCategories, legacySeoPages } from "@/lib/legacy-seo";
import { IMPORT_MARKER, POSTS_COLLECTION, isoFromLegacyDate, type Post } from "@/lib/posts";
import { translationHashes } from "@/lib/post-translation";

/**
 * One-time copy of the 45 migrated WordPress articles (English and Arabic) into
 * Firestore, so they can be listed, edited, unpublished and deleted in
 * /admin/blog like any other post. Nothing about them changes: same URL, same
 * text, same dates, same position in the blog archive and category lists
 * (kept as `archiveRank` / `categoryRanks`). Safe to run again: articles that
 * were already imported (even if since edited) are left alone.
 *
 * Later changes to which category an imported article is in (legacy-seo.ts blogCategories) reach the
 * stored copies through categorizeLegacyArticles below, which only ever fills in an empty category list.
 */

const docIdFor = (path: string) => `legacy-${path.slice(1).replace(/\//g, "__")}`;

export async function isLegacyImported(): Promise<boolean> {
  return (await adminDb().doc(IMPORT_MARKER).get()).exists;
}

export async function importLegacyArticles(importedBy: string): Promise<{ created: number; skipped: number }> {
  const db = adminDb();
  const col = db.collection(POSTS_COLLECTION);
  const refs = legacySeoPages.map((page) => col.doc(docIdFor(page.path)));
  const existing = new Set((await db.getAll(...refs)).filter((snap) => snap.exists).map((snap) => snap.id));

  const now = new Date().toISOString();
  let created = 0;
  let batch = db.batch();
  let pending = 0;

  for (const page of legacySeoPages) {
    const id = docIdFor(page.path);
    if (existing.has(id)) continue;

    const categoryRanks = Object.fromEntries(
      blogCategories.flatMap((category) => {
        const rank = category.articlePaths.indexOf(page.path);
        return rank < 0 ? [] : [[category.slug, rank] as const];
      }),
    );
    const archiveRank = legacyArchivePaths.indexOf(page.path);
    const arPage = getLegacySeoPageAr(page.path);

    const post: Omit<Post, "id"> = {
      slug: page.path.slice(1),
      path: page.path,
      legacy: true,
      title: page.title,
      seoTitle: page.seoTitle,
      description: page.description,
      keywords: page.keywords,
      geoTerms: [],
      categories: Object.keys(categoryRanks),
      blocks: page.blocks,
      faq: [],
      related: [],
      sources: [],
      origin: "legacy",
      status: "published",
      publishedAt: isoFromLegacyDate(page.published),
      updatedAt: isoFromLegacyDate(page.modified),
      updatedBy: "WordPress import",
      archiveRank: archiveRank < 0 ? undefined : archiveRank,
      categoryRanks,
      ar: arPage
        ? {
            title: arPage.title,
            seoTitle: arPage.seoTitle,
            description: arPage.description,
            keywords: arPage.keywords,
            blocks: arPage.blocks,
            faq: [],
            relatedLabels: [],
            ...(({ all, body }) => ({ sourceHash: all, bodyHash: body }))(
              translationHashes({
                title: page.title,
                seoTitle: page.seoTitle,
                description: page.description,
                keywords: page.keywords,
                geoTerms: [],
                blocks: page.blocks,
                faq: [],
                related: [],
              }),
            ),
            translatedAt: now,
            model: "original translation",
          }
        : undefined,
    };
    batch.create(refs[legacySeoPages.indexOf(page)], JSON.parse(JSON.stringify(post)));
    created++;
    if (++pending === 400) {
      await batch.commit();
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending) await batch.commit();

  // Written last: only now does the public site stop using the built-in copies.
  await db.doc(IMPORT_MARKER).set({ importedAt: now, importedBy, count: legacySeoPages.length });
  return { created, skipped: legacySeoPages.length - created };
}

/** The categories (and their order within each category page) legacy-seo.ts gives an imported article. */
function expectedCategories(path: string) {
  const categoryRanks = Object.fromEntries(
    blogCategories.flatMap((category) => {
      const rank = category.articlePaths.indexOf(path);
      return rank < 0 ? [] : [[category.slug, rank] as const];
    }),
  );
  return { categories: Object.keys(categoryRanks), categoryRanks };
}

/** Imported articles that are stored in no category although legacy-seo.ts now files them in one. */
async function legacyNeedingCategory() {
  const db = adminDb();
  const snaps = await db.getAll(...legacySeoPages.map((page) => db.collection(POSTS_COLLECTION).doc(docIdFor(page.path))));
  return snaps.flatMap((snap, index) => {
    if (!snap.exists) return [];
    const stored = (snap.get("categories") as string[] | undefined) ?? [];
    const expected = expectedCategories(legacySeoPages[index].path);
    return stored.length === 0 && expected.categories.length > 0 ? [{ ref: snap.ref, ...expected }] : [];
  });
}

export async function countLegacyNeedingCategory(): Promise<number> {
  return (await legacyNeedingCategory()).length;
}

/**
 * Files imported articles that are in no category under the category legacy-seo.ts gives them. Only fills in
 * an empty list: an article an editor has already categorised (or deliberately left alone after editing) is
 * never changed, so running it again does nothing.
 */
export async function categorizeLegacyArticles(): Promise<{ updated: number }> {
  const pending = await legacyNeedingCategory();
  if (pending.length === 0) return { updated: 0 };
  const batch = adminDb().batch();
  for (const { ref, categories, categoryRanks } of pending) batch.update(ref, { categories, categoryRanks });
  await batch.commit();
  return { updated: pending.length };
}
