import type { Metadata } from "next";
import type { SiteArticle } from "@/lib/posts";
import { articleJsonLd, buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { stripInlineLinks } from "@/lib/content-blocks";

const isoDate = (date: string) => `${date.replace(" ", "T")}Z`;

export function blogMetadata(page: SiteArticle): Metadata {
  const metadata = buildMetadata({ title: page.seoTitle, description: page.description, path: page.path, keywords: page.keywords, ogImage: page.cover?.url });
  if (!page.isPost) return metadata;
  const image = page.cover ? {
    url: new URL(page.cover.url, siteConfig.url).toString(), alt: page.cover.alt,
    ...(page.cover.width && page.cover.height ? { width: page.cover.width, height: page.cover.height } : {}),
  } : undefined;
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph, type: "article",
      publishedTime: isoDate(page.published), modifiedTime: isoDate(page.modified),
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.description, ...(image ? { images: [image] } : {}) },
  };
}

export function blogPostJsonLd(page: SiteArticle) {
  const text = page.blocks.filter(block => "text" in block).map(block => "text" in block ? stripInlineLinks(block.text) : "").join(" ");
  const imageUrl = page.cover ? new URL(page.cover.url, siteConfig.url).toString() : undefined;
  return {
    ...articleJsonLd({ ...page, image: imageUrl }),
    "@type": "BlogPosting",
    image: page.cover ? { "@type": "ImageObject", url: imageUrl, contentUrl: imageUrl, caption: page.cover.alt, width: page.cover.width, height: page.cover.height } : undefined,
    articleSection: page.category,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    citation: page.sources?.map(source => ({ "@type": "CreativeWork", name: source.title, url: source.url })),
  };
}
