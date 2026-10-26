import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jsonLdScript } from "@/lib/seo";
import { builtInArticlePaths, getBlogArticle } from "@/lib/blog-store";
import { articleStructuredData, blogMetadata } from "@/lib/blog-seo";
import LegacyArticle from "@/components/legacy/LegacyArticle";

// The migrated WordPress articles that live outside /blog/<slug> keep their
// original addresses. The set of addresses never grows (new posts are always
// /blog/<slug>), so unknown URLs stay a real 404; what is shown at each address
// is read from the article store, so editing, unpublishing or deleting one in
// /admin takes effect without a deploy.
export const dynamicParams = false;

// Admin edits refresh this immediately; hourly is the safety net.
export const revalidate = 3600;

export function generateStaticParams() {
  return builtInArticlePaths()
    .map((path) => path.slice(1).split("/"))
    // /blog/{article} (exactly 2 segments) is owned by /blog/[category] instead,
    // which falls back to rendering the same article when the segment isn't a
    // known category slug - keeps this catch-all from claiming the same path.
    .filter((segments) => !(segments.length === 2 && segments[0] === "blog"))
    .map((legacy) => ({ legacy }));
}

export async function generateMetadata({ params }: { params: Promise<{ legacy: string[] }> }): Promise<Metadata> {
  const { legacy } = await params;
  const page = await getBlogArticle("/" + legacy.join("/"));
  return page ? blogMetadata(page) : {};
}

export default async function LegacySeoPage({ params }: { params: Promise<{ legacy: string[] }> }) {
  const { legacy } = await params;
  const page = await getBlogArticle("/" + legacy.join("/"));
  if (!page) notFound();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleStructuredData(page))} />
      <LegacyArticle page={page} />
    </>
  );
}
