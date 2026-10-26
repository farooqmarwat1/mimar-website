import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { blogCategories } from "@/lib/legacy-seo";
import { getArchivePage, getArchivePageCount, getBlogArticle, getBlogSlugs, getCategoryList } from "@/lib/blog-store";
import LegacyArticle from "@/components/legacy/LegacyArticle";
import { articleStructuredData, blogMetadata } from "@/lib/blog-seo";

// This segment serves category listings, archive pagination (/blog/2) and every
// one-segment article (/blog/3d-rendering, or a post written in /admin). Pages
// that are not known at build time are resolved on request; anything that
// matches none of the above calls notFound(), which is still a real 404
// (SEO_MIGRATION.md section 5).
export const dynamicParams = true;

// Admin edits refresh this immediately; hourly is the safety net.
export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageCount, slugs] = await Promise.all([getArchivePageCount("en"), getBlogSlugs("en")]);
  const archivePages = Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => String(index + 2));
  return [...blogCategories.map((category) => category.slug), ...slugs, ...archivePages].map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const archivePage = Number(slug);
  if (String(archivePage) === slug && archivePage >= 2 && (await getArchivePage(archivePage)).length > 0) {
    return buildMetadata({
      title: "Latest Blogs by Mimar | Page " + archivePage,
      description: "Browse more articles on architecture, 3D visualization and real estate technology from mimAR.",
      path: "/blog/" + archivePage,
      // The Arabic archive has its own page count; a page that only exists in English gets no alternate.
      hreflang: archivePage <= (await getArchivePageCount("ar")),
    });
  }

  const category = blogCategories.find((c) => c.slug === slug);
  if (category) {
    return buildMetadata({
      title: category.seoTitle,
      description: category.metaDescription,
      path: "/blog/" + category.slug,
    });
  }

  const page = await getBlogArticle("/blog/" + slug);
  if (!page) return {};
  return blogMetadata(page);
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const archivePage = Number(slug);
  if (String(archivePage) === slug && archivePage >= 2) {
    if ((await getArchivePage(archivePage)).length === 0) notFound();
    return <BlogArchiveView page={archivePage} />;
  }

  const category = blogCategories.find((c) => c.slug === slug);
  if (!category) {
    const page = await getBlogArticle("/blog/" + slug);
    if (!page) notFound();
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleStructuredData(page))} />
        <LegacyArticle page={page} />
      </>
    );
  }

  const articles = await getCategoryList(slug);
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
