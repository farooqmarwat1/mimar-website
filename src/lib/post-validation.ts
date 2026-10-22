import "server-only";
import { countWords, type ContentBlock } from "@/lib/content-blocks";
import { findUnknownPaths, collectLinkedPaths } from "@/lib/internal-paths";
import { blogCategories } from "@/lib/legacy-seo";
import type { FaqItem, LinkItem, SourceItem } from "@/lib/posts";
import { isHttpsSourceUrl } from "@/lib/post-fields";

/**
 * Publish-readiness rules for a blog post. One implementation shared by the
 * editor (manual posts) and the AI generator's quality gates, so a draft can
 * never be "better" or "worse" depending on who wrote it.
 *
 * `errors` block publishing; `warnings` are shown but do not.
 */
export type PostCheckInput = {
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  blocks: ContentBlock[];
  faq: FaqItem[];
  related: LinkItem[];
  sources: SourceItem[];
  coverImage?: { url: string; alt: string };
};

export type PostCheck = { errors: Record<string, string>; warnings: string[] };

export const MIN_PUBLISH_WORDS = 150;

export async function checkPost(post: PostCheckInput): Promise<PostCheck> {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (post.title.length < 10 || post.title.length > 120) errors.title = "Use 10-120 characters.";
  if (post.seoTitle.length < 10 || post.seoTitle.length > 70) errors.seoTitle = "Use 10-70 characters (about 60 is ideal).";
  else if (post.seoTitle.length > 60) warnings.push("The SEO title is over 60 characters and may be cut off in search results.");
  if (post.description.length < 50 || post.description.length > 175) errors.description = "Use 50-175 characters (about 155 is ideal).";
  else if (post.description.length > 160) warnings.push("The meta description is over 160 characters and may be cut off in search results.");

  if (post.category && !blogCategories.some((category) => category.slug === post.category)) errors.category = "Unknown category.";

  const words = countWords(post.blocks);
  if (words < MIN_PUBLISH_WORDS) errors.body = `The article has ${words} words; at least ${MIN_PUBLISH_WORDS} are needed to publish.`;
  else if (words < 600) warnings.push(`The article is ${words} words. Pieces under ~600 words rarely rank for competitive terms.`);
  if (!post.blocks.some((block) => block.type === "h2")) errors.body ??= "Add at least one ## section heading.";
  if (post.blocks.some((block) => block.type === "p" && /^#\s/.test(block.text))) {
    errors.body ??= 'A line starts with a single "#". The page title is the H1; use ## for section headings.';
  }

  const unknown = await findUnknownPaths(collectLinkedPaths(post.blocks, [...post.related.map((l) => l.path), ...post.faq.flatMap((f) => collectLinkedPaths([{ type: "p", text: f.answer }]))]));
  if (unknown.length) errors.links = `These links do not match any page on the site: ${unknown.join(", ")}`;

  if (post.sources.some((source) => !source.title.trim() || !isHttpsSourceUrl(source.url))) errors.sources = "Each source needs a title and a valid full https:// link.";
  if (post.coverImage?.url && !post.coverImage.alt.trim()) errors.coverAlt = "Describe the cover image (alt text).";

  return { errors, warnings };
}
