import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { articleJsonLd, buildMetadata, breadcrumbJsonLd, faqJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { blogCategories, getLegacySeoPage, legacySeoPages } from "@/lib/legacy-seo";
import { getBlogArchivePage, getBlogPageCount, getCategoryArticles } from "@/lib/blog";
import { getPublishedArticleBySlug, getPublishedArticles, type SiteArticle } from "@/lib/posts";
import { stripInlineLinks } from "@/lib/content-blocks";
import LegacyArticle from "@/components/legacy/LegacyArticle";
import { blogMetadata, blogPostJsonLd } from "@/lib/blog-seo";

// This segment serves category listings, archive pagination (/blog/2),
// one-segment legacy articles (/blog/3d-rendering) and posts written in /admin.
// New posts and pagination pages are not known at build time, so unknown params
// are resolved at request time; anything that matches none of the above calls
// notFound(), which is still a real 404 (SEO_MIGRATION.md section 5).
export const dynamicParams = true;

// Admin edits refresh this immediately; hourly is the safety net.
export const revalidate = 3600;

function articleSlugs() {
  return legacySeoPages
    .map((page) => page.path.slice(1).split("/"))
    .filter((segments) => segments.length === 2 && segments[0] === "blog")
    .map((segments) => segments[1]);
}

export async function generateStaticParams() {
  const [pageCount, posts] = await Promise.all([getBlogPageCount(), getPublishedArticles()]);
  const archivePages = Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => String(index + 2));
  const postSlugs = posts.map((post) => post.path.replace("/blog/", ""));
  return [...blogCategories.map((category) => category.slug), ...articleSlugs(), ...postSlugs, ...archivePages]
    .map((category) => ({ category }));
}

async function resolveArticle(slug: string): Promise<SiteArticle | undefined> {
  return getLegacySeoPage("blog/" + slug) ?? (await getPublishedArticleBySlug(slug)) ?? undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const archivePage = Number(slug);
  if (String(archivePage) === slug && archivePage >= 2 && (await getBlogArchivePage(archivePage)).length > 0) {
    return buildMetadata({
      title: "Latest Blogs by Mimar | Page " + archivePage,
      description: "Browse more articles on architecture, 3D visualization and real estate technology from mimAR.",
      path: "/blog/" + archivePage,
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

  const page = await resolveArticle(slug);
  if (!page) return {};
  return blogMetadata(page);
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const archivePage = Number(slug);
  if (String(archivePage) === slug && archivePage >= 2) {
    if ((await getBlogArchivePage(archivePage)).length === 0) notFound();
    return <BlogArchiveView page={archivePage} />;
  }

  const { category, articles } = await getCategoryArticles(slug);
  if (!category) {
    const page = await resolveArticle(slug);
    if (!page) notFound();
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript([
            breadcrumbJsonLd(
              page.isPost
                ? [{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: page.title, path: page.path }]
                : [{ name: "Home", path: "/" }, { name: page.title, path: page.path }],
            ),
            page.isPost ? blogPostJsonLd(page) : articleJsonLd({ ...page, image: page.cover?.url }),
            // FAQPage only because the same Q&A is rendered on the page.
            ...(page.faq?.length
              ? [faqJsonLd(page.faq.map((item) => ({ question: item.question, answer: stripInlineLinks(item.answer) })))]
              : []),
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
