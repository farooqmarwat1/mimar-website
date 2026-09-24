import legacySeoData from "@/content/legacy-seo.json";

export type LegacyContentBlock = {
  type: "h2" | "h3" | "p" | "li";
  text: string;
};

export type LegacySeoPage = {
  path: string;
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  published: string;
  modified: string;
  blocks: LegacyContentBlock[];
};

export const legacySeoPages = legacySeoData as LegacySeoPage[];

export function getLegacySeoPage(path: string) {
  const normalized = `/${path.replace(/^\/+|\/+$/g, "")}`;
  return legacySeoPages.find((page) => page.path === normalized);
}

/**
 * The old WordPress site organized long-form articles under a handful of
 * topic categories (some rooted at /blog/{category}/, some rooted directly
 * at /{category}/ as standalone pillar pages). Google indexed the category
 * archive URLs themselves, so we rebuild them here as simple filtered
 * listings over the same legacySeoPages data rather than a separate CMS
 * taxonomy - keyword-matched against the path so this stays correct as
 * legacy-seo.json grows, instead of a hand-maintained slug list.
 */
export type BlogCategory = {
  slug: string;
  label: string;
  description: string;
  keywords: string[];
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "3d-visualization",
    label: "3D Visualization",
    description: "Rendering, animation and architectural visualization technique guides.",
    keywords: ["3d-visualization", "3d-rendering", "3d-animation", "rendering-techniques", "ai-architecture-rendering", "visualizing-architecture", "3d-architectural"],
  },
  {
    slug: "vr-real-estate",
    label: "VR & Real Estate",
    description: "Virtual reality, augmented reality and the metaverse in real estate.",
    keywords: ["vr-real-estate", "metaverse"],
  },
  {
    slug: "real-estate-tech",
    label: "Real Estate Tech",
    description: "Proptech and technology trends shaping how real estate is sold.",
    keywords: ["real-estate-tech", "technology", "apartment-3d-virtual-tour"],
  },
];

export function getArticlesForCategory(categorySlug: string) {
  const category = blogCategories.find((c) => c.slug === categorySlug);
  if (!category) return { category: undefined, articles: [] as LegacySeoPage[] };
  const articles = legacySeoPages.filter((page) =>
    category.keywords.some((keyword) => page.path.toLowerCase().includes(keyword)),
  );
  return { category, articles };
}
