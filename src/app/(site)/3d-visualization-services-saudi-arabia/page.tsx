import type { Metadata } from "next";

import RegionLanding from "@/components/regions/RegionLanding";
import { regionProjects, regions } from "@/lib/regions";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";

const region = regions.saudiArabia;

/**
 * Saudi Arabia country landing page.
 *
 * Unlike the UAE and US pages, this is a new path - WordPress never had a
 * Saudi page, so there is no equity to preserve and no redirect to add.
 *
 * It is also not capturing existing demand. Of 276 Saudi queries in the six
 * months to 17 Oct 2026, exactly one named a Saudi city; the rest were brand
 * terms or searches about other markets. Judge this page on whether it starts
 * earning Riyadh and Jeddah impressions at all, not on a share of traffic that
 * does not exist yet.
 */
export const metadata: Metadata = buildMetadata({
  title: region.seoTitle,
  description: region.description,
  path: region.path,
  keywords: region.keywords,
});

export default function SaudiArabiaRegionPage() {
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
              { "@type": "Country", name: "Saudi Arabia" },
              { "@type": "City", name: "Riyadh" },
              { "@type": "City", name: "Jeddah" },
              { "@type": "City", name: "Dammam" },
            ],
          },
          // The Jeddah office. No verified Google Business Profile exists for
          // Saudi Arabia yet, so this node carries no sameAs - adding one that
          // points at the wrong listing would be worse than having none.
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
