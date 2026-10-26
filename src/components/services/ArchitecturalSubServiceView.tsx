import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BackToService,
  BenefitsSection,
  ConsultationCta,
  SubServiceHero,
  leadClass,
  subServiceJsonLd,
} from "@/components/services/shared";
import Reveal from "@/components/ui/Reveal";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { localizeArchitecturalSubService } from "@/lib/ar/localized-sub-services";
import { byMimar, getServiceUi } from "@/lib/ar/service-ui";
import { architecturalDesignSlug, architecturalSubServicePath, architecturalSubServices, type ArchitecturalSubService } from "@/lib/architectural-sub-services";
import { localizeProject } from "@/lib/localized-site";
import { jsonLdScript, buildMetadata } from "@/lib/seo";
import { projects } from "@/lib/site-config";

export function architecturalSubServiceMetadata(slug: string, lang: Locale = "en"): Metadata {
  const base = architecturalSubServices[slug];
  if (!base) return {};
  const service = localizeArchitecturalSubService(base, lang);
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: architecturalSubServicePath(slug), locale: lang });
}

/** /services/architectural-design/{slug}, in English (root) or Arabic (/ar). */
export default function ArchitecturalSubServiceView({ service: baseService, lang = "en" }: { service: ArchitecturalSubService; lang?: Locale }) {
  const service = localizeArchitecturalSubService(baseService, lang);
  const ui = getServiceUi(lang);
  const rtl = isRtl(lang);
  const path = architecturalSubServicePath(service.slug);
  const featuredProjects = (service.featuredProjects ?? [])
    .map((projectSlug) => projects.find((project) => project.slug === projectSlug))
    .filter((project) => project !== undefined)
    .map((project) => localizeProject(project, lang));

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          subServiceJsonLd({ lang, path, title: service.title, description: service.seoDescription, parentSlug: architecturalDesignSlug }),
        )}
      />

      <SubServiceHero
        lang={lang}
        parentSlug={architecturalDesignSlug}
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

      {featuredProjects.length > 0 && (
        <section className="container-page pb-16 md:pb-28" aria-labelledby="featured-projects-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="featured-projects-heading" className="eyebrow text-muted">{`/ ${ui.featuredProjects}`}</h2>
            <p className="eyebrow text-accent">{service.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.slug} delay={(index % 3) * 0.05}>
                <Link href={localeHref(lang, `/projects/${project.slug}`)} className="group relative block aspect-video overflow-hidden bg-ink/5">
                  <Image src={project.cover} alt={byMimar(project.title, lang)} fill quality={85} sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 text-paper">
                    <h3 className="flex items-end justify-between gap-3 text-sm md:text-base">
                      <span>{project.title}</span>
                      <span aria-hidden="true" className={`text-accent transition-transform ${rtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>{rtl ? "↖" : "↗"}</span>
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="container-page grid gap-10 border-t border-line py-16 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-16 md:py-28">
        <Reveal>
          <h2 className="eyebrow text-muted">{`/ ${ui.designProcess}`}</h2>
        </Reveal>
        <div>
          {service.process.map(({ step, items }, index) => (
            <Reveal key={step} delay={index * 0.05}>
              <div className="grid grid-cols-[4rem_1fr] gap-3 border-t border-line py-7">
                <p className="text-4xl font-light text-accent/40">{localizeDigits(String(index + 1).padStart(2, "0"), lang)}</p>
                <div>
                  <h3 className="text-lg">{step}</h3>
                  {Array.isArray(items) ? (
                    <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                      {items.map((item) => <li key={item} className="section-body text-sm">{item}</li>)}
                    </ul>
                  ) : (
                    <p className="section-body mt-3 max-w-xl text-sm">{items}</p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <BenefitsSection lang={lang} benefits={service.benefits} image={service.benefitsImage} columns={4} />

      <ConsultationCta
        lang={lang}
        eyebrow={service.ctaEyebrow}
        heading={service.cta.heading}
        body={service.cta.body}
        primaryLabel={service.cta.primaryLabel}
        primaryHref={service.cta.primaryHref}
        bordered={false}
      />

      <BackToService lang={lang} parentSlug={architecturalDesignSlug} />
    </article>
  );
}
