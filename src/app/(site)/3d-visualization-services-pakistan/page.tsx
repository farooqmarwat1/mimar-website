import type { Metadata } from "next";

import RegionLanding from "@/components/regions/RegionLanding";
import { regionProjects, regions } from "@/lib/regions";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";

const region = regions.pakistan;

/**
 * Pakistan country landing page.
 *
 * A new path - WordPress had no Pakistan page.
 *
 * Pakistan is the inverse of the US problem. Brand terms already do well
 * ("mimar" alone is 140 clicks at 33% CTR in the six months to 17 Oct 2026),
 * but the non-brand local queries sit on page 2 to 6 - "architecture firms in
 * pakistan" at 21, "branding companies in pakistan" at 26, "architectural
 * design firm in pakistan" at 49. Those need rankings, not a better title,
 * which is what this page and its eight delivered projects are for.
 */
export const metadata: Metadata = buildMetadata({
  title: region.seoTitle,
  description: region.description,
  path: region.path,
  keywords: region.keywords,
});

export default function PakistanRegionPage() {
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
          {
            ...serviceJsonLd({
              title: `3D Visualization Services ${region.name}`,
              slug: "3d-visualization",
              intro: region.description,
              outputs: region.services.map((s) => s.title),
            }),
            areaServed: [
              { "@type": "Country", name: "Pakistan" },
              { "@type": "City", name: "Islamabad" },
              { "@type": "City", name: "Lahore" },
              { "@type": "City", name: "Karachi" },
              { "@type": "City", name: "Multan" },
            ],
          },
          // The Islamabad studio, linked to its verified Business Profile.
          ...region.locations.map((location) => ({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "ProfessionalService"],
            "@id": `${siteConfig.url}${region.path}#${location.city.toLowerCase().replace(/\s+/g, "-")}`,
            name: `${siteConfig.name} - ${location.city}`,
            url: `${siteConfig.url}${region.path}`,
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
            email: contact.email,
            parentOrganization: { "@id": `${siteConfig.url}/#organization` },
            ...(location.gbpUrl ? { sameAs: [location.gbpUrl] } : {}),
          })),
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
