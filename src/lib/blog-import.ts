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
