import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, jsonLdScript } from "@/lib/seo";
import { getLegacySeoPage, legacySeoPages } from "@/lib/legacy-seo";
import LegacyArticle from "@/components/legacy/LegacyArticle";

export const dynamicParams = false;

export function generateStaticParams() {
  return legacySeoPages
    .filter((page) => {
      const segments = page.path.slice(1).split("/");
      // /blog/{article} (exactly 2 segments) is owned by /blog/[category] instead,
      // which falls back to rendering the same article when the segment isn't a
      // known category slug - keeps this catch-all from claiming the same path.
      return !(segments.length === 2 && segments[0] === "blog");
    })
    .map((page) => ({ legacy: page.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: { params: Promise<{ legacy: string[] }> }): Promise<Metadata> {
  const { legacy } = await params;
  const page = getLegacySeoPage(legacy.join("/"));
  if (!page) return {};

  return buildMetadata({
    title: page.seoTitle,
    description: page.description,
    path: page.path,
    keywords: page.keywords,
  });
}

export default async function LegacySeoPage({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const page = getLegacySeoPage(legacy.join("/"));
  if (!page) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: page.title, path: page.path },
          ]),
          articleJsonLd(page),
        ])}
      />
      <LegacyArticle page={page} />
    </>
  );
}
