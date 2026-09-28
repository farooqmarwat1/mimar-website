import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactCta from "@/components/sections/ContactCta";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Studio - mimAR",
  description: "award winning emerging company",
  path: "/about-us/studio",
});

const disciplines = [
  { number: "02", title: "Our Team", detail: "A studio built around people with different skills and one shared purpose: making ideas possible." },
  { number: "03", title: "Marketing Team", detail: "The people who help projects find their voice, connect with audiences, and reach the market." },
  { number: "04", title: "Architects Team", detail: "Architects, visual artists, and technologists working together from first concept to final experience." },
  { number: "05", title: "Development Team", detail: "Developers turn visual ideas into interactive experiences, digital products, and tools people can explore." },
  { number: "06", title: "Creative Team", detail: "Designers and storytellers shape how every project looks, moves, and communicates." },
] as const;

const studioPhotos = [
  { src: "/about/studio/studio-lounge.jpg", alt: "A moment in the Mimar studio lounge", caption: "Studio life" },
  { src: "/about/studio/team-moment.jpg", alt: "Mimar team members at a studio gathering", caption: "Working together" },
] as const;

export default function StudioPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About Us", path: "/about-us" },
          { name: "Studio", path: "/about-us/studio" },
        ]))}
      />

      <header className="container-page flex min-h-[34rem] flex-col justify-between border-b border-line pb-16 pt-32 md:min-h-[42rem] md:pb-20 md:pt-40">
        <p className="eyebrow text-muted">
          <Link href="/about-us" className="hover:text-accent">/ About Us</Link> / Studio
        </p>
        <div className="w-full">
          <p className="eyebrow text-accent">Award winning emerging company</p>
          <h1 className="index-heading mt-5 text-accent">Studio</h1>
          <div className="mt-12 flex flex-col justify-between gap-8 border-t border-line pt-7 md:flex-row md:items-end">
            <p className="section-body max-w-2xl text-lg md:text-xl">
              The people and environment behind Mimar Studios. Meet the thinking, collaboration, and creative energy that shape our work.
            </p>
            <Link href="#ceo-message" className="button-pill shrink-0 text-ink">Explore the studio</Link>
          </div>
        </div>
      </header>

      <section id="ceo-message" className="bg-ink text-paper">
        <div className="container-page grid gap-12 py-20 md:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] md:items-center md:gap-16 md:py-28">
          <div>
            <p className="eyebrow text-muted-inverse">/ 01 — CEO message</p>
            <h2 className="section-heading mt-8 max-w-xl">A note from <span className="text-accent">our founder.</span></h2>
            <blockquote className="mt-10 max-w-2xl border-l-2 border-accent pl-6 text-xl leading-snug tracking-[-.02em] md:text-2xl">
              <p>“The constraint of being solo founder of a prop-tech bootstrapping startup in a tech reluctant construction industry is the challenging ingredient in itself that energizes me to take consequential risks!</p>
              <p className="mt-6">Our strength is our free minded talented youth. We risk ourselves into goals bigger than our capacity: then test ourselves beyond our limits, eventually being forced to go out of the box to achieve the goal. The failures we face, to us are the stepping stones!”</p>
            </blockquote>
          </div>
          <div>
            <div className="aspect-video overflow-hidden bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/yAIKHczr05o"
                title="MimAR — From An Architect to a Businessman"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="eyebrow mt-4 text-muted-inverse">The original studio film / NIC Islamabad</p>
          </div>
        </div>
      </section>

      <section className="container-page py-20 md:py-28">
        <div className="grid gap-6 border-b border-line pb-12 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:gap-16">
          <p className="eyebrow text-muted">/ The people</p>
          <div>
            <h2 className="section-heading">A multidisciplinary <span className="text-accent">studio.</span></h2>
            <p className="section-body mt-6 max-w-2xl">Design, visualization, technology, and communication come together in one studio. Every perspective helps move an idea from first sketch to a memorable experience.</p>
          </div>
        </div>
        <div className="border-t border-line">
          {disciplines.map((item) => (
            <article key={item.number} className="motion-row grid gap-5 border-b border-line py-8 md:grid-cols-[4rem_minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-10 md:py-10">
              <p className="eyebrow text-accent">{item.number}</p>
              <h3 className="text-2xl font-medium tracking-[-.035em] md:text-3xl">{item.title}</h3>
              <p className="section-body max-w-xl">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-20 md:pb-28">
        <div className="flex flex-col justify-between gap-5 border-t border-line pt-8 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-muted">/ 07 — Culture & environment</p>
            <h2 className="section-heading mt-6">Life at <span className="text-accent">Mimar.</span></h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-16">
          <p className="section-body max-w-xl">At mimAR, it’s our amazing team that shapes our unique culture. We’re all about creating a workplace where everyone feels valued and supported.</p>
          <p className="section-body max-w-xl">We want our employees to grow both personally and professionally while connecting with each other. Our goal is to foster a supportive environment where our employees can thrive and contribute to our overarching mission.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {studioPhotos.map((photo) => (
            <figure key={photo.src}>
              <div className="relative aspect-[4/5] overflow-hidden bg-ink">
                <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
              </div>
              <figcaption className="eyebrow mt-4 text-muted">{photo.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <ContactCta />
    </div>
  );
}
