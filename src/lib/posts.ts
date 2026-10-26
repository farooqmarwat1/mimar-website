import "server-only";
import { selectBlogCover, type BlogCover } from "@/lib/blog-covers";
import { adminDb } from "@/lib/firebase/admin";
import type { ArticleBlock } from "@/lib/content-blocks";
import { blogCategories, getLegacySeoPage, type LegacySeoPage } from "@/lib/legacy-seo";
import type { Locale } from "@/i18n/config";

/**
 * Every article on the site lives in Firestore (collection `sitePosts`) and is
 * managed in /admin/blog: the posts written there AND the migrated WordPress
 * articles, which are copied in once with "Import existing articles" (see
 * blog-import.ts) and keep their original URLs.
 *
 * This module is the data model plus the admin reads/writes. Public reads
 * (cached, with the built-in JSON as a fallback) are in blog-store.ts.
 */

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
/** manual = typed in the portal, ai = written by the generator, legacy = imported WordPress article. */
export type PostOrigin = "manual" | "ai" | "legacy";

export type FaqItem = { question: string; answer: string };
export type LinkItem = { label: string; path: string };
export type SourceItem = { title: string; url: string };

/** The Arabic version, produced by the translator (never typed in the portal). */
export type PostAr = {
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  /** The target places in Arabic (same order as the English `geoTerms`). */
  geoTerms?: string[];
  blocks: ArticleBlock[];
  faq: FaqItem[];
  /** Arabic labels for `related`, in the same order. */
  relatedLabels: string[];
  coverAlt?: string;
  /** Fingerprint of the English text this was translated from. A different value means the English changed since. */
  sourceHash: string;
  /** Fingerprint of the English article text, FAQ and link labels alone (see post-translation.ts). */
  bodyHash?: string;
  translatedAt: string;
  model: string;
};

export type Post = {
  id: string;
  /** Last URL segment for new posts; the whole path without the leading slash for imported ones. */
  slug: string;
  /** Public English path: /blog/<slug> for new posts, the original URL for imported ones. */
  path: string;
  /** Imported WordPress article. Its URL is fixed. */
  legacy?: boolean;
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  /** Target places (cities / countries) for local search; merged into keywords on the page. */
  geoTerms: string[];
  /** blogCategories[].slug values the article is listed under. */
  categories: string[];
  blocks: ArticleBlock[];
  faq: FaqItem[];
  coverImage?: BlogCover;
  related: LinkItem[];
  sources: SourceItem[];
  origin: PostOrigin;
  status: PostStatus;
  publishedAt?: string;
  updatedAt: string;
  updatedBy: string;
  /** AI drafts: what was asked for and any warnings from the quality gates. */
  generation?: { topic: string; geo?: string; model: string; notes: string[] };
  ar?: PostAr;
  /** Imported articles only: their position in the old blog archive / category lists (lower = earlier). */
  archiveRank?: number;
  categoryRanks?: Record<string, number>;
};

/** A post as the public site consumes it: the legacy article shape plus optional extras. */
export type SiteArticle = LegacySeoPage & {
  cover?: BlogCover;
  faq?: FaqItem[];
  related?: LinkItem[];
  sources?: SourceItem[];
  categories?: string[];
  geoTerms?: string[];
  /** True for articles written in the portal (not the migrated WordPress ones, whose markup is kept exactly). */
  isPost?: true;
  /** An Arabic version exists at /ar/<path>. */
  hasAr: boolean;
  lang: Locale;
};

export const POSTS_COLLECTION = process.env.BLOG_POSTS_COLLECTION?.trim() || "sitePosts";
/** Marker written when the WordPress articles have been imported. */
export const IMPORT_MARKER = POSTS_COLLECTION === "sitePosts" ? "siteBlogMeta/legacyImport" : `${POSTS_COLLECTION}Meta/legacyImport`;
export const POSTS_TAG = "posts";

export const postPath = (slug: string) => `/blog/${slug}`;

export function fromDoc(id: string, data: FirebaseFirestore.DocumentData): Post {
  const post = data as Partial<Post> & { category?: string };
  const slug = post.slug ?? "";
  // Defaults first for fields older/partial documents may lack, then the stored values.
  return {
    ...(post as Omit<Post, "id">),
    slug,
    path: post.path ?? postPath(slug),
    categories: post.categories ?? (post.category ? [post.category] : []),
    faq: post.faq ?? [],
    related: post.related ?? [],
    sources: post.sources ?? [],
    keywords: post.keywords ?? [],
    geoTerms: post.geoTerms ?? [],
    id,
  };
}

// "2026-10-21T08:30:00.000Z" -> "2026-10-21 08:30:00" (the legacy format, treated as UTC).
export const legacyDate = (iso: string) => iso.slice(0, 19).replace("T", " ");
// ...and back, for importing.
export const isoFromLegacyDate = (value: string) => `${value.replace(" ", "T")}.000Z`;

