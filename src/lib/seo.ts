import type { Metadata } from "next";
import { siteConfig, faqs as defaultFaqs } from "./site-config";
import { servicePath } from "./service-details";
import { localeHref, ogLocales, type Locale } from "@/i18n/config";

type BuildMetadataArgs = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
  /** Page language. `path` is always the English (root) path; Arabic pages live under /ar. */
  locale?: Locale;
  /**
   * Emit the en <-> ar hreflang pair. On by default; pass false for pages that
   * only exist in one language (Firestore jobs and posts).
   */
  hreflang?: boolean;
};

/** Absolute URL of a page in a given language: pageUrl("/services", "ar") -> https://mim.archi/ar/services */
export function pageUrl(path: string, locale: Locale = "en") {
  return new URL(localeHref(locale, path), siteConfig.url).toString();
}

/**
 * Standard per-page metadata builder. Every route should call this so
 * canonical URLs, Open Graph, Twitter cards, and robots directives stay
 * consistent - this is the layer that protects the SEO equity carried over
 * from the current WordPress site (same title/description conventions,
 * same OG image strategy).
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noIndex,
  keywords,
  locale = "en",
  hreflang = true,
}: BuildMetadataArgs): Metadata {
  const url = pageUrl(path, locale);
  const image = ogImage ?? siteConfig.ogImage;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      ...(hreflang && !noIndex
        ? { languages: { en: pageUrl(path, "en"), ar: pageUrl(path, "ar"), "x-default": pageUrl(path, "en") } }
        : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: locale === "ar" ? ogLocales.ar : siteConfig.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function articleJsonLd(article: {
  path: string;
  title: string;
  description: string;
  published: string;
  modified: string;
  keywords: string[];
  image?: string;
  locale?: Locale;
}) {
  const locale = article.locale ?? "en";
  const articlePath = localeHref(locale, article.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteConfig.url}${articlePath}#article`,
    headline: article.title,
    description: article.description,
    url: `${siteConfig.url}${articlePath}`,
    datePublished: article.published ? `${article.published.replace(" ", "T")}Z` : undefined,
    dateModified: article.modified ? `${article.modified.replace(" ", "T")}Z` : undefined,
    keywords: article.keywords.join(", ") || undefined,
    image: article.image,
    author: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}${articlePath}` },
    inLanguage: locale === "ar" ? "ar" : "en-US",
  };
}

const SCHEMA_EMPLOYMENT_TYPES: Record<string, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
  temporary: "TEMPORARY",
};

/**
 * JobPosting structured data for Google Jobs. Only render it for a role that is
 * genuinely open and unexpired (SEO_MIGRATION.md section 7); closed roles must not carry it.
 */
export function jobPostingJsonLd(job: {
  slug: string;
  title: string;
  location: string;
  country: string;
  workMode: string;
  employmentType: string;
  salary?: { min?: number; max?: number; currency: string; period: string };
  descriptionHtml: string;
  postedAt?: string;
  validThrough?: string;
  updatedAt: string;
}) {
  const url = `${siteConfig.url}/careers/${job.slug}`;
  const remote = job.workMode === "remote";
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "@id": `${url}#job`,
    url,
    title: job.title,
    description: job.descriptionHtml,
    datePosted: (job.postedAt ?? job.updatedAt).slice(0, 10),
    validThrough: job.validThrough ? `${job.validThrough}T23:59:59Z` : undefined,
    employmentType: SCHEMA_EMPLOYMENT_TYPES[job.employmentType],
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: "Mimar Studios",
      sameAs: siteConfig.url,
      logo: `${siteConfig.url}/logo.png`,
    },
    jobLocationType: remote ? "TELECOMMUTE" : undefined,
    applicantLocationRequirements: remote ? { "@type": "Country", name: job.country } : undefined,
    jobLocation: remote
      ? undefined
      : {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: job.country },
        },
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: job.salary.currency,
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salary.min,
            maxValue: job.salary.max,
            unitText: job.salary.period.toUpperCase(),
          },
        }
      : undefined,
  };
}

