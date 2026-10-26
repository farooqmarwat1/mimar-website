import type { Metadata } from "next";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Latest Blogs by Mimar",
  description: "Stay updated with the latest trends and insights in architecture and 3D rendering technology. Explore the newest blogs by mimAR",
  path: "/blog",
});

// New posts appear on page 1; admin edits refresh this immediately, hourly is the safety net.
export const revalidate = 3600;

export default function BlogIndexPage() {
  return <BlogArchiveView page={1} />;
}
