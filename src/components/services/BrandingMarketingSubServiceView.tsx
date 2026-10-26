import type { Metadata } from "next";
import Image from "next/image";
import {
  BackToService,
  BenefitsSection,
  ConsultationCta,
  SubServiceHero,
  leadClass,
  subServiceJsonLd,
} from "@/components/services/shared";
import FaqSection from "@/components/sections/FaqSection";
import Reveal from "@/components/ui/Reveal";
import { localizeDigits, type Locale } from "@/i18n/config";
import { localizeBrandingMarketingSubService } from "@/lib/ar/localized-sub-services";
import { byMimar, getServiceUi } from "@/lib/ar/service-ui";
import {
  brandingMarketingSubServicePath,
  brandingMarketingSubServices,
  type BrandingMarketingParent,
  type BrandingMarketingSubService,
} from "@/lib/branding-marketing-sub-services";
import { buildMetadata, jsonLdScript } from "@/lib/seo";

export function brandingMarketingStaticParams(parent: BrandingMarketingParent) {
  return Object.keys(brandingMarketingSubServices[parent]).map((slug) => ({ slug }));
}

export function brandingMarketingMetadata(parent: BrandingMarketingParent, slug: string, lang: Locale = "en"): Metadata {
  const base = brandingMarketingSubServices[parent][slug];
  if (!base) return {};
  const service = localizeBrandingMarketingSubService(base, lang);
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: brandingMarketingSubServicePath(parent, slug), locale: lang });
}

/** Same layout as the architectural-design sub-pages, with a portfolio gallery and FAQs in place of featured projects. */
export default function BrandingMarketingSubServiceView({ service: baseService, lang = "en" }: { service: BrandingMarketingSubService; lang?: Locale }) {
  const service = localizeBrandingMarketingSubService(baseService, lang);
  const ui = getServiceUi(lang);
  const path = brandingMarketingSubServicePath(service.parent, service.slug);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          subServiceJsonLd({ lang, path, title: service.title, description: service.seoDescription, parentSlug: service.parent }),
        )}
      />

      <SubServiceHero
        lang={lang}
        parentSlug={service.parent}
        title={service.title}
        tagline={service.tagline}
        media={<Image src={service.hero} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />}
      />

      <section className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
        <Reveal>
          <div className="relative aspect-[1.1] overflow-hidden bg-ink/5">
            <Image src={service.introImage} alt={byMimar(service.title, lang)} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </Reveal>
        <div>
          <Reveal><p className="eyebrow text-muted">/ {service.title}</p></Reveal>
          {service.intro.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.05 + index * 0.05}>
              <p className={index === 0 ? leadClass(lang) : "section-body mt-6 max-w-xl text-lg"}>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {service.gallery.length > 0 && (
        <section className="container-page pb-16 md:pb-28" aria-labelledby="portfolio-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="portfolio-heading" className="eyebrow text-muted">{`/ ${ui.selectedWork}`}</h2>
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
          <h2 className="eyebrow text-muted">{`/ ${ui.ourProcess}`}</h2>
        </Reveal>
        <div>
          {service.process.map(({ step, items }, index) => (
            <Reveal key={step} delay={index * 0.05}>
              <div className="grid grid-cols-[4rem_1fr] gap-3 border-t border-line py-7">
                <p className="text-4xl font-light text-accent/40">{localizeDigits(String(index + 1).padStart(2, "0"), lang)}</p>
                <div>
                  <h3 className="text-lg">{step}</h3>
                  <p className="section-body mt-3 max-w-xl text-sm">{items}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <BenefitsSection lang={lang} benefits={service.benefits} image={service.benefitsImage} columns={3} />

      <FaqSection items={service.faqs} lang={lang} />

      <ConsultationCta lang={lang} heading={service.cta.heading} body={service.cta.body} bordered />

      <BackToService lang={lang} parentSlug={service.parent} />
    </article>
  );
}
