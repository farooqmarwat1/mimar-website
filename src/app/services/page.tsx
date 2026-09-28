import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ServiceCards from "@/components/sections/ServiceCards";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { mainServiceCards } from "@/lib/service-cards";
import { projects } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "3D Rendering, Visualization & Interactive Services | Mimar",
  description:
    "Five core services: architectural design, 3D visualization, interactive AR and VR experiences, branding and real estate marketing.",
  path: "/services",
  keywords: ["3D rendering services", "architectural visualization services", "3D animation services", "VR real estate", "interactive property experiences"],
});

const projectSlugs = ["aark-residences", "amerat-park", "nana-222", "nomi-downtown", "faisal-town-ii", "abuja"];
const serviceProjects = projectSlugs.map((slug) => projects.find((project) => project.slug === slug)).filter((project) => project !== undefined);

export default function ServicesPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          [
            breadcrumbJsonLd([
              { name: "Home", path: "/" },
              { name: "Services", path: "/services" },
            ]),
            itemListJsonLd("Mimar Studios services", mainServiceCards.map((card) => ({ name: card.title, path: card.href }))),
          ],
        )}
      />

      <section className="pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-page">
          <Reveal>
            <p className="eyebrow text-muted mb-6">/ Capabilities</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="index-heading">
              <span className="block">What We</span>
              <span className="block text-accent">Do.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-body mt-8 max-w-xl">
              Five core services, one studio. From the first concept sketch to the smart home a buyer controls before it is built.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page">
        <ServiceCards cards={mainServiceCards} />
      </section>

      <section className="py-24 md:py-32">
        <div className="container-page">
          <Reveal><p className="eyebrow mb-8 text-muted">/ Work in these disciplines</p></Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-heading"><span className="block">Services, Seen</span><span className="block text-accent">In Built Projects</span></h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-body mt-8 max-w-2xl">Every capability above is proven on delivered work. These are recent examples across architecture, visualization and interiors.</p>
          </Reveal>
        </div>

        <div className="mt-16 grid md:grid-cols-2">
          {serviceProjects.map((project, index) => (
            <Reveal key={project.slug} delay={(index % 2) * 0.05}>
              <Link href={`/projects/${project.slug}`} className="group relative block aspect-video overflow-hidden bg-ink/5">
                <Image src={project.cover} alt={`${project.title} by Mimar Studios`} fill quality={85} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                <div className="absolute bottom-0 left-0 bg-paper px-5 py-4">
                  <p className="text-sm">{project.title}</p>
                  <p className="mt-1 text-xs text-muted">{project.location}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-page min-h-[34rem] py-24 md:min-h-[40rem] md:py-32">
        <Reveal>
          <h2 className="max-w-6xl text-[clamp(2.75rem,5.8vw,6rem)] font-medium leading-[.95] tracking-[-.055em]">
            Need two or three of these at once?
            <br />
            <span className="text-accent">That is the normal case.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <Link href="/contact" className="button-pill mt-14 text-ink">Request a quote</Link>
        </Reveal>
      </section>
    </div>
  );
}
