import type { Metadata } from "next";
import ApplyView from "@/components/pages/ApplyView";
import { buildMetadata } from "@/lib/seo";
import { applyContent } from "@/content/pages/apply";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: applyContent.ar.title,
  description: applyContent.ar.description,
  path: "/careers/apply",
  locale: "ar",
  noIndex: true,
});

export default function ArabicApplyPage() {
  return <ApplyView lang="ar" />;
}
