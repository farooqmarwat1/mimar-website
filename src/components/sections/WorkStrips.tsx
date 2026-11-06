import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { arClass } from "@/lib/page-helpers";
import type { Locale } from "@/i18n/config";

// Two strips of renders that drift in opposite directions. The photos are decorative (the heading names
// the section), so the strips are hidden from screen readers and carry no alt text.
const TOP_ROW = [
  "/hero/03-pool.webp",
  "/hero/04-lobby.webp",
  "/hero/02-sunset.webp",
  "/hero/06-residence.webp",
  "/hero/journey-03-bedroom.webp",
  "/hero/fallback.webp",
];

const BOTTOM_ROW = [
  "/hero/journey-01-exterior.webp",
  "/hero/06-interior.webp",
  "/hero/05-amenity.webp",
  "/hero/03-courtyard.webp",
  "/hero/02-exterior.webp",
  "/hero/01-aerial.webp",
];

type WorkCopy = { heading1: string; heading2: string; label: string };

function Strip({ images, direction }: { images: string[]; direction: "left" | "right" }) {
  return (
    <div className="work-mask">
      <div className={`work-track ${direction === "left" ? "work-track-left" : "work-track-right"} flex w-max gap-3 sm:gap-4`}>
        {/* The set is repeated once so the loop (a shift of exactly half the track) is seamless. */}
        {[...images, ...images].map((src, index) => (
          <figure key={`${src}-${index}`} className="relative h-40 w-60 shrink-0 overflow-hidden bg-line sm:h-[226px] sm:w-[340px]">
            <Image src={src} alt="" fill sizes="(max-width: 640px) 240px, 340px" className="object-cover" />
          </figure>
        ))}
      </div>
    </div>
  );
}

/** Banner under the contact form: "Selected work" heading above two opposite-direction strips of renders. */
export default function WorkStrips({ lang, copy }: { lang: Locale; copy: WorkCopy }) {
  return (
    <section className="work-strips overflow-hidden border-t border-line py-16 md:py-24">
      <div className="container-page mb-9 flex items-end justify-between gap-6">
        <Reveal>
          <h2 className={`section-heading uppercase leading-[.95] tracking-[-.05em]${arClass(lang, "rtl:leading-[1.3]")}`}>
            {copy.heading1}
            {" "}<br />
            <span className="text-accent">{copy.heading2}</span>
          </h2>
        </Reveal>
        <p className="eyebrow hidden text-muted sm:block">{copy.label}</p>
      </div>
      {/* dir="ltr": the strips are pictures, so they drift the same way in the Arabic page. */}
      <div dir="ltr" aria-hidden="true" className="flex flex-col gap-3 sm:gap-4">
        <Strip images={TOP_ROW} direction="left" />
        <Strip images={BOTTOM_ROW} direction="right" />
      </div>
    </section>
  );
}
