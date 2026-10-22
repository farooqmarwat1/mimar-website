"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { parseBlocks } from "@/lib/content-blocks";
import { parseFaq, parseLinks, parseList, parseSources } from "@/lib/post-fields";
import { checkPost } from "@/lib/post-validation";
import {
  POSTS_TAG,
  deletePost,
  getPostAdmin,
  isPostSlugTaken,
  isReservedSlug,
  savePost,
  type Post,
  type PostStatus,
} from "@/lib/posts";
import { slugify } from "@/lib/slug";
import { coverObjectPath, deleteCover } from "@/lib/storage";
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
  category: z.string().trim(),
  keywords: z.string().max(2000),
  geoTerms: z.string().max(2000),
  body: z.string().max(60000),
  faq: z.string().max(20000),
  related: z.string().max(4000),
  sources: z.string().max(8000),
  coverUrl: z.string().trim().max(1200),
  coverAlt: z.string().trim().max(250),
});

/** Refresh every public surface that lists or renders posts. */
function revalidateBlog(slug: string) {
  updateTag(POSTS_TAG);
  revalidatePath("/blog");
  revalidatePath("/blog/[category]", "page");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
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

  // A published URL never changes, so inbound links and rankings keep working.
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

  const blocks = parseBlocks(input.body);
  const faq = parseFaq(input.faq);
  const related = parseLinks(input.related);
  const sources = parseSources(input.sources);
  const category = input.category;
  const seoTitle = input.seoTitle || input.title;
  const knownCover = libraryCover(input.coverUrl);
  const coverImage = input.coverUrl ? { ...knownCover, url: input.coverUrl, alt: input.coverAlt } : undefined;
  // Accept our uploaded images or an exact match from the first-party library.
  if (coverImage && !knownCover && !coverObjectPath(coverImage.url)) {
    return { error: "The cover image must be uploaded here.", fieldErrors: { coverUrl: "Upload the image again." }, values };
  }

  const check = await checkPost({ title: input.title, seoTitle, description: input.description, category, blocks, faq, related, sources, coverImage });
  // Drafts may be saved incomplete; publishing needs every rule to pass.
  if (status === "published" && Object.keys(check.errors).length) {
    return { error: "This post is not ready to publish. Fix the highlighted fields, or save it as a draft.", fieldErrors: check.errors, warnings: check.warnings, values };
  }
  if (blocks.length === 0 && status === "draft" && !input.title) return { error: "Add a title first.", values };

  const now = new Date().toISOString();
  const post: Omit<Post, "id"> = {
    slug,
    title: input.title,
    seoTitle,
    description: input.description,
    keywords: parseList(input.keywords),
    geoTerms: parseList(input.geoTerms),
    category,
    blocks,
    faq,
    coverImage,
    related,
    sources,
    origin: existing?.origin ?? "manual",
    status,
    // Stamped when first published; later edits only move updatedAt (-> dateModified).
    publishedAt: existing?.publishedAt ?? (status === "published" ? now : undefined),
    updatedAt: now,
    updatedBy: session.email,
    generation: existing?.generation,
  };

  const savedId = await savePost(id, post);
  // The cover was replaced or removed: its old file is no longer referenced.
  if (existing?.coverImage?.url && existing.coverImage.url !== coverImage?.url) await deleteCover(existing.coverImage.url);
  revalidateBlog(slug);
  if (existing && existing.slug !== slug) revalidateBlog(existing.slug);

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
    const check = await checkPost(post);
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
  revalidateBlog(post.slug);
  revalidatePath("/admin/blog");
}

export async function deletePostAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const post = await getPostAdmin(id);
  if (!post) return;
  await deletePost(id);
  await deleteCover(post.coverImage?.url);
  revalidateBlog(post.slug);
  redirect("/admin/blog");
}
