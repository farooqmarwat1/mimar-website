import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArchiveView from "@/components/blog/BlogArchiveView";
import BlogCategoryView from "@/components/blog/BlogCategoryView";
import LegacyArticle from "@/components/legacy/LegacyArticle";
import { jsonLdScript } from "@/lib/seo";
import { blogCategories } from "@/lib/legacy-seo";
import { blogMetaAr, localizeBlogCategory } from "@/lib/ar/blog-ui";
import { buildMetadata } from "@/lib/seo";
import { getArchivePage, getArchivePageCount, getBlogArticle, getBlogSlugs, getCategoryList } from "@/lib/blog-store";
import { articleStructuredData, blogMetadata } from "@/lib/blog-seo";

// Arabic mirror of /blog/[category]: category listings, archive pagination
// (/ar/blog/2) and the Arabic version of every one-segment article
// (/ar/blog/3d-rendering). An article appears here once it has an Arabic
// version (the generator and the editor create it automatically); any other
// slug is a real HTTP 404 inside the Arabic layout.
export const dynamicParams = true;

// Admin edits refresh this immediately; hourly is the safety net.
export const revalidate = 3600;

export async function generateStaticParams() {
  const [pageCount, slugs] = await Promise.all([getArchivePageCount("ar"), getBlogSlugs("ar")]);
  const archivePages = Array.from({ length: Math.max(pageCount - 1, 0) }, (_, index) => String(index + 2));
  return [...blogCategories.map((category) => category.slug), ...slugs, ...archivePages].map((category) => ({ category }));
}

async function archivePageOf(slug: string): Promise<number | undefined> {
  const page = Number(slug);
  return String(page) === slug && page >= 2 && (await getArchivePage(page, "ar")).length > 0 ? page : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const archivePage = await archivePageOf(slug);
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

  const page = await getBlogArticle("/blog/" + slug, "ar");
  return page ? blogMetadata(page) : {};
}

export default async function ArabicBlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;

  const archivePage = await archivePageOf(slug);
  if (archivePage) return <BlogArchiveView page={archivePage} lang="ar" />;

  const category = blogCategories.find((c) => c.slug === slug);
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
        articles={await getCategoryList(slug, "ar")}
      />
    );
  }

  const page = await getBlogArticle("/blog/" + slug, "ar");
  if (!page) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleStructuredData(page))} />
      <LegacyArticle page={page} lang="ar" />
    </>
  );
}
