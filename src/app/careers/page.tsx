import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { contact } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Careers | Mimar Studios",
  description:
    "Join Mimar Studios - a multidisciplinary team of architects, visualizers and designers working on projects across 14+ countries.",
  path: "/careers",
  keywords: ["Mimar Studios careers", "architecture jobs Islamabad", "3D visualization jobs"],
});

const values = [
  ["Craft first", "Every render, animation and drawing carries the studio's name. We'd rather do fewer projects well than many projects fast."],
  ["Learn on real work", "Team members from Pakistan, Turkey and Egypt work side by side on live client projects, not internal exercises."],
  ["Ownership", "Small project teams mean your work is visible - from first concept to what the client actually sees."],
];

export default function CareersPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }]),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Careers</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="page-heading max-w-3xl">
            Build the studio <span className="text-accent">alongside us.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-2xl">
            Mimar Studios is a multidisciplinary team of architects, 3D artists, animators and designers based in
            Islamabad, working with clients across 14+ countries. We hire in waves as project load demands rather
            than keeping a running list open - the fastest way to be considered is to reach out directly with your
            portfolio.
          </p>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {values.map(([title, body], index) => (
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
            No open roles are posted here right now. If you&apos;d like to be considered when a position opens, send your
            portfolio and CV to <a href={`mailto:${contact.email}`} className="text-accent hover:underline">{contact.email}</a>.
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <Link href="/contact" className="button-pill mt-8 text-ink">Get in touch</Link>
        </Reveal>
      </div>
    </div>
  );
}
