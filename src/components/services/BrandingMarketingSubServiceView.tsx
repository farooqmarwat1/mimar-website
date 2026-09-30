import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FaqSection from "@/components/sections/FaqSection";
import Reveal from "@/components/ui/Reveal";
import {
  brandingMarketingSubServicePath,
  brandingMarketingSubServices,
  type BrandingMarketingParent,
  type BrandingMarketingSubService,
} from "@/lib/branding-marketing-sub-services";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from "@/lib/seo";
import { serviceDetails, servicePath } from "@/lib/service-details";
import { siteConfig } from "@/lib/site-config";

export function brandingMarketingStaticParams(parent: BrandingMarketingParent) {
  return Object.keys(brandingMarketingSubServices[parent]).map((slug) => ({ slug }));
}

export function brandingMarketingMetadata(parent: BrandingMarketingParent, slug: string): Metadata {
  const service = brandingMarketingSubServices[parent][slug];
  if (!service) return {};
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: brandingMarketingSubServicePath(parent, slug) });
}

/** Same layout as the architectural-design sub-pages, with a portfolio gallery and FAQs in place of featured projects. */
export default function BrandingMarketingSubServiceView({ service }: { service: BrandingMarketingSubService }) {
  const parent = serviceDetails[service.parent];
  const path = brandingMarketingSubServicePath(service.parent, service.slug);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: parent.title, path: servicePath(parent.slug) },
            { name: service.title, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${siteConfig.url}${path}#service`,
            name: service.title,
            description: service.seoDescription,
            url: `${siteConfig.url}${path}`,
            provider: { "@id": `${siteConfig.url}/#organization` },
            areaServed: "Worldwide",
            serviceType: parent.title,
          },
        ])}
      />

      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        <Image src={service.hero} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
          <Reveal>
            <p className="eyebrow mb-8 text-paper/65">
              <Link href={servicePath(parent.slug)} className="hover:text-accent">/ {parent.title}</Link> / Services
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-5xl break-words text-[clamp(3rem,10vw,7rem)] font-medium uppercase leading-[.82] tracking-[-.065em]">{service.title}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{service.tagline}</p>
          </Reveal>
          <Reveal delay={0.15}><Link href="/contact" className="button-pill mt-10 text-paper">Request a quote</Link></Reveal>
        </div>
      </section>

      <section className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
        <Reveal>
          <div className="relative aspect-[1.1] overflow-hidden bg-ink/5">
            <Image src={service.introImage} alt={`${service.title} by Mimar Studios`} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </Reveal>
        <div>
          <Reveal><p className="eyebrow text-muted">/ {service.title}</p></Reveal>
          {service.intro.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.05 + index * 0.05}>
              <p className={index === 0 ? "mt-8 text-2xl leading-[1.15] tracking-[-.03em] md:text-4xl" : "section-body mt-6 max-w-xl text-lg"}>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {service.gallery.length > 0 && (
        <section className="container-page pb-16 md:pb-28" aria-labelledby="portfolio-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="portfolio-heading" className="eyebrow text-muted">/ Selected work</h2>
            <p className="eyebrow text-accent">{service.title}</p>
          </div>
          <div className={`grid gap-3 ${service.gallery.length === 1 ? "max-w-xl" : "grid-cols-2 md:grid-cols-3"}`}>
            {service.gallery.map((image, index) => (
              <Reveal key={image.src} delay={(index % 3) * 0.05}>
                <div className="relative aspect-square overflow-hidden bg-ink/5">
                  <Image src={image.src} alt={image.alt} fill unoptimized sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-105" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-page grid gap-10 border-t border-line py-16 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-16 md:py-28">
        <Reveal>
          <h2 className="eyebrow text-muted">/ Our process</h2>
        </Reveal>
        <div>
          {service.process.map(({ step, items }, index) => (
            <Reveal key={step} delay={index * 0.05}>
              <div className="grid grid-cols-[4rem_1fr] gap-3 border-t border-line py-7">
                <p className="text-4xl font-light text-accent/40">{String(index + 1).padStart(2, "0")}</p>
                <div>
                  <h3 className="text-lg">{step}</h3>
                  <p className="section-body mt-3 max-w-xl text-sm">{items}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-16 text-paper md:py-24" aria-labelledby="benefits-heading">
        <Image src={service.benefitsImage} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-25" />
        <div className="container-page relative">
          <h2 id="benefits-heading" className="eyebrow mb-10 text-paper/55">/ Benefits</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {service.benefits.map(([title, description], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <div className="border-t border-paper/25 pt-5">
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/70">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FaqSection items={service.faqs} />

      <section className="section-py border-t border-line">
        <div className="container-page mx-auto max-w-3xl text-center">
          <Reveal><h2 className="eyebrow text-muted">/ Get a free consultation</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-heading mx-auto mt-6">
              {service.cta.heading[0]}
              <br />
              <span className="text-accent">{service.cta.heading[1]}</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}><p className="section-body mx-auto mt-6 max-w-md">{service.cta.body}</p></Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/booking" className="button-pill text-ink">Get a free consultation</Link>
              <Link href="/contact" className="button-pill text-ink">Contact us</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Link href={servicePath(parent.slug)} className="group relative block min-h-[16rem] overflow-hidden bg-ink text-paper md:min-h-[20rem]">
        <Image src={parent.hero} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="container-page relative flex min-h-[16rem] flex-col justify-center md:min-h-[20rem]">
          <p className="eyebrow mb-8 text-paper/55">/ Back to service</p>
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-.05em]">{parent.title}</h2>
        </div>
      </Link>
    </article>
  );
}
