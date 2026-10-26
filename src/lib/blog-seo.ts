import type { Metadata } from "next";
import type { SiteArticle } from "@/lib/posts";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { blocksToPlainText, stripInlineLinks } from "@/lib/content-blocks";
import { blogCategories } from "@/lib/legacy-seo";
import { localeHref } from "@/i18n/config";
import { blogUi, localizeBlogCategory } from "@/lib/ar/blog-ui";

const isoDate = (date: string) => `${date.replace(" ", "T")}Z`;

/**
 * <head> data for an article page in either language. `path` is always the
 * English path; the Arabic page's canonical becomes /ar/..., and the en/ar/x-default
 * pair is only emitted when the other language really exists.
 */
export function blogMetadata(page: SiteArticle): Metadata {
  const metadata = buildMetadata({
    title: page.seoTitle,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
    ogImage: page.cover?.url,
    locale: page.lang,
    hreflang: page.hasAr,
  });
  if (!page.isPost) return metadata;
  const image = page.cover
    ? {
        url: new URL(page.cover.url, siteConfig.url).toString(),
        alt: page.cover.alt,
        ...(page.cover.width && page.cover.height ? { width: page.cover.width, height: page.cover.height } : {}),
      }
    : undefined;
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: isoDate(page.published),
      modifiedTime: isoDate(page.modified),
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.description, ...(image ? { images: [image] } : {}) },
  };
}

export function blogPostJsonLd(page: SiteArticle) {
  const imageUrl = page.cover ? new URL(page.cover.url, siteConfig.url).toString() : undefined;
  const category = blogCategories.find((item) => item.slug === page.categories?.[0]);
  const section = category ? localizeBlogCategory(category, page.lang).label : undefined;
  const places = (page.geoTerms ?? []).map((name) => ({ "@type": "Place", name }));
  return {
    ...articleJsonLd({ ...page, image: imageUrl, locale: page.lang }),
    "@type": "BlogPosting",
    image: page.cover
      ? { "@type": "ImageObject", url: imageUrl, contentUrl: imageUrl, caption: page.cover.alt, width: page.cover.width, height: page.cover.height }
      : undefined,
    articleSection: section,
    wordCount: blocksToPlainText(page.blocks).split(/\s+/).filter(Boolean).length,
    // The places the article is written for (local search and answer engines).
    contentLocation: places.length ? places : undefined,
    isAccessibleForFree: true,
    citation: page.sources?.map((source) => ({ "@type": "CreativeWork", name: source.title, url: source.url })),
  };
}

/** BreadcrumbList + Article/BlogPosting (+ FAQPage when the Q&A is shown on the page) for an article page. */
export function articleStructuredData(page: SiteArticle) {
  const ui = blogUi(page.lang);
  const href = (path: string) => localeHref(page.lang, path);
  return [
    breadcrumbJsonLd(
      page.isPost
        ? [
            { name: ui.home, path: href("/") },
            { name: ui.blog, path: href("/blog") },
            { name: page.title, path: href(page.path) },
          ]
        : [
            { name: ui.home, path: href("/") },
            { name: page.title, path: href(page.path) },
          ],
    ),
    page.isPost ? blogPostJsonLd(page) : articleJsonLd({ ...page, image: page.cover?.url, locale: page.lang }),
    // FAQPage only because the same Q&A is rendered on the page.
    ...(page.faq?.length ? [faqJsonLd(page.faq.map((item) => ({ question: item.question, answer: stripInlineLinks(item.answer) })))] : []),
  ];
}
