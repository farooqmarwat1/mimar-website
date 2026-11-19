import { siteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

import RegionLanding from "@/components/regions/RegionLanding";
import { regionProjects, regions, localCurrency } from "@/lib/regions";
import { regionAreaServed } from "@/lib/ar/regions.ar";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";

const region = regions.middleEast;

/**
 * Middle East hub page (SEO_MIGRATION.md point 30).
 *
 * The path is the old WordPress "3D Visualization - Middle East" article, kept
 * as it was. A real route file takes precedence over the [...legacy] catch-all,
 * and the article is gone from legacy-seo.json and filtered out of the
 * Firestore index (blog-store.ts), so this is the only page at this URL.
 */
export const metadata: Metadata = buildMetadata({
  title: region.seoTitle,
  description: region.description,
  path: region.path,
  keywords: region.keywords,
});

export default function MiddleEastRegionPage() {
  const projects = regionProjects(region);
  const [countries, cities] = regionAreaServed.middleEast.en;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: region.h1, path: region.path },
          ]),
          {
            ...serviceJsonLd({
              title: region.h1,
              slug: "3d-visualization",
              intro: region.description,
              outputs: region.services.map((s) => s.title),
            }),
            // This page's own Service node: the /services/3d-visualization/ page owns that @id.
            "@id": `${siteUrl(region.path)}#service`,
            url: siteUrl(region.path),
            areaServed: [
              ...(Array.isArray(countries) ? countries : [countries]).map((name) => ({ "@type": "Country", name })),
              ...cities.map((name) => ({ "@type": "City", name })),
            ],
          },
          // One LocalBusiness per verified location (Dubai, Jeddah), as on the UAE and Saudi pages.
          ...region.locations.map((location) => ({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "@id": `${siteUrl(region.path)}#${location.city.toLowerCase().replace(/\s+/g, "-")}`,
            name: `${siteConfig.name} - ${location.city}`,
            url: siteUrl(region.path),
            image: `${siteConfig.url}${siteConfig.ogImage}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: location.streetAddress,
              addressLocality: location.city,
              ...(location.area ? { addressRegion: location.area } : {}),
              ...(location.postalCode ? { postalCode: location.postalCode } : {}),
              addressCountry: location.countryCode,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: location.geo.latitude,
              longitude: location.geo.longitude,
            },
            telephone: location.phone.replace(/[^\d+]/g, ""),
            ...(localCurrency[location.countryCode] ? { currenciesAccepted: localCurrency[location.countryCode] } : {}),
            email: contact.email,
            parentOrganization: { "@id": `${siteConfig.url}/#organization` },
            ...(location.gbpUrl ? { sameAs: [location.gbpUrl] } : {}),
          })),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Mimar Studios projects in the ${region.name}`,
            numberOfItems: projects.length,
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.title,
              url: siteUrl(`/projects/${project.slug}`),
            })),
          },
        ])}
      />
      <RegionLanding region={region} />
    </>
  );
}
