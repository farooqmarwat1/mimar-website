import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import DriveVideo from "@/components/ui/DriveVideo";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, serviceJsonLd } from "@/lib/seo";
import { getServiceCards } from "@/lib/service-cards";
import { interactiveServicesSlug, interactiveSubServiceSlugs, serviceDetails, servicePath, type ServiceDetail } from "@/lib/service-details";
import { projects } from "@/lib/site-config";

/** Shared layout for /services/{slug} and /services/interactive-services/{slug}. */
export default function ServiceDetailView({ detail }: { detail: ServiceDetail }) {
  const parent = interactiveSubServiceSlugs.includes(detail.slug) ? serviceDetails[interactiveServicesSlug] : undefined;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    ...(parent ? [{ name: parent.title, path: servicePath(parent.slug) }] : []),
    { name: detail.title, path: servicePath(detail.slug) },
  ];
  const subServiceCards = getServiceCards(detail.subServices ?? []);
  const recentProjects = detail.projects
    .map((projectSlug) => projects.find((project) => project.slug === projectSlug))
    .filter((project) => project !== undefined);
  const nextService = serviceDetails[detail.next];

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd(breadcrumbs),
          serviceJsonLd(detail),
          faqJsonLd(detail.faqs.map(([question, answer]) => ({ question, answer }))),
        ])}
      />

      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        {detail.heroType === "video" ? (
          <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true">
            <source src={detail.hero} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={detail.hero}
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
          <Reveal><p className="eyebrow mb-8 text-paper/65">{detail.eyebrow}</p></Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-5xl break-words text-[clamp(3rem,13vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.065em]">{detail.title}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{detail.intro}</p>
          </Reveal>
          <Reveal delay={0.15}><Link href="/contact" className="button-pill mt-10 text-paper">Request a quote</Link></Reveal>
        </div>
      </section>

      {subServiceCards.length > 0 ? (
        // Same tile grid as the "Outputs" section, but each tile links to its sub-service.
        <section className="container-page pb-16 pt-16 md:pb-28 md:pt-28" aria-labelledby="sub-services-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between"><h2 id="sub-services-heading" className="eyebrow text-muted">/ Services</h2><p className="eyebrow text-accent">{detail.title}</p></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {subServiceCards.map((card, index) => (
              <Reveal key={card.slug} delay={index * 0.05}>
                <Link href={card.href} className="group relative block aspect-[.82] overflow-hidden bg-ink/5">
                  <Image src={card.media} alt={`${card.title} by Mimar Studios`} fill unoptimized sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-16 text-paper">
                    <h3 className="flex items-end justify-between gap-3 text-sm md:text-base">
                      <span>{card.title}</span>
                      <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">↗</span>
                    </h3>
                    <p className="mt-2 hidden max-w-xs text-xs leading-snug text-paper/75 md:block">{card.description}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <section className={`container-page pt-16 md:pt-28 ${detail.featuredMedia ? "pb-8 md:pb-12" : "pb-16 md:pb-28"}`}>
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between"><p className="eyebrow text-muted">/ {detail.featuredMedia ? "Featured media" : "Outputs"}</p><p className="eyebrow text-accent">{detail.title}</p></div>
          {detail.featuredMedia ? (
            <div className={`grid gap-8 ${detail.featuredMedia.length > 1 && detail.slug !== "cinematics" ? "md:grid-cols-2" : ""}`}>
              {detail.featuredMedia.map((media, index) => (
                <Reveal key={`${media.title}-${index}`} delay={index * 0.05}>
                  <div className="relative aspect-video overflow-hidden bg-ink text-paper">
                    {media.type === "video" && <video controls playsInline preload="metadata" poster={media.poster} className="h-full w-full object-cover"><source src={media.src} type="video/mp4" /></video>}
                    {media.type === "youtube" && <iframe src={media.src} title={media.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full border-0" />}
                    {media.type === "drive" && <DriveVideo src={media.src} title={media.title} />}
                    {media.type === "placeholder" && <div className="flex h-full flex-col items-center justify-center px-8 text-center"><p className="eyebrow text-paper/55">Video placeholder</p><p className="mt-4 text-xl">{media.title}</p><p className="mt-3 max-w-md text-sm text-paper/60">{media.note}</p></div>}
                  </div>
                  <p className="mt-3 text-sm text-muted">{media.title}</p>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-3 ${detail.outputs.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
              {detail.outputs.map((output, index) => (
                <Reveal key={output} delay={index * 0.05}>
                  <div className="relative aspect-[.82] overflow-hidden bg-ink/5">
                    {detail.outputImages[index] ? (
                      <Image src={detail.outputImages[index]} alt="" fill unoptimized sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 hover:scale-105" />
                    ) : (
                      <div className="absolute inset-0 bg-ink" />
                    )}
                    <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 text-sm text-paper">{output}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          {detail.demoUrl && <Reveal><a href={detail.demoUrl} target="_blank" rel="noreferrer" className="button-pill mt-8 inline-flex text-ink">Open live demo</a></Reveal>}
        </section>
      )}

      {detail.showFacts !== false && <section className="container-page grid grid-cols-2 md:grid-cols-4">
        {detail.facts?.map(([value, label], index) => (
          <Reveal key={label} delay={index * 0.04} className="border-r border-line px-3 py-9 first:pl-0 [&:nth-child(even)]:border-r-0 md:px-6 md:py-12 md:[&:nth-child(even)]:border-r md:last:border-r-0">
            <p className="text-xl leading-tight tracking-[-.03em] md:text-2xl">{value}</p>
            <p className="eyebrow mt-4 text-muted">{label}</p>
          </Reveal>
        ))}
      </section>}

      <section className={`container-page grid gap-10 pb-16 md:gap-12 md:pb-28 ${detail.featuredMedia ? "pt-8 md:pt-12" : "pt-16 md:pt-28"} ${detail.showProcessImage === false ? "" : "md:grid-cols-2"}`}>
        {detail.showProcessImage !== false && <Reveal>
          <div className="relative aspect-[1.1] overflow-hidden bg-ink/5"><Image src={detail.processImage ?? detail.outputImages[1]} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
        </Reveal>}
        <div>
          {detail.process.map(([step, description], index) => (
            <Reveal key={step} delay={index * 0.05}>
              <div className="grid grid-cols-[4rem_1fr] gap-3 border-t border-line py-7">
                <p className="text-4xl font-light text-accent/40">{String(index + 1).padStart(2, "0")}</p>
                <div><h2 className="text-lg">{step}</h2><p className="section-body mt-2 text-sm">{description}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink py-16 text-paper md:py-20">
        <Image src={detail.includedImage} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-25" />
        <div className="container-page relative">
          <p className="eyebrow mb-10 text-paper/55">/ {detail.includedLabel ?? "Also included"}</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
            {detail.included.map((item) => <p key={item} className="border-t border-paper/25 pt-5 text-sm">{item}</p>)}
          </div>
        </div>
      </section>

      {detail.portfolio?.length ? (
        <section className="container-page py-16 md:py-28">
          <Reveal><p className="eyebrow mb-10 text-muted">/ Selected {detail.title.toLowerCase()} work</p></Reveal>
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {detail.portfolio.map((item, index) => (
              <Reveal key={item.url} delay={(index % 3) * 0.05}>
                <a href={item.url} target="_blank" rel="noreferrer" className="group block">
                  {detail.slug === "branding" ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-ink">
                      <iframe src={item.url} title={`${item.title} flipbook preview`} loading="lazy" tabIndex={-1} aria-hidden="true" className="pointer-events-none h-full w-full border-0 transition-transform duration-700 group-hover:scale-[1.015]" />
                      <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] flex-col justify-between overflow-hidden bg-ink p-6 text-paper transition-colors group-hover:bg-accent sm:p-8">
                      <span className="eyebrow text-paper/45">Mimar Digital</span>
                      <p className="break-words text-[clamp(1.5rem,2.3vw,2.5rem)] leading-[.95] tracking-[-.045em]">{item.title}</p>
                      <span className="eyebrow text-paper/55">Open project ↗</span>
                    </div>
                  )}
                  <p className="eyebrow mt-4 text-muted">{item.category}</p>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <h2 className="text-xl tracking-[-.025em]">{item.title}</h2>
                    <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">↗</span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {detail.showProjects !== false && <section className="container-page py-16 md:py-28">
        <Reveal><p className="eyebrow mb-10 text-muted">/ Proven on</p></Reveal>
        <div className={`grid gap-8 ${recentProjects.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {recentProjects.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.06}>
              <Link href={`/projects/${project.slug}`} className="group block">
                <div className="relative aspect-video overflow-hidden bg-ink/5"><Image src={project.cover} alt={`${project.title} by Mimar Studios`} fill quality={85} sizes={`(max-width: 768px) 100vw, ${recentProjects.length >= 3 ? "33vw" : "50vw"}`} className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" /></div>
                <div className="mt-4"><p>{project.title}</p></div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>}

      <section className="container-page py-16 md:py-28">
        <Reveal><p className="eyebrow mb-10 text-muted">/ Questions</p></Reveal>
        <div className="ml-auto max-w-4xl border-t border-line">
          {detail.faqs.map(([question, answer]) => (
            <details key={question} className="group border-b border-line py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-8 text-lg"><span>{question}</span><span className="text-accent transition-transform group-open:rotate-45">+</span></summary>
              <p className="section-body max-w-2xl pt-5">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {nextService && (
        <Link href={servicePath(nextService.slug)} className="group relative block min-h-[16rem] overflow-hidden bg-ink text-paper md:min-h-[20rem]">
          {nextService.heroType === "video" ? (
            <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.02]" aria-hidden="true">
              <source src={nextService.hero} type="video/mp4" />
            </video>
          ) : (
            <Image src={nextService.hero} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.02]" />
          )}
          <div className="absolute inset-0 bg-black/30" />
          <div className="container-page relative flex min-h-[16rem] flex-col justify-center md:min-h-[20rem]"><p className="eyebrow mb-8 text-paper/55">/ Next service</p><h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-.05em]">{nextService.title}</h2></div>
        </Link>
      )}
    </article>
  );
}
