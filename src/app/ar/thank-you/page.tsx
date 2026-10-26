import type { Metadata } from "next";
import ThankYouView from "@/components/pages/ThankYouView";
import { thankYouContent } from "@/content/pages/contact";

// Confirmation page for the Arabic site: noindex, and no hreflang pair (it is not a landing page).
export const metadata: Metadata = {
  title: thankYouContent.ar.title,
  robots: { index: false, follow: true },
};

export default function ArabicThankYouPage() {
  return <ThankYouView lang="ar" />;
}
