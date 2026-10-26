import Link from "next/link";
import ProjectShowcase from "@/components/sections/ProjectShowcase";
import type { Project } from "@/lib/site-config";
import { localizedPortfolioIntro } from "@/lib/localized-site";
import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export default function PortfolioGrid({
  projects,
  lang = "en",
  dict = getDictionary(lang),
}: {
  projects: Project[];
  lang?: Locale;
  dict?: Dictionary;
}) {
  const featured = projects.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      {/* ProjectShowcase owns its own <section> and its vertical spacing -
          it needs the intro and the grid inside ONE overflow-hidden box so
          the scroll-driven columns can rise up into the intro's space. It
          can't be wrapped in an outer padded section without reintroducing
          a clip boundary above the grid. */}
      <ProjectShowcase projects={featured} intro={localizedPortfolioIntro(lang)} lang={lang} dict={dict} />

      {/* Outside the transformed column wrappers, in normal flow below the
          grid's document bottom, and on its own higher stacking level - so
          it can neither be overlapped by a translated card nor painted
          under one.

          The negative top margin closes the dead space the risen columns
          leave behind: the middle column (the lowest-sitting one) travels
          -200px desktop / -80px mobile, so without this the button floated
          that far below the last visible card. The pull is deliberately
          smaller than that travel - by the time the button scrolls into
          view the middle column has already cleared it - so they still
          never collide. No bottom padding: the next section's own top
          padding supplies that gap, keeping one section-sized space rather
          than two stacked. */}
      <div className="container-page relative z-30 -mt-4 flex justify-center md:-mt-16">
        <Link href={localeHref(lang, "/projects")} className="button-pill text-ink">
          {dict.portfolioGrid.cta}
        </Link>
      </div>
    </>
  );
}
