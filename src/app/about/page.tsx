import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import AnimatedStatValue from "@/components/ui/AnimatedStatValue";
import ContactCta from "@/components/sections/ContactCta";
import { buildMetadata, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { stats } from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Life at Mimar - About Us",
  description: "Experience the vibrant culture and dynamic environment at mimAR. Learn about our team of young professionals and our journey.",
  path: "/about",
  keywords: ["About Us", "life at Mimar", "Mimar team", "architecture studio Islamabad"],
});

const studioNotes = [
  ["Profile", "Mimar Studios was founded in 2019 at the National Incubation Center, Islamabad. The studio is formed by a multidisciplinary group of architects, visualizers and designers who share the same project - active participation of all its components, teamwork and passion for the work as the essence of the studio."],
  ["Values", "Architecture can be small in the big or big in the small, if each commission is understood as an opportunity to materialize a good project. The approach arises from a double commitment: a technical response to a specific context, and the desire to seek beauty through the built work."],
  ["Team", "Excellence in design is based on the integration of a network of professionals who agree on the pleasure of their work - architects, 3D artists, animators, brand designers and marketers, including international recruits from Turkey and Egypt."],
];

const services = [
  ["Architectural Design", "Full architectural design services spanning interior and exterior spaces, from concept through construction documentation."],
  ["3D Visualization", "Photorealistic visualization for architecture, interiors, and real estate."],
  ["Cinematics", "Cinematic walkthroughs, fly-throughs, and design animations that bring spaces to life."],
  ["VR 360 Tours", "Immersive, interactive experiences that let you explore spaces before they’re built."],
  ["Web Tours", "Browser-based 360° virtual tours, accessible on any device with no installation."],
  ["Dual Screen Navigator", "Synchronized interactive displays for sales offices, showrooms, events, and on-the-go presentations."],
  ["Interactive Prints", "AR-powered marketing collateral that brings brochures and print campaigns to life."],
  ["Property Explorer", "Interactive tools for exploring units, layouts, amenities, views, and property availability."],
  ["Virtual Smart Home", "Interactive experiences for showcasing smart-home and connected-living features."],
  ["Branding", "Strategic brand identities and visual systems that make projects recognizable across every touchpoint."],
  ["Marketing", "Integrated digital marketing and web development to amplify a project's reach."],
];

