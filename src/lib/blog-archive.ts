import { legacySeoPages, type LegacySeoPage } from "@/lib/legacy-seo";

// The old WordPress /blog/ archive showed these 34 articles, nine per page.
// Keep its article URLs and order while allowing newer articles above them.
const wordpressArchivePaths = [
  "/blog/best-architects-in-islamabad",
  "/blog/apartment-3d-virtual-tour",
  "/blog/rendering-techniques",
  "/blog/ai-architecture-rendering",
  "/blog/visualizing-architecture",
  "/blog/brand-vs-company",
  "/blog/3d-animation-services",
  "/blog/architectural-services",
  "/blog/3d-rendering",
  "/blog/importance-of-architectural-design-services-in-uae",
  "/3d-visualization/why-you-need-real-estate-renders-to-sell-your-property",
  "/metaverse/how-to-become-a-metaverse-developer",
  "/technology/best-ways-to-sell-your-real-estate",
  "/3d-visualization/top-faqs-about-virtual-reality",
  "/3d-visualization/3d-architectural-walkthroughs",
  "/vr-real-estate/top-10-faqs-about-the-augmented-reality",
  "/metaverse/technologies-in-metaverse",
  "/metaverse/how-to-buy-nft",
  "/metaverse/top-six-faqs-about-real-estate-in-the-metaverse",
  "/metaverse/top-6-questions-about-the-metaverse",
  "/vr-real-estate/how-can-you-easily-distinguish-augmented-virtual-reality",
  "/vr-real-estate/virtual-reality-applications",
  "/vr-real-estate/virtual-reality-in-real-estate",
  "/vr-real-estate/5-ways-how-virtual-reality-is-transforming-the-real-estate-industry",
  "/blog/elements-in-interior-design",
  "/blog/12-faq-about-interior-design",
  "/blog/top-landmarks-and-restaurants-in-islamabad",
  "/technology/why-technology-is-important-in-real-estate",
  "/3d-visualization/best-3d-modelling-software",
  "/3d-visualization/hire-3d-animation-studio",
  "/3d-visualization/hire-3d-architectural-visualization-company",
  "/3d-visualization/3d-architectural-visualization-software",
  "/3d-visualization/3d-architectural-visualization-top-faqs",
  "/3d-visualization/how-to-create-realistic-architectural-rendering",
] as const;

const newerArticlePaths = ["/metaverse-development-a-complete-guide-for-businesses"];

export const blogArchiveArticles: LegacySeoPage[] = [...newerArticlePaths, ...wordpressArchivePaths]
  .map((path) => legacySeoPages.find((article) => article.path === path))
  .filter((article): article is LegacySeoPage => article !== undefined);

export const blogPageSize = 9;
export const blogPageCount = Math.ceil(blogArchiveArticles.length / blogPageSize);

export function getBlogArchivePage(page: number) {
  if (!Number.isInteger(page) || page < 1 || page > blogPageCount) return [];
  const start = (page - 1) * blogPageSize;
  return blogArchiveArticles.slice(start, start + blogPageSize);
}
