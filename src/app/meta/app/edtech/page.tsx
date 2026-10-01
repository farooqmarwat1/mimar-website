import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactCta from "@/components/sections/ContactCta";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

// Restored from the old /meta/app/edtech page: two web AR science
// experiences. The old site linked each one to its own page
// (/magnetic-field-of-solenoid, /galvanic-cell) that only embedded the
// MyWebAR project, so the cards open those projects directly.
export const metadata: Metadata = buildMetadata({
  title: "EdTech - mimAR",
  description: "Click to Scan",
  path: "/meta/app/edtech",
  ogImage: "/edtech/naqi-ejaz.webp",
});

const experiences = [
  {
    title: "Magnetic Field of Solenoid",
    icon: "/edtech/magnetic-field-of-solenoid-icon.svg",
    href: "https://mywebar.com/p/Project_4_h3xjhfscnb",
  },
  {
    title: "Galvanic Cell",
    icon: "/edtech/galvanic-cell-icon.svg",
    href: "https://mywebar.com/p/Project_4_tvdsxbiaob",
  },
] as const;

export default function EdTechPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "XR Digital Services", path: "/meta" },
          { name: "EdTech", path: "/meta/app/edtech" },
        ]))}
      />

      <section className="container-page grid gap-12 pb-20 pt-32 md:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] md:items-end md:gap-16 md:pb-28 md:pt-44">
        <div>
          <p className="eyebrow text-accent">
            <Link href="/meta" className="hover:text-ink">/ XR Digital Services</Link> / App
          </p>
          <h1 className="index-heading mt-8">
            Ed<span className="text-accent">Tech</span>
          </h1>
          <p className="section-body mt-8 max-w-xl text-lg">
            Science lessons in augmented reality. Scan an experience with your phone and explore it in 3D.
          </p>
          <Link href="#experiences" className="button-pill mt-10 text-ink">Click to Scan</Link>
        </div>
        <figure className="max-w-md md:justify-self-end">
          <div className="relative aspect-square overflow-hidden bg-ink">
            <Image src="/edtech/naqi-ejaz.webp" alt="Naqi Ejaz, Mimar Studios" fill priority sizes="(max-width: 768px) 100vw, 28rem" className="object-cover" />
          </div>
          <a href="https://www.linkedin.com/in/naqiejaz/" target="_blank" rel="noopener noreferrer" className="eyebrow mt-5 inline-block border-b border-ink pb-2 transition-colors hover:border-accent hover:text-accent">
            Naqi Ejaz on LinkedIn ↗
          </a>
        </figure>
      </section>

      <section id="experiences" className="border-t border-line">
        <div className="container-page py-20 md:py-28">
          <p className="eyebrow text-muted">/ Experiences</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {experiences.map((experience, index) => (
              <a
                key={experience.title}
                href={experience.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[20rem] flex-col justify-between border border-line p-8 transition-colors hover:border-accent md:p-10"
              >
                <div className="flex items-start justify-between gap-6">
                  <p className="eyebrow text-accent">Experience # {index + 1}</p>
                  <Image src={experience.icon} alt="" width={96} height={104} unoptimized className="h-24 w-auto" />
                </div>
                <h2 className="mt-12 text-3xl font-medium uppercase tracking-[-.035em] transition-colors group-hover:text-accent md:text-4xl">
                  {experience.title} ↗
                </h2>
              </a>
            ))}
          </div>
          <Image src="/edtech/mimar-lab-logo.webp" alt="Mimar Studios lab logo" width={303} height={182} className="mt-16 h-20 w-auto" />
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
