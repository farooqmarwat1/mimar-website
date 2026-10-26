import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyArticle from "@/components/legacy/LegacyArticle";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, jsonLdScript } from "@/lib/seo";
import { localeHref } from "@/i18n/config";
import { blogUi } from "@/lib/ar/blog-ui";
import { arabicCatchAllSegments, getLegacySeoPageAr } from "@/lib/ar/blog-ar";

// Arabic catch-all. Serves the translated legacy articles that are not
// one-segment /blog/{article} pages (those belong to /ar/blog/[category]) and
// turns every other unknown /ar/... URL into a real HTTP 404 rendered by
// src/app/ar/not-found.tsx inside the Arabic layout. Static routes such as
// /ar/services/... take precedence over this catch-all.
export const dynamicParams = false;

export function generateStaticParams() {
  return arabicCatchAllSegments().map((legacy) => ({ legacy }));
}

export async function generateMetadata({ params }: { params: Promise<{ legacy: string[] }> }): Promise<Metadata> {
  const { legacy } = await params;
  const page = getLegacySeoPageAr(legacy.join("/"));
  if (!page) return {};

  return buildMetadata({
    title: page.seoTitle,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
    locale: "ar",
  });
}

export default async function ArabicLegacySeoPage({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const page = getLegacySeoPageAr(legacy.join("/"));
  if (!page) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: blogUi("ar").home, path: localeHref("ar", "/") },
            { name: page.title, path: localeHref("ar", page.path) },
          ]),
          articleJsonLd({ ...page, locale: "ar" }),
        ])}
      />
      <LegacyArticle page={page} lang="ar" />
    </>
  );
}
