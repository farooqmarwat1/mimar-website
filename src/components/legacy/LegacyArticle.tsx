import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { splitInlineLinks } from "@/lib/content-blocks";
import type { SiteArticle } from "@/lib/posts";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { blogUi } from "@/lib/ar/blog-ui";

// Inline `[label](/path)` links exist only in posts written in /admin. Text with
// none (every migrated article) is returned as the bare string, so its markup is unchanged.
function renderInline(text: string, lang: Locale) {
  const parts = splitInlineLinks(text);
  if (parts.length === 1 && !parts[0].href) return text;
  return parts.map((part, index) =>
    part.href ? (
      <Link key={index} href={localeHref(lang, part.href)} className="text-accent underline underline-offset-4 hover:no-underline">
        {part.text}
      </Link>
    ) : (
      part.text
    ),
  );
}

const ARABIC_LETTER = /[؀-ۿ]/;

/**
 * Text for the page language. Arabic gets Eastern digits, and a block with no
 * Arabic letters at all (a product list, a URL, a phone number) is isolated as
 * LTR so a trailing colon or "+" does not jump to the wrong side of it.
 */
function renderText(text: string, lang: Locale) {
  if (lang !== "ar") return renderInline(text, lang);
  const content = renderInline(localizeDigits(text, lang), lang);
  return ARABIC_LETTER.test(text) ? content : <bdi dir="ltr">{content}</bdi>;
}

/**
 * Shared article template for preserved legacy content, used by both the
 * root [...legacy] catch-all and /blog/[category] (which needs to render an
 * individual article whenever the segment isn't one of the known category
 * slugs - see that route for why). `lang="ar"` renders the translated
 * article (/ar/...) with RTL-correct bullets and localized chrome.
 */
export default function LegacyArticle({ page, lang = "en" }: { page: SiteArticle; lang?: Locale }) {
  const ar = lang === "ar";
  const rtl = isRtl(lang);
  const copy = getDictionary(lang).legacyArticle;
  const ui = blogUi(lang);
  const show = (text: string) => (ar ? localizeDigits(text, lang) : text);

  return (
    <article className="pb-24 pt-32 md:pb-32 md:pt-40">
      <header className="container-page">
        <Reveal><p className="eyebrow text-accent">{copy.eyebrow}</p></Reveal>
        <Reveal delay={0.05}>
          <h1
            className={
              ar
                ? "mt-8 max-w-6xl text-[clamp(2.25rem,6vw,5.5rem)] font-medium leading-[1.2]"
                : "mt-8 max-w-6xl text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[.88] tracking-[-.06em]"
            }
          >
            {show(page.title)}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-10 max-w-3xl text-xl md:text-2xl">{show(page.description)}</p>
        </Reveal>
      </header>

      {page.cover && (
        <div className="container-page mt-12 md:mt-16">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-line">
            <Image src={page.cover.url} alt={page.cover.alt} fill priority sizes="(max-width: 1280px) 100vw, 1200px" className="object-cover" />
          </div>
        </div>
      )}

      <div className="container-page mt-16 grid gap-12 md:mt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <aside>
          <p className="eyebrow text-muted">{copy.publishedBy}</p>
          {page.keywords.length > 0 && <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{show(page.keywords.join(" · "))}</p>}
        </aside>
        <div className="max-w-3xl">
          {page.blocks.map((block, index) => {
            if (block.type === "img") {
              return (
                <figure key={`${block.src}-${index}`} className="mt-10 first:mt-0">
                  <Image
                    src={block.src}
                    alt={block.alt}
                    width={block.width ?? 2000}
                    height={block.height ?? 1250}
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="h-auto w-full"
                    priority={index === 0}
                  />
                </figure>
              );
            }
            if (block.type === "video") {
              return (
                <video key={`${block.src}-${index}`} className="mt-10 h-auto w-full" controls playsInline preload="none">
                  <source src={block.src} />
                </video>
              );
            }
            if (block.type === "h2") return <h2 key={`${block.text}-${index}`} className="mb-6 mt-14 text-3xl font-medium leading-tight tracking-[-.035em] first:mt-0 md:text-4xl">{renderText(block.text, lang)}</h2>;
            if (block.type === "h3") return <h3 key={`${block.text}-${index}`} className="mb-4 mt-10 text-2xl font-medium leading-tight tracking-[-.025em]">{renderText(block.text, lang)}</h3>;
            if (block.type === "li") return <p key={`${block.text}-${index}`} className="section-body ms-5 mt-3 before:-ms-5 before:me-3 before:text-accent before:content-['•']">{renderText(block.text, lang)}</p>;
            return <p key={`${block.text}-${index}`} className="section-body mt-6">{renderText(block.text, lang)}</p>;
          })}
          {page.faq && (
            <section aria-labelledby="article-faq-heading" className="mt-16">
              <h2 id="article-faq-heading" className="mb-6 text-3xl font-medium leading-tight tracking-[-.035em] md:text-4xl">{ui.faqHeading}</h2>
              <dl>
                {page.faq.map((item) => (
                  <div key={item.question} className="border-t border-line py-6">
                    <dt className="text-xl font-medium tracking-tight">{show(item.question)}</dt>
                    <dd className="section-body mt-3">{renderText(item.answer, lang)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {page.related && (
            <section aria-labelledby="article-related-heading" className="mt-16">
              <h2 id="article-related-heading" className="eyebrow mb-4 text-muted">{ui.relatedHeading}</h2>
              <ul className="border-t border-line">
                {page.related.map((item) => (
                  <li key={item.path} className="border-b border-line">
                    <Link href={localeHref(lang, item.path)} className="flex items-center justify-between gap-4 py-4 text-lg hover:text-accent">
                      {show(item.label)}
                      <span aria-hidden="true" className="text-accent">{rtl ? "↖" : "↗"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {page.sources && (
            <section aria-labelledby="article-sources-heading" className="mt-16">
              <h2 id="article-sources-heading" className="eyebrow mb-4 text-muted">{ui.sourcesHeading}</h2>
              <ul className="grid gap-2 text-sm text-muted">
                {page.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent hover:underline">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <Link href={localeHref(lang, "/contact")} className="button-pill mt-14 text-ink">{copy.discussProject}</Link>
        </div>
      </div>
    </article>
  );
}
