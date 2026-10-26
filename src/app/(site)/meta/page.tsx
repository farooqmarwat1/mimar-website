import type { Metadata } from "next";
import { MetaView } from "@/components/pages/MetaViews";
import { buildMetadata } from "@/lib/seo";
import { metaContent } from "@/content/pages/meta";

export const metadata: Metadata = buildMetadata({
  title: metaContent.en.title,
  description: metaContent.en.description,
  path: "/meta",
});

export default function MetaPage() {
  return <MetaView />;
}
