import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { legacySeoPages, blogCategories } from "@/lib/legacy-seo";

export const metadata: Metadata = buildMetadata({
  title: "Insights & Guides | Mimar Studios",
  description:
    "Guides on 3D visualization, architectural rendering, VR/AR in real estate and proptech from the Mimar Studios team.",
  path: "/blog",
  keywords: ["architectural visualization blog", "3D rendering guides", "VR real estate", "proptech"],
});

const articles = [...legacySeoPages].sort((a, b) => (a.modified < b.modified ? 1 : -1));

export default function BlogIndexPage() {
  return (
    <div className="pt-32 pb-24 md:pt-40 md:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Insights", path: "/blog" }]),
          itemListJsonLd("Mimar Studios insights", articles.map((a) => ({ name: a.title, path: a.path }))),
        ])}
      />

      <div className="container-page">
        <Reveal>
          <p className="eyebrow text-muted mb-6">/ Insights</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="index-heading">
            <span className="block">All</span>
            <span className="block text-accent">Insights</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-8 max-w-xl">
            Guides and field notes on 3D visualization, architectural rendering, VR/AR in real estate and proptech.
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 flex flex-wrap gap-3">
            {blogCategories.map((category) => (
              <Link key={category.slug} href={`/blog/${category.slug}`} className="button-pill text-ink">
                {category.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="container-page mt-16 border-t border-line">
        {articles.map((article, index) => (
          <Reveal key={article.path} delay={Math.min(index * 0.02, 0.15)}>
            <Link
              href={article.path}
              className="motion-row group flex flex-col gap-2 border-b border-line py-8 md:flex-row md:items-center md:gap-10"
            >
              <span className="eyebrow text-muted w-16 shrink-0">{String(index + 1).padStart(2, "0")}</span>
              <span className="flex-1 text-xl tracking-tight transition-opacity group-hover:opacity-60 md:text-2xl">
                {article.title}
              </span>
              <span className="section-body max-w-md">{article.description}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
