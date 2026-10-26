import type { Metadata } from "next";
import ExposView from "@/components/pages/ExposView";
import { buildMetadata } from "@/lib/seo";
import { exposContent } from "@/content/pages/expos-careers-privacy";

export const metadata: Metadata = buildMetadata({
  title: exposContent.en.title,
  description: exposContent.en.description,
  path: "/expos",
  keywords: exposContent.en.keywords,
});

export default function ExposPage() {
  return <ExposView />;
}
