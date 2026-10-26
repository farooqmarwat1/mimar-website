import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export default function StudioIntro({ lang = "en", dict = getDictionary(lang) }: { lang?: Locale; dict?: Dictionary }) {
  const c = dict.studioIntro;
  return (
    <section className="container-page section-py">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            <span className="block">{c.heading1}</span>
            <span className="block text-accent">{c.heading2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-7 max-w-xl">{c.body}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href={localeHref(lang, "/services")} className="button-pill mt-9 text-ink">
            {c.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
