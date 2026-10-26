import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

export default function ContactCta({ lang = "en", dict = getDictionary(lang) }: { lang?: Locale; dict?: Dictionary }) {
  const c = dict.contactCta;
  return (
    <section className="section-py">
      <div className="container-page mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            {c.heading1}
            <br />
            <span className="text-accent">{c.heading2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-6 max-w-md">{c.body}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href={localeHref(lang, "/contact")} className="button-pill mt-9 text-ink">
            {c.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
