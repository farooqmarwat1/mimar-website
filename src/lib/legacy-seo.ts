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
 * These four category pages and their article links follow the published
 * WordPress blog. Some articles live outside /blog/, so the link lists are
 * explicit rather than inferred from a URL prefix.
 */
export type BlogCategory = {
  slug: string;
  label: string;
  headingLead: string;
  headingAccent: string;
  seoTitle: string;
  metaDescription: string;
  description: string;
  image: string;
  articlePaths: string[];
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "3d-visualization",
    label: "3D Visualization",
    headingLead: "3D",
    headingAccent: "Visualization",
    seoTitle: "3d Visualization - mimAR",
    metaDescription: "Virtual reality and augmented reality have become highly influential across several industries. In our 3D Visualization blog section, we’ve discussed all",
    description: "Virtual reality and augmented reality have become highly influential across several industries. Explore our 3D visualization articles.",
    image: "/services/section-media/rendering-card.webp",
    articlePaths: [
      "/blog/best-architects-in-islamabad",
      "/blog/apartment-3d-virtual-tour",
      "/blog/3d-animation-services",
      "/3d-visualization/hire-3d-animation-studio",
      "/3d-visualization/3d-architectural-visualization-software",
      "/3d-visualization/3d-architectural-visualization-top-faqs",
      "/3d-visualization/hire-3d-architectural-visualization-company",
      "/3d-visualization/how-to-create-realistic-architectural-rendering",
      "/3d-visualization/3d-architectural-walkthroughs",
      "/3d-visualization/top-faqs-about-virtual-reality",
      "/blog/3d-visualization/3d-exterior-visualization-services",
      "/3d-architectural-walkthrough-services",
      "/3d-visualization/why-you-need-real-estate-renders-to-sell-your-property",
    ],
  },
  {
    slug: "vr-real-estate",
    label: "AR/VR in Real Estate",
    headingLead: "AR & VR",
    headingAccent: "in Real Estate",
    seoTitle: "VR Real Estate - mimAR",
    metaDescription: "VIRTUAL REALITY AND AUGMENTED REALITY IN REAL ESTATE HAVE BECOME HIGHLY INFLUENTIAL ACROSS SEVERAL INDUSTRIES. USING AR AND VR IN REAL ESTATE WILL LET YOU",
    description: "Virtual reality and augmented reality in real estate have become highly influential across several industries.",
    image: "/services/section-media/vr-card.webp",
    articlePaths: [
      "/vr-real-estate/how-can-you-easily-distinguish-augmented-virtual-reality",
      "/vr-real-estate/virtual-reality-in-real-estate",
      "/3d-visualization/hire-3d-architectural-visualization-company",
      "/vr-real-estate/5-ways-how-virtual-reality-is-transforming-the-real-estate-industry",
      "/vr-real-estate/virtual-reality-applications",
      "/vr-real-estate/top-10-faqs-about-the-augmented-reality",
      "/blog/vr-real-estate/benefits-of-virtual-tours-for-real-estate",
    ],
  },
  {
    slug: "architecture",
    label: "Architecture Designing",
    headingLead: "Architecture",
    headingAccent: "Designing",
    seoTitle: "Architecture - mimAR",
    metaDescription: "In our architecture articles, we cover and meet consumer demands, help them design living spaces, and illustrate creativity.",
    description: "Our architecture articles cover design ideas, living spaces and creative approaches to the built environment.",
    image: "/services/architectural-design/hero.jpg",
    articlePaths: [
      "/blog/ai-architecture-rendering",
      "/blog/visualizing-architecture",
      "/3d-visualization/hire-3d-architectural-visualization-company",
      "/3d-visualization/3d-architectural-visualization-software",
      "/blog/architecture/residential-vs-commercial-architecture",
      "/blog/architecture/stages-of-architectural-design",
    ],
  },
  {
    slug: "real-estate-tech",
    label: "Real Estate Technology",
    headingLead: "Real Estate",
    headingAccent: "Technology - Proptech",
    seoTitle: "Real Estate Tech - mimAR",
    metaDescription: "\"Proptech, as we all know, has brought efficiency to the real estate market. Over 70% of companies in the real estate industry use technology to increase",
    description: "Proptech brings efficiency to real estate. Explore how technology helps developers present and sell property.",
    image: "/services/section-media/property-card.webp",
    articlePaths: [
      "/3d-visualization/best-3d-modelling-software",
      "/technology/why-technology-is-important-in-real-estate",
      "/blog/top-landmarks-and-restaurants-in-islamabad",
      "/blog/12-faq-about-interior-design",
      "/blog/elements-in-interior-design",
      "/technology/best-ways-to-sell-your-real-estate",
      "/blog/real-estate-tech/commercial-real-estate-technology",
    ],
  },
];

export function getArticlesForCategory(categorySlug: string) {
  const category = blogCategories.find((c) => c.slug === categorySlug);
  if (!category) return { category: undefined, articles: [] as LegacySeoPage[] };
  const articles = category.articlePaths
    .map((path) => legacySeoPages.find((page) => page.path === path))
    .filter((page): page is LegacySeoPage => page !== undefined);
  return { category, articles };
}
