import type { Metadata } from "next";
import { VisualizationProposalView } from "@/components/pages/BookingViews";
import { buildMetadata } from "@/lib/seo";
import { proposalContent } from "@/content/pages/booking";

// The old page only embedded this Canva presentation and had no meta description.
export const metadata: Metadata = buildMetadata({
  title: proposalContent.en.title,
  description: proposalContent.en.description,
  path: "/visualization-proposal",
});

export default function VisualizationProposalPage() {
  return <VisualizationProposalView />;
}
