import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { legacyArchivePaths, blogPageSize } from "@/lib/blog-archive";
import { legacyCategories } from "@/lib/legacy-categories";
import { blogCategories, getLegacySeoPage, legacySeoPages } from "@/lib/legacy-seo";
import { getLegacySeoPageAr, legacySeoPagesAr } from "@/lib/ar/blog-ar";
import {
  IMPORT_MARKER,
  POSTS_COLLECTION,
  POSTS_TAG,
  articleFromPost,
  fromDoc,
  legacyDate,
  postPath,
  type Post,
  type SiteArticle,
} from "@/lib/posts";
import type { Locale } from "@/i18n/config";

/**
 * What the public site reads. Everything comes from Firestore (see posts.ts),
 * through two small caches that /admin invalidates on every save:
 *
 *   index   - one light row per published article (titles, dates, categories)
 *             for lists, pagination, the sitemap and llms.txt
 *   article - one full document, looked up by its public path
 *
 * Fallbacks, so the site never goes blank:
 * - Firebase not configured, or Firestore unreachable: the 45 migrated articles
 *   are served from the built-in JSON, exactly as before the portal existed.
 * - Firestore reachable but the WordPress articles not imported yet: the JSON
 *   articles plus the posts written in /admin.
 * Once the import has run, Firestore is the only source, so deleting or
 * unpublishing an imported article really removes it.
 */

export type BlogEntry = {
  /** English public path, e.g. /blog/3d-rendering */
  path: string;
  title: string;
  description: string;
  /** Arabic title/description; undefined while there is no Arabic version. */
  titleAr?: string;
  descriptionAr?: string;
  /** "2026-10-21 08:30:00" (the legacy format). */
  published: string;
  modified: string;
  legacy: boolean;
  categories: string[];
  archiveRank?: number;
  categoryRanks: Record<string, number>;
  /** Position in the built-in JSON (migrated articles), to keep a stable order. */
  order: number;
};

export type ListItem = { path: string; title: string };

const normalizePath = (path: string) => `/${path.replace(/[?#].*$/, "").replace(/^\/+|\/+$/g, "")}`;

// ---- Built-in articles (fallback) ---------------------------------------

const legacyOrder = new Map(legacySeoPages.map((page, index) => [page.path, index]));

let staticCache: BlogEntry[] | undefined;
function staticEntries(): BlogEntry[] {
  staticCache ??= legacySeoPages.map((page, order) => {
    const ar = getLegacySeoPageAr(page.path);
    const categoryRanks = Object.fromEntries(
      blogCategories.flatMap((category) => {
        const rank = category.articlePaths.indexOf(page.path);
        return rank < 0 ? [] : [[category.slug, rank] as const];
      }),
    );
    const archiveRank = legacyArchivePaths.indexOf(page.path);
    return {
      path: page.path,
      title: page.title,
      description: page.description,
      titleAr: ar?.title,
      descriptionAr: ar?.description,
      published: page.published,
      modified: page.modified,
      legacy: true,
      categories: Object.keys(categoryRanks),
      archiveRank: archiveRank < 0 ? undefined : archiveRank,
      categoryRanks,
      order,
    };
  });
  return staticCache;
}

// ---- Firestore index ----------------------------------------------------

const INDEX_FIELDS = [
  "slug", "path", "legacy", "title", "description", "publishedAt", "updatedAt", "categories", "category",
  "archiveRank", "categoryRanks", "ar.title", "ar.description",
] as const;

function entryFromDoc(data: FirebaseFirestore.DocumentData): BlogEntry {
  const path = data.path ?? postPath(data.slug ?? "");
  const publishedIso: string = data.publishedAt ?? data.updatedAt ?? new Date(0).toISOString();
  const updatedIso: string = data.updatedAt ?? publishedIso;
  return {
    path,
    title: data.title ?? "",
    description: data.description ?? "",
    titleAr: data.ar?.title || undefined,
    descriptionAr: data.ar?.description || undefined,
    published: legacyDate(publishedIso),
    modified: legacyDate(updatedIso > publishedIso ? updatedIso : publishedIso),
    legacy: Boolean(data.legacy),
    categories: data.categories ?? (data.category ? [data.category] : []),
    archiveRank: typeof data.archiveRank === "number" ? data.archiveRank : undefined,
    categoryRanks: data.categoryRanks ?? {},
    order: legacyOrder.get(path) ?? Number.MAX_SAFE_INTEGER,
  };
}

const cachedIndex = unstable_cache(
  async () => {
    const db = adminDb();
    const [snap, marker] = await Promise.all([
      db.collection(POSTS_COLLECTION).where("status", "==", "published").select(...INDEX_FIELDS).get(),
      db.doc(IMPORT_MARKER).get(),
    ]);
    return { imported: marker.exists, entries: snap.docs.map((doc) => entryFromDoc(doc.data())) };
  },
  ["blog:index"],
  { tags: [POSTS_TAG], revalidate: 3600 },
);

type Loaded = { entries: BlogEntry[]; imported: boolean; live: boolean };

const load = cache(async (): Promise<Loaded> => {
  if (!isFirebaseConfigured) return { entries: staticEntries(), imported: false, live: false };
  try {
    const { imported, entries } = await cachedIndex();
    return { imported, live: true, entries: imported ? entries : [...entries.filter((entry) => !entry.legacy), ...staticEntries()] };
  } catch (err) {
    console.error("[blog] could not load the article index; serving the built-in articles:", err instanceof Error ? err.message : err);
    return { entries: staticEntries(), imported: false, live: false };
  }
});

