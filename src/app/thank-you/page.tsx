import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

// Standalone confirmation page preserved from the old site for anyone who
// still has it bookmarked/linked. The current contact form shows its
// success state inline rather than navigating here, so this is intentionally
// noindexed rather than promoted anywhere in navigation.
export const metadata: Metadata = {
  title: "Thank You | Mimar Studios",
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <div className="flex min-h-[70svh] items-center py-24">
      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Thank you</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">
            We&apos;ve got it. <span className="text-accent">We&apos;ll be in touch shortly.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-xl">
            Thanks for reaching out to Mimar Studios. A member of the team will follow up on your enquiry soon.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href="/" className="button-pill mt-10 text-ink">Back to home</Link>
        </Reveal>
      </div>
    </div>
  );
}
