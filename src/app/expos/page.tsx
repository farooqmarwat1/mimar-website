import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Expos & Events | Mimar Studios",
  description:
    "Mimar Studios presents at real estate and architecture expos across Pakistan and the Gulf with interactive VR, AR and virtual tour experiences.",
  path: "/expos",
  keywords: ["real estate expo", "architecture exhibition", "VR real estate demo"],
});

const formats = [
  ["Live VR & AR demos", "Headset walkthroughs and interactive AR print pieces set up on the stand for attendees to try directly."],
  ["Dual-screen sales stations", "The same agent-console setup used in sales offices, running live for booth visitors."],
  ["Big-screen showreels", "Animation and rendering work looped for passing traffic, with the team on hand to talk through projects."],
];

export default function ExposPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Expos", path: "/expos" }]),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Expos</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">
            We show up <span className="text-accent">where buyers are.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-2xl">
            Beyond client deliverables, Mimar Studios takes its interactive tools - VR headsets, AR prints, dual-screen
            navigators - to real estate and property expos across Pakistan and the Gulf, on our own stand or alongside
            developer partners. Get in touch if you&apos;d like Mimar at your next launch or exhibition.
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {formats.map(([title, body], index) => (
          <Reveal key={title} delay={Math.min(index * 0.05, 0.15)}>
            <div className="motion-row grid gap-4 border-b border-line py-8 md:grid-cols-[14rem_1fr]">
              <p className="eyebrow text-muted">{title}</p>
              <p className="max-w-2xl text-lg leading-relaxed">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="container-page mt-16">
        <Reveal>
          <p className="section-body max-w-xl">
            Planning a launch event or exhibition stand and want an interactive experience on it? Tell us the dates
            and format and we&apos;ll put a package together.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <Link href="/contact" className="button-pill mt-8 text-ink">Get in touch</Link>
        </Reveal>
      </div>
    </div>
  );
}
