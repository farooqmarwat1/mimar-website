import Link from "next/link";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { getArchive, getArchivePage, getArchivePageCount } from "@/lib/blog-store";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { blogUi } from "@/lib/ar/blog-ui";

function pageHref(page: number) {
  return page === 1 ? "/blog" : "/blog/" + page;
}

/**
 * Blog index / archive pages, English and Arabic. Both read the live catalogue
 * (see blog-store.ts); the Arabic list holds the articles that have an Arabic version.
 */
export default async function BlogArchiveView({ page, lang = "en" }: { page: number; lang?: Locale }) {
  const [articles, blogPageCount, archive] = await Promise.all([getArchivePage(page, lang), getArchivePageCount(lang), getArchive(lang)]);
  const currentPath = pageHref(page);
  const ui = blogUi(lang);
  const href = (path: string) => localeHref(lang, path);

  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: ui.home, path: href("/") },
            { name: ui.blog, path: href("/blog") },
            ...(page === 1 ? [] : [{ name: ui.pageWord + " " + page, path: href(currentPath) }]),
          ]),
          itemListJsonLd(ui.itemListArchive, articles.map((article) => ({ name: article.title, path: href(article.path) }))),
        ])}
      />

      <header className="container-page">
        <p className="eyebrow mb-6 text-muted">{ui.journalEyebrow}</p>
        <h1 className="index-heading">{ui.archiveH1Lead}<span className="text-accent">{ui.archiveH1Accent}</span></h1>
        <p className="section-body mt-8 max-w-2xl">{ui.archiveBody}</p>
      </header>

      <section className="container-page mt-20" aria-labelledby="blog-categories-heading">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="blog-categories-heading" className="section-heading">{ui.categoriesHeading}</h2>
          <p className="eyebrow hidden text-muted sm:block">{ui.exploreByTopic}</p>
        </div>
        <BlogCategoryLinks cards lang={lang} />
      </section>

      <section className="container-page mt-24" aria-labelledby="latest-blogs-heading">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5 border-t border-line pt-8">
          <div>
            <p className="eyebrow mb-3 text-muted">{ui.archiveCount[0]}{localizeDigits(archive.length, lang)}{ui.archiveCount[1]}</p>
            <h2 id="latest-blogs-heading" className="section-heading">{ui.latestBlogs}</h2>
          </div>
          <span className="eyebrow text-muted">{ui.pageOf[0]}{localizeDigits(page, lang)}{ui.pageOf[1]}{localizeDigits(blogPageCount, lang)}</span>
        </div>
        <BlogArticleList articles={articles} lang={lang} />

        <nav aria-label={ui.pagesAria} className="mt-16 flex flex-wrap items-center justify-center gap-2 border-t border-line pt-8">
          {page > 1 && (
            <Link href={href(pageHref(page - 1))} className="button-pill text-ink">{ui.previous}</Link>
          )}
          {Array.from({ length: blogPageCount }, (_, index) => index + 1).map((number) => (
            <Link
              key={number}
              href={href(pageHref(number))}
              aria-current={number === page ? "page" : undefined}
              className="flex size-11 items-center justify-center rounded-full border border-line text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {localizeDigits(number, lang)}
            </Link>
          ))}
          {page < blogPageCount && (
            <Link href={href(pageHref(page + 1))} className="button-pill text-ink">{ui.next}</Link>
          )}
        </nav>
      </section>
    </div>
  );
}
