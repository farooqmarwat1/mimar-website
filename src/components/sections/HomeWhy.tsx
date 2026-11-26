import Reveal from "@/components/ui/Reveal";
import { linkedText } from "@/components/ui/LinkedText";
import type { Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

/**
 * Home page "Why Mimar?" (SEO_MIGRATION.md point 42): the region pages' "Why"
 * list (RegionLanding), with the home page's own heading. Every row is a fact the studio stands
 * behind; file formats and the NDA are on the owner checklist.
 */
export default function HomeWhy({ lang = "en", dict = getDictionary(lang) }: { lang?: Locale; dict?: Dictionary }) {
  const c = dict.homeWhy;
  return (
    <section className="container-page section-py" aria-labelledby="home-why-heading">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="home-why-heading" className="section-heading mx-auto mt-6">
            <span className="block">{c.heading1}</span>{" "}
            <span className="block text-accent">{c.heading2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-7 max-w-xl">{c.intro}</p>
        </Reveal>
      </div>
      <div className="mx-auto mt-14 grid max-w-7xl gap-x-10 gap-y-9 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
        {c.reasons.map(([title, body], index) => (
          <Reveal key={title} delay={(index % 3) * 0.05}>
            <div className="border-t border-line pt-5">
              <h3 className="text-lg">{title}</h3>
              <p className="section-body mt-2 text-sm">{linkedText(body, lang)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
