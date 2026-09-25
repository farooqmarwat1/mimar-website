import type { Metadata } from "next";
import { siteConfig, faqs as defaultFaqs } from "./site-config";

type BuildMetadataArgs = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
};

/**
 * Standard per-page metadata builder. Every route should call this so
 * canonical URLs, Open Graph, Twitter cards, and robots directives stay
 * consistent - this is the layer that protects the SEO equity carried over
 * from the current WordPress site (same title/description conventions,
 * same OG image strategy).
 */
export function buildMetadata({ title, description, path, ogImage, noIndex, keywords }: BuildMetadataArgs): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const image = ogImage ?? siteConfig.ogImage;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      locale: siteConfig.locale,
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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteConfig.url}${article.path}#article`,
    headline: article.title,
    description: article.description,
    url: `${siteConfig.url}${article.path}`,
    datePublished: article.published ? `${article.published.replace(" ", "T")}Z` : undefined,
    dateModified: article.modified ? `${article.modified.replace(" ", "T")}Z` : undefined,
    keywords: article.keywords.join(", ") || undefined,
    author: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}${article.path}` },
    inLanguage: "en-US",
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
      sameAs: [
        "https://www.linkedin.com/company/mimar-studios",
        "https://www.behance.net/mimARstudios",
        "https://www.pinterest.com/mimarstudios",
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

export function serviceJsonLd(service: {
  title: string;
  slug: string;
  intro: string;
  outputs?: readonly string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteConfig.url}/services/${service.slug}#service`,
    name: service.title,
    description: service.intro,
    url: `${siteConfig.url}/services/${service.slug}`,
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: "Worldwide",
    serviceType: service.title,
    hasOfferCatalog: service.outputs?.length
      ? {
          "@type": "OfferCatalog",
          name: `${service.title} deliverables`,
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

export function creativeWorkJsonLd(project: {
  title: string;
  summary: string;
  cover: string;
  slug: string;
  location?: string;
  year?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: new URL(project.cover, siteConfig.url).toString(),
    url: new URL(`/projects/${project.slug}`, siteConfig.url).toString(),
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
    __html: JSON.stringify(graph.length === 1 ? graph[0] : { "@context": "https://schema.org", "@graph": graph }),
  };
}
