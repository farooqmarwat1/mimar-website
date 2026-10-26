import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogCategoryView from "@/components/blog/BlogCategoryView";
import { legacyCategories, legacyCategoryPath } from "@/lib/legacy-categories";
import { getLegacyCategoryList } from "@/lib/blog-store";
import { buildMetadata } from "@/lib/seo";
import { localizeLegacyCategory } from "@/lib/ar/blog-ui";

// Arabic mirror of the old WordPress category archives kept at /category/{slug}.
export const dynamicParams = false;

// Follows the article store: an article unpublished or deleted in /admin drops out of the list.
export const revalidate = 3600;

export function generateStaticParams() {
  return legacyCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = legacyCategories.find((item) => item.slug === slug);
  if (!category) return {};
  const ar = localizeLegacyCategory(category, "ar");
  return buildMetadata({
    title: ar.seoTitle,
    description: ar.description,
    path: legacyCategoryPath(slug),
    locale: "ar",
  });
}

export default async function ArabicLegacyCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, articles } = await getLegacyCategoryList(slug, "ar");
  if (!category) notFound();
  const ar = localizeLegacyCategory(category, "ar");

  return (
    <BlogCategoryView
      lang="ar"
      label={ar.label}
      headingLead={ar.headingLead}
      headingAccent={ar.headingAccent}
      intro={ar.intro}
      path={legacyCategoryPath(slug)}
      // A key that matches no pill, so neither "All blogs" nor a /blog category is marked current.
      currentSlug={`category/${slug}`}
      articles={articles}
    />
  );
}
