"use server";

import { after } from "next/server";
import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { aiConfigured } from "@/lib/ai/provider";
import { ensureArabic } from "@/lib/ai/translate-post";
import { importLegacyArticles } from "@/lib/blog-import";
import { parseBlocks } from "@/lib/content-blocks";
import { parseFaq, parseLinks, parseList, parseSources } from "@/lib/post-fields";
import { checkPost } from "@/lib/post-validation";
import {
  POSTS_TAG,
  deletePost,
  getPostAdmin,
  isPostSlugTaken,
  isReservedSlug,
  postPath,
  savePost,
  type Post,
  type PostStatus,
} from "@/lib/posts";
import { slugify } from "@/lib/slug";
import { coverObjectPath, deleteCover } from "@/lib/storage";
import { blogCategories } from "@/lib/legacy-seo";
import { libraryCover } from "@/lib/blog-covers";

export type PostFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  warnings?: string[];
  saved?: boolean;
  values?: Record<string, string>;
};

const schema = z.object({
  intent: z.enum(["draft", "published"]),
  title: z.string().trim().min(1, "Enter a title.").max(160),
  slug: z.string().trim().max(90).optional(),
  seoTitle: z.string().trim().max(120),
  description: z.string().trim().max(400),
  keywords: z.string().max(2000),
  geoTerms: z.string().max(2000),
  body: z.string().max(80000),
  faq: z.string().max(20000),
  related: z.string().max(4000),
  sources: z.string().max(8000),
  coverUrl: z.string().trim().max(1200),
  coverAlt: z.string().trim().max(250),
});

/** The pages that list or render articles, in both languages. */
function pagePaths(path: string) {
  return [
    "/blog",
    "/ar/blog",
    path,
    `/ar${path}`,
    "/sitemap.xml",
    "/llms.txt",
  ];
}

/** Refresh every public surface that lists or renders articles. For Server Actions. */
function revalidateBlog(path: string) {
  updateTag(POSTS_TAG);
  for (const target of pagePaths(path)) revalidatePath(target);
  for (const pattern of ["/blog/[category]", "/ar/blog/[category]", "/category/[slug]", "/ar/category/[slug]", "/[...legacy]", "/ar/[...legacy]"]) {
    revalidatePath(pattern, "page");
  }
}

/** Same, for work that finishes after the response (the Arabic version is written then). */
function revalidateBlogLater(path: string) {
  try {
    revalidateTag(POSTS_TAG, { expire: 0 });
    for (const target of pagePaths(path)) revalidatePath(target);
    revalidatePath("/ar/blog/[category]", "page");
    revalidatePath("/ar/[...legacy]", "page");
  } catch (err) {
    console.error("[blog] could not refresh pages after translating:", err instanceof Error ? err.message : err);
  }
}

/** Writes or refreshes the Arabic version once the response has been sent. Drafts are translated when published. */
function translateAfterSave(post: { id: string; path: string; status: PostStatus }) {
  if (post.status !== "published" || !aiConfigured()) return;
  after(async () => {
    try {
      const result = await ensureArabic(post.id);
      if (result.status === "translated") revalidateBlogLater(post.path);
    } catch (err) {
      console.error("[blog] Arabic version failed:", err instanceof Error ? err.message : err);
    }
  });
}

function snapshot(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string" && key !== "id") values[key] = value;
  return values;
}

