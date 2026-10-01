import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

// The old page only embedded this Canva presentation and had no meta description.
export const metadata: Metadata = buildMetadata({
  title: "Visualization Proposal - mimAR",
  description: "View the Mimar Studios 3D visualization proposal and get a quote for your project.",
  path: "/visualization-proposal",
});

const proposalUrl = "https://www.canva.com/design/DAEuLkl6nlM/watch";

export default function VisualizationProposalPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Visualization Proposal", path: "/visualization-proposal" },
        ]))}
      />

      <section className="container-page pb-12 pt-32 md:pb-16 md:pt-44">
        <p className="eyebrow text-accent">/ Proposal</p>
        <h1 className="index-heading mt-8 max-w-6xl">
          Visualization <span className="text-accent">Proposal.</span>
        </h1>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <div className="relative aspect-video w-full overflow-hidden bg-ink/5">
          <iframe
            src={`${proposalUrl}?embed`}
            title="Mimar Studios visualization proposal"
            loading="lazy"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={proposalUrl} target="_blank" rel="noopener noreferrer" className="button-pill text-ink">Open the proposal ↗</a>
          <Link href="/contact" className="button-pill text-ink">Contact us</Link>
        </div>
      </section>
    </div>
  );
}
