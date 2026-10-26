import type { Metadata } from "next";
import { MetaView } from "@/components/pages/MetaViews";
import { buildMetadata } from "@/lib/seo";
import { metaContent } from "@/content/pages/meta";

export const metadata: Metadata = buildMetadata({
  title: metaContent.ar.title,
  description: metaContent.ar.description,
  path: "/meta",
  locale: "ar",
});

export default function ArabicMetaPage() {
  return <MetaView lang="ar" />;
}
