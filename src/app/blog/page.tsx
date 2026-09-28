import type { Metadata } from "next";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Latest Blogs by Mimar",
  description: "Stay updated with the latest trends and insights in architecture and 3D rendering technology. Explore the newest blogs by mimAR",
  path: "/blog",
});

export default function BlogIndexPage() {
  return <BlogArchiveView page={1} />;
}
