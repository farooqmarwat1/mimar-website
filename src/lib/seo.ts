import type { Metadata } from "next";
import { siteConfig, contact, social, services, faqs as defaultFaqs } from "./site-config";

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
 * Organization + LocalBusiness structured data.
 * LocalBusiness fields (geo coordinates, address, phone) are what power
 * classic local/geographic SEO - map packs, "near me" queries, knowledge
 * panels.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.description,
    foundingDate: siteConfig.foundingDate,
    founder: {
      "@type": "Person",
      name: "Naqi Ejaz",
      jobTitle: "Founder",
      url: `${siteConfig.url}/about`,
    },
    foundingLocation: {
      "@type": "Place",
      name: siteConfig.foundingLocation,
      address: { "@type": "PostalAddress", addressLocality: "Islamabad", addressCountry: "PK" },
    },
    slogan: "Experience good. Build better.",
    alternateName: ["mimAR", "mimAR Studio", "Mimar Architecture"],
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.line1,
      addressLocality: "Islamabad",
      addressRegion: "Islamabad Capital Territory",
      postalCode: "44000",
      addressCountry: "PK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.geo.latitude,
      longitude: contact.geo.longitude,
    },
    email: contact.email,
    telephone: contact.phones.pakistanMobile,
    contactPoint: [
      { "@type": "ContactPoint", telephone: contact.phones.pakistanHQ, contactType: "customer service", areaServed: "PK", availableLanguage: ["English", "Urdu"] },
      { "@type": "ContactPoint", telephone: contact.phones.uae, contactType: "sales", areaServed: "AE", availableLanguage: "English" },
      { "@type": "ContactPoint", telephone: contact.phones.usa, contactType: "sales", areaServed: "US", availableLanguage: "English" },
    ],
    areaServed: [
      { "@type": "Country", name: "Pakistan" },
      { "@type": "Country", name: "United Arab Emirates" },
      { "@type": "Country", name: "United States" },
      { "@type": "AdministrativeArea", name: "Worldwide" },
    ],
    knowsAbout: [
      "Architectural design",
      "Interior design",
      "Architectural visualization",
      "3D rendering",
      "Architectural animation",
      "Virtual reality tours",
      "Web 360 tours",
      "Property technology",
      "Real estate marketing",
    ],
    award: [
      "National Winner in Pakistan - Uber Pitch, Karachi",
      "Pakistan representative at 4YFN, Barcelona",
      "Runner-up, Top 100 Entrepreneurship World Cup, Riyadh",
      "Winner of the ISF Award by HEC, Islamabad",
      "Runner-up, Pakistan Startup Cup, Islamabad",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Architecture, visualization and interactive services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          url: `${siteConfig.url}/services/${service.slug}`,
        },
      })),
    },
    sameAs: Object.values(social),
  };
}

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

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "en-US",
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
