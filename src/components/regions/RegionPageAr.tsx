import RegionLanding from "@/components/regions/RegionLanding";
import { regionProjects, regions } from "@/lib/regions";
import { breadcrumbJsonLd, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { contact, siteConfig } from "@/lib/site-config";
import { localeHref } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { localizeProject } from "@/lib/localized-site";
import { localizeRegion, regionAreaServed } from "@/lib/ar/regions.ar";

/**
 * Arabic region landing page: the same RegionLanding view plus the Arabic
 * structured data (breadcrumb, Service, one LocalBusiness per verified
 * location, project ItemList) with /ar URLs. Mirrors the JSON-LD the English
 * route files emit.
 */
export default function RegionPageAr({ regionKey }: { regionKey: keyof typeof regions }) {
  const englishRegion = regions[regionKey];
  const region = localizeRegion(englishRegion, "ar");
  const dict = getDictionary("ar");
  const projects = regionProjects(englishRegion).map((project) => localizeProject(project, "ar"));
  const [country, cities] = regionAreaServed[regionKey].ar;
  const pagePath = localeHref("ar", englishRegion.path);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: dict.common.home, path: localeHref("ar", "/") },
            { name: dict.nav.services, path: localeHref("ar", "/services") },
            { name: region.h1, path: pagePath },
          ]),
          {
            ...serviceJsonLd(
              {
                title: region.h1,
                slug: "3d-visualization",
                intro: region.description,
                outputs: region.services.map((s) => s.title),
              },
              "ar",
            ),
            inLanguage: "ar",
            url: `${siteConfig.url}${pagePath}`,
            // Cities we work in, including those with no profile of their own.
            areaServed: [
              { "@type": "Country", name: country },
              ...cities.map((name) => ({ "@type": "City", name })),
            ],
          },
          // One LocalBusiness per verified location, in Arabic like the visible text.
          ...region.locations.map((location, index) => {
            const english = englishRegion.locations[index];
            return {
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "ProfessionalService"],
              "@id": `${siteConfig.url}${pagePath}#${english.city.toLowerCase().replace(/\s+/g, "-")}`,
              name: `ميمار ستوديوز - ${location.city}`,
              url: `${siteConfig.url}${pagePath}`,
              inLanguage: "ar",
              image: `${siteConfig.url}${siteConfig.ogImage}`,
              address: {
                "@type": "PostalAddress",
                streetAddress: location.streetAddress,
                addressLocality: location.city,
                ...(location.area ? { addressRegion: location.area } : {}),
                ...(english.postalCode ? { postalCode: english.postalCode } : {}),
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
            };
          }),
          // The projects delivered in this market, as an ordered list.
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `مشاريع ميمار ستوديوز في ${region.name}`,
            numberOfItems: projects.length,
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.title,
              url: `${siteConfig.url}${localeHref("ar", `/projects/${project.slug}`)}`,
            })),
          },
        ])}
      />
      <RegionLanding region={englishRegion} lang="ar" />
    </>
  );
}