export async function savePostAction(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const values = snapshot(formData);

  let session;
  try {
    session = await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message, values };
    throw err;
  }

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message;
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }
  const input = parsed.data;
  const status: PostStatus = input.intent;

  const id = String(formData.get("id") ?? "") || null;
  const existing = id ? await getPostAdmin(id) : null;
  if (id && !existing) return { error: "That post no longer exists.", values };

  // A published address never changes, so inbound links and rankings keep working.
  const slug = existing?.publishedAt ? existing.slug : slugify(input.slug || input.title);
  if (!slug) return { error: "Could not build a URL from that title.", fieldErrors: { title: "Use letters or numbers." }, values };
  if (!existing?.publishedAt) {
    if (isReservedSlug(slug)) {
      return { error: "That URL is already used by the site.", fieldErrors: { slug: "Reserved (a category, page number or existing article)." }, values };
    }
    if (await isPostSlugTaken(slug, id ?? undefined)) {
      return { error: "That URL is already used by another post.", fieldErrors: { slug: "Already taken." }, values };
    }
  }
  const path = existing?.path ?? postPath(slug);

  const blocks = parseBlocks(input.body);
  const faq = parseFaq(input.faq);
  const related = parseLinks(input.related);
  const sources = parseSources(input.sources);
  const categories = [...new Set(formData.getAll("categories").map(String))].filter((value) => blogCategories.some((category) => category.slug === value));
  const seoTitle = input.seoTitle || input.title;
  const knownCover = libraryCover(input.coverUrl);
  const coverImage = input.coverUrl ? { ...knownCover, url: input.coverUrl, alt: input.coverAlt } : undefined;
  // Accept our uploaded images or an exact match from the first-party library.
  if (coverImage && !knownCover && !coverObjectPath(coverImage.url)) {
    return { error: "The cover image must be uploaded here.", fieldErrors: { coverUrl: "Upload the image again." }, values };
  }

  const check = await checkPost({ title: input.title, seoTitle, description: input.description, categories, blocks, faq, related, sources, coverImage, legacy: existing?.legacy });
  // Drafts may be saved incomplete; publishing needs every rule to pass.
  if (status === "published" && Object.keys(check.errors).length) {
    return { error: "This post is not ready to publish. Fix the highlighted fields, or save it as a draft.", fieldErrors: check.errors, warnings: check.warnings, values };
  }
  if (blocks.length === 0 && status === "draft" && !input.title) return { error: "Add a title first.", values };

  const now = new Date().toISOString();
  const post: Omit<Post, "id"> = {
    ...(existing ?? { origin: "manual" as const }),
    slug,
    path,
    title: input.title,
    seoTitle,
    description: input.description,
    keywords: parseList(input.keywords),
    geoTerms: parseList(input.geoTerms),
    categories,
    blocks,
    faq,
    coverImage,
    related,
    sources,
    status,
    // Stamped when first published; later edits only move updatedAt (-> dateModified).
    publishedAt: existing?.publishedAt ?? (status === "published" ? now : undefined),
    updatedAt: now,
    updatedBy: session.email,
  };

  const savedId = await savePost(id, post);
  // The cover was replaced or removed: its old file is no longer referenced.
  if (existing?.coverImage?.url && existing.coverImage.url !== coverImage?.url) await deleteCover(existing.coverImage.url);
  revalidateBlog(path);
  translateAfterSave({ id: savedId, path, status });

  if (!id) redirect(`/admin/blog/${savedId}?saved=1`);
  return { saved: true, warnings: [...check.warnings, ...Object.values(status === "draft" ? check.errors : {})], values };
}

async function guard() {
  try {
    return await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) redirect("/admin/login");
    throw err;
  }
}

/** Quick publish / unpublish from the list. Publishing re-runs the publish checks. */
export async function setPostStatusAction(formData: FormData) {
  const session = await guard();
  const id = String(formData.get("id") ?? "");
  const status = z.enum(["draft", "published"]).safeParse(formData.get("status"));
  if (!id || !status.success) return;
  const post = await getPostAdmin(id);
  if (!post) return;

  if (status.data === "published") {
    const check = await checkPost({ ...post, legacy: post.legacy });
    if (Object.keys(check.errors).length) redirect(`/admin/blog/${id}?blocked=1`);
  }

  const now = new Date().toISOString();
  await savePost(id, {
    ...post,
    status: status.data,
    publishedAt: post.publishedAt ?? (status.data === "published" ? now : undefined),
    updatedAt: now,
    updatedBy: session.email,
  });
  revalidateBlog(post.path);
  revalidatePath("/admin/blog");
  translateAfterSave({ id, path: post.path, status: status.data });
}

export async function deletePostAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const post = await getPostAdmin(id);
  if (!post) return;
  await deletePost(id);
  await deleteCover(post.coverImage?.url);
  revalidateBlog(post.path);
  redirect("/admin/blog");
}

/** Writes the Arabic version now (also the way to retry after an automatic attempt failed). */
export async function translateNowAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const post = await getPostAdmin(id);
  if (!post) redirect("/admin/blog");
  let outcome = "ok";
  try {
    const result = await ensureArabic(id, { force: formData.get("force") === "1" });
    if (result.status === "skipped") outcome = "skipped";
    else revalidateBlog(post.path);
  } catch (err) {
    console.error("[blog] translate failed:", err instanceof Error ? err.message : err);
    outcome = "failed";
  }
  redirect(`/admin/blog/${id}?arabic=${outcome}`);
}

/** One-time copy of the migrated WordPress articles into the portal. Safe to run again. */
export async function importLegacyAction() {
  const session = await guard();
  const result = await importLegacyArticles(session.email);
  revalidateBlog("/blog");
  redirect(`/admin/blog?imported=${result.created}`);
}
