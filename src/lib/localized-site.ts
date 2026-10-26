import {
  faqs,
  offices,
  portfolioIntro,
  projectsIntro,
  siteConfig,
  stats,
  taglines,
  type Project,
  type Service,
} from "./site-config";
import { siteConfigAr } from "./ar/site-config.ar";
import { localizeDigits, type Locale } from "@/i18n/config";

/**
 * Locale-aware views of the seed data in site-config.ts.
 *
 * English returns the data untouched. Arabic merges the overlay in
 * `lib/ar/site-config.ar.ts` over it by slug, so Sanity projects/services
 * (which are English only) still pick up Arabic copy, and anything without an
 * overlay entry falls back to English. Only human-readable text goes through
 * `localizeDigits`; slugs, image paths and years are never touched.
 */

const d = (value: string, lang: Locale) => localizeDigits(value, lang);

export function localizeProjects(list: Project[], lang: Locale): Project[] {
  if (lang !== "ar") return list;
  return list.map((project) => {
    const ar = (siteConfigAr.projects as Record<string, { title: string; category: string; summary: string; location: string }>)[
      project.slug
    ];
    if (!ar) return project;
    return {
      ...project,
      title: d(ar.title, lang),
      category: d(ar.category, lang),
      summary: d(ar.summary, lang),
      location: d(ar.location, lang),
    };
  });
}

export function localizeProject(project: Project, lang: Locale): Project {
  return localizeProjects([project], lang)[0];
}

export function localizeServices(list: Service[], lang: Locale): Service[] {
  if (lang !== "ar") return list;
  return list.map((service) => {
    const ar = (siteConfigAr.services as Record<string, { title: string; short: string; description: string }>)[service.slug];
    if (!ar) return service;
    return { ...service, title: d(ar.title, lang), short: d(ar.short, lang), description: d(ar.description, lang) };
  });
}

export function localizeService(service: Service, lang: Locale): Service {
  return localizeServices([service], lang)[0];
}

export function localizedFaqs(lang: Locale): { question: string; answer: string }[] {
  if (lang !== "ar") return faqs.map((faq) => ({ ...faq }));
  return siteConfigAr.faqs.map((faq) => ({ question: d(faq.question, lang), answer: d(faq.answer, lang) }));
}

export function localizedStats(lang: Locale): { value: string; label: string }[] {
  if (lang !== "ar") return stats.map((stat) => ({ ...stat }));
  return stats.map((stat, index) => ({ value: stat.value, label: siteConfigAr.stats[index] ?? stat.label }));
}

export function localizedTaglines(lang: Locale): string[] {
  return lang === "ar" ? [...siteConfigAr.taglines] : [...taglines];
}

export function localizedPortfolioIntro(lang: Locale): string {
  return lang === "ar" ? siteConfigAr.portfolioIntro : portfolioIntro;
}

export function localizedProjectsIntro(lang: Locale): string {
  return lang === "ar" ? siteConfigAr.projectsIntro : projectsIntro;
}

/** Site title, description and keywords for the home page and root metadata. */
export function localizedSiteMeta(lang: Locale) {
  if (lang === "ar") {
    return {
      title: siteConfigAr.title,
      description: siteConfigAr.description,
      keywords: [...siteConfigAr.keywords],
    };
  }
  return {
    title: siteConfig.title as string,
    description: siteConfig.description as string,
    keywords: ["architecture firm", "3D rendering", "3D rendering services", "architectural visualization", "real estate marketing"],
  };
}

/** Offices with the city and address lines in the page language. */
export function localizedOffices(lang: Locale) {
  if (lang !== "ar") return offices.map((office) => ({ ...office, lines: [...office.lines] as string[] }));
  const byCity = siteConfigAr.offices as Record<string, { city: string; country: string; lines: readonly string[] }>;
  return offices.map((office) => {
    const ar = byCity[office.city.toLowerCase()];
    return ar
      ? { ...office, city: ar.city, lines: ar.lines.map((line) => d(line, lang)) }
      : { ...office, lines: [...office.lines] as string[] };
  });
}
