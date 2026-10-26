import type { Metadata } from "next";
import StudioView from "@/components/pages/StudioView";
import { buildMetadata } from "@/lib/seo";
import { studioContent } from "@/content/pages/studio";

export const metadata: Metadata = buildMetadata({
  title: studioContent.en.title,
  description: studioContent.en.description,
  path: "/about-us/studio",
});

export default function StudioPage() {
  return <StudioView />;
}
