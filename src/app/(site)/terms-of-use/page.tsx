import type { Metadata } from "next";
import TermsView from "@/components/pages/TermsView";
import { buildMetadata } from "@/lib/seo";
import { termsContent } from "@/content/pages/terms";

// DRAFT - not reviewed by counsel (see the note in src/content/pages/terms.ts).
export const metadata: Metadata = buildMetadata({
  title: termsContent.en.title,
  description: termsContent.en.description,
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return <TermsView />;
}
