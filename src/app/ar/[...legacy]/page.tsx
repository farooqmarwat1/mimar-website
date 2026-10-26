import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LegacyArticle from "@/components/legacy/LegacyArticle";
import { jsonLdScript } from "@/lib/seo";
import { builtInArabicPaths, getBlogArticle } from "@/lib/blog-store";
import { articleStructuredData, blogMetadata } from "@/lib/blog-seo";

// Arabic catch-all. Serves the translated legacy articles that are not
// one-segment /blog/{article} pages (those belong to /ar/blog/[category]) and
// turns every other unknown /ar/... URL into a real HTTP 404 rendered by
// src/app/ar/not-found.tsx inside the Arabic layout. Static routes such as
// /ar/services/... take precedence over this catch-all. What is shown comes
// from the article store (edited, unpublished or deleted in /admin).
export const dynamicParams = false;

// Admin edits refresh this immediately; hourly is the safety net.
export const revalidate = 3600;

export function generateStaticParams() {
  return builtInArabicPaths()
    .map((path) => path.slice(1).split("/"))
    .filter((segments) => !(segments.length === 2 && segments[0] === "blog"))
    .map((legacy) => ({ legacy }));
}

export async function generateMetadata({ params }: { params: Promise<{ legacy: string[] }> }): Promise<Metadata> {
  const { legacy } = await params;
  const page = await getBlogArticle("/" + legacy.join("/"), "ar");
  return page ? blogMetadata(page) : {};
}

export default async function ArabicLegacySeoPage({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const page = await getBlogArticle("/" + legacy.join("/"), "ar");
  if (!page) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleStructuredData(page))} />
      <LegacyArticle page={page} lang="ar" />
    </>
  );
}
