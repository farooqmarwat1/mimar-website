import Link from "next/link";
import { BlogArticleList, BlogCategoryLinks } from "@/components/blog/BlogCatalog";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { localeHref, type Locale } from "@/i18n/config";
import { articleCountAr, blogUi, categoryViewUi } from "@/lib/ar/blog-ui";

/**
 * Category listing used by the Arabic category pages (/ar/blog/<category> and
 * /ar/category/<slug>). The English pages keep their own inline markup; this
 * mirrors it with locale-aware links, breadcrumbs and copy.
 */
export default function BlogCategoryView({
  lang,
  label,
  headingLead,
  headingAccent,
  intro,
  path,
  currentSlug,
  articles,
}: {
  lang: Locale;
  label: string;
  headingLead: string;
  headingAccent: string;
  intro: string;
  /** English path of this page, e.g. "/blog/architecture" or "/category/metaverse". */
  path: string;
  /** Pill to mark current; a key that matches no pill leaves all unmarked. */
  currentSlug: string;
  articles: { path: string; title: string }[];
}) {
  const ui = blogUi(lang);
  const view = categoryViewUi[lang];
  const href = (p: string) => localeHref(lang, p);

  return (
    <div className="pb-24 pt-32 md:pb-32 md:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: ui.home, path: href("/") },
            { name: ui.blog, path: href("/blog") },
            { name: label, path: href(path) },
          ]),
          itemListJsonLd(
            view.itemListName(label),
            articles.map((article) => ({ name: article.title, path: href(article.path) })),
          ),
        ])}
      />

      <header className="container-page">
        <p className="eyebrow mb-6 text-muted">
          <Link href={href("/blog")} className="hover:text-accent">{ui.breadcrumbBlog}</Link> / {label}
        </p>
        <h1 className="index-heading">
          <span className="text-ink">{headingLead}</span>{" "}
          <span className="text-accent">{headingAccent}</span>
        </h1>
        <p className="section-body mt-8 max-w-2xl">{intro}</p>
        <div className="mt-10"><BlogCategoryLinks currentSlug={currentSlug} lang={lang} /></div>
      </header>

      <section className="container-page mt-20" aria-labelledby="category-blogs-heading">
        <div className="mb-10 flex items-end justify-between gap-5 border-t border-line pt-8">
          <h2 id="category-blogs-heading" className="section-heading">{view.latestBlogs}</h2>
          <span className="eyebrow text-muted">{lang === "ar" ? articleCountAr(articles.length) : `${articles.length} articles`}</span>
        </div>
        <BlogArticleList articles={articles} lang={lang} />
      </section>
    </div>
  );
}