/**
 * Site-wide structured data rendered in <head> on every page, supplied
 * verbatim by the SEO team (Sep 2026). Replaces the earlier generated
 * Organization/WebSite blocks, so keep the #organization and #website @ids
 * unique - page-level schema (articles, services, projects) references them.
 */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://mim.archi/#organization",
      name: "Mimar Studios",
      url: "https://mim.archi",
      logo: "https://mim.archi/logo.png",
      email: "info@mim.archi",
      description:
        "Mimar Studios is an international architecture and 3D visualization studio offering 3D rendering, animation, VR tours, and digital property experiences.",
      // Social profiles, then the verified Google Business Profiles. Every link
      // below was opened and confirmed to reach the right listing on 21 Oct
      // 2026 - share.google answers 200 for a dead link too, serving an error
      // page, so a status code proves nothing on its own. Dallas is absent
      // deliberately: no working link for it has been supplied yet.
      sameAs: [
        "https://www.linkedin.com/company/mimar-studios",
        "https://www.behance.net/mimARstudios",
        "https://www.pinterest.com/mimarstudios",
        "https://share.google/9UmptDgeq3JNUfBZW", // Islamabad
        "https://share.google/zExBKdwTHeYWP6xBc", // Dubai
        "https://share.google/1moaNAdc6IN5roHSm", // New York
        "https://maps.google.com/?cid=10127851720809782624", // Dallas
        "https://share.google/jF9Xy8mD5BPlUy1wY", // San Francisco
        "https://share.google/1DPWaFVsmxJDSZocn", // Los Angeles
        "https://share.google/H6hiSKKIuuuV59ZFt", // Houston
        "https://maps.app.goo.gl/rQE1yMo767ZwhQLK8", // Austin
        "https://share.google/52xpHYZjQEjnqvTFh", // Istanbul
      ],
      areaServed: ["Saudi Arabia", "United Arab Emirates", "Pakistan", "United States", "Worldwide"],
      contactPoint: [
        { "@type": "ContactPoint", telephone: "+966-59-743-9044", contactType: "customer service", areaServed: "SA" },
        { "@type": "ContactPoint", telephone: "+971-54-146-5887", contactType: "customer service", areaServed: "AE" },
        { "@type": "ContactPoint", telephone: "+92-300-511-2990", contactType: "customer service", areaServed: "PK" },
        { "@type": "ContactPoint", telephone: "+1-786-761-9866", contactType: "customer service", areaServed: "US" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://mim.archi/#website",
      url: "https://mim.archi",
      name: "Mimar Studios",
      publisher: { "@id": "https://mim.archi/#organization" },
      inLanguage: "en",
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://mim.archi/#localbusiness-jeddah",
      name: "Mimar Studios - Jeddah",
      image: "https://mim.archi/logo.png",
      url: "https://mim.archi",
      telephone: "+966597439044",
      priceRange: "$$$",
      hasMap: "https://maps.app.goo.gl/weNLH7xskTdbXjdL7",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Prince Sultan Branch Rd, Al-Mohammadiyah",
        addressLocality: "Jeddah",
        postalCode: "23625",
        addressCountry: "SA",
      },
      parentOrganization: { "@id": "https://mim.archi/#organization" },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://mim.archi/#localbusiness-islamabad",
      name: "Mimar Studios - Islamabad",
      image: "https://mim.archi/logo.png",
      url: "https://mim.archi",
      telephone: "+923005112990",
      priceRange: "$$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "mimAR Studio, (NSTP) NUST, H-12",
        addressLocality: "Islamabad",
        postalCode: "44000",
        addressCountry: "PK",
      },
      parentOrganization: { "@id": "https://mim.archi/#organization" },
    },
    {
      "@type": "Service",
      "@id": "https://mim.archi/#service-3d-visualization",
      name: "3D Visualization & Architectural Rendering Services",
      provider: { "@id": "https://mim.archi/#organization" },
      serviceType: "3D Architectural Visualization",
      areaServed: ["Saudi Arabia", "UAE", "Pakistan", "USA"],
      description:
        "Photorealistic 3D visualization, interior and exterior architectural rendering services for real estate developers and architects.",
      url: "https://mim.archi/services/3d-visualization",
    },
    {
      "@type": "Service",
      "@id": "https://mim.archi/#service-architectural-design",
      name: "Architectural Design Services",
      provider: { "@id": "https://mim.archi/#organization" },
      serviceType: "Architectural Design",
      areaServed: ["Saudi Arabia", "UAE", "Pakistan", "USA"],
      description:
        "Comprehensive architectural design services from schematic design and concept development to construction documentation.",
      url: "https://mim.archi/services/architectural-design",
    },
  ],
};

