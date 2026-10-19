import type { Metadata } from "next";

import RegionLanding from "@/components/regions/RegionLanding";
import { regionProjects, regions } from "@/lib/regions";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";

const region = regions.uae;

/**
 * UAE country landing page.
 *
 * The path is deliberately unchanged from the old WordPress site - it holds
 * roughly 108k Search Console impressions and 16 months of signals. A real
 * route file takes precedence over the [...legacy] catch-all, so moving this
 * page off the article template needed no redirect and loses no equity.
 */
export const metadata: Metadata = buildMetadata({
  title: region.seoTitle,
  description: region.description,
  path: region.path,
  keywords: region.keywords,
});

export default function UaeRegionPage() {
  const projects = regionProjects(region);

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
          serviceJsonLd({
            title: `3D Visualization Services ${region.name}`,
            slug: "3d-visualization",
            intro: region.description,
            outputs: region.services.map((s) => s.title),
          }),
          // LocalBusiness for the Dubai office - geo coordinates are what power
          // map-pack and "near me" results, and were missing site-wide.
          {
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "@id": `${siteConfig.url}${region.path}#localbusiness`,
            name: `${siteConfig.name} - ${region.office.city}`,
            url: `${siteConfig.url}${region.path}`,
            image: `${siteConfig.url}${siteConfig.ogImage}`,
            description: region.description,
            address: {
              "@type": "PostalAddress",
              addressLocality: region.office.city,
              addressCountry: "AE",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: region.office.geo.latitude,
              longitude: region.office.geo.longitude,
            },
            telephone: region.office.phone.replace(/\s/g, ""),
            email: contact.email,
            areaServed: [
              { "@type": "Country", name: "United Arab Emirates" },
              { "@type": "City", name: "Dubai" },
              { "@type": "City", name: "Abu Dhabi" },
              { "@type": "City", name: "Sharjah" },
            ],
            parentOrganization: { "@id": `${siteConfig.url}/#organization` },
            ...(region.office.gbpUrl ? { sameAs: [region.office.gbpUrl] } : {}),
          },
          // The projects delivered in this market, as an ordered list.
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Mimar Studios projects in ${region.name}`,
            numberOfItems: projects.length,
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.title,
              url: `${siteConfig.url}/projects/${project.slug}`,
            })),
          },
        ])}
      />
      <RegionLanding region={region} />
    </>
  );
}