/** The public shape of a post in one language, or null when that language does not exist yet. */
export function articleFromPost(post: Post, lang: Locale = "en"): SiteArticle | null {
  const ar = lang === "ar" ? post.ar : undefined;
  if (lang === "ar" && !ar) return null;
  const published = post.publishedAt ?? post.updatedAt;
  const cover = post.coverImage ?? (post.origin === "ai" ? selectBlogCover({ title: post.title, category: post.categories[0] }) : undefined);
  return {
    path: post.path,
    title: ar?.title ?? post.title,
    seoTitle: ar?.seoTitle ?? post.seoTitle,
    description: ar?.description ?? post.description,
    keywords: ar ? ar.keywords : [...new Set([...post.keywords, ...post.geoTerms])],
    published: legacyDate(published),
    modified: legacyDate(post.updatedAt > published ? post.updatedAt : published),
    blocks: ar?.blocks ?? post.blocks,
    cover: cover && ar?.coverAlt ? { ...cover, alt: ar.coverAlt } : cover,
    faq: (ar?.faq ?? post.faq).length ? (ar?.faq ?? post.faq) : undefined,
    related: post.related.length
      ? post.related.map((item, index) => ({ path: item.path, label: ar?.relatedLabels[index] || item.label }))
      : undefined,
    sources: post.sources.length ? post.sources : undefined,
    categories: post.categories,
    geoTerms: ar?.geoTerms?.length === post.geoTerms.length && ar.geoTerms.length ? ar.geoTerms : post.geoTerms,
    isPost: post.legacy ? undefined : true,
    hasAr: Boolean(post.ar),
    lang,
  };
}

// ---- Slug rules ---------------------------------------------------------

/**
 * /blog/<slug> is shared with category pages (/blog/architecture), archive
 * pagination (/blog/2) and the migrated one-segment articles. A new post may
 * never shadow any of them - including a migrated article that was later
 * deleted, so an old address is never reused for something else.
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug || /^\d+$/.test(slug)) return true;
  if (blogCategories.some((category) => category.slug === slug)) return true;
  return getLegacySeoPage(`blog/${slug}`) !== undefined;
}

// ---- Admin reads/writes (uncached; callers must have passed assertAccess) --

/** What the admin list needs, without the article bodies. */
export type PostRow = Pick<Post, "id" | "slug" | "path" | "legacy" | "title" | "origin" | "status" | "updatedAt" | "updatedBy" | "publishedAt" | "categories"> & {
  arState: "none" | "current" | "outdated";
};

const ROW_FIELDS = ["slug", "path", "legacy", "title", "origin", "status", "updatedAt", "updatedBy", "publishedAt", "categories", "category", "ar.sourceHash"] as const;

export async function listPostRows(): Promise<PostRow[]> {
  const snap = await adminDb().collection(POSTS_COLLECTION).select(...ROW_FIELDS).get();
  return snap.docs
    .map((doc) => {
      const data = doc.data() as Partial<Post> & { category?: string };
      const slug = data.slug ?? "";
      return {
        id: doc.id,
        slug,
        path: data.path ?? postPath(slug),
        legacy: data.legacy,
        title: data.title ?? "",
        origin: data.origin ?? "manual",
        status: data.status ?? "draft",
        updatedAt: data.updatedAt ?? "",
        updatedBy: data.updatedBy ?? "",
        publishedAt: data.publishedAt,
        categories: data.categories ?? (data.category ? [data.category] : []),
        // "current" vs "outdated" needs the English text, so the list only tells present from missing.
        arState: data.ar?.sourceHash ? "current" : "none",
      } satisfies PostRow;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPostAdmin(id: string): Promise<Post | null> {
  const doc = await adminDb().collection(POSTS_COLLECTION).doc(id).get();
  return doc.exists ? fromDoc(doc.id, doc.data()!) : null;
}

export async function isPostSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const snap = await adminDb().collection(POSTS_COLLECTION).where("slug", "==", slug).limit(2).get();
  return snap.docs.some((doc) => doc.id !== exceptId);
}

/** AI drafts nobody has reviewed yet (the scheduler stops adding more past a limit). */
export async function countPendingAiDrafts(): Promise<number> {
  const snap = await adminDb().collection(POSTS_COLLECTION).where("status", "==", "draft").select("origin").get();
  return snap.docs.filter((doc) => doc.get("origin") === "ai").length;
}

export async function countDrafts(): Promise<number> {
  const snap = await adminDb().collection(POSTS_COLLECTION).where("status", "==", "draft").select("status").get();
  return snap.size;
}

export async function savePost(id: string | null, data: Omit<Post, "id"> & { id?: string }): Promise<string> {
  const col = adminDb().collection(POSTS_COLLECTION);
  const clean = JSON.parse(JSON.stringify(data)) as Omit<Post, "id"> & { id?: string; category?: string };
  delete clean.id;
  delete clean.category;
  if (id) {
    await col.doc(id).set(clean);
    return id;
  }
  return (await col.add(clean)).id;
}

export async function deletePost(id: string) {
  await adminDb().collection(POSTS_COLLECTION).doc(id).delete();
}
