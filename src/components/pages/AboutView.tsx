import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import AnimatedStatValue from "@/components/ui/AnimatedStatValue";
import ContactCta from "@/components/sections/ContactCta";
import { jsonLdScript } from "@/lib/seo";
import { localizedStats } from "@/lib/localized-site";
import { arClass, localizedBreadcrumb } from "@/lib/page-helpers";
import { aboutContent } from "@/content/pages/about-us";
import { getDictionary } from "@/i18n/dictionaries";
import { isRtl, localeHref, localizeDigitsDeep, type Locale } from "@/i18n/config";
import Num from "@/i18n/Num";

/** Shared body of /about-us and /ar/about-us. */
export default function AboutView({ lang = "en" }: { lang?: Locale }) {
  const c = localizeDigitsDeep(aboutContent[lang], lang);
  const dict = getDictionary(lang);
  const stats = localizedStats(lang);
  const rtl = isRtl(lang);

  return <div>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(localizedBreadcrumb(lang, [{ name: c.breadcrumbHome, path: "/" }, { name: c.breadcrumbName, path: "/about-us" }]))} />

    <section className="relative h-[100svh] min-h-[32rem] overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
      <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" aria-label={c.heroAriaLabel}>
        <source src="/about/about-us-animation.mp4" type="video/mp4" />
      </video>
      <div className={`absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent${arClass(lang, "rtl:bg-gradient-to-l")}`} />
      <div className="container-page relative flex h-full items-end pb-14 pt-32 md:pb-16">
        <div className="w-full">
          <Reveal><p className="eyebrow mb-8 text-paper/65">{c.heroEyebrow}</p></Reveal>
          <Reveal delay={0.05}>
            <h1 className={`max-w-5xl break-words text-[clamp(3rem,13vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.065em]${arClass(lang, "rtl:leading-[1.2]")}`}>{c.heroTitle}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{c.heroSubtitle}</p>
          </Reveal>
          <Reveal delay={0.15}><Link href={localeHref(lang, "/contact")} className="button-pill mt-10 text-paper">{dict.common.requestQuote}</Link></Reveal>
        </div>
      </div>
    </section>

    <section className="container-page section-py">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal><p className="eyebrow text-muted">{c.aboutEyebrow}</p></Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            <span className="block">{c.aboutHeading1}</span>
            <span className="block text-accent">{c.aboutHeading2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}><p className="section-body mx-auto mt-7 max-w-xl">{c.aboutBody}</p></Reveal>
      </div>
    </section>

    <section className="container-page section-py">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="section-heading">{c.missionHeading}</h2>
            <p className="section-body mx-auto mt-6 max-w-xl">{c.missionBody}</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mx-auto mt-14 max-w-2xl border-t border-line pt-14 md:mt-16 md:pt-16">
            <h2 className="section-heading">{c.visionHeading}</h2>
            <p className="section-body mx-auto mt-6 max-w-xl">{c.visionBody}</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="container-page grid gap-10 py-20 md:min-h-[44rem] md:grid-cols-2 md:items-center md:py-0">
      <Reveal><div className="max-w-xl md:py-28"><h2 className={`text-[clamp(4rem,7vw,7rem)] font-medium uppercase leading-[.82] tracking-[-.06em]${arClass(lang, "rtl:leading-[1.2]")}`}>{c.founderFirst}<br /><span className="text-accent">{c.founderLast}</span></h2><blockquote className="mt-12 text-2xl leading-tight tracking-[-.03em] md:text-3xl">{c.founderQuote}</blockquote><p className="section-body mt-10 max-w-lg">{c.founderBio}</p><Link href={localeHref(lang, "/contact")} className="button-pill mt-10 text-ink">{c.founderCta}</Link></div></Reveal>
      <Reveal delay={0.08} className="motion-media relative h-[28rem] self-end sm:h-[34rem] md:h-[42rem]"><Image src="/about/naqi-ejaz-final.png" alt={c.founderAlt} fill sizes="(max-width: 768px) 100vw, 50vw" quality={90} className="object-contain object-bottom" /></Reveal>
    </section>

    <section className="container-page py-12 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-6">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.05} className="flex min-h-40 flex-col items-center justify-center border-b border-line px-4 py-7 text-center even:border-s lg:col-span-1 lg:min-h-44 lg:border-b-0 lg:border-s-0 lg:border-e lg:px-5 lg:py-8 lg:last:border-e-0">
            <p className="text-[clamp(2.5rem,4.5vw,5rem)] leading-none tracking-[-.05em] text-accent"><AnimatedStatValue value={stat.value} locale={lang} /></p>
            <p className="eyebrow mt-5 flex min-h-10 max-w-32 items-start justify-center text-muted">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="container-page grid gap-12 py-16 md:grid-cols-12 md:gap-14 md:py-32">
      <Reveal><p className="eyebrow text-muted md:col-span-2">{c.studioHeading}</p></Reveal>
      <div className="md:col-span-9 md:col-start-4">{c.studioNotes.map(([label, body], index) => <Reveal key={label} delay={index * 0.05}><div className="motion-row grid gap-5 border-t border-line py-9 md:grid-cols-[10rem_1fr]"><p className="eyebrow">{label}</p><p className="max-w-3xl text-xl leading-[1.25] tracking-[-.02em] md:text-2xl">{body}</p></div></Reveal>)}<Link href={localeHref(lang, "/about-us/studio")} className="button-pill mt-8 text-ink">{c.exploreStudio}</Link></div>
    </section>

    <section className="container-page grid gap-14 py-16 md:grid-cols-2 md:gap-16 md:py-32">{[[c.awardsHeading, c.awards], [c.participationsHeading, c.participations]].map(([heading, items]) => <div key={heading as string}><Reveal><p className="eyebrow mb-10 text-muted">{heading as string}</p></Reveal><div className="border-t border-line">{(items as string[]).map((item, index) => <Reveal key={item} delay={index * 0.04}><p className="motion-row border-b border-line py-5 text-sm">{item}</p></Reveal>)}</div></div>)}</section>

    <section className="container-page py-16 md:py-32"><Reveal><p className="eyebrow mb-10 text-muted">{c.timelineHeading}</p></Reveal><div className="border-t border-line">{c.timeline.map(([date, event], index) => <Reveal key={`${date}-${event}`} delay={index * 0.04}><div className="motion-row grid gap-4 border-b border-line py-6 md:grid-cols-[14rem_1fr]"><p className="eyebrow text-muted">{date}</p><p>{event}</p></div></Reveal>)}</div></section>

    <section className="container-page py-16 md:py-32"><Reveal><p className="eyebrow mb-12 text-muted">{c.testimonialsHeading}</p></Reveal><div className="grid gap-x-10 md:grid-cols-2">{c.testimonials.map(([quote, person], index) => <Reveal key={person} delay={index * 0.05}><blockquote className="border-t border-line py-9"><p className="text-xl leading-tight tracking-[-.02em] md:text-2xl">{c.openQuote}{quote}{c.closeQuote}</p><footer className="eyebrow mt-8 text-muted">{person}</footer></blockquote></Reveal>)}</div></section>

    <section className="container-page py-16 md:py-32">
      <Reveal><p className="eyebrow mb-12 text-muted">{c.whatWeDoHeading}</p></Reveal>
      <div className="border-t border-line">{c.services.map(([title, body], index) => <Reveal key={title} delay={Math.min(index * 0.03, 0.15)}><div className="motion-row grid gap-5 border-b border-line py-8 md:grid-cols-[3rem_5fr_6fr] md:items-start"><p className="eyebrow text-muted">{rtl ? <Num value={String(index + 1).padStart(2, "0")} locale={lang} /> : String(index + 1).padStart(2, "0")}</p><h2 className="text-2xl font-medium tracking-[-.035em] md:text-4xl">{title}</h2><p className="section-body max-w-2xl">{body}</p></div></Reveal>)}</div>
    </section>

    <ContactCta lang={lang} dict={dict} />
  </div>;
}
