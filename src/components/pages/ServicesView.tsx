import Image from "next/image";
import Link from "next/link";
import FaqSection from "@/components/sections/FaqSection";
import ServiceCards from "@/components/sections/ServiceCards";
import Reveal from "@/components/ui/Reveal";
import { itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { mainServiceCards } from "@/lib/service-cards";
import { projects } from "@/lib/site-config";
import { localizeProjects } from "@/lib/localized-site";
import { localizeServiceCards } from "@/lib/localized-services";
import { arClass, localizedBreadcrumb } from "@/lib/page-helpers";
import { servicesContent } from "@/content/pages/services";
import { localeHref, localizeDigitsDeep, type Locale } from "@/i18n/config";

const projectSlugs = ["aark-residences", "amerat-park", "nana-222", "nomi-downtown", "faisal-town-ii", "abuja"];

/** Shared body of /services and /ar/services. */
export default function ServicesView({ lang = "en" }: { lang?: Locale }) {
  const c = localizeDigitsDeep(servicesContent[lang], lang);
  const cards = localizeServiceCards(mainServiceCards, lang);
  const serviceProjects = localizeProjects(
    projectSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter((project) => project !== undefined),
    lang,
  );

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          [
            localizedBreadcrumb(lang, [
              { name: c.home, path: "/" },
              { name: c.breadcrumbName, path: "/services" },
            ]),
            itemListJsonLd(c.itemListName, cards.map((card) => ({ name: card.title, path: localeHref(lang, card.href) }))),
          ],
        )}
      />

      <section className="pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-muted mb-6">{c.eyebrow}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="index-heading">
              <span className="block">{c.heading1}</span>
              <span className="block text-accent">{c.heading2}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-body mt-8 max-w-xl">
              {c.body}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page">
        <ServiceCards cards={cards} lang={lang} />
      </section>

      <section className="py-24 md:py-32">
        <div className="container-page">
          <Reveal><p className="eyebrow mb-8 text-muted">{c.workEyebrow}</p></Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-heading"><span className="block">{c.workHeading1}</span><span className="block text-accent">{c.workHeading2}</span></h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-body mt-8 max-w-2xl">{c.workBody}</p>
          </Reveal>
        </div>

        <div className="mt-16 grid md:grid-cols-2">
          {serviceProjects.map((project, index) => (
            <Reveal key={project.slug} delay={(index % 2) * 0.05}>
              <Link href={localeHref(lang, `/projects/${project.slug}`)} className="group relative block aspect-video overflow-hidden bg-ink/5">
                <Image src={project.cover} alt={lang === "ar" ? `${project.title} من ميمار ستوديوز` : `${project.title} by Mimar Studios`} fill quality={85} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                <div className="absolute bottom-0 start-0 bg-paper px-5 py-4">
                  <p className="text-sm">{project.title}</p>
                  <p className="mt-1 text-xs text-muted">{project.location}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <FaqSection items={c.faqs} lang={lang} />

      <section className="container-page min-h-[34rem] py-24 md:min-h-[40rem] md:py-32">
        <Reveal>
          <h2 className={`max-w-6xl text-[clamp(2.75rem,5.8vw,6rem)] font-medium leading-[.95] tracking-[-.055em]${arClass(lang, "rtl:leading-[1.25]")}`}>
            {c.closingHeading1}
            <br />
            <span className="text-accent">{c.closingHeading2}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Link href={localeHref(lang, "/contact")} className="button-pill mt-14 text-ink">{c.requestQuote}</Link>
        </Reveal>
      </section>
    </div>
  );
}
