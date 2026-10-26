import type { Metadata } from "next";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import { buildMetadata } from "@/lib/seo";
import { blogMetaAr } from "@/lib/ar/blog-ui";

export const metadata: Metadata = buildMetadata({
  title: blogMetaAr.title,
  description: blogMetaAr.description,
  path: "/blog",
  locale: "ar",
});

// Static: the Arabic blog is the translated archive only. Posts written in
// /admin are English-only and never appear under /ar.
export default function ArabicBlogIndexPage() {
  return <BlogArchiveView page={1} lang="ar" />;
}
