import type { Metadata } from "next";
import { EdTechView } from "@/components/pages/MetaViews";
import { buildMetadata } from "@/lib/seo";
import { edtechContent } from "@/content/pages/meta";

export const metadata: Metadata = buildMetadata({
  title: edtechContent.ar.title,
  description: edtechContent.ar.description,
  path: "/meta/app/edtech",
  locale: "ar",
  ogImage: "/edtech/naqi-ejaz.webp",
});

export default function ArabicEdTechPage() {
  return <EdTechView lang="ar" />;
}