/** Every published article, unsorted. */
export async function getBlogEntries(): Promise<BlogEntry[]> {
  return (await load()).entries;
}

// ---- Ordering -----------------------------------------------------------

const newestFirst = (a: BlogEntry, b: BlogEntry) => b.published.localeCompare(a.published) || a.order - b.order;

/** Articles without a rank (written in the portal) first, newest first; then the imported ones in their old order. */
function byRank(rank: (entry: BlogEntry) => number | undefined) {
  return (a: BlogEntry, b: BlogEntry) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra === undefined && rb === undefined) return newestFirst(a, b);
    if (ra === undefined) return -1;
    if (rb === undefined) return 1;
    return ra - rb;
  };
}

const inLanguage = (entry: BlogEntry, lang: Locale) => lang === "en" || entry.titleAr !== undefined;
const toItem = (entry: BlogEntry, lang: Locale): ListItem => ({ path: entry.path, title: lang === "ar" ? entry.titleAr! : entry.title });

export async function getArchive(lang: Locale = "en"): Promise<ListItem[]> {
  const { entries } = await load();
  return entries
    .filter((entry) => inLanguage(entry, lang) && (!entry.legacy || entry.archiveRank !== undefined))
    .sort(byRank((entry) => entry.archiveRank))
    .map((entry) => toItem(entry, lang));
}

export const archivePageCount = (total: number) => Math.ceil(total / blogPageSize);

export async function getArchivePageCount(lang: Locale = "en"): Promise<number> {
  return archivePageCount((await getArchive(lang)).length);
}

export async function getArchivePage(page: number, lang: Locale = "en"): Promise<ListItem[]> {
  const all = await getArchive(lang);
  if (!Number.isInteger(page) || page < 1 || page > archivePageCount(all.length)) return [];
  return all.slice((page - 1) * blogPageSize, page * blogPageSize);
}

export async function getCategoryList(slug: string, lang: Locale = "en"): Promise<ListItem[]> {
  const { entries } = await load();
  return entries
    .filter((entry) => inLanguage(entry, lang) && entry.categories.includes(slug))
    .sort(byRank((entry) => entry.categoryRanks[slug]))
    .map((entry) => toItem(entry, lang));
}

/** The old WordPress /category/<slug> archives: fixed lists of paths, skipping anything unpublished or deleted. */
export async function getLegacyCategoryList(slug: string, lang: Locale = "en"): Promise<{ category: (typeof legacyCategories)[number] | undefined; articles: ListItem[] }> {
  const category = legacyCategories.find((item) => item.slug === slug);
  if (!category) return { category: undefined, articles: [] };
  const { entries } = await load();
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const articles = category.articlePaths.flatMap((path) => {
    const entry = byPath.get(path);
    return entry && inLanguage(entry, lang) ? [toItem(entry, lang)] : [];
  });
  return { category, articles };
}

/** Slugs under /blog/ (one segment) that are published, for static generation. */
export async function getBlogSlugs(lang: Locale = "en"): Promise<string[]> {
  const { entries } = await load();
  return entries
    .filter((entry) => inLanguage(entry, lang))
    .flatMap((entry) => {
      const match = /^\/blog\/([^/]+)$/.exec(entry.path);
      return match ? [match[1]] : [];
    });
}

// ---- One article --------------------------------------------------------

const cachedPost = unstable_cache(
  async (path: string): Promise<Post | null> => {
    const col = adminDb().collection(POSTS_COLLECTION);
    let snap = await col.where("path", "==", path).where("status", "==", "published").limit(1).get();
    // Posts saved before the `path` field existed.
    const legacySlug = /^\/blog\/([^/]+)$/.exec(path)?.[1];
    if (snap.empty && legacySlug) snap = await col.where("slug", "==", legacySlug).where("status", "==", "published").limit(1).get();
    return snap.empty ? null : fromDoc(snap.docs[0].id, snap.docs[0].data());
  },
  ["blog:post"],
  { tags: [POSTS_TAG], revalidate: 3600 },
);

function staticArticle(path: string, lang: Locale): SiteArticle | null {
  const page = lang === "ar" ? getLegacySeoPageAr(path) : getLegacySeoPage(path);
  if (!page) return null;
  return { ...page, hasAr: Boolean(getLegacySeoPageAr(path)), lang };
}

/** The published article at an English path, in one language; null when it does not exist (a real 404). */
export async function getBlogArticle(path: string, lang: Locale = "en"): Promise<SiteArticle | null> {
  const clean = normalizePath(path);
  const { imported, live } = await load();
  if (live) {
    try {
      const post = await cachedPost(clean);
      if (post && (imported || !post.legacy)) return articleFromPost(post, lang);
      if (imported) return null;
    } catch (err) {
      console.error("[blog] could not load an article; serving the built-in copy:", err instanceof Error ? err.message : err);
    }
  }
  return staticArticle(clean, lang);
}

/** Paths of the built-in articles (never changes; used for static generation of non-/blog URLs). */
export const builtInArticlePaths = () => legacySeoPages.map((page) => page.path);
export const builtInArabicPaths = () => legacySeoPagesAr.map((page) => page.path);
