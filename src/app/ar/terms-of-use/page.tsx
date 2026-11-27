import type { Metadata } from "next";
import TermsView from "@/components/pages/TermsView";
import { buildMetadata } from "@/lib/seo";
import { termsContent } from "@/content/pages/terms";

export const metadata: Metadata = buildMetadata({
  title: termsContent.ar.title,
  description: termsContent.ar.description,
  path: "/terms-of-use",
  locale: "ar",
});

export default function ArabicTermsOfUsePage() {
  return <TermsView lang="ar" />;
}
