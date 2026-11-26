import Image from "next/image";
import Link from "@/components/ui/Link";
import Reveal from "@/components/ui/Reveal";
import { linkedText } from "@/components/ui/LinkedText";
import Num from "@/i18n/Num";
import { isRtl, localeHref, type Locale } from "@/i18n/config";
import { getDictionary, type Dictionary } from "@/i18n/dictionaries";

/**
 * Home page "How we work" (SEO_MIGRATION.md point 42): the numbered process block of the service
 * pages (ServiceDetailView), with the home page's own heading. It answers the outsourcing search
 * (what to send, what happens next) and carries "photorealistic 3D visualization".
 */
export default function HomeProcess({ lang = "en", dict = getDictionary(lang) }: { lang?: Locale; dict?: Dictionary }) {
  const c = dict.homeProcess;
  const rtl = isRtl(lang);
  return (
    <section className="container-page section-py" aria-labelledby="home-process-heading">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="home-process-heading" className="section-heading mx-auto mt-6">
            <span className="block">{c.heading1}</span>{" "}
            <span className="block text-accent">{c.heading2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-7 max-w-xl">
            {c.lead ? <strong className="font-semibold text-ink">{c.lead}</strong> : null}
            {c.lead ? " " : null}
            {c.intro}
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 grid max-w-7xl gap-10 md:mt-16 md:grid-cols-2 md:gap-12">
        <Reveal>
          <div className="relative aspect-[1.1] overflow-hidden bg-ink/5">
            <Image
              src="/services/3d-rendering/process.webp"
              alt={c.imageAlt}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <div>
          {c.steps.map(([step, description], index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <Reveal key={step} delay={index * 0.05}>
                <div className="grid grid-cols-[4rem_1fr] gap-3 border-t border-line py-7">
                  <p className="text-4xl font-light text-accent/40">{rtl ? <Num value={number} locale={lang} /> : number}</p>
                  <div>
                    <h3 className="text-lg">{step}</h3>
                    <p className="section-body mt-2 text-sm">{linkedText(description, lang)}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
          <Reveal delay={0.3}>
            <Link href={localeHref(lang, "/contact")} className="button-pill mt-6 text-ink">
              {c.cta}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
