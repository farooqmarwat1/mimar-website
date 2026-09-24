import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { LegacySeoPage } from "@/lib/legacy-seo";

/**
 * Shared article template for preserved legacy content, used by both the
 * root [...legacy] catch-all and /blog/[category] (which needs to render an
 * individual article whenever the segment isn't one of the known category
 * slugs - see that route for why).
 */
export default function LegacyArticle({ page }: { page: LegacySeoPage }) {
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

      <div className="container-page mt-16 grid gap-12 md:mt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
        <aside>
          <p className="eyebrow text-muted">Published by Mimar Studios</p>
          {page.keywords.length > 0 && <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">{page.keywords.join(" · ")}</p>}
        </aside>
        <div className="max-w-3xl">
          {page.blocks.map((block, index) => {
            if (block.type === "h2") return <h2 key={`${block.text}-${index}`} className="mb-6 mt-14 text-3xl font-medium leading-tight tracking-[-.035em] first:mt-0 md:text-4xl">{block.text}</h2>;
            if (block.type === "h3") return <h3 key={`${block.text}-${index}`} className="mb-4 mt-10 text-2xl font-medium leading-tight tracking-[-.025em]">{block.text}</h3>;
            if (block.type === "li") return <p key={`${block.text}-${index}`} className="section-body ml-5 mt-3 before:-ml-5 before:mr-3 before:text-accent before:content-['•']">{block.text}</p>;
            return <p key={`${block.text}-${index}`} className="section-body mt-6">{block.text}</p>;
          })}
          <Link href="/contact" className="button-pill mt-14 text-ink">Discuss a project</Link>
        </div>
      </div>
    </article>
  );
}
