import type { Metadata } from "next";
import PrivacyPolicyView from "@/components/pages/PrivacyPolicyView";
import { buildMetadata } from "@/lib/seo";
import { privacyContent } from "@/content/pages/expos-careers-privacy";

export const metadata: Metadata = buildMetadata({
  title: privacyContent.ar.title,
  description: privacyContent.ar.description,
  path: "/privacy-policy",
  locale: "ar",
});

export default function ArabicPrivacyPolicyPage() {
  return <PrivacyPolicyView lang="ar" />;
}
