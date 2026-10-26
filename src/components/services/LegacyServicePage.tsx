import type { Metadata } from "next";
import Image from "next/image";
import {
  BackToService,
  ConsultationCta,
  SubServiceHero,
  getParentService,
  leadClass,
  subServiceJsonLd,
} from "@/components/services/shared";
import Reveal from "@/components/ui/Reveal";
import { localizeDigits, type Locale } from "@/i18n/config";
import { localizeLegacyServicePage } from "@/lib/ar/localized-sub-services";
import type { LegacyServiceImage, LegacyServicePage as LegacyServicePageData } from "@/lib/legacy-service-pages";
import { buildMetadata, jsonLdScript } from "@/lib/seo";

export function legacyServiceMetadata(basePage: LegacyServicePageData, lang: Locale = "en"): Metadata {
  const page = localizeLegacyServicePage(basePage, lang);
  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: page.path,
    keywords: page.keywords,
    ogImage: page.introImage.src,
    locale: lang,
  });
}

const aspectClass: Record<NonNullable<LegacyServiceImage["aspect"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[.8]",
};

function videoType(src: string) {
  return src.endsWith(".webm") ? "video/webm" : "video/mp4";
}

function SectionVideo({ image }: { image: LegacyServiceImage }) {
  return (
    <video autoPlay muted loop playsInline preload="metadata" poster={image.src} title={image.alt} aria-label={image.alt} className="absolute inset-0 h-full w-full object-cover">
      <source src={image.video} type={videoType(image.video ?? "")} />
    </video>
  );
}

/** Old WordPress service pages kept at their original URLs, laid out like the architectural sub-service pages. */
export default function LegacyServicePage({ page: basePage, lang = "en" }: { page: LegacyServicePageData; lang?: Locale }) {
  const page = localizeLegacyServicePage(basePage, lang);
  const parent = getParentService(page.parentSlug, lang);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          subServiceJsonLd({ lang, path: page.path, title: page.title, description: page.seoDescription, parentSlug: page.parentSlug }),
        )}
      />

      <SubServiceHero
        lang={lang}
        parentSlug={page.parentSlug}
        title={page.title}
        tagline={page.tagline}
        legacy
        media={
          page.hero.type === "video" ? (
            <video autoPlay muted loop playsInline preload="metadata" poster={page.hero.poster} className="absolute inset-0 h-full w-full object-cover" aria-hidden="true">
              <source src={page.hero.src} type={videoType(page.hero.src)} />
            </video>
          ) : (
            <Image src={page.hero.src} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
          )
        }
      />

      <section className="container-page grid gap-10 py-16 md:grid-cols-2 md:items-center md:gap-16 md:py-28">
        <Reveal>
          <div className="relative aspect-[1.1] overflow-hidden bg-ink/5">
            {page.introImage.video ? (
              <SectionVideo image={page.introImage} />
            ) : (
              <Image src={page.introImage.src} alt={page.introImage.alt} fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            )}
          </div>
        </Reveal>
        <div>
          <Reveal><p className="eyebrow text-muted">/ {page.title}</p></Reveal>
          {page.intro.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.05 + index * 0.05}>
              <p className={index === 0 ? leadClass(lang, { legacy: true }) : "section-body mt-6 max-w-xl text-lg"}>{paragraph}</p>
            </Reveal>
          ))}
          {page.introList && (
            <Reveal delay={0.15}>
              <ul className="mt-6 max-w-xl border-b border-line">
                {page.introList.map((item) => <li key={item} className="section-body border-t border-line py-3 text-sm">{item}</li>)}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      {page.sections.map((section, index) => (
        <section key={section.heading} className="container-page grid gap-10 border-t border-line py-16 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] md:gap-16 md:py-24">
          <Reveal>
            <div className="grid grid-cols-[4rem_1fr] gap-3">
              <p className="text-4xl font-light text-accent/40">{localizeDigits(String(index + 1).padStart(2, "0"), lang)}</p>
              <h2 className={lang === "ar" ? "text-2xl font-medium leading-snug md:text-3xl" : "text-2xl font-medium leading-tight tracking-[-.035em] md:text-3xl"}>{section.heading}</h2>
            </div>
          </Reveal>
          <div>
            {section.body?.map((paragraph) => (
              <Reveal key={paragraph}><p className="section-body mb-6 max-w-2xl text-lg">{paragraph}</p></Reveal>
            ))}
            {section.lists?.map((list, listIndex) => (
              <Reveal key={list.label ?? listIndex} delay={listIndex * 0.04}>
                <div className="mb-8">
                  {list.label && <h3 className="eyebrow mb-3 text-muted">{list.label}</h3>}
                  <ul className="grid border-b border-line sm:grid-cols-2 sm:gap-x-8">
                    {list.items.map((item) => <li key={item} className="section-body border-t border-line py-3 text-sm">{item}</li>)}
                  </ul>
                </div>
              </Reveal>
            ))}
            {section.after?.map((paragraph) => (
              <Reveal key={paragraph}><p className="section-body mb-4 max-w-2xl">{paragraph}</p></Reveal>
            ))}
          </div>
          {section.images && (
            <div className={`grid gap-3 md:col-span-2 ${section.images.length === 1 ? "" : section.images.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {section.images.map((image, imageIndex) => (
                <Reveal key={image.src} delay={imageIndex * 0.05}>
                  <figure className={section.images?.length === 1 && image.aspect === "square" ? "max-w-md" : ""}>
                    <div className={`relative overflow-hidden bg-ink/5 ${aspectClass[image.aspect ?? "video"]}`}>
                      {image.video ? (
                        <SectionVideo image={image} />
                      ) : (
                        <Image src={image.src} alt={image.alt} title={image.alt} fill unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                      )}
                    </div>
                  </figure>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      ))}

      <ConsultationCta lang={lang} heading={page.cta.heading} body={page.cta.body} bordered />

      <BackToService
        lang={lang}
        parentSlug={page.parentSlug}
        background={
          parent.heroType === "video" ? (
            <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-30" aria-hidden="true">
              <source src={parent.hero} type={videoType(parent.hero)} />
            </video>
          ) : undefined
        }
      />
    </article>
  );
}
