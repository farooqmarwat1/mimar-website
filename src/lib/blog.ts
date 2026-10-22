import "server-only";
import { blogArchiveArticles, blogPageSize } from "@/lib/blog-archive";
import { getArticlesForCategory } from "@/lib/legacy-seo";
import { getPublishedArticles, type SiteArticle } from "@/lib/posts";

/**
 * The public blog catalogue: Firestore posts layered on top of the migrated
 * archive. `blog-archive.ts` and `legacy-seo.ts` stay the source of truth for
 * the WordPress articles (order, pagination, category membership) and are not
 * modified; new posts are prepended, newest first - the same treatment the
 * archive already gives its one "newer article". With no posts these functions
 * return exactly what the static helpers return.
 */

export async function getBlogArchive(): Promise<SiteArticle[]> {
  const posts = await getPublishedArticles();
  return [...posts, ...blogArchiveArticles];
}

export async function getBlogPageCount(): Promise<number> {
  return Math.ceil((await getBlogArchive()).length / blogPageSize);
}

export async function getBlogArchivePage(page: number): Promise<SiteArticle[]> {
  const all = await getBlogArchive();
  const pageCount = Math.ceil(all.length / blogPageSize);
  if (!Number.isInteger(page) || page < 1 || page > pageCount) return [];
  const start = (page - 1) * blogPageSize;
  return all.slice(start, start + blogPageSize);
}

export async function getCategoryArticles(slug: string) {
  const { category, articles } = getArticlesForCategory(slug);
  if (!category) return { category: undefined, articles: [] as SiteArticle[] };
  const posts = (await getPublishedArticles()).filter((post) => post.category === slug);
  return { category, articles: [...posts, ...articles] as SiteArticle[] };
}
