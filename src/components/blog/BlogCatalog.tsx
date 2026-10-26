import Image from "next/image";
import Link from "next/link";
import { blogCategories, type LegacySeoPage } from "@/lib/legacy-seo";
import { isRtl, localeHref, type Locale } from "@/i18n/config";
import Num from "@/i18n/Num";
import { blogUi, localizeBlogCategory } from "@/lib/ar/blog-ui";

export function BlogCategoryLinks({
  currentSlug,
  cards = false,
  lang = "en",
}: {
  currentSlug?: string;
  cards?: boolean;
  lang?: Locale;
}) {
  const ui = blogUi(lang);
  const rtl = isRtl(lang);
  const categories = blogCategories.map((category) => localizeBlogCategory(category, lang));

  if (cards) {
    return (
      <nav aria-label={ui.categoriesAria} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={localeHref(lang, "/blog/" + category.slug)}
            className="group relative flex min-h-56 items-end overflow-hidden rounded-2xl bg-ink text-paper"
          >
            <Image
              src={category.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="relative flex w-full items-end justify-between gap-4 p-6">
              <span className="text-xl font-medium leading-tight tracking-tight md:text-2xl">{category.label}</span>
              <span
                aria-hidden="true"
                className={`text-2xl transition-transform ${rtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
              >
                {rtl ? "↖" : "↗"}
              </span>
            </span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav aria-label={ui.categoriesAria} className="flex flex-wrap gap-3">
      <Link href={localeHref(lang, "/blog")} aria-current={currentSlug ? undefined : "page"} className="button-pill text-ink">{ui.allBlogs}</Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={localeHref(lang, "/blog/" + category.slug)}
          aria-current={currentSlug === category.slug ? "page" : undefined}
          className="button-pill text-ink"
        >
          {category.label}
        </Link>
      ))}
    </nav>
  );
}

export function BlogArticleList({ articles, lang = "en" }: { articles: LegacySeoPage[]; lang?: Locale }) {
  const rtl = isRtl(lang);
  return (
    <ol className="border-t border-line">
      {articles.map((article, index) => (
        <li key={article.path}>
          <Link
            href={localeHref(lang, article.path)}
            className="motion-row group grid grid-cols-[3rem_1fr_2rem] items-center gap-4 border-b border-line py-7 md:grid-cols-[5rem_1fr_2rem] md:gap-8 md:py-9"
          >
            <span aria-hidden="true" className="eyebrow text-muted">
              {rtl ? <Num value={String(index + 1).padStart(2, "0")} locale={lang} /> : String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-xl font-medium leading-tight tracking-tight transition-colors group-hover:text-accent md:text-3xl">
              {article.title}
            </h3>
            <span
              aria-hidden="true"
              className={`text-2xl text-accent transition-transform ${rtl ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"} ${rtl ? "text-end" : ""}`.trimEnd()}
            >
              {rtl ? "↖" : "↗"}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
