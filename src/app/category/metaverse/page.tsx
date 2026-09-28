import type { Metadata } from "next";
import Link from "next/link";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { legacySeoPages, type LegacySeoPage } from "@/lib/legacy-seo";

// Preserves the old WordPress /category/metaverse/ archive at its own URL.
// It is intentionally left out of blogCategories so it does not appear in the
// blog category cards, pills or site navigation.
const path = "/category/metaverse";

// Same articles and order as the old WordPress category page.
const articlePaths = [
  "/metaverse/how-to-become-a-metaverse-developer",
  "/metaverse/technologies-in-metaverse",
  "/metaverse/how-to-buy-nft",
  "/metaverse/top-six-faqs-about-real-estate-in-the-metaverse",
  "/metaverse/top-6-questions-about-the-metaverse",
];

const articles = articlePaths
  .map((articlePath) => legacySeoPages.find((page) => page.path === articlePath))
  .filter((page): page is LegacySeoPage => page !== undefined);

const description =
  "Explore mimAR's metaverse articles: how to become a metaverse developer, the technologies behind the metaverse, buying NFTs and virtual real estate FAQs.";

export const metadata: Metadata = buildMetadata({
  title: "Metaverse - mimAR",
  description,
  path,
});

export default function MetaverseCategoryPage() {
  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: "Metaverse", path },
          ]),
          itemListJsonLd(
            "Mimar Studios Metaverse blogs",
            articles.map((article) => ({ name: article.title, path: article.path })),
          ),
        ])}
      />

      <header className="container-page">
        <p className="eyebrow mb-6 text-muted">
          <Link href="/blog" className="hover:text-accent">/ Blog</Link> / Metaverse
        </p>
        <h1 className="index-heading">
          <span className="text-ink">Metaverse</span>{" "}
          <span className="text-accent">Insights</span>
        </h1>
        <p className="section-body mt-8 max-w-2xl">
          Guides and answers on the metaverse, from becoming a metaverse developer and the technologies that power
          virtual worlds to buying NFTs and investing in virtual real estate.
        </p>
        <div className="mt-10"><BlogCategoryLinks currentSlug="metaverse" /></div>
      </header>

      <section className="container-page mt-20" aria-labelledby="metaverse-blogs-heading">
        <div className="mb-10 flex items-end justify-between gap-5 border-t border-line pt-8">
          <h2 id="metaverse-blogs-heading" className="section-heading">Latest Blogs</h2>
          <span className="eyebrow text-muted">{articles.length} articles</span>
        </div>
        <BlogArticleList articles={articles} />
      </section>
    </div>
  );
}
