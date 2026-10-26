import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { getLegacyCategory, legacyCategories, legacyCategoryPath } from "@/lib/legacy-categories";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd, jsonLdScript } from "@/lib/seo";

// Old WordPress category archives (/category/metaverse, /category/vr-real-estate)
// kept at their own URLs. Other /category/* URLs are redirects in next.config.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return legacyCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const { category } = getLegacyCategory(slug);
  if (!category) return {};
  return buildMetadata({ title: category.seoTitle, description: category.description, path: legacyCategoryPath(slug) });
}

export default async function LegacyCategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const { category, articles } = getLegacyCategory(slug);
  if (!category) notFound();
  const path = legacyCategoryPath(slug);

  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: category.label, path },
          ]),
          itemListJsonLd(
            `Mimar Studios ${category.label} blogs`,
            articles.map((article) => ({ name: article.title, path: article.path })),
          ),
        ])}
      />

      <header className="container-page">
        <p className="eyebrow mb-6 text-muted">
          <Link href="/blog" className="hover:text-accent">/ Blog</Link> / {category.label}
        </p>
        <h1 className="index-heading">
          <span className="text-ink">{category.headingLead}</span>{" "}
          <span className="text-accent">{category.headingAccent}</span>
        </h1>
        <p className="section-body mt-8 max-w-2xl">{category.intro}</p>
        {/* A key that matches no pill, so neither "All blogs" nor a /blog category is marked current. */}
        <div className="mt-10"><BlogCategoryLinks currentSlug={`category/${slug}`} /></div>
      </header>

      <section className="container-page mt-20" aria-labelledby="category-blogs-heading">
        <div className="mb-10 flex items-end justify-between gap-5 border-t border-line pt-8">
          <h2 id="category-blogs-heading" className="section-heading">Latest Blogs</h2>
          <span className="eyebrow text-muted">{articles.length} articles</span>
        </div>
        <BlogArticleList articles={articles} />
      </section>
    </div>
  );
}
