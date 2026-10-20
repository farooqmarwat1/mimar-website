import type { Metadata } from "next";

import RegionLanding from "@/components/regions/RegionLanding";
import { regionProjects, regions } from "@/lib/regions";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";

const region = regions.usa;

/**
 * USA country landing page.
 *
 * The path is unchanged from the old WordPress site. A real route file takes
 * precedence over the [...legacy] catch-all, so moving this page off the
 * article template needed no redirect and loses no equity.
 *
 * The US is where the gap is widest: 33,251 impressions and 7 clicks in the
 * 28 days to 17 Oct 2026, with city queries like "3d rendering services new
 * york" and "3d rendering services dallas" already sitting at position 1-2.
 * The copy names those cities so the listing matches the query.
 */
export const metadata: Metadata = buildMetadata({
  title: region.seoTitle,
  description: region.description,
  path: region.path,
  keywords: region.keywords,
});

export default function UsaRegionPage() {
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
            // Cities we work in, including those with no profile of their own.
            areaServed: [
              { "@type": "Country", name: "United States" },
              { "@type": "City", name: "New York" },
              { "@type": "City", name: "Los Angeles" },
              { "@type": "City", name: "San Francisco" },
              { "@type": "City", name: "Dallas" },
              { "@type": "City", name: "Houston" },
              { "@type": "City", name: "Austin" },
              { "@type": "City", name: "Miami" },
            ],
          },
          // One LocalBusiness per verified Google Business Profile. Each node
          // carries that profile's own address, phone and geo, and links back
          // to it with sameAs - that link is what ties this page to the
          // listing Google already trusts.
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
