import type { MetadataRoute } from "next";
import { siteConfig, services } from "@/lib/site-config";
import { getProjects } from "@/lib/cms";
import { legacySeoPages, blogCategories } from "@/lib/legacy-seo";
import { interactiveServicesSlug, servicePath } from "@/lib/service-details";
import { architecturalSubServicePath, architecturalSubServiceSlugs } from "@/lib/architectural-sub-services";
import { legacyServicePages } from "@/lib/legacy-service-pages";
import { legacyCategories, legacyCategoryPath } from "@/lib/legacy-categories";

// Other restored Pano2VR tours (see legacyTours in next.config.ts).
const legacyTourPaths = [
  "/tours/aurumone/2-bed-apartment",
  "/tours/aurumone/3-bed-apartment",
  "/tours/the360residences/one-bed",
  "/tours/the360residences/two-bed",
  "/tours/the360residences/loft",
  "/ud-courtyard-type-a",
  "/ud-courtyard-type-b",
  "/ud-courtyard-type-c",
  "/ud-courtyard-type-d",
  "/gardenialivings-onebed",
  "/gardenialivings-twobed",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/about-us`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/about-us/studio`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/meta`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteConfig.url}/booking`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    // HMR 360 tours served from public/tours/hmr (see rewrites in next.config.ts).
    ...["one-bedroom", "two-bedroom", "three-bedroom", "four-bedroom", "penthouse", "townhouse"].map((unit) => ({
      url: `${siteConfig.url}/tours/hmr/${unit}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...legacyTourPaths.map((path) => ({ url: `${siteConfig.url}${path}`, changeFrequency: "yearly" as const, priority: 0.4 })),
    ...legacyCategories.map((category) => ({
      url: `${siteConfig.url}${legacyCategoryPath(category.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const blogCategoryRoutes: MetadataRoute.Sitemap = blogCategories.map((c) => ({
    url: `${siteConfig.url}/blog/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${siteConfig.url}/projects/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = [...services.map((s) => s.slug), interactiveServicesSlug].map((slug) => ({
    url: `${siteConfig.url}${servicePath(slug)}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const architecturalSubServiceRoutes: MetadataRoute.Sitemap = architecturalSubServiceSlugs.map((slug) => ({
    url: `${siteConfig.url}${architecturalSubServicePath(slug)}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const legacyServiceRoutes: MetadataRoute.Sitemap = Object.values(legacyServicePages).map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const legacyRoutes: MetadataRoute.Sitemap = legacySeoPages.map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    lastModified: page.modified ? new Date(`${page.modified.replace(" ", "T")}Z`) : undefined,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogCategoryRoutes, ...projectRoutes, ...serviceRoutes, ...architecturalSubServiceRoutes, ...legacyServiceRoutes, ...legacyRoutes];
}
