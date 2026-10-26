import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import BlogCategoryView from "@/components/blog/BlogCategoryView";
import LegacyArticle from "@/components/legacy/LegacyArticle";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, jsonLdScript } from "@/lib/seo";
import { blogCategories } from "@/lib/legacy-seo";
import { localeHref } from "@/i18n/config";
import { blogMetaAr, blogUi, localizeBlogCategory } from "@/lib/ar/blog-ui";
import {
  arabicBlogArticleSlugs,
  blogPageCountAr,
  getBlogArchivePageAr,
  getCategoryArticlesAr,
  getLegacySeoPageAr,
} from "@/lib/ar/blog-ar";

// Arabic mirror of /blog/[category]: category listings, archive pagination
// (/ar/blog/2) and the one-segment translated articles (/ar/blog/3d-rendering).
// Everything is known at build time and dynamicParams is false, so anything
// else - including a slug that only exists as an English /admin post - is a
// real HTTP 404 inside the Arabic layout.
export const dynamicParams = false;

export function generateStaticParams() {
  const archivePages = Array.from({ length: Math.max(blogPageCountAr - 1, 0) }, (_, index) => String(index + 2));
  return [...blogCategories.map((category) => category.slug), ...arabicBlogArticleSlugs(), ...archivePages].map(
    (category) => ({ category }),
  );
}

function archivePageOf(slug: string): number | undefined {
  const page = Number(slug);
  return String(page) === slug && page >= 2 && getBlogArchivePageAr(page).length > 0 ? page : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const archivePage = archivePageOf(slug);
  if (archivePage) {
    return buildMetadata({
      title: blogMetaAr.archiveTitle(archivePage),
      description: blogMetaAr.archiveDescription,
      path: "/blog/" + archivePage,
      locale: "ar",
    });
  }

  const category = blogCategories.find((c) => c.slug === slug);
  if (category) {
    const ar = localizeBlogCategory(category, "ar");
    return buildMetadata({
      title: ar.seoTitle,
      description: ar.metaDescription,
      path: "/blog/" + category.slug,
      locale: "ar",
    });
  }

  const page = getLegacySeoPageAr("blog/" + slug);
  if (!page) return {};
  return buildMetadata({
    title: page.seoTitle,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
    locale: "ar",
  });
}

export default async function ArabicBlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;

  const archivePage = archivePageOf(slug);
  if (archivePage) return <BlogArchiveView page={archivePage} lang="ar" />;

  const { category, articles } = getCategoryArticlesAr(slug);
  if (category) {
    const ar = localizeBlogCategory(category, "ar");
    return (
      <BlogCategoryView
        lang="ar"
        label={ar.label}
        headingLead={ar.headingLead}
        headingAccent={ar.headingAccent}
        intro={ar.description}
        path={"/blog/" + category.slug}
        currentSlug={category.slug}
        articles={articles}
      />
    );
  }

  const page = getLegacySeoPageAr("blog/" + slug);
  if (!page) notFound();
  const ui = blogUi("ar");
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: ui.home, path: localeHref("ar", "/") },
            { name: page.title, path: localeHref("ar", page.path) },
          ]),
          articleJsonLd({ ...page, locale: "ar" }),
        ])}
      />
      <LegacyArticle page={page} lang="ar" />
    </>
  );
}