/**
 * Arabic version of the site-wide graph: same @ids and entities as
 * `siteJsonLd` (so page-level schema still resolves), with Arabic descriptions
 * and names, `inLanguage: "ar"` and /ar service URLs.
 */
export const siteJsonLdAr = {
  ...siteJsonLd,
  "@graph": siteJsonLd["@graph"].map((node) => {
    switch (node["@id"]) {
      case "https://mim.archi/#organization":
        return {
          ...node,
          description:
            "ميمار ستوديوز استوديو دولي للعمارة والتصور ثلاثي الأبعاد، يقدّم خدمات التصيير ثلاثي الأبعاد والرسوم المتحركة وجولات الواقع الافتراضي والتجارب الرقمية للعقارات.",
        };
      case "https://mim.archi/#website":
        return { ...node, url: pageUrl("/", "ar"), name: "ميمار ستوديوز", inLanguage: "ar" };
      case "https://mim.archi/#service-3d-visualization":
        return {
          ...node,
          name: "خدمات التصور ثلاثي الأبعاد والتصيير المعماري",
          serviceType: "التصور المعماري ثلاثي الأبعاد",
          description: "خدمات تصور وتصيير معماري داخلي وخارجي فائق الواقعية للمطورين العقاريين والمعماريين.",
          url: pageUrl("/services/3d-visualization", "ar"),
        };
      case "https://mim.archi/#service-architectural-design":
        return {
          ...node,
          name: "خدمات التصميم المعماري",
          serviceType: "التصميم المعماري",
          description: "خدمات تصميم معماري شاملة، من التصميم المبدئي وتطوير الفكرة وحتى مستندات التنفيذ.",
          url: pageUrl("/services/architectural-design", "ar"),
        };
      default:
        return node;
    }
  }),
};

export function itemListJsonLd(name: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}

export function serviceJsonLd(
  service: {
    title: string;
    slug: string;
    intro: string;
    outputs?: readonly string[];
  },
  locale: Locale = "en",
) {
  const path = localeHref(locale, servicePath(service.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}${path}#service`,
    name: service.title,
    description: service.intro,
    url: `${siteConfig.url}${path}`,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: "Worldwide",
    serviceType: service.title,
    hasOfferCatalog: service.outputs?.length
      ? {
          "@type": "OfferCatalog",
          name: locale === "ar" ? `مخرجات ${service.title}` : `${service.title} deliverables`,
          itemListElement: service.outputs.map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        }
      : undefined,
  };
}

/**
 * FAQPage structured data. This is the single highest-leverage block for
 * Generative Engine Optimization (GEO) - question/answer pairs are exactly
 * what AI answer engines (Google AI Overviews, ChatGPT browsing, Perplexity)
 * extract and cite verbatim. Keep answers self-contained (no "see above").
 */
export function faqJsonLd(items: readonly { question: string; answer: string }[] = defaultFaqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}

export function creativeWorkJsonLd(
  project: {
    title: string;
    summary: string;
    cover: string;
    slug: string;
    location?: string;
    year?: number;
  },
  locale: Locale = "en",
) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: new URL(project.cover, siteConfig.url).toString(),
    url: new URL(localeHref(locale, `/projects/${project.slug}`), siteConfig.url).toString(),
    dateCreated: project.year ? String(project.year) : undefined,
    // contentLocation ties each project to a real place - useful both for
    // local/geographic SEO (work delivered across Pakistan + UAE) and as a
    // citable fact for AI answer engines.
    contentLocation: project.location ? { "@type": "Place", name: project.location } : undefined,
    creator: { "@id": `${siteConfig.url}/#organization` },
  };
}

/** Renders one or more JSON-LD graphs as a <script> tag. Use in Server Components. */
export function jsonLdScript(data: object | object[]) {
  const graph = Array.isArray(data) ? data : [data];
  return {
    // "<" is escaped so editor- or AI-supplied text (jobs, blog posts) can never contain
    // a literal "</script>" that would end the tag early. The parsed JSON is identical.
    __html: JSON.stringify(graph.length === 1 ? graph[0] : { "@context": "https://schema.org", "@graph": graph }).replace(
      /</g,
      "\\u003c",
    ),
  };
}
