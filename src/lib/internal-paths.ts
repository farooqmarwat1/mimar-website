import "server-only";
import { architecturalSubServicePath, architecturalSubServiceSlugs } from "@/lib/architectural-sub-services";
import { brandingMarketingSubServicePaths } from "@/lib/branding-marketing-sub-services";
import { getBlogEntries } from "@/lib/blog-store";
import { blogCategories } from "@/lib/legacy-seo";
import { legacyServicePages } from "@/lib/legacy-service-pages";
import { regionList } from "@/lib/regions";
import { interactiveServicesSlug, servicePath } from "@/lib/service-details";
import { services } from "@/lib/site-config";
import { threeDVisualizationSubServicePath, threeDVisualizationSubServiceSlugs } from "@/lib/three-d-visualization-sub-services";
import { isTextBlock, type ArticleBlock } from "@/lib/content-blocks";

/**
 * Every site-relative page a blog post may link to. Used to reject made-up
 * links (a typo, or an AI draft inventing /services/foo) before a post is saved.
 */
const FIXED = ["/", "/blog", "/services", "/projects", "/contact", "/booking", "/about-us", "/about-us/studio", "/careers", "/meta", "/expos"];

export function normalizePath(path: string): string {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
}

function staticPaths(): string[] {
  return [
    ...FIXED,
    ...services.map((s) => servicePath(s.slug)),
    servicePath(interactiveServicesSlug),
    ...architecturalSubServiceSlugs.map(architecturalSubServicePath),
    ...threeDVisualizationSubServiceSlugs.map(threeDVisualizationSubServicePath),
    ...brandingMarketingSubServicePaths,
    ...Object.values(legacyServicePages).map((page) => page.path),
    ...regionList.map((region) => region.path),
    ...blogCategories.map((category) => `/blog/${category.slug}`),
  ].map(normalizePath);
}

export async function knownInternalPaths(): Promise<Set<string>> {
  // Published articles only: a deleted or unpublished one is no longer a valid link target.
  const articles = await getBlogEntries();
  return new Set([...staticPaths(), ...articles.map((article) => normalizePath(article.path))]);
}

const LINK_PATTERN = /\[[^\]\n]{1,120}\]\((\/[^)\s\\]{0,200})\)/g;

/** Site-relative paths used as inline links in the blocks, plus any extra list (e.g. "related"). */
export function collectLinkedPaths(blocks: ArticleBlock[], extra: string[] = []): string[] {
  const found = new Set<string>(extra);
  for (const block of blocks) if (isTextBlock(block)) for (const match of block.text.matchAll(LINK_PATTERN)) found.add(match[1]);
  return [...found];
}

export async function findUnknownPaths(paths: string[]): Promise<string[]> {
  const known = await knownInternalPaths();
  return paths.filter((path) => !known.has(normalizePath(path)));
}
