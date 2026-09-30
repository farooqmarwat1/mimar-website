import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import DriveVideo from "@/components/ui/DriveVideo";
import MediaSlider from "@/components/ui/MediaSlider";
import { threeDVisualizationSlug, threeDVisualizationSubServicePath, threeDVisualizationSubServiceSlugs, threeDVisualizationSubServices } from "@/lib/three-d-visualization-sub-services";
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from "@/lib/seo";
import { serviceDetails, servicePath } from "@/lib/service-details";
import { projects, siteConfig } from "@/lib/site-config";

export const dynamicParams = false;

export function generateStaticParams() {
  return threeDVisualizationSubServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/3d-visualization/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = threeDVisualizationSubServices[slug];
  if (!service) return {};
  return buildMetadata({ title: service.seoTitle, description: service.seoDescription, path: threeDVisualizationSubServicePath(slug) });
}

export default async function ThreeDVisualizationSubServicePage({ params }: PageProps<"/services/3d-visualization/[slug]">) {
  const { slug } = await params;
  const service = threeDVisualizationSubServices[slug];
  if (!service) notFound();

  const parent = serviceDetails[threeDVisualizationSlug];
  const path = threeDVisualizationSubServicePath(slug);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: parent.title, path: servicePath(parent.slug) },
            { name: service.title, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": `${siteConfig.url}${path}#service`,
            name: service.title,
            description: service.seoDescription,
            url: `${siteConfig.url}${path}`,
            provider: { "@id": `${siteConfig.url}/#organization` },
            areaServed: "Worldwide",
            serviceType: parent.title,
          },
        ])}
      />

      <section className="relative flex h-[100svh] min-h-[32rem] items-end overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
        <Image src={service.hero} alt="" fill priority unoptimized sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="container-page relative w-full pb-14 pt-32 md:pb-16">
          <Reveal>
            <p className="eyebrow mb-8 text-paper/65">
              <Link href={servicePath(parent.slug)} className="hover:text-accent">/ {parent.title}</Link> / Services
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-5xl break-words text-[clamp(3rem,10vw,7rem)] font-medium uppercase leading-[.82] tracking-[-.065em]">{service.title}</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">{service.tagline}</p>
          </Reveal>
          <Reveal delay={0.15}><Link href="/contact" className="button-pill mt-10 text-paper">Request a quote</Link></Reveal>
        </div>
      </section>

      {service.sections.map((section, sectionIndex) => {
        const sectionProjects = section.projects
          .map((projectSlug) => projects.find((project) => project.slug === projectSlug))
          .filter((project) => project !== undefined);
        const slides = section.slides;
        return (
          <section key={section.heading} className={`container-page py-16 md:py-28 ${sectionIndex > 0 ? "border-t border-line" : ""}`}>
            <div className={slides?.length ? "grid gap-10 md:grid-cols-2 md:items-center md:gap-16" : ""}>
              {slides && slides.length > 0 && (
                <Reveal>
                  <MediaSlider slides={slides} title={section.heading} />
                </Reveal>
              )}
              <div>
                <Reveal><p className="eyebrow text-muted">/ {section.heading}</p></Reveal>
                <div className="mt-8">
                  {section.body.map((paragraph, index) => (
                    <Reveal key={paragraph} delay={0.05 + index * 0.05}>
                      <p className={index === 0 ? "text-2xl leading-[1.15] tracking-[-.03em] md:text-4xl" : "section-body mt-6 text-lg"}>{paragraph}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
            {sectionProjects.length > 0 && (
              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sectionProjects.map((project, index) => (
                  <Reveal key={project.slug} delay={(index % 3) * 0.05}>
                    <Link href={`/projects/${project.slug}`} className="group relative block aspect-video overflow-hidden bg-ink/5">
                      <Image src={project.cover} alt={`${project.title} by Mimar Studios`} fill quality={85} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-12 text-paper">
                        <h3 className="flex items-end justify-between gap-3 text-sm md:text-base">
                          <span>{project.title}</span>
                          <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">↗</span>
                        </h3>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {service.media && (
        <section className="container-page border-t border-line py-16 md:py-28" aria-labelledby="showreels-heading">
          <div className="mb-8 flex flex-col gap-2 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="showreels-heading" className="eyebrow text-muted">/ Showreels</h2>
            <p className="eyebrow text-accent">{service.title}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {service.media.map((media, index) => (
              <Reveal key={media.title} delay={index * 0.05}>
                <div className="relative aspect-video overflow-hidden bg-ink text-paper">
                  <DriveVideo src={media.src} title={media.title} />
                </div>
                <p className="mt-3 text-sm text-muted">{media.title}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-ink py-16 text-paper md:py-24" aria-labelledby="benefits-heading">
        <Image src={service.benefitsImage} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-25" />
        <div className="container-page relative">
          <h2 id="benefits-heading" className="eyebrow mb-10 text-paper/55">/ Benefits</h2>
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {service.benefits.map(([title, description], index) => (
              <Reveal key={title} delay={index * 0.05}>
                <div className="border-t border-paper/25 pt-5">
                  <h3 className="text-lg">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-paper/70">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-py">
        <div className="container-page mx-auto max-w-3xl text-center">
          <Reveal><h2 className="eyebrow text-muted">/ {service.ctaEyebrow ?? "Get a free consultation"}</h2></Reveal>
          <Reveal delay={0.05}>
            <p className="section-heading mx-auto mt-6">
              {service.cta.heading[0]}
              <br />
              <span className="text-accent">{service.cta.heading[1]}</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}><p className="section-body mx-auto mt-6 max-w-md">{service.cta.body}</p></Reveal>
          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href={service.cta.primaryHref ?? "/booking"} className="button-pill text-ink">{service.cta.primaryLabel ?? "Get a free consultation"}</Link>
              <Link href="/contact" className="button-pill text-ink">Contact us</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Link href={servicePath(parent.slug)} className="group relative block min-h-[16rem] overflow-hidden bg-ink text-paper md:min-h-[20rem]">
        <Image src={parent.hero} alt="" fill unoptimized sizes="100vw" className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="container-page relative flex min-h-[16rem] flex-col justify-center md:min-h-[20rem]">
          <p className="eyebrow mb-8 text-paper/55">/ Back to service</p>
          <h2 className="text-[clamp(2.5rem,5vw,5rem)] tracking-[-.05em]">{parent.title}</h2>
        </div>
      </Link>
    </article>
  );
}
