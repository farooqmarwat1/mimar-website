import Image from "next/image";
import Link from "next/link";

import ContactCta from "@/components/sections/ContactCta";
import FaqSection from "@/components/sections/FaqSection";
import ServicesPreview from "@/components/sections/ServicesPreview";
import AnimatedStatValue from "@/components/ui/AnimatedStatValue";
import Reveal from "@/components/ui/Reveal";
import { regionProjects, type Region } from "@/lib/regions";
import { stats } from "@/lib/site-config";

/**
 * "Global offices" is dropped here: it is a company-wide figure that says
 * nothing about the market the page is about, and a sixth item wraps onto a
 * second row in this five-column grid. TeamStats keeps the full set.
 */
const regionStats = stats.filter((stat) => stat.label !== "Global offices");

/**
 * Shared template for the country landing pages.
 *
 * These pages previously rendered through the [...legacy] article route, which
 * could only output text blocks - that is why they carried three images and no
 * projects, contact details or CTA. This template leads with the work instead,
 * which is what the studio actually sells.
 */
export default function RegionLanding({ region }: { region: Region }) {
  const projects = regionProjects(region);
  const hero = projects[0];

  // Markets differ in depth - six projects in the UAE, two in the US, one in
  // Saudi Arabia. Narrowing the grid for the thin ones fills the row and keeps
  // the images large, instead of leaving dead cells next to a single card.
  const projectColumns =
    projects.length === 1 ? "max-w-xl" : projects.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  // The grid above changes with the number of projects, so the sizes hint has
  // to change with it. Left at a flat 33vw, the two-card US grid and the
  // single Saudi card were being given a source a third of the width they
  // actually render at, which is what made those thumbnails look soft.
  const projectSizes =
    projects.length === 1
      ? "(max-width: 640px) 100vw, 36rem"
      : projects.length === 2
        ? "(max-width: 640px) 100vw, 50vw"
        : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

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
            alt=""
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
            <p className="eyebrow mb-8 text-paper/65">/ {region.city}, {region.name}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-5xl break-words text-[clamp(3rem,13vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.065em]">
              {region.h1}
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{region.intro}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link href="/contact" className="button-pill mt-10 text-paper">Request a quote</Link>
          </Reveal>
        </div>
      </section>

      {/* Local proof bar - buyer must know within seconds that we are here */}
      <section className="border-b border-line bg-paper">
        <div className="container-page grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4 md:py-12">
          <Reveal>
            <p className="eyebrow text-muted">/ Office</p>
            <p className="mt-3 text-sm">{region.office.city}</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="eyebrow text-muted">/ Direct line</p>
            <a href={`tel:${region.office.phone.replace(/\s/g, "")}`} className="mt-3 block text-sm hover:text-accent">
              {region.office.phone}
            </a>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow text-muted">/ Quoted in</p>
            <p className="mt-3 text-sm">{region.currency}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="eyebrow text-muted">/ Projects here</p>
            <p className="mt-3 text-sm">{projects.length} delivered</p>
          </Reveal>
        </div>
      </section>

      {/* Market positioning */}
      <section className="container-page py-16 md:py-28">
        <Reveal><p className="eyebrow mb-10 text-muted">/ {region.name} market</p></Reveal>
        <Reveal delay={0.05}>
          <p className="section-body max-w-4xl text-xl leading-snug md:text-2xl">{region.marketCopy}</p>
        </Reveal>
      </section>

      {/* Projects - the section that actually sells */}
      {projects.length > 0 && (
        <section className="container-page pb-16 md:pb-28" aria-labelledby="region-projects-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="region-projects-heading" className="eyebrow text-muted">/ Projects in {region.name}</h2>
            <p className="eyebrow text-accent">
              {projects.length} {projects.length === 1 ? "development" : "developments"}
            </p>
          </div>
          <div className={`grid gap-6 ${projectColumns}`}>
            {projects.map((project, index) => (
              <Reveal key={project.slug} delay={(index % 3) * 0.05}>
                <Link href={`/projects/${project.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-ink/5">
                    <Image
                      src={project.cover}
                      alt={`${project.title} - ${project.category} by Mimar Studios in ${project.location}`}
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
      <ServicesPreview />

      {/* Stats - same treatment as the studio block on the homepage:
          accent-coloured, count-up values with the label beneath. */}
      <section className="container-page mx-auto max-w-7xl py-4 md:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-5">
          {regionStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 0.08}
              className="group flex min-h-40 flex-col items-center justify-center border-b border-line px-4 py-7 text-center transition-colors duration-300 even:border-l lg:col-span-1 lg:min-h-44 lg:border-b-0 lg:border-l-0 lg:border-r lg:px-5 lg:py-8 lg:last:border-r-0"
            >
              <p className="text-[clamp(2.5rem,4.5vw,5rem)] leading-none tracking-[-0.05em] text-accent">
                <AnimatedStatValue value={stat.value} />
              </p>
              <p className="eyebrow mt-5 flex min-h-10 max-w-32 items-start justify-center text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why clients here choose us */}
      <section className="container-page py-16 md:py-28" aria-labelledby="region-why-heading">
        <Reveal>
          <h2 id="region-why-heading" className="eyebrow mb-10 text-muted">/ Why {region.name} clients choose Mimar</h2>
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
              <Reveal><p className="eyebrow mb-10 text-paper/55">/ Working in {region.name}</p></Reveal>
              <div className="grid gap-x-10 gap-y-5 md:grid-cols-3">
                {region.compliance.map((item) => (
                  <p key={item} className="border-t border-paper/25 pt-5 text-sm">{item}</p>
                ))}
              </div>
            </>
          )}
          <Reveal>
            <p className="eyebrow mb-10 mt-16 text-paper/55">/ Key facts</p>
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
              / What {region.name} clients say
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
                    {testimonial.name} - {testimonial.city}
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
            <h2 id="region-locations-heading" className="eyebrow text-muted">/ {region.name} locations</h2>
            <p className="eyebrow text-accent">
              {region.locations.length} {region.locations.length === 1 ? "office" : "offices"}
            </p>
          </div>
          <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {region.locations.map((location, index) => (
              <Reveal key={location.gbpUrl} delay={(index % 3) * 0.05}>
                <div className="border-t border-line pt-5">
                  <h3 className="text-lg">
                    {location.city}
                    {location.area ? `, ${location.area}` : ""}
                  </h3>
                  <p className="section-body mt-2 text-sm">
                    {location.streetAddress}
                    {location.postalCode ? `, ${location.postalCode}` : ""}
                  </p>
                  <a
                    href={`tel:${location.phone.replace(/[^\d+]/g, "")}`}
                    className="mt-2 block text-sm transition-colors hover:text-accent"
                  >
                    {location.phone}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <FaqSection items={region.faqs} />

      {/* The site's standard closing CTA - same component every other page uses */}
      <ContactCta />
    </>
  );
}
