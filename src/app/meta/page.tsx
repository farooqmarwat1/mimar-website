import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactCta from "@/components/sections/ContactCta";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "meta - mimAR",
  description: "Transforming ideas into captivating 3D visualizations for architectural brilliance. Unleash your vision with mimAR's immersive 3D visualization services.",
  path: "/meta",
});

const capabilities = [
  {
    title: "Augmented Reality",
    description: "Unlock limitless possibilities with our MataVerse development service, crafting dynamic and engaging virtual experiences for your audience.",
    href: "/services/interactive-services/interactive-prints",
    linkLabel: "Explore augmented reality work",
  },
  {
    title: "Virtual Reality",
    description: "Unlock limitless possibilities with our MataVerse development service, crafting dynamic and engaging virtual experiences for your audience.",
    href: "/services/interactive-services/vr-360-tours",
    linkLabel: "Explore virtual reality work",
  },
  {
    title: "Web 3.0",
    description: "Experience the future of the web with our Web 3.0 as a service, revolutionizing connectivity, decentralization, and user-centric experiences.",
  },
  {
    title: "Virtual Orient",
    description: "There's nothing in the world of Architectural Visualization that we don't offer!",
    href: "/services/interactive-services/web-tours",
    linkLabel: "Explore virtual tours",
  },
  {
    title: "Game Development",
    description: "Level up your vision with our Game Development as a Service, where we turn ideas into captivating interactive experiences for players worldwide.",
  },
  {
    title: "App Development",
    description: "Turn your app dreams into reality with our comprehensive App Development as a Service, delivering tailored solutions for seamless user experiences",
  },
] as const;

const portfolioAreas = [
  "Metaverse Development",
  "Virtual Orientation",
  "Web 3.0",
  "Virtual Reality",
  "Augmented Reality",
] as const;

const reasons = [
  {
    title: "Seamless integration",
    description: "Mimar Studio is your hub for seamless integration of VR, AR, Web 3.0, and app development, ensuring smooth, cross-platform functionality that keeps pace with technological advancements.",
  },
  {
    title: "Scalable Solutions",
    description: "We specialize in scalable and sustainable solutions at Mimar Studio, providing innovative and adaptable VR and AR experiences designed to grow with your enterprise.",
  },
  {
    title: "Cutting-Edge Technologies",
    description: "Our expertise in the latest metaverse and immersive technologies positions us at the forefront of the industry, offering our clients the most advanced and innovative solutions.",
  },
  {
    title: "Immersive Experiences",
    description: "Mimar Studio is dedicated to creating immersive and interactive virtual worlds, offering tailored AR, VR, and metaverse services that push the envelope of digital innovation.",
  },
] as const;

export default function MetaPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "XR Digital Services", path: "/meta" },
        ]))}
      />

      <header className="relative isolate flex min-h-[42rem] items-end overflow-hidden bg-ink text-paper md:min-h-[48rem]">
        <Image
          src="/hero/meta.webp"
          alt="Person wearing a virtual reality headset"
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover object-[65%_center]"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink/90 via-ink/70 to-ink/10" />
        <div className="container-page relative z-20 w-full pb-16 pt-36 md:pb-24 md:pt-44">
          <p className="eyebrow text-paper/70">/ XR Digital Services</p>
          <h1 className="index-heading mt-8 max-w-5xl">
            Explore<br />Limitless<br /><span className="text-accent">Realms</span>
          </h1>
          <p className="mt-9 max-w-xl text-lg leading-relaxed text-paper/85 md:text-xl">
            Transforming ideas into captivating 3D visualizations for architectural brilliance. Unleash your vision with mimAR’s immersive 3D visualization services.
          </p>
          <Link href="#capabilities" className="button-pill mt-10 text-paper">Explore our services</Link>
        </div>
      </header>

      <section id="capabilities" className="container-page py-20 md:py-28">
        <div className="grid gap-6 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] md:gap-16">
          <p className="eyebrow text-muted">/ Services</p>
          <div>
            <h2 className="section-heading">Immersive ideas, <span className="text-accent">built to work.</span></h2>
            <p className="section-body mt-6 max-w-2xl">From augmented and virtual reality to interactive applications, the same team carries a digital experience from concept to delivery.</p>
          </div>
        </div>
        <div className="mt-12 border-t border-line">
          {capabilities.map((capability, index) => (
            <article key={capability.title} className="motion-row grid gap-5 border-b border-line py-8 md:grid-cols-[4rem_minmax(0,0.8fr)_minmax(0,1fr)] md:gap-10 md:py-10">
              <p className="eyebrow text-accent">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="text-2xl font-medium uppercase tracking-[-.035em] md:text-3xl">{capability.title}</h3>
              <div>
                <p className="section-body max-w-xl">{capability.description}</p>
                {"href" in capability && (
                  <Link href={capability.href} className="eyebrow mt-6 inline-block border-b border-ink pb-2 transition-colors hover:border-accent hover:text-accent">
                    {capability.linkLabel} ↗
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page border-y border-line py-20 md:py-28">
        <p className="eyebrow text-muted">/ Portfolio</p>
        <div className="mt-7 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end md:gap-16">
          <h2 className="section-heading max-w-2xl">Work across <span className="text-accent">digital worlds.</span></h2>
          <p className="section-body max-w-xl">Explore the areas represented in Mimar&apos;s immersive portfolio, from virtual orientation and Web 3.0 to augmented and virtual reality.</p>
        </div>
        <ul className="mt-12 flex flex-wrap gap-3" aria-label="Portfolio areas">
          {portfolioAreas.map((area) => <li key={area} className="eyebrow rounded-full border border-line px-5 py-4">{area}</li>)}
        </ul>
        <Link href="/projects" className="button-pill mt-10 text-ink">View projects</Link>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-page py-20 md:py-28">
          <p className="eyebrow text-muted-inverse">/ Why us</p>
          <h2 className="section-heading mt-7">Made to connect <span className="text-accent">every dimension.</span></h2>
          <div className="mt-12 grid gap-x-12 md:grid-cols-2">
            {reasons.map((reason, index) => (
              <article key={reason.title} className="border-t border-line-inverse py-8 md:py-10">
                <p className="eyebrow text-accent">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-6 text-2xl font-medium tracking-[-.03em] md:text-3xl">{reason.title}</h3>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-inverse">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
