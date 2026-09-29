import type { MetadataRoute } from "next";
import { siteConfig, services } from "@/lib/site-config";
import { getProjects } from "@/lib/cms";
import { legacySeoPages, blogCategories } from "@/lib/legacy-seo";
import { interactiveServicesSlug, servicePath } from "@/lib/service-details";
import { architecturalSubServicePath, architecturalSubServiceSlugs } from "@/lib/architectural-sub-services";
import { threeDVisualizationSubServicePath, threeDVisualizationSubServiceSlugs } from "@/lib/three-d-visualization-sub-services";
import { legacyServicePages } from "@/lib/legacy-service-pages";

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
    { url: `${siteConfig.url}/category/metaverse`, changeFrequency: "monthly", priority: 0.6 },
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

  const threeDVisualizationSubServiceRoutes: MetadataRoute.Sitemap = threeDVisualizationSubServiceSlugs.map((slug) => ({
    url: `${siteConfig.url}${threeDVisualizationSubServicePath(slug)}`,
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

  const allRoutes = [...staticRoutes, ...blogCategoryRoutes, ...projectRoutes, ...serviceRoutes, ...architecturalSubServiceRoutes, ...threeDVisualizationSubServiceRoutes, ...legacyServiceRoutes, ...legacyRoutes];

  // Some sub-service slugs (e.g. cinematics) exist both in the flat `services`
  // list, for servicePath()-driven surfaces like the contact form and llms.txt,
  // and in their own sub-service route list above - de-dupe by final URL so
  // neither produces a duplicate sitemap entry.
  const seen = new Set<string>();
  return allRoutes.filter((route) => {
    if (seen.has(route.url)) return false;
    seen.add(route.url);
    return true;
  });
}
