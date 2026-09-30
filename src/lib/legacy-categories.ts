import { legacySeoPages, type LegacySeoPage } from "@/lib/legacy-seo";

/**
 * Old WordPress /category/{slug}/ archives kept at their own URLs. They are
 * intentionally not in blogCategories, so they stay out of the blog category
 * cards, pills and site navigation. Titles and article lists (with their
 * order) follow the old archive; the old pages had no H1 or meta description.
 */
export type LegacyCategory = {
  slug: string;
  seoTitle: string;
  description: string;
  label: string;
  headingLead: string;
  headingAccent: string;
  intro: string;
  articlePaths: string[];
};

export const legacyCategories: LegacyCategory[] = [
  {
    slug: "metaverse",
    seoTitle: "Metaverse - mimAR",
    description:
      "Explore mimAR's metaverse articles: how to become a metaverse developer, the technologies behind the metaverse, buying NFTs and virtual real estate FAQs.",
    label: "Metaverse",
    headingLead: "Metaverse",
    headingAccent: "Insights",
    intro:
      "Guides and answers on the metaverse, from becoming a metaverse developer and the technologies that power virtual worlds to buying NFTs and investing in virtual real estate.",
    articlePaths: [
      "/metaverse/how-to-become-a-metaverse-developer",
      "/metaverse/technologies-in-metaverse",
      "/metaverse/how-to-buy-nft",
      "/metaverse/top-six-faqs-about-real-estate-in-the-metaverse",
      "/metaverse/top-6-questions-about-the-metaverse",
    ],
  },
  {
    slug: "vr-real-estate",
    seoTitle: "VR Real Estate - mimAR",
    description:
      "mimAR's VR real estate articles: augmented reality FAQs, AR vs VR, virtual reality applications and how VR is transforming the real estate industry.",
    label: "VR Real Estate",
    headingLead: "VR",
    headingAccent: "Real Estate",
    intro:
      "Articles on virtual and augmented reality in real estate, from telling AR and VR apart to the industries and property teams already using them.",
    articlePaths: [
      "/vr-real-estate/top-10-faqs-about-the-augmented-reality",
      "/vr-real-estate/how-can-you-easily-distinguish-augmented-virtual-reality",
      "/vr-real-estate/virtual-reality-applications",
      "/vr-real-estate/virtual-reality-in-real-estate",
      "/vr-real-estate/5-ways-how-virtual-reality-is-transforming-the-real-estate-industry",
    ],
  },
];

export function legacyCategoryPath(slug: string) {
  return `/category/${slug}`;
}

export function getLegacyCategory(slug: string) {
  const category = legacyCategories.find((c) => c.slug === slug);
  const articles = (category?.articlePaths ?? [])
    .map((path) => legacySeoPages.find((page) => page.path === path))
    .filter((page): page is LegacySeoPage => page !== undefined);
  return { category, articles };
}
