import Image from "next/image";
import Link from "@/components/ui/Link";

import ContactCta from "@/components/sections/ContactCta";
import FaqSection from "@/components/sections/FaqSection";
import ServicesPreview from "@/components/sections/ServicesPreview";
import AnimatedStatValue from "@/components/ui/AnimatedStatValue";
import Reveal from "@/components/ui/Reveal";
import { regionProjects, regions, type Region } from "@/lib/regions";
import { stats } from "@/lib/site-config";
import { getDictionary } from "@/i18n/dictionaries";
import { comma, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { localizeProject, localizedStats } from "@/lib/localized-site";
import { developmentsAr, deliveredAr, localizeRegion, officesAr, regionUi } from "@/lib/ar/regions.ar";
import { projectCoverAlt } from "@/lib/project-alt";
import { linkedText } from "@/components/ui/LinkedText";

/**
 * "Global offices" is dropped here: it is a company-wide figure that says
 * nothing about the market the page is about, and a sixth item wraps onto a
 * second row in this five-column grid. TeamStats keeps the full set.
 */
const regionStatIndexes = stats.flatMap((stat, index) => (stat.label !== "Global offices" ? [index] : []));

/**
 * Shared template for the country landing pages.
 *
 * These pages previously rendered through the [...legacy] article route, which
 * could only output text blocks - that is why they carried three images and no
 * projects, contact details or CTA. This template leads with the work instead,
 * which is what the studio actually sells.
 */
export default function RegionLanding({ region: englishRegion, lang = "en" }: { region: Region; lang?: Locale }) {
  const ar = lang === "ar";
  const region = localizeRegion(englishRegion, lang);
  const ui = regionUi(lang);
  const dict = getDictionary(lang);
  const href = (path: string) => localeHref(lang, path);
  const projects = regionProjects(englishRegion).map((project) => localizeProject(project, lang));
  const relatedRegions = (englishRegion.relatedRegions ?? [])
    .map((key) => regions[key])
    .filter(Boolean)
    .map((related) => localizeRegion(related, lang));
  const hero = projects[0];
  const localizedStatList = localizedStats(lang);
  const regionStats = regionStatIndexes.map((index) => localizedStatList[index]);
  // Latin-script runs (phone numbers, client names) are isolated in Arabic so
  // a leading "+" or a trailing word never jumps to the wrong side.
  const ltr = (text: string) => (ar ? <bdi dir="ltr">{localizeDigits(text, lang)}</bdi> : text);
  const isolate = (text: string) => (ar ? <bdi>{text}</bdi> : text);

  // Markets differ in depth - six projects in the UAE, two in the US, one in
  // Saudi Arabia. Narrowing the grid for the thin ones fills the row and keeps
  // the images large, instead of leaving dead cells next to a single card.
  const projectColumns =
    projects.length === 1 ? "max-w-xl" : projects.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  // The grid above changes with the number of projects, so the sizes hint has
  // to change with it. Left at a flat 33vw, the two-card US grid and the
  // single Saudi card were being given a source a third of the width they
  // actually render at, which is what made those thumbnails look soft.
  //
  // The cards are 4:3 but the covers are mostly 16:9, so object-cover scales a
  // cover up by 4/3 to fill the card height (plus 5% on hover). The hint is the
  // card width x 1.35: at 33vw a 1920px screen got the 640w file for a card that
  // needs about 790px, which is what made the cards look blurred (16 Nov 2026).
  const projectSizes =
    projects.length === 1
      ? "(max-width: 640px) 135vw, 48rem"
      : projects.length === 2
        ? "(max-width: 640px) 135vw, 68vw"
        : "(max-width: 640px) 135vw, (max-width: 1024px) 68vw, 45vw";

  // Same reasoning for the quotes: the UAE has three, the US one. A lone
  // quote stretched to a readable measure reads as a pull quote; squeezed
  // into a third of the row with two empty cells beside it reads as a bug.
  const testimonialColumns =
    region.testimonials.length === 1
      ? "max-w-3xl"
      : region.testimonials.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      {/* Hero - full-bleed project render, not an article header */}
      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        {hero && (
          <Image
            src={hero.cover}
            alt={projectCoverAlt(hero, lang)}
            fill
            priority
            unoptimized
            quality={90}
            sizes="(max-width: 640px) 400vw, (max-width: 900px) 250vw, 100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
          <Reveal>
            <p className="eyebrow mb-8 text-paper/65">/ {region.city}{comma(lang)}{region.name}</p>
          </Reveal>
          <Reveal delay={0.05}>
            {/* Every country page uses one heading size; the H1s are short enough for two lines on a desktop. */}
            <h1 className={`max-w-6xl text-balance break-words font-medium uppercase ${
              ar ? "text-[clamp(2rem,6vw,4rem)] leading-[1.2]" : "text-[clamp(2.1rem,6.5vw,5rem)] leading-[.9] tracking-[-.05em]"
            }`}>
              {region.h1}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{region.intro}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link href={href("/contact")} className="button-pill mt-10 text-paper">{dict.common.requestQuote}</Link>
          </Reveal>
        </div>
      </section>

      {/* Local proof bar - buyer must know within seconds that we are here */}
      <section className="border-b border-line bg-paper">
        <div className="container-page grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4 md:py-12">
          <Reveal>
            <p className="eyebrow text-muted">{ui.office}</p>
            <p className="mt-3 text-sm">{region.office.city}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="eyebrow text-muted">{ui.directLine}</p>
            <a href={`tel:${region.office.phone.replace(/\s/g, "")}`} className="mt-3 block text-sm hover:text-accent">
              {ltr(region.office.phone)}
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow text-muted">{ui.quotedIn}</p>
            <p className="mt-3 text-sm">{region.currency}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="eyebrow text-muted">{ui.projectsHere}</p>
            <p className="mt-3 text-sm">{ar ? deliveredAr(projects.length) : <>{projects.length} delivered</>}</p>
          </Reveal>
        </div>
      </section>

      {/* Market positioning */}
      <section className="container-page py-16 md:py-28">
        <Reveal><p className="eyebrow mb-10 text-muted">{ui.marketHeading[0]}{region.name}{ui.marketHeading[1]}</p></Reveal>
        {/* H2 / H3 from Deliverable 5's heading plan; a region without them keeps the plain copy. */}
        {region.marketHeading && (
          <Reveal delay={0.05}>
            <h2 className="mb-8 max-w-4xl text-2xl leading-tight tracking-[-.03em] md:text-4xl">{region.marketHeading}</h2>
          </Reveal>
        )}
        <Reveal delay={0.05}>
          {/* The market copy carries a `[words](/services/3d-visualization)` link to the core service
              page within the page's first 300 words (Deliverable 5, tier 1 interlinking). */}
          <p className="section-body max-w-4xl text-xl leading-snug md:text-2xl">{linkedText(region.marketCopy, lang)}</p>
        </Reveal>
        {region.localHeading && (
          <Reveal delay={0.1}>
            <div className="mt-10 max-w-3xl border-t border-line pt-6">
              <h3 className="text-lg md:text-xl">{region.localHeading.heading}</h3>
              <p className="section-body mt-3">{region.localHeading.body}</p>
            </div>
          </Reveal>
        )}
        {/* A hub page (the Middle East) links down to the country pages it covers. */}
        {relatedRegions.length > 0 && (
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-3">
              {relatedRegions.map((related) => (
                <Link key={related.path} href={href(related.path)} className="button-pill text-ink">{related.label}</Link>
              ))}
            </div>
          </Reveal>
        )}
      </section>

      {/* City hub (USA): one subheading per city US searchers name, so a city
          query matches this page rather than the home page. */}
      {region.cityHub && (
        <section className="container-page pb-16 md:pb-28" aria-labelledby="region-city-hub-heading">
          <Reveal>
            <h2 id="region-city-hub-heading" className="max-w-4xl text-2xl leading-tight tracking-[-.03em] md:text-4xl">
              {region.cityHub.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="section-body mt-6 max-w-3xl">{region.cityHub.body}</p>
          </Reveal>
          <div className="mt-12 grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
            {region.cityHub.cities.map((city, index) => (
              <Reveal key={city.city} delay={(index % 3) * 0.05}>
                <div className="border-t border-line pt-5">
                  <h3 className="text-lg">{city.heading}</h3>
                  <p className="section-body mt-2 text-sm">{city.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <Link href={href("/contact")} className="button-pill mt-12 text-ink">{dict.common.requestQuote}</Link>
          </Reveal>
        </section>
      )}

      {/* Projects - the section that actually sells */}
      {projects.length > 0 && (
        <section className="container-page pb-16 md:pb-28" aria-labelledby="region-projects-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="region-projects-heading" className="eyebrow text-muted">
              {region.headings?.projects ? `/ ${region.headings.projects}` : <>{ui.projectsHeading[0]}{region.name}{ui.projectsHeading[1]}</>}
            </h2>
            <p className="eyebrow text-accent">
              {ar ? developmentsAr(projects.length) : <>{projects.length} {projects.length === 1 ? "development" : "developments"}</>}
            </p>
          </div>
          <div className={`grid gap-6 ${projectColumns}`}>
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={(index % 3) * 0.05}>
                <Link href={href(`/projects/${project.slug}`)} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                    <Image
                      src={project.cover}
                      alt={projectCoverAlt(project, lang)}
                      fill
                      quality={85}
                      sizes={projectSizes}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="eyebrow mt-4 text-muted">{project.location}</p>
                  <h3 className="mt-2 text-xl tracking-[-.025em]">{project.title}</h3>
                  <p className="section-body mt-2 text-sm">{project.summary}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Services - the same scroll-driven numbered showcase the homepage
          uses, so the region pages read as part of the same site. It renders
          its own heading and links straight into each service page. */}
      <ServicesPreview lang={lang} dict={dict} heading={ui.servicesHeading} />

      {/* Stats - same treatment as the studio block on the homepage:
          accent-coloured, count-up values with the label beneath. */}
      <section className="container-page mx-auto max-w-7xl py-4 md:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5">
          {regionStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 0.08}
              className="group flex min-h-40 flex-col items-center justify-center border-b border-line px-4 py-7 text-center transition-colors duration-300 even:border-s lg:col-span-1 lg:min-h-44 lg:border-b-0 lg:border-s-0 lg:border-e lg:px-5 lg:py-8 lg:last:border-e-0"
            >
              <p className="text-[clamp(2.5rem,4.5vw,5rem)] leading-none tracking-[-0.05em] text-accent">
                <AnimatedStatValue value={stat.value} locale={lang} />
              </p>
              <p className="eyebrow mt-5 flex min-h-10 max-w-32 items-start justify-center text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why clients here choose us */}
      <section className="container-page py-16 md:py-28" aria-labelledby="region-why-heading">
        <Reveal>
          <h2 id="region-why-heading" className="eyebrow mb-10 text-muted">
            {region.headings?.why ? `/ ${region.headings.why}` : <>{ui.whyHeading[0]}{region.name}{ui.whyHeading[1]}</>}
          </h2>
        </Reveal>
        <div className="grid gap-x-10 gap-y-9 md:grid-cols-2 lg:grid-cols-3">
          {region.reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={(index % 3) * 0.05}>
              <div className="border-t border-line pt-5">
                <h3 className="text-lg">{reason.title}</h3>
                <p className="section-body mt-2 text-sm">{reason.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Working practice + key facts on one dark band. The facts are written
          as self-contained sentences so AI answer engines can quote them. */}
      <section className="relative overflow-hidden bg-ink py-16 text-paper md:py-24">
        <div className="container-page relative">
          {region.compliance && region.compliance.length > 0 && (
            <>
              <Reveal><p className="eyebrow mb-10 text-paper/55">{ui.workingHeading[0]}{region.name}{ui.workingHeading[1]}</p></Reveal>
              <div className="grid gap-x-10 gap-y-5 md:grid-cols-3">
                {region.compliance.map((item) => (
                  <p key={item} className="border-t border-paper/25 pt-5 text-sm">{item}</p>
                ))}
              </div>
            </>
          )}
          <Reveal>
            <p className="eyebrow mb-10 mt-16 text-paper/55">{ui.keyFacts}</p>
          </Reveal>
          <div className="grid gap-x-10 gap-y-5 md:grid-cols-2">
            {region.keyFacts.map((fact) => (
              <p key={fact} className="border-t border-paper/25 pt-5 text-sm text-paper/85">{fact}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - the same editorial blockquote treatment as /about-us:
          rule above, large quote, eyebrow attribution. The old page used a
          slider, which hid two of the three quotes behind arrows; stacking
          them means all three are visible and crawlable. */}
      {region.testimonials.length > 0 && (
        <section className="container-page py-16 md:py-32" aria-labelledby="region-testimonials-heading">
          <Reveal>
            <h2 id="region-testimonials-heading" className="eyebrow mb-12 text-muted">
              {ui.testimonialsHeading[0]}{region.name}{ui.testimonialsHeading[1]}
            </h2>
          </Reveal>
          <div className={`grid gap-x-10 ${testimonialColumns}`}>
            {region.testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.name} delay={(index % 2) * 0.05}>
                <blockquote className="border-t border-line py-9">
                  <p className="text-xl leading-tight tracking-[-.02em] md:text-2xl">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <footer className="eyebrow mt-8 text-muted">
                    {isolate(testimonial.name)} - {testimonial.city}
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Verified Google Business Profile locations.
          These are on the page because the LocalBusiness markup carries their
          addresses, and Google expects marked-up detail to be visible to a
          reader too. It is also the crawlable text that ties each city we
          already rank for to a real address. */}
      {region.locations.length > 0 && (
        <section className="container-page py-16 md:py-28" aria-labelledby="region-locations-heading">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="region-locations-heading" className="eyebrow text-muted">{ui.locationsHeading[0]}{region.name}{ui.locationsHeading[1]}</h2>
            <p className="eyebrow text-accent">
              {ar ? officesAr(region.locations.length) : <>{region.locations.length} {region.locations.length === 1 ? "office" : "offices"}</>}
            </p>
          </div>
          <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {region.locations.map((location, index) => (
              <Reveal key={`${location.city}-${location.streetAddress}`} delay={(index % 3) * 0.05}>
                <div className="border-t border-line pt-5">
                  <h3 className="text-lg">
                    {location.city}
                    {location.area ? `${comma(lang)}${location.area}` : ""}
                  </h3>
                  <p className="section-body mt-2 text-sm">
                    {location.streetAddress}
                    {location.postalCode ? `${comma(lang)}${location.postalCode}` : ""}
                  </p>
                  <a
                    href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                    className="mt-2 block text-sm transition-colors hover:text-accent"
                  >
                    {ltr(location.phone)}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <FaqSection
        items={region.faqs}
        lang={lang}
        dict={dict}
        heading={region.headings?.faq ?? `${ui.faqHeading[0]}${region.name}${ui.faqHeading[1]}`}
      />

      {/* The site's standard closing CTA - same component every other page uses */}
      <ContactCta lang={lang} dict={dict} />
    </>
  );
}
