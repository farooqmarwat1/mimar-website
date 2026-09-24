import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { buildMetadata, breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { projects } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "3D Rendering, Visualization & Interactive Services | Mimar",
  description:
    "Eleven disciplines across architectural design, 3D visualization, VR, branding, interactive property experiences and real estate marketing.",
  path: "/services",
  keywords: ["3D rendering services", "architectural visualization services", "3D animation services", "VR real estate", "interactive property experiences"],
});

const capabilities = [
  {
    title: "Architectural Design",
    slug: "architectural-design",
    description: "Full architectural design services spanning interior and exterior spaces, from concept through construction documentation.",
    deliverables: ["Architectural design", "Interior design", "Urban planning", "Smart Topography Survey"],
    media: "/services/architectural-design/hero.jpg",
    mediaType: "image" as const,
  },
  {
    title: "3D Visualization",
    slug: "3d-visualization",
    description: "Photorealistic visualization for architecture, interiors, and real estate.",
    deliverables: ["Interior stills", "Exterior stills", "Aerials", "Day / dusk sets"],
    media: "/services/3d-rendering-2026.webp",
    mediaType: "image" as const,
  },
  {
    title: "Cinematics",
    slug: "cinematics",
    description: "Cinematic walkthroughs, fly-throughs, and design animations that bring spaces to life.",
    deliverables: ["Fly-through films", "Walk-throughs", "Launch teasers", "Social cutdowns"],
    media: "/services/animations-2026.mp4",
    mediaType: "video" as const,
  },
  {
    title: "VR 360 Tours",
    slug: "vr-360-tours",
    description: "Immersive, interactive experiences that let you explore spaces before they’re built.",
    deliverables: ["VR walk-throughs", "360° panoramas", "Headset builds", "Sales-suite setup"],
    media: "/services/approved/vr-experiences.webp",
    mediaType: "image" as const,
  },
  {
    title: "Web Tours",
    slug: "web-tours",
    description: "Browser-based 360° virtual tours, accessible on any device with no installation.",
    deliverables: ["Linked 360 tours", "Hotspots & info cards", "Floor-plan navigation", "Embed code"],
    media: "/services/approved/web-360-updated.webp",
    mediaType: "image" as const,
  },
  {
    title: "Dual Screen Navigator",
    slug: "dual-screen-navigator",
    description: "Synchronized interactive displays for sales offices, showrooms, events, and on-the-go presentations.",
    deliverables: ["Agent touch console", "Client display app", "Content CMS", "On-site install"],
    media: "/services/approved/dual-screen.webp",
    mediaType: "image" as const,
  },
  {
    title: "Interactive Prints",
    slug: "interactive-prints",
    description: "AR-powered marketing collateral that brings brochures and print campaigns to life.",
    deliverables: ["AR brochures", "Site hoardings", "Marker design", "AR content build"],
    media: "/services/approved/interactive-prints.webp",
    mediaType: "image" as const,
  },
  {
    title: "Property Explorer",
    slug: "property-explorer",
    description: "Interactive tools for exploring units, layouts, amenities, views, and property availability.",
    deliverables: ["Unit filter engine", "Floor-plate browser", "View simulator", "CRM lead routing"],
    media: "/services/approved/property-explorer.webp",
    mediaType: "image" as const,
  },
  {
    title: "Virtual Smart Home",
    slug: "smart-home",
    description: "Interactive experiences for showcasing smart-home and connected-living features.",
    deliverables: ["Scene simulation", "Device demos", "Touch kiosk build", "Developer showroom setup"],
    media: "/services/approved/virtual-smart-home.webp",
    mediaType: "image" as const,
  },
  {
    title: "Branding",
    slug: "branding",
    description: "Strategic brand identities and visual systems that make projects recognizable across every touchpoint.",
    deliverables: ["Brand Identity", "Corporate stationery", "Marketing collateral"],
    media: "/services/branding/hero.png",
    mediaType: "image" as const,
  },
  {
    title: "Marketing",
    slug: "marketing",
    description: "Integrated digital marketing and web development to amplify a project's reach.",
    deliverables: ["Digital Marketing", "Social Media Marketing", "Web Development", "SEO & Online Visibility"],
    media: "/service-media/marketing-hero.png",
    mediaType: "image" as const,
  },
];

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
            itemListJsonLd("Mimar Studios services", capabilities.map((capability) => ({ name: capability.title, path: `/services/${capability.slug}` }))),
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
              Eleven disciplines, one studio. From the first concept sketch to the smart home a buyer controls before it is built.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page">
        {capabilities.map((capability, index) => (
          <Reveal key={capability.slug} delay={Math.min(index * 0.025, 0.12)}>
            <Link href={`/services/${capability.slug}`} className="group block">
            <article className="grid gap-8 border-b border-line py-12 md:grid-cols-12 md:items-center md:gap-12 md:py-16">
              <div className={`motion-media relative aspect-[16/10] overflow-hidden bg-ink/5 md:col-span-5 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                {capability.mediaType === "video" ? (
                  <video autoPlay muted loop playsInline preload="none" poster="/services/animations-poster.jpg" className="h-full w-full object-cover" aria-label="Architectural animation by Mimar Studios">
                    <source src={capability.media} type="video/mp4" />
                  </video>
                ) : (
                  <Image src={capability.media} alt={`${capability.title} by Mimar Studios`} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 42vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                )}
              </div>
              <div className={`md:col-span-7 ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="grid gap-5 md:grid-cols-[3.5rem_1fr]">
                  <p className="eyebrow text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <div>
                    <h2 className="text-3xl font-medium leading-none tracking-[-.045em] transition-colors group-hover:text-accent md:text-[2.75rem]">{capability.title}</h2>
                    <p className="mt-7 max-w-2xl text-xl leading-[1.2] tracking-[-.02em] md:text-2xl">{capability.description}</p>
                    <ul className="mt-8 grid grid-cols-1 min-[420px]:grid-cols-2">
                      {capability.deliverables.map((deliverable) => (
                        <li key={deliverable} className="eyebrow border-t border-line py-3 text-muted">{deliverable}</li>
                      ))}
                    </ul>
                    <span className="button-pill mt-6 text-ink">
                      Explore {capability.title}
                    </span>
                  </div>
                </div>
              </div>
            </article>
            </Link>
          </Reveal>
        ))}
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
