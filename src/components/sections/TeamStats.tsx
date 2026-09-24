import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import AnimatedStatValue from "@/components/ui/AnimatedStatValue";
import ViewportVideo from "@/components/ui/ViewportVideo";
import { stats } from "@/lib/site-config";

export default function TeamStats() {
  return (
    <section className="bg-paper text-ink section-py">
      <div className="container-page mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">/ Studio</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-heading mx-auto mt-6">
            A Team That Produces
            <span className="block text-accent">Shared Creativity.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-6 max-w-xl">
            Taking care of what is in process and excited about what is to come.
          </p>
        </Reveal>
      </div>

      {/* Full-bleed, edge-to-edge - same treatment as the hero and services
          videos, instead of being boxed into a grid column next to text. */}
      <Reveal variant="mask" delay={0.1}>
        {/* Phones size to the clip's own ratio instead of a tall vh box -
            the footage is 20:9, so a near-square viewport-height container
            was cropping most of the frame width away. Desktop keeps the
            tall full-bleed treatment, where the crop is minimal. */}
        <div className="motion-media relative mt-10 aspect-[16/9] w-full md:mt-14 md:aspect-auto md:h-[62vh]">
          <ViewportVideo
            src="/home/team-that-produces.mp4"
            poster="/home/team-that-produces-poster.jpg"
            label="The Mimar Studios team collaborating on architectural visualization work"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </Reveal>

      <div className="container-page mx-auto mt-10 max-w-7xl md:mt-14">
        <div className="grid grid-cols-2 lg:grid-cols-6">
          {stats.map((stat, index) => (
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
        <Reveal delay={0.24} className="mt-12 flex justify-center md:mt-14">
          <Link href="/about" className="button-pill text-ink">
            Explore the studio
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
