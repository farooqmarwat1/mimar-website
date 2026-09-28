import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import type { ServiceCard } from "@/lib/service-cards";

/** Alternating image/text service rows used on /services and hub service pages. */
export default function ServiceCards({ cards, titleTag: Title = "h2" }: { cards: ServiceCard[]; titleTag?: "h2" | "h3" }) {
  return (
    <>
      {cards.map((card, index) => (
        <Reveal key={card.slug} delay={Math.min(index * 0.025, 0.12)}>
          <Link href={card.href} className="group block">
            <article className="grid gap-8 border-b border-line py-12 md:grid-cols-12 md:items-center md:gap-12 md:py-16">
              <div className={`motion-media relative aspect-[16/10] overflow-hidden bg-ink/5 md:col-span-5 ${index % 2 === 1 ? "md:order-2" : ""}`}>
                {card.mediaType === "video" ? (
                  <video autoPlay muted loop playsInline preload="none" poster="/services/animations-poster.jpg" className="h-full w-full object-cover" aria-label="Architectural animation by Mimar Studios">
                    <source src={card.media} type="video/mp4" />
                  </video>
                ) : (
                  <Image src={card.media} alt={`${card.title} by Mimar Studios`} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 42vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                )}
              </div>
              <div className={`md:col-span-7 ${index % 2 === 1 ? "md:order-1" : ""}`}>
                <div className="grid gap-5 md:grid-cols-[3.5rem_1fr]">
                  <p className="eyebrow text-muted">{String(index + 1).padStart(2, "0")}</p>
                  <div>
                    <Title className="text-3xl font-medium leading-none tracking-[-.045em] transition-colors group-hover:text-accent md:text-[2.75rem]">{card.title}</Title>
                    <p className="mt-7 max-w-2xl text-xl leading-[1.2] tracking-[-.02em] md:text-2xl">{card.description}</p>
                    <ul className="mt-8 grid grid-cols-1 min-[420px]:grid-cols-2">
                      {card.deliverables.map((deliverable) => (
                        <li key={deliverable} className="eyebrow border-t border-line py-3 text-muted">{deliverable}</li>
                      ))}
                    </ul>
                    <span className="button-pill mt-6 text-ink">
                      Explore {card.title}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </Reveal>
      ))}
    </>
  );
}
