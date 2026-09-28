import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { articleJsonLd, buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { blogCategories, getArticlesForCategory, getLegacySeoPage, legacySeoPages } from "@/lib/legacy-seo";
import { blogPageCount, getBlogArchivePage } from "@/lib/blog-archive";
import LegacyArticle from "@/components/legacy/LegacyArticle";

// This segment serves category listings, archive pagination (/blog/2),
// and one-segment legacy articles (/blog/3d-rendering).
export const dynamicParams = false;

function articleSlugs() {
  return legacySeoPages
    .map((page) => page.path.slice(1).split("/"))
    .filter((segments) => segments.length === 2 && segments[0] === "blog")
    .map((segments) => segments[1]);
}

export function generateStaticParams() {
  const archivePages = Array.from({ length: Math.max(blogPageCount - 1, 0) }, (_, index) => String(index + 2));
  return [...blogCategories.map((category) => category.slug), ...articleSlugs(), ...archivePages]
    .map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const archivePage = Number(slug);
  if (String(archivePage) === slug && archivePage >= 2 && getBlogArchivePage(archivePage).length > 0) {
    return buildMetadata({
      title: "Latest Blogs by Mimar | Page " + archivePage,
      description: "Browse more articles on architecture, 3D visualization and real estate technology from mimAR.",
      path: "/blog/" + archivePage,
    });
  }

  const { category } = getArticlesForCategory(slug);
  if (category) {
    return buildMetadata({
      title: category.seoTitle,
      description: category.metaDescription,
      path: "/blog/" + category.slug,
    });
  }

  const page = getLegacySeoPage("blog/" + slug);
  if (!page) return {};
  return buildMetadata({
    title: page.seoTitle,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
  });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const archivePage = Number(slug);
  if (String(archivePage) === slug && archivePage >= 2) {
    if (getBlogArchivePage(archivePage).length === 0) notFound();
    return <BlogArchiveView page={archivePage} />;
  }

  const { category, articles } = getArticlesForCategory(slug);
  if (!category) {
    const page = getLegacySeoPage("blog/" + slug);
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

  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: category.label, path: "/blog/" + category.slug },
          ]),
          itemListJsonLd(
            "Mimar Studios " + category.label + " blogs",
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
        <p className="section-body mt-8 max-w-2xl">{category.description}</p>
        <div className="mt-10"><BlogCategoryLinks currentSlug={category.slug} /></div>
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
