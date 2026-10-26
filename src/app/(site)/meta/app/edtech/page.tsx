import type { Metadata } from "next";
import { EdTechView } from "@/components/pages/MetaViews";
import { buildMetadata } from "@/lib/seo";
import { edtechContent } from "@/content/pages/meta";

// Restored from the old /meta/app/edtech page: two web AR science
// experiences. The old site linked each one to its own page
// (/magnetic-field-of-solenoid, /galvanic-cell) that only embedded the
// MyWebAR project, so the cards open those projects directly.
export const metadata: Metadata = buildMetadata({
  title: edtechContent.en.title,
  description: edtechContent.en.description,
  path: "/meta/app/edtech",
  ogImage: "/edtech/naqi-ejaz.webp",
});

export default function EdTechPage() {
  return <EdTechView />;
}
