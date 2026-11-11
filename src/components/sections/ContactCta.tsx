import Link from "@/components/ui/Link";
import Reveal from "@/components/ui/Reveal";
import { localeHref, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

/** Page-specific heading and body for the same block (project pages use it with the project's own line). */
export type ContactCtaContent = { heading1: string; heading2: string; body: string };

export default function ContactCta({
  lang = "en",
  dict = getDictionary(lang),
  content,
}: {
  lang?: Locale;
  dict?: Dictionary;
  content?: ContactCtaContent;
}) {
  const c = { ...dict.contactCta, ...content };
  return (
    <section className="section-py">
      <div className="container-page mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            {c.heading1}
            {" "}<br />
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
