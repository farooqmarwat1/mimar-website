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
import DriveVideo from "@/components/ui/DriveVideo";
import MediaSlider from "@/components/ui/MediaSlider";
import Reveal from "@/components/ui/Reveal";
import { isRtl, localeHref, type Locale } from "@/i18n/config";
import { localizeThreeDSubService } from "@/lib/ar/localized-sub-services";
import { byMimar, getServiceUi } from "@/lib/ar/service-ui";
import { localizeProject } from "@/lib/localized-site";
import { buildMetadata, jsonLdScript } from "@/lib/seo";
import { projects } from "@/lib/site-config";
import {
  threeDVisualizationSlug,
  threeDVisualizationSubServicePath,
  threeDVisualizationSubServices,
  type ThreeDVisualizationSubService,
} from "@/lib/three-d-visualization-sub-services";

export function threeDVisualizationSubServiceMetadata(slug: string, lang: Locale = "en"): Metadata {
  const base = threeDVisualizationSubServices[slug];
  if (!base) return {};
  const service = localizeThreeDSubService(base, lang);
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: threeDVisualizationSubServicePath(slug), locale: lang });
}

/** /services/3d-visualization/{slug}, in English (root) or Arabic (/ar). */
export default function ThreeDVisualizationSubServiceView({ service: baseService, lang = "en" }: { service: ThreeDVisualizationSubService; lang?: Locale }) {
  const service = localizeThreeDSubService(baseService, lang);
  const ui = getServiceUi(lang);
  const rtl = isRtl(lang);
  const path = threeDVisualizationSubServicePath(service.slug);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          subServiceJsonLd({ lang, path, title: service.title, description: service.seoDescription, parentSlug: threeDVisualizationSlug }),
        )}
      />

      <SubServiceHero
        lang={lang}
        parentSlug={threeDVisualizationSlug}
        title={service.title}
        tagline={service.tagline}
        media={<Image src={service.hero} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />}
      />

      {service.sections.map((section, sectionIndex) => {
        const sectionProjects = section.projects
          .map((projectSlug) => projects.find((project) => project.slug === projectSlug))
          .filter((project) => project !== undefined)
          .map((project) => localizeProject(project, lang));
        const slides = section.slides;
        return (
          <section key={section.heading} className={`container-page py-16 md:py-28 ${sectionIndex > 0 ? "border-t border-line" : ""}`}>
            <div className={slides?.length ? "grid gap-10 md:grid-cols-2 md:items-center md:gap-16" : ""}>
              {slides && slides.length > 0 && (
                <Reveal>
                  <MediaSlider slides={slides} title={section.heading} lang={lang} />
                </Reveal>
              )}
              <div>
                <Reveal><p className="eyebrow text-muted">/ {section.heading}</p></Reveal>
                <div className="mt-8">
                  {section.body.map((paragraph, index) => (
                    <Reveal key={paragraph} delay={0.05 + index * 0.05}>
                      <p className={index === 0 ? leadClass(lang, { gap: false }) : "section-body mt-6 text-lg"}>{paragraph}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
            {sectionProjects.length > 0 && (
              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sectionProjects.map((project, index) => (
                  <Reveal key={project.slug} delay={(index % 3) * 0.05}>
                    <Link href={localeHref(lang, `/projects/${project.slug}`)} className="group relative block aspect-video overflow-hidden bg-ink/5">
                      <Image src={project.cover} alt={byMimar(project.title, lang)} fill quality={85} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
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
            )}
          </section>
        );
      })}

      {service.media && (
        <section className="container-page border-t border-line py-16 md:py-28" aria-labelledby="showreels-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="showreels-heading" className="eyebrow text-muted">{`/ ${ui.showreels}`}</h2>
            <p className="eyebrow text-accent">{service.title}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {service.media.map((media, index) => (
              <Reveal key={media.src} delay={index * 0.05}>
                <div className="relative aspect-video overflow-hidden bg-ink text-paper">
                  <DriveVideo src={media.src} title={media.title} poster={media.poster} lang={lang} />
                </div>
                <p className="mt-3 text-sm text-muted">{media.title}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

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

      <BackToService lang={lang} parentSlug={threeDVisualizationSlug} />
    </article>
  );
}