const awards = ["National Winner in Pakistan - Uber Pitch, Karachi", "Qualified & represented Pakistan at 4YFN, Barcelona", "Runner-up, Top 100 Entrepreneurship World Cup, Riyadh", "Winner of the ISF Award by HEC, Islamabad", "Runner-up, Pakistan Startup Cup, Islamabad"];
const participations = ["OIC Youth Scientific Congress 2022 - Kazan, Russia", "LEAP Expo 2022 - Riyadh, KSA", "Expo 2020 - Dubai, UAE", "Future of Construction Expo 2022 - Jeddah, KSA", "Proptech Convention 2022 - Karachi, Pakistan"];
const timeline = [["Summer 2019", "Founded at the National Incubation Center (NIC), Islamabad"], ["Fall 2020", "First corporate office at National Science & Technology Park"], ["Spring 2021", "Team exceeded 10 people"], ["Spring 2022", "Team exceeded 20 people"], ["Spring 2022", "Welcomed international recruits from Turkey & Egypt"]];
const testimonials = [
  ["Working with Mimar has been a smooth ride. My team has hardly faced any problems from their end as they keep a positive and professional attitude throughout the project.", "Ali Raza - Pakistan"],
  ["Their futuristic 3D technology really helped our team and boosted our sales to a great extent. The overall experience was wonderful.", "Umar Farooq - Pakistan"],
  ["Reasonable rates, clear communication, and top-quality VR services. They have the best talent for each service they offer.", "David Chen - USA"],
  ["The quality of the 3D renderings they delivered, and their ability to implement feedback is admirable. They take care of everything from top to bottom.", "Mohammed Al Hashmi - UAE"],
];
export default function AboutPage() {
  return <div>
    <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]))} />

    <section className="relative h-[100svh] min-h-[32rem] overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]">
      <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" aria-label="Animated aerial visualization introducing Mimar Studios">
        <source src="/about/about-us-animation.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
      <div className="container-page relative flex h-full items-end pb-14 pt-32 md:pb-16">
        <div className="w-full">
          <Reveal><p className="eyebrow mb-8 text-paper/65">About Mimar Studios</p></Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-5xl break-words text-[clamp(3rem,13vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.065em]">About Us</h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-xl text-lg leading-snug text-paper/90 md:text-xl">An architecture and visualization studio turning unbuilt ideas into clear, compelling experiences.</p>
          </Reveal>
          <Reveal delay={0.15}><Link href="/contact" className="button-pill mt-10 text-paper">Request a quote</Link></Reveal>
        </div>
      </div>
    </section>

    <section className="container-page section-py">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal><p className="eyebrow text-muted">/ About us</p></Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            <span className="block">An Architecture And</span>
            <span className="block text-accent">Visualization Studio.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}><p className="section-body mx-auto mt-7 max-w-xl">Based in Islamabad, working on residential, hospitality, corporate and public projects at an international level.</p></Reveal>
      </div>
    </section>

    <section className="container-page section-py">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <h2 className="section-heading">Mission</h2>
            <p className="section-body mx-auto mt-6 max-w-xl">Make unbuilt ideas clear and actionable, helping clients understand, refine, and confidently move their projects forward.</p>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mx-auto mt-14 max-w-2xl border-t border-line pt-14 md:mt-16 md:pt-16">
            <h2 className="section-heading">Vision</h2>
            <p className="section-body mx-auto mt-6 max-w-xl">Bring architects, visualizers, and designers together under one roof to carry every project from concept to experience.</p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="container-page grid gap-10 py-20 md:min-h-[44rem] md:grid-cols-2 md:items-center md:py-0">
      <Reveal><div className="max-w-xl md:py-28"><h2 className="text-[clamp(4rem,7vw,7rem)] font-medium uppercase leading-[.82] tracking-[-.06em]">Naqi<br /><span className="text-accent">Ejaz</span></h2><blockquote className="mt-12 text-2xl leading-tight tracking-[-.03em] md:text-3xl">“We did not start a rendering shop. We started a studio that makes buildings understandable before they exist.”</blockquote><p className="section-body mt-10 max-w-lg">Architect by training, technologist by necessity - he built the studio around one idea: a client should be able to walk a building, switch its finishes and watch its lights answer, long before the first pour.</p><Link href="/contact" className="button-pill mt-10 text-ink">Speak with the founder</Link></div></Reveal>
      <Reveal delay={0.08} className="motion-media relative h-[28rem] self-end sm:h-[34rem] md:h-[42rem]"><Image src="/about/naqi-ejaz-final.png" alt="Naqi Ejaz, founder of Mimar Studios" fill sizes="(max-width: 768px) 100vw, 50vw" quality={90} className="object-contain object-bottom" /></Reveal>
    </section>

    <section className="container-page py-12 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-6">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.05} className="flex min-h-40 flex-col items-center justify-center border-b border-line px-4 py-7 text-center even:border-l lg:col-span-1 lg:min-h-44 lg:border-b-0 lg:border-l-0 lg:border-r lg:px-5 lg:py-8 lg:last:border-r-0">
            <p className="text-[clamp(2.5rem,4.5vw,5rem)] leading-none tracking-[-.05em] text-accent"><AnimatedStatValue value={stat.value} /></p>
            <p className="eyebrow mt-5 flex min-h-10 max-w-32 items-start justify-center text-muted">{stat.label}</p>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="container-page grid gap-12 py-16 md:grid-cols-12 md:gap-14 md:py-32">
      <Reveal><p className="eyebrow text-muted md:col-span-2">/ The studio</p></Reveal>
      <div className="md:col-span-9 md:col-start-4">{studioNotes.map(([label, body], index) => <Reveal key={label} delay={index * 0.05}><div className="motion-row grid gap-5 border-t border-line py-9 md:grid-cols-[10rem_1fr]"><p className="eyebrow">{label}</p><p className="max-w-3xl text-xl leading-[1.25] tracking-[-.02em] md:text-2xl">{body}</p></div></Reveal>)}</div>
    </section>

    <section className="container-page grid gap-14 py-16 md:grid-cols-2 md:gap-16 md:py-32">{[["/ Awards", awards], ["/ Participations", participations]].map(([heading, items]) => <div key={heading as string}><Reveal><p className="eyebrow mb-10 text-muted">{heading as string}</p></Reveal><div className="border-t border-line">{(items as string[]).map((item, index) => <Reveal key={item} delay={index * 0.04}><p className="motion-row border-b border-line py-5 text-sm">{item}</p></Reveal>)}</div></div>)}</section>

    <section className="container-page py-16 md:py-32"><Reveal><p className="eyebrow mb-10 text-muted">/ Timeline</p></Reveal><div className="border-t border-line">{timeline.map(([date, event], index) => <Reveal key={`${date}-${event}`} delay={index * 0.04}><div className="motion-row grid gap-4 border-b border-line py-6 md:grid-cols-[14rem_1fr]"><p className="eyebrow text-muted">{date}</p><p>{event}</p></div></Reveal>)}</div></section>

    <section className="container-page py-16 md:py-32"><Reveal><p className="eyebrow mb-12 text-muted">/ Testimonials</p></Reveal><div className="grid gap-x-10 md:grid-cols-2">{testimonials.map(([quote, person], index) => <Reveal key={person} delay={index * 0.05}><blockquote className="border-t border-line py-9"><p className="text-xl leading-tight tracking-[-.02em] md:text-2xl">“{quote}”</p><footer className="eyebrow mt-8 text-muted">{person}</footer></blockquote></Reveal>)}</div></section>

    <section className="container-page py-16 md:py-32">
      <Reveal><p className="eyebrow mb-12 text-muted">/ What we do</p></Reveal>
      <div className="border-t border-line">{services.map(([title, body], index) => <Reveal key={title} delay={Math.min(index * 0.03, 0.15)}><div className="motion-row grid gap-5 border-b border-line py-8 md:grid-cols-[3rem_5fr_6fr] md:items-start"><p className="eyebrow text-muted">{String(index + 1).padStart(2, "0")}</p><h2 className="text-2xl font-medium tracking-[-.035em] md:text-4xl">{title}</h2><p className="section-body max-w-2xl">{body}</p></div></Reveal>)}</div>
    </section>

    <ContactCta />
  </div>;
}
