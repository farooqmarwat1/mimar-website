import Image from "next/image";
import Link from "next/link";
import ContactCta from "@/components/sections/ContactCta";
import { jsonLdScript } from "@/lib/seo";
import { arClass, externalArrow, localizedBreadcrumb } from "@/lib/page-helpers";
import { edtechContent, metaContent } from "@/content/pages/meta";
import { getDictionary } from "@/i18n/dictionaries";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import Num from "@/i18n/Num";

const numLabel = (lang: Locale, index: number) =>
  isRtl(lang) ? <Num value={String(index + 1).padStart(2, "0")} locale={lang} /> : String(index + 1).padStart(2, "0");

/** Shared body of /meta and /ar/meta. */
export function MetaView({ lang = "en" }: { lang?: Locale }) {
  const c = metaContent[lang];
  const dict = getDictionary(lang);
  const arrow = externalArrow(lang);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [
          { name: c.home, path: "/" },
          { name: c.breadcrumbName, path: "/meta" },
        ]))}
      />

      <header className="relative isolate flex min-h-[42rem] items-end overflow-hidden bg-ink text-paper md:min-h-[48rem]">
        <Image
          src="/hero/meta.webp"
          alt={c.heroAlt}
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-[65%_center]"
        />
        <div className={`absolute inset-0 z-10 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/10${arClass(lang, "rtl:bg-gradient-to-l")}`} />
        <div className="container-page relative z-20 w-full pb-16 pt-36 md:pb-24 md:pt-44">
          <p className="eyebrow text-paper/70">{c.heroEyebrow}</p>
          <h1 className="index-heading mt-8 max-w-5xl">
            {c.heroLines[0]}<br />{c.heroLines[1]}<br /><span className="text-accent">{c.heroAccent}</span>
          </h1>
          <p className="mt-9 max-w-xl text-lg leading-relaxed text-paper/85 md:text-xl">
            {c.heroBody}
          </p>
          <Link href="#capabilities" className="button-pill mt-10 text-paper">{c.heroCta}</Link>
        </div>
      </header>

      <section id="capabilities" className="container-page py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] md:gap-16">
          <p className="eyebrow text-muted">{c.capEyebrow}</p>
          <div>
            <h2 className="section-heading">{c.capPre}<span className="text-accent">{c.capAccent}</span></h2>
            <p className="section-body mt-6 max-w-2xl">{c.capBody}</p>
          </div>
        </div>
        <div className="mt-12 border-t border-line">
          {c.capabilities.map((capability, index) => (
            <article key={capability.title} className="motion-row grid gap-5 border-b border-line py-8 md:grid-cols-[4rem_minmax(0,0.8fr)_minmax(0,1fr)] md:gap-10 md:py-10">
              <p className="eyebrow text-accent">{numLabel(lang, index)}</p>
              <h3 className="text-2xl font-medium uppercase tracking-[-.035em] md:text-3xl">{capability.title}</h3>
              <div>
                <p className="section-body max-w-xl">{capability.description}</p>
                {capability.href && (
                  <Link href={localeHref(lang, capability.href)} className="eyebrow mt-6 inline-block border-b border-ink pb-2 transition-colors hover:border-accent hover:text-accent">
                    {capability.linkLabel}{` ${arrow}`}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page border-y border-line py-20 md:py-28">
        <p className="eyebrow text-muted">{c.portfolioEyebrow}</p>
        <div className="mt-7 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end md:gap-16">
          <h2 className="section-heading max-w-2xl">{c.portfolioPre}<span className="text-accent">{c.portfolioAccent}</span></h2>
          <p className="section-body max-w-xl">{c.portfolioBody}</p>
        </div>
        <ul className="mt-12 flex flex-wrap gap-3" aria-label={c.portfolioAreasLabel}>
          {c.portfolioAreas.map((area) => <li key={area} className="eyebrow rounded-full border border-line px-5 py-4">{localizeDigits(area, lang)}</li>)}
        </ul>
        <Link href={localeHref(lang, "/projects")} className="button-pill mt-10 text-ink">{c.portfolioCta}</Link>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page py-20 md:py-28">
          <p className="eyebrow text-muted-inverse">{c.whyEyebrow}</p>
          <h2 className="section-heading mt-7">{c.whyPre}<span className="text-accent">{c.whyAccent}</span></h2>
          <div className="mt-12 grid gap-x-12 md:grid-cols-2">
            {c.reasons.map((reason, index) => (
              <article key={reason.title} className="border-t border-line-inverse py-8 md:py-10">
                <p className="eyebrow text-accent">{numLabel(lang, index)}</p>
                <h3 className="mt-6 text-2xl font-medium tracking-[-.03em] md:text-3xl">{reason.title}</h3>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-inverse">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactCta lang={lang} dict={dict} />
    </div>
  );
}

const experiences = [
  { icon: "/edtech/magnetic-field-of-solenoid-icon.svg", href: "https://mywebar.com/p/Project_4_h3xjhfscnb" },
  { icon: "/edtech/galvanic-cell-icon.svg", href: "https://mywebar.com/p/Project_4_tvdsxbiaob" },
] as const;

/** Shared body of /meta/app/edtech and /ar/meta/app/edtech. */
export function EdTechView({ lang = "en" }: { lang?: Locale }) {
  const c = edtechContent[lang];
  const dict = getDictionary(lang);
  const arrow = externalArrow(lang);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [
          { name: c.home, path: "/" },
          { name: c.xrName, path: "/meta" },
          { name: c.breadcrumbName, path: "/meta/app/edtech" },
        ]))}
      />

      <section className="container-page grid gap-12 pb-20 pt-32 md:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] md:items-end md:gap-16 md:pb-28 md:pt-44">
        <div>
          <p className="eyebrow text-accent">
            <Link href={localeHref(lang, "/meta")} className="hover:text-ink">{c.eyebrowXr}</Link>{c.eyebrowApp}
          </p>
          <h1 className="index-heading mt-8">
            {c.h1Pre}<span className="text-accent">{c.h1Accent}</span>
          </h1>
          <p className="section-body mt-8 max-w-xl text-lg">
            {c.body}
          </p>
          <Link href="#experiences" className="button-pill mt-10 text-ink">{c.cta}</Link>
        </div>
        <figure className="max-w-md md:justify-self-end">
          <div className="relative aspect-square overflow-hidden bg-ink">
            <Image src="/edtech/naqi-ejaz.webp" alt={c.photoAlt} fill priority sizes="(max-width: 768px) 100vw, 28rem" className="object-cover" />
          </div>
          <a href="https://www.linkedin.com/in/naqiejaz/" target="_blank" rel="noopener noreferrer" className="eyebrow mt-5 inline-block border-b border-ink pb-2 transition-colors hover:border-accent hover:text-accent">
            {c.linkedin}{` ${arrow}`}
          </a>
        </figure>
      </section>

      <section id="experiences" className="border-t border-line">
        <div className="container-page py-20 md:py-28">
          <p className="eyebrow text-muted">{c.experiencesEyebrow}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {experiences.map((experience, index) => {
              const title = c.experiences[index];
              return (
                <a
                  key={experience.href}
                  href={experience.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[20rem] flex-col justify-between border border-line p-8 transition-colors hover:border-accent md:p-10"
                >
                  <div className="flex items-start justify-between gap-6">
                    <p className="eyebrow text-accent">{c.experienceLabel}{localizeDigits(index + 1, lang)}</p>
                    <Image src={experience.icon} alt="" width={96} height={104} unoptimized className="h-24 w-auto" />
                  </div>
                  <h2 className="mt-12 text-3xl font-medium uppercase tracking-[-.035em] transition-colors group-hover:text-accent md:text-4xl">
                    {title}{` ${arrow}`}
                  </h2>
                </a>
              );
            })}
          </div>
          <Image src="/edtech/mimar-lab-logo.webp" alt={c.logoAlt} width={303} height={182} className="mt-16 h-20 w-auto" />
        </div>
      </section>

      <ContactCta lang={lang} dict={dict} />
    </div>
  );
}
