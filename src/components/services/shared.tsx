import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { getServiceUi, localizedServiceTitle } from "@/lib/ar/service-ui";
import { breadcrumbJsonLd } from "@/lib/seo";
import { serviceDetails, servicePath } from "@/lib/service-details";
import { siteConfig } from "@/lib/site-config";

/**
 * Pieces shared by the service sub-page views (architectural design, 3D
 * visualization, branding, marketing and the legacy standalone pages). For
 * `lang="en"` they render exactly the markup the English pages always had;
 * Arabic swaps copy and a few typography classes (Arabic needs real line
 * height and no negative tracking, uppercase is meaningless).
 */

/** The main service a sub-page sits under, with its title in the page language. */
export function getParentService(slug: string, lang: Locale) {
  const parent = serviceDetails[slug];
  return { ...parent, title: localizedServiceTitle(slug, parent.title, lang) };
}

/** BreadcrumbList + Service JSON-LD for a sub-page. `path` is the English path. */
export function subServiceJsonLd({
  lang,
  path,
  title,
  description,
  parentSlug,
}: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
  parentSlug: string;
}) {
  const ui = getServiceUi(lang);
  const parent = getParentService(parentSlug, lang);
  const localPath = localeHref(lang, path);
  return [
    breadcrumbJsonLd([
      { name: ui.home, path: localeHref(lang, "/") },
      { name: ui.services, path: localeHref(lang, "/services") },
      { name: parent.title, path: localeHref(lang, servicePath(parentSlug)) },
      { name: title, path: localPath },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${siteConfig.url}${localPath}#service`,
      name: title,
      description,
      url: `${siteConfig.url}${localPath}`,
      provider: { "@id": `${siteConfig.url}/#organization` },
      areaServed: "Worldwide",
      serviceType: parent.title,
      ...(lang === "ar" ? { inLanguage: "ar" } : {}),
    },
  ];
}

const isAr = (lang: Locale) => lang === "ar";

/** Hero H1 classes. `legacy` is the slightly smaller heading the standalone pages use. */
export function h1Class(lang: Locale, legacy = false) {
  if (isAr(lang)) {
    return legacy
      ? "max-w-5xl break-words text-[clamp(2.25rem,7vw,5rem)] font-medium leading-[1.2]"
      : "max-w-5xl break-words text-[clamp(2.5rem,8vw,5.5rem)] font-medium leading-[1.2]";
  }
  return legacy
    ? "max-w-5xl break-words text-[clamp(2.75rem,8vw,6.5rem)] font-medium uppercase leading-[.86] tracking-[-.06em]"
    : "max-w-5xl break-words text-[clamp(3rem,10vw,7rem)] font-medium uppercase leading-[.82] tracking-[-.065em]";
}

/** Large first paragraph next to the intro image. `gap` adds the top margin the intro blocks use. */
export function leadClass(lang: Locale, { gap = true, legacy = false }: { gap?: boolean; legacy?: boolean } = {}) {
  const top = gap ? "mt-8 " : "";
  if (isAr(lang)) return `${top}${legacy ? "text-xl leading-[1.55] md:text-2xl" : "text-2xl leading-[1.5] md:text-3xl"}`;
  return `${top}${legacy ? "text-2xl leading-[1.15] tracking-[-.03em] md:text-3xl" : "text-2xl leading-[1.15] tracking-[-.03em] md:text-4xl"}`;
}

export function SubServiceHero({
  lang,
  parentSlug,
  title,
  tagline,
  media,
  legacy = false,
}: {
  lang: Locale;
  parentSlug: string;
  title: string;
  tagline: string;
  media: ReactNode;
  legacy?: boolean;
}) {
  const ui = getServiceUi(lang);
  const parent = getParentService(parentSlug, lang);
  return (
    <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
      {media}
      <div className="absolute inset-0 bg-black/45" />
      <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
        <Reveal>
          <p className="eyebrow mb-8 text-paper/65">
            <Link href={localeHref(lang, servicePath(parent.slug))} className="hover:text-accent">/ {parent.title}</Link>
            {` / ${ui.services}`}
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className={h1Class(lang, legacy)}>{title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{tagline}</p>
        </Reveal>
        <Reveal delay={0.15}><Link href={localeHref(lang, "/contact")} className="button-pill mt-10 text-paper">{ui.requestQuote}</Link></Reveal>
      </div>
    </section>
  );
}

export function BenefitsSection({
  lang,
  benefits,
  image,
  columns,
}: {
  lang: Locale;
  benefits: readonly (readonly [string, string])[];
  image: string;
  columns: 3 | 4;
}) {
  const ui = getServiceUi(lang);
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-paper md:py-24" aria-labelledby="benefits-heading">
      <Image src={image} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-25" />
      <div className="container-page relative">
        <h2 id="benefits-heading" className="eyebrow mb-10 text-paper/55">{`/ ${ui.benefits}`}</h2>
        <div className={`grid gap-x-8 gap-y-10 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {benefits.map(([title, description], index) => (
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
  );
}

export function ConsultationCta({
  lang,
  eyebrow,
  heading,
  body,
  primaryLabel,
  primaryHref = "/booking",
  bordered,
}: {
  lang: Locale;
  /** Defaults to "Get a free consultation". */
  eyebrow?: string;
  heading: readonly [string, string];
  body: string;
  primaryLabel?: string;
  primaryHref?: string;
  /** The branding/marketing and legacy pages draw a top border; the architectural ones do not. */
  bordered: boolean;
}) {
  const ui = getServiceUi(lang);
  return (
    <section className={bordered ? "section-py border-t border-line" : "section-py"}>
      <div className="container-page mx-auto max-w-3xl text-center">
        <Reveal><h2 className="eyebrow text-muted">/ {eyebrow ?? ui.freeConsultation}</h2></Reveal>
        <Reveal delay={0.05}>
          <p className="section-heading mx-auto mt-6">
            {heading[0]}
            <br />
            <span className="text-accent">{heading[1]}</span>
          </p>
        </Reveal>
        <Reveal delay={0.1}><p className="section-body mx-auto mt-6 max-w-md">{body}</p></Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={localeHref(lang, primaryHref)} className="button-pill text-ink">{primaryLabel ?? ui.freeConsultation}</Link>
            <Link href={localeHref(lang, "/contact")} className="button-pill text-ink">{ui.contactUs}</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function BackToService({ lang, parentSlug, background }: { lang: Locale; parentSlug: string; background?: ReactNode }) {
  const ui = getServiceUi(lang);
  const parent = getParentService(parentSlug, lang);
  return (
    <Link href={localeHref(lang, servicePath(parent.slug))} className="group relative block min-h-[16rem] overflow-hidden bg-ink text-paper md:min-h-[20rem]">
      {background ?? <Image src={parent.hero} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.02]" />}
      <div className="absolute inset-0 bg-black/30" />
      <div className="container-page relative flex min-h-[16rem] flex-col justify-center md:min-h-[20rem]">
        <p className="eyebrow mb-8 text-paper/55">{`/ ${ui.backToService}`}</p>
        <h2 className={isAr(lang) ? "text-[clamp(2.5rem,5vw,5rem)] leading-[1.2]" : "text-[clamp(2.5rem,5vw,5rem)] tracking-[-.05em]"}>{parent.title}</h2>
      </div>
    </Link>
  );
}
