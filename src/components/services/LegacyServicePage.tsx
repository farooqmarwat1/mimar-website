import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { LegacyServiceImage, LegacyServicePage as LegacyServicePageData } from "@/lib/legacy-service-pages";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from "@/lib/seo";
import { serviceDetails, servicePath } from "@/lib/service-details";
import { siteConfig } from "@/lib/site-config";

export function legacyServiceMetadata(page: LegacyServicePageData): Metadata {
  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: page.path,
    keywords: page.keywords,
    ogImage: page.introImage.src,
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
export default function LegacyServicePage({ page }: { page: LegacyServicePageData }) {
  const parent = serviceDetails[page.parentSlug];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: parent.title, path: servicePath(parent.slug) },
            { name: page.title, path: page.path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${siteConfig.url}${page.path}#service`,
            name: page.title,
            description: page.seoDescription,
            url: `${siteConfig.url}${page.path}`,
            provider: { "@id": `${siteConfig.url}/#organization` },
            areaServed: "Worldwide",
            serviceType: parent.title,
          },
        ])}
      />

      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        {page.hero.type === "video" ? (
          <video autoPlay muted loop playsInline preload="metadata" poster={page.hero.poster} className="absolute inset-0 h-full w-full object-cover" aria-hidden="true">
            <source src={page.hero.src} type={videoType(page.hero.src)} />
          </video>
        ) : (
          <Image src={page.hero.src} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
          <Reveal>
            <p className="eyebrow mb-8 text-paper/65">
              <Link href={servicePath(parent.slug)} className="hover:text-accent">/ {parent.title}</Link> / Services
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-5xl break-words text-[clamp(2.75rem,8vw,6.5rem)] font-medium uppercase leading-[.86] tracking-[-.06em]">{page.title}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{page.tagline}</p>
          </Reveal>
          <Reveal delay={0.15}><Link href="/contact" className="button-pill mt-10 text-paper">Request a quote</Link></Reveal>
        </div>
      </section>

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
              <p className={index === 0 ? "mt-8 text-2xl leading-[1.15] tracking-[-.03em] md:text-3xl" : "section-body mt-6 max-w-xl text-lg"}>{paragraph}</p>
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
              <p className="text-4xl font-light text-accent/40">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="text-2xl font-medium leading-tight tracking-[-.035em] md:text-3xl">{section.heading}</h2>
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

      <section className="section-py border-t border-line">
        <div className="container-page mx-auto max-w-3xl text-center">
          <Reveal><h2 className="eyebrow text-muted">/ Get a free consultation</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-heading mx-auto mt-6">
              {page.cta.heading[0]}
              <br />
              <span className="text-accent">{page.cta.heading[1]}</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}><p className="section-body mx-auto mt-6 max-w-md">{page.cta.body}</p></Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/booking" className="button-pill text-ink">Get a free consultation</Link>
              <Link href="/contact" className="button-pill text-ink">Contact us</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Link href={servicePath(parent.slug)} className="group relative block min-h-[16rem] overflow-hidden bg-ink text-paper md:min-h-[20rem]">
        {parent.heroType === "video" ? (
          <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-30" aria-hidden="true">
            <source src={parent.hero} type={videoType(parent.hero)} />
          </video>
        ) : (
          <Image src={parent.hero} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.02]" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="container-page relative flex min-h-[16rem] flex-col justify-center md:min-h-[20rem]">
          <p className="eyebrow mb-8 text-paper/55">/ Back to service</p>
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-.05em]">{parent.title}</h2>
        </div>
      </Link>
    </article>
  );
}
