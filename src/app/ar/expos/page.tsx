import type { Metadata } from "next";
import ExposView from "@/components/pages/ExposView";
import { buildMetadata } from "@/lib/seo";
import { exposContent } from "@/content/pages/expos-careers-privacy";

export const metadata: Metadata = buildMetadata({
  title: exposContent.ar.title,
  description: exposContent.ar.description,
  path: "/expos",
  locale: "ar",
  keywords: exposContent.ar.keywords,
});

export default function ArabicExposPage() {
  return <ExposView lang="ar" />;
}
