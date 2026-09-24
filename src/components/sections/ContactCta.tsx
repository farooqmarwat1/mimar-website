import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

export default function ContactCta() {
  return (
    <section className="section-py">
      <div className="container-page mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">/ Get in touch</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            Tell us about the project.
            <br />
            <span className="text-accent">We will take it from there.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-6 max-w-md">
            Share a few details and one of our architects will get back to you within a day.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Link href="/contact" className="button-pill mt-9 text-ink">
            Start a conversation
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
