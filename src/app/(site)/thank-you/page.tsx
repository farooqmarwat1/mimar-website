import type { Metadata } from "next";
import ThankYouView from "@/components/pages/ThankYouView";

// Standalone confirmation page preserved from the old site for anyone who
// still has it bookmarked/linked. The current contact form shows its
// success state inline rather than navigating here, so this is intentionally
// noindexed rather than promoted anywhere in navigation.
export const metadata: Metadata = {
  title: "Thank You | Mimar Studios",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return <ThankYouView />;
}
