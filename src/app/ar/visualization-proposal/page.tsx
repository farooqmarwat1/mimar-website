import type { Metadata } from "next";
import { VisualizationProposalView } from "@/components/pages/BookingViews";
import { buildMetadata } from "@/lib/seo";
import { proposalContent } from "@/content/pages/booking";

export const metadata: Metadata = buildMetadata({
  title: proposalContent.ar.title,
  description: proposalContent.ar.description,
  path: "/visualization-proposal",
  locale: "ar",
});

export default function ArabicVisualizationProposalPage() {
  return <VisualizationProposalView lang="ar" />;
}
