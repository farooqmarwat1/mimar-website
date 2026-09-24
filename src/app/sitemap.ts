import type { MetadataRoute } from "next";
import { siteConfig, services } from "@/lib/site-config";
import { getProjects } from "@/lib/cms";
import { legacySeoPages, blogCategories } from "@/lib/legacy-seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
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

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${siteConfig.url}/services/${s.slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const legacyRoutes: MetadataRoute.Sitemap = legacySeoPages.map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    lastModified: page.modified ? new Date(`${page.modified.replace(" ", "T")}Z`) : undefined,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogCategoryRoutes, ...projectRoutes, ...serviceRoutes, ...legacyRoutes];
}
