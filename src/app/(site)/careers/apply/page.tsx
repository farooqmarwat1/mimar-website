import type { Metadata } from "next";
import ApplyView from "@/components/pages/ApplyView";
import { buildMetadata } from "@/lib/seo";
import { applyContent } from "@/content/pages/apply";

// The role list is the same Firestore-backed one as /careers; admin edits refresh /careers, the hourly revalidate is the safety net.
export const revalidate = 3600;

// A form page has nothing to rank for, so it stays out of search results (and the sitemap).
export const metadata: Metadata = buildMetadata({
  title: applyContent.en.title,
  description: applyContent.en.description,
  path: "/careers/apply",
  noIndex: true,
});

export default function ApplyPage() {
  return <ApplyView />;
}
