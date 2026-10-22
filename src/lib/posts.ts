import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import type { ContentBlock } from "@/lib/content-blocks";
import { blogCategories, getLegacySeoPage, type LegacySeoPage } from "@/lib/legacy-seo";

/**
 * Blog posts managed in /admin/blog (Firestore collection `posts`).
 *
 * The 39 migrated WordPress articles stay in src/content/legacy-seo.json and
 * are never touched. Posts here are served at /blog/<slug> and are mapped to
 * the same `LegacySeoPage` shape (plus optional extras) at read time, so every
 * existing component - article template, lists, sitemap, llms.txt - works for
 * both. With Firebase unconfigured or unreachable this module returns nothing
 * and the blog renders exactly as it did before.
 */

export const POST_STATUSES = ["draft", "published"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export type PostOrigin = "manual" | "ai";

export type FaqItem = { question: string; answer: string };
export type LinkItem = { label: string; path: string };
export type SourceItem = { title: string; url: string };

export type Post = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  /** Target places (cities / countries) for local search; merged into keywords on the page. */
  geoTerms: string[];
  /** One of blogCategories[].slug, or "" for none. */
  category: string;
  blocks: ContentBlock[];
  faq: FaqItem[];
  coverImage?: { url: string; alt: string };
  related: LinkItem[];
  sources: SourceItem[];
  origin: PostOrigin;
  status: PostStatus;
  publishedAt?: string;
  updatedAt: string;
  updatedBy: string;
  /** AI drafts: what was asked for and any warnings from the quality gates. */
  generation?: { topic: string; geo?: string; model: string; notes: string[] };
};

/** A post as the public site consumes it: the legacy article shape plus optional extras. */
export type SiteArticle = LegacySeoPage & {
  cover?: { url: string; alt: string };
  faq?: FaqItem[];
  related?: LinkItem[];
  sources?: SourceItem[];
  category?: string;
  /** True for Firestore posts (never set on the migrated WordPress articles). */
  isPost?: true;
};

const COLLECTION = "sitePosts";
export const POSTS_TAG = "posts";

export const postPath = (slug: string) => `/blog/${slug}`;

function fromDoc(id: string, data: FirebaseFirestore.DocumentData): Post {
  const post = data as Partial<Post>;
  // Defaults first for fields older/partial documents may lack, then the stored values.
  return {
    ...(post as Omit<Post, "id">),
    faq: post.faq ?? [],
    related: post.related ?? [],
    sources: post.sources ?? [],
    keywords: post.keywords ?? [],
    geoTerms: post.geoTerms ?? [],
    category: post.category ?? "",
    id,
  };
}

// "2026-10-21T08:30:00.000Z" -> "2026-10-21 08:30:00" (the legacy format, treated as UTC).
const legacyDate = (iso: string) => iso.slice(0, 19).replace("T", " ");

export function toSiteArticle(post: Post): SiteArticle {
  const published = post.publishedAt ?? post.updatedAt;
  return {
    path: postPath(post.slug),
    title: post.title,
    seoTitle: post.seoTitle,
    description: post.description,
    keywords: [...new Set([...post.keywords, ...post.geoTerms])],
    published: legacyDate(published),
    modified: legacyDate(post.updatedAt > published ? post.updatedAt : published),
    blocks: post.blocks,
    cover: post.coverImage,
    faq: post.faq.length ? post.faq : undefined,
    related: post.related.length ? post.related : undefined,
    sources: post.sources.length ? post.sources : undefined,
    category: post.category || undefined,
    isPost: true,
  };
}

const newestFirst = (a: Post, b: Post) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");

const cachedPublished = unstable_cache(
  async () => {
    const snap = await adminDb().collection(COLLECTION).where("status", "==", "published").get();
    return snap.docs.map((doc) => fromDoc(doc.id, doc.data())).sort(newestFirst);
  },
  ["posts:published"],
  { tags: [POSTS_TAG], revalidate: 3600 },
);

/** Published posts, newest first, for the public site. Never throws. */
export async function getPublishedPosts(): Promise<Post[]> {
  if (!isFirebaseConfigured) return [];
  try {
    return await cachedPublished();
  } catch (err) {
    console.error("[posts] could not load published posts:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getPublishedArticles(): Promise<SiteArticle[]> {
  return (await getPublishedPosts()).map(toSiteArticle);
}

export async function getPublishedArticleBySlug(slug: string): Promise<SiteArticle | null> {
  const post = (await getPublishedPosts()).find((p) => p.slug === slug);
  return post ? toSiteArticle(post) : null;
}

// ---- Slug rules ---------------------------------------------------------

/**
 * /blog/<slug> is shared with category pages (/blog/architecture), archive
 * pagination (/blog/2) and the migrated one-segment articles. A new post may
 * never shadow any of them.
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug || /^\d+$/.test(slug)) return true;
  if (blogCategories.some((category) => category.slug === slug)) return true;
  return getLegacySeoPage(`blog/${slug}`) !== undefined;
}

// ---- Admin reads/writes (uncached; callers must have passed assertAccess) --

export async function listPostsAdmin(): Promise<Post[]> {
  const snap = await adminDb().collection(COLLECTION).get();
  return snap.docs.map((doc) => fromDoc(doc.id, doc.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getPostAdmin(id: string): Promise<Post | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? fromDoc(doc.id, doc.data()!) : null;
}

export async function isPostSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const snap = await adminDb().collection(COLLECTION).where("slug", "==", slug).limit(2).get();
  return snap.docs.some((doc) => doc.id !== exceptId);
}

export async function savePost(id: string | null, data: Omit<Post, "id"> & { id?: string }): Promise<string> {
  const col = adminDb().collection(COLLECTION);
  const clean = JSON.parse(JSON.stringify(data)) as Omit<Post, "id"> & { id?: string };
  delete clean.id;
  if (id) {
    await col.doc(id).set(clean);
    return id;
  }
  return (await col.add(clean)).id;
}

export async function deletePost(id: string) {
  await adminDb().collection(COLLECTION).doc(id).delete();
}
