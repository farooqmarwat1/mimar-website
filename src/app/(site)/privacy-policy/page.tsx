import type { Metadata } from "next";
import PrivacyPolicyView from "@/components/pages/PrivacyPolicyView";
import { buildMetadata } from "@/lib/seo";
import { privacyContent } from "@/content/pages/expos-careers-privacy";

// GENERIC STARTER - not reviewed by counsel (see the note in
// src/content/pages/expos-careers-privacy.ts). Mimar Studios must have a lawyer
// review and adapt it before it is treated as the real, binding policy.
export const metadata: Metadata = buildMetadata({
  title: privacyContent.en.title,
  description: privacyContent.en.description,
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyView />;
}
