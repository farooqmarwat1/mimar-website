import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function StudioIntro() {
  return (
    <section className="container-page section-py">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">/ Studio</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            <span className="block">Design. Visualize.</span>
            <span className="block text-accent">Experience.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-7 max-w-xl">
            Your one-stop architecture and design studio. Mimar Studios brings architects,
            visualizers, and designers together under one roof to deliver projects from concept
            to experience.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href="/services" className="button-pill mt-9 text-ink">
            Go to services
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
