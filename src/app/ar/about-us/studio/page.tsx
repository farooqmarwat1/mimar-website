import type { Metadata } from "next";
import StudioView from "@/components/pages/StudioView";
import { buildMetadata } from "@/lib/seo";
import { studioContent } from "@/content/pages/studio";

export const metadata: Metadata = buildMetadata({
  title: studioContent.ar.title,
  description: studioContent.ar.description,
  path: "/about-us/studio",
  locale: "ar",
});

export default function ArabicStudioPage() {
  return <StudioView lang="ar" />;
}
