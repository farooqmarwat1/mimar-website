import Link from "next/link";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { blogArchiveArticles, blogPageCount, getBlogArchivePage } from "@/lib/blog-archive";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";

function pageHref(page: number) {
  return page === 1 ? "/blog" : "/blog/" + page;
}

export default function BlogArchiveView({ page }: { page: number }) {
  const articles = getBlogArchivePage(page);
  const currentPath = pageHref(page);

  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            ...(page === 1 ? [] : [{ name: "Page " + page, path: currentPath }]),
          ]),
          itemListJsonLd("Mimar Studios latest blogs", articles.map((article) => ({ name: article.title, path: article.path }))),
        ])}
      />

      <header className="container-page">
        <p className="eyebrow mb-6 text-muted">/ Mimar Journal</p>
        <h1 className="index-heading">Our <span className="text-accent">Blog</span></h1>
        <p className="section-body mt-8 max-w-2xl">
          Discover where design meets innovation: Your ultimate blog for everything real estate, architecture, and cutting-edge technology.
        </p>
      </header>

      <section className="container-page mt-20" aria-labelledby="blog-categories-heading">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="blog-categories-heading" className="section-heading">Categories</h2>
          <p className="eyebrow hidden text-muted sm:block">Explore by topic</p>
        </div>
        <BlogCategoryLinks cards />
      </section>

      <section className="container-page mt-24" aria-labelledby="latest-blogs-heading">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-t border-line pt-8">
          <div>
            <p className="eyebrow mb-3 text-muted">/ {blogArchiveArticles.length} articles</p>
            <h2 id="latest-blogs-heading" className="section-heading">Latest Blogs</h2>
          </div>
          <span className="eyebrow text-muted">Page {page} of {blogPageCount}</span>
        </div>
        <BlogArticleList articles={articles} />

        <nav aria-label="Blog pages" className="mt-16 flex flex-wrap items-center justify-center gap-2 border-t border-line pt-8">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="button-pill text-ink">← Previous</Link>
          )}
          {Array.from({ length: blogPageCount }, (_, index) => index + 1).map((number) => (
            <Link
              key={number}
              href={pageHref(number)}
              aria-current={number === page ? "page" : undefined}
              className="flex size-11 items-center justify-center rounded-full border border-line text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {number}
            </Link>
          ))}
          {page < blogPageCount && (
            <Link href={pageHref(page + 1)} className="button-pill text-ink">Next →</Link>
          )}
        </nav>
      </section>
    </div>
  );
}
