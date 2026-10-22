import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { splitInlineLinks } from "@/lib/content-blocks";
import type { SiteArticle } from "@/lib/posts";

// Inline `[label](/path)` links exist only in posts written in /admin. Text with
// none (every migrated article) is returned as the bare string, so its markup is unchanged.
function renderInline(text: string) {
  const parts = splitInlineLinks(text);
  if (parts.length === 1 && !parts[0].href) return text;
  return parts.map((part, index) =>
    part.href ? (
      <Link key={index} href={part.href} className="text-accent underline underline-offset-4 hover:no-underline">
        {part.text}
      </Link>
    ) : (
      part.text
    ),
  );
}

/**
 * Shared article template for preserved legacy content, used by both the
 * root [...legacy] catch-all and /blog/[category] (which needs to render an
 * individual article whenever the segment isn't one of the known category
 * slugs - see that route for why).
 */
export default function LegacyArticle({ page }: { page: SiteArticle }) {
  return (
    <article className="pb-24 pt-32 md:pb-32 md:pt-40">
      <header className="container-page">
        <Reveal><p className="eyebrow text-accent">/ Mimar insights</p></Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-8 max-w-6xl text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[.88] tracking-[-.06em]">{page.title}</h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mt-10 max-w-3xl text-xl md:text-2xl">{page.description}</p>
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
          <p className="eyebrow text-muted">Published by Mimar Studios</p>
          {page.keywords.length > 0 && <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{page.keywords.join(" · ")}</p>}
        </aside>
        <div className="max-w-3xl">
          {page.blocks.map((block, index) => {
            if (block.type === "h2") return <h2 key={`${block.text}-${index}`} className="mb-6 mt-14 text-3xl font-medium leading-tight tracking-[-.035em] first:mt-0 md:text-4xl">{renderInline(block.text)}</h2>;
            if (block.type === "h3") return <h3 key={`${block.text}-${index}`} className="mb-4 mt-10 text-2xl font-medium leading-tight tracking-[-.025em]">{renderInline(block.text)}</h3>;
            if (block.type === "li") return <p key={`${block.text}-${index}`} className="section-body ml-5 mt-3 before:-ml-5 before:mr-3 before:text-accent before:content-['•']">{renderInline(block.text)}</p>;
            return <p key={`${block.text}-${index}`} className="section-body mt-6">{renderInline(block.text)}</p>;
          })}
          {page.faq && (
            <section aria-labelledby="article-faq-heading" className="mt-16">
              <h2 id="article-faq-heading" className="mb-6 text-3xl font-medium leading-tight tracking-[-.035em] md:text-4xl">Frequently asked questions</h2>
              <dl>
                {page.faq.map((item) => (
                  <div key={item.question} className="border-t border-line py-6">
                    <dt className="text-xl font-medium tracking-tight">{item.question}</dt>
                    <dd className="section-body mt-3">{renderInline(item.answer)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
          {page.related && (
            <section aria-labelledby="article-related-heading" className="mt-16">
              <h2 id="article-related-heading" className="eyebrow mb-4 text-muted">Related reading</h2>
              <ul className="border-t border-line">
                {page.related.map((item) => (
                  <li key={item.path} className="border-b border-line">
                    <Link href={item.path} className="flex items-center justify-between gap-4 py-4 text-lg hover:text-accent">
                      {item.label}
                      <span aria-hidden="true" className="text-accent">↗</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {page.sources && (
            <section aria-labelledby="article-sources-heading" className="mt-16">
              <h2 id="article-sources-heading" className="eyebrow mb-4 text-muted">Sources</h2>
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
          <Link href="/contact" className="button-pill mt-14 text-ink">Discuss a project</Link>
        </div>
      </div>
    </article>
  );
}
