import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { articleJsonLd, buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { blogCategories, getArticlesForCategory, getLegacySeoPage, legacySeoPages } from "@/lib/legacy-seo";
import LegacyArticle from "@/components/legacy/LegacyArticle";

/**
 * This segment does double duty: it's both the category-listing route
 * (/blog/3d-visualization etc.) AND, for any segment that isn't a known
 * category, it falls back to rendering a single legacy article
 * (/blog/3d-rendering, /blog/brand-vs-company, ...). Those articles are a
 * single path segment under /blog/, which is exactly what this route
 * matches, so without this fallback they'd be shadowed and 404 instead of
 * reaching the root [...legacy] catch-all.
 */
export const dynamicParams = false;

function articleSlugs() {
  return legacySeoPages
    .map((page) => page.path.slice(1).split("/"))
    .filter((segments) => segments.length === 2 && segments[0] === "blog")
    .map((segments) => segments[1]);
}

export function generateStaticParams() {
  const categorySlugs = blogCategories.map((c) => c.slug);
  return [...categorySlugs, ...articleSlugs()].map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const { category } = getArticlesForCategory(slug);
  if (category) {
    return buildMetadata({
      title: `${category.label} Insights | Mimar Studios`,
      description: category.description,
      path: `/blog/${category.slug}`,
    });
  }
  const page = getLegacySeoPage(`blog/${slug}`);
  if (!page) return {};
  return buildMetadata({ title: page.seoTitle, description: page.description, path: page.path, keywords: page.keywords });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const { category, articles } = getArticlesForCategory(slug);

  if (!category) {
    const page = getLegacySeoPage(`blog/${slug}`);
    if (!page) notFound();
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript([
            breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: page.title, path: page.path }]),
            articleJsonLd(page),
          ])}
        />
        <LegacyArticle page={page} />
      </>
    );
  }

  const sorted = [...articles].sort((a, b) => (a.modified < b.modified ? 1 : -1));

  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Insights", path: "/blog" },
            { name: category.label, path: `/blog/${category.slug}` },
          ]),
          itemListJsonLd(`Mimar Studios ${category.label} insights`, sorted.map((a) => ({ name: a.title, path: a.path }))),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6"><Link href="/blog" className="hover:text-accent">/ Insights</Link> / {category.label}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="index-heading">
            <span className="block text-accent">{category.label}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-xl">{category.description}</p>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {sorted.length === 0 && <p className="section-body py-8">No articles in this category yet.</p>}
        {sorted.map((article, index) => (
          <Reveal key={article.path} delay={Math.min(index * 0.02, 0.15)}>
            <Link
              href={article.path}
              className="motion-row group flex flex-col gap-2 border-b border-line py-8 md:flex-row md:items-center md:gap-10"
            >
              <span className="eyebrow text-muted w-16 shrink-0">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-xl tracking-tight transition-opacity group-hover:opacity-60 md:text-2xl">
                {article.title}
              </span>
              <span className="section-body max-w-md">{article.description}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
