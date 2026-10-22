import { blocksToText } from "@/lib/content-blocks";
import { faqToText, linksToText, listToText, sourcesToText } from "@/lib/post-fields";
import type { PostFormInitial } from "@/components/admin/PostForm";
import type { Post } from "@/lib/posts";

export function postToFormValues(post: Post): PostFormInitial {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    slugLocked: Boolean(post.publishedAt),
    seoTitle: post.seoTitle,
    description: post.description,
    category: post.category,
    keywords: listToText(post.keywords),
    geoTerms: listToText(post.geoTerms),
    body: blocksToText(post.blocks),
    faq: faqToText(post.faq),
    related: linksToText(post.related),
    sources: sourcesToText(post.sources),
    coverUrl: post.coverImage?.url ?? "",
    coverAlt: post.coverImage?.alt ?? "",
    status: post.status,
    origin: post.origin,
    notes: post.generation?.notes ?? [],
  };
}

export const emptyPostForm: PostFormInitial = {
  title: "",
  slug: "",
  slugLocked: false,
  seoTitle: "",
  description: "",
  category: "",
  keywords: "",
  geoTerms: "",
  body: "",
  faq: "",
  related: "",
  sources: "",
  coverUrl: "",
  coverAlt: "",
  status: "draft",
  origin: "manual",
  notes: [],
};
