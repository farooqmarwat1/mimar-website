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


// Alt text for the renders in the strips, written from the images. The strips stay hidden from screen
// readers (they move, and the heading names the section), but Google Images reads the alt, so each
// render carries a keyword description. The second, repeated copy repeats the same alt.
const STRIP_ALT: Record<string, { en: string; ar: string }> = {
  "/hero/03-pool.webp": { en: "Residential tower with a terraced resort-style swimming pool, 3D architectural rendering by Mimar Studios", ar: "برج سكني مع مسبح مدرّج بطراز المنتجعات، رندر معماري ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/04-lobby.webp": { en: "Luxury residential lobby with a reception desk and timber screens, interior 3D rendering by Mimar Studios", ar: "ردهة سكنية فاخرة مع مكتب استقبال وحواجز خشبية، رندر داخلي ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/02-sunset.webp": { en: "Apartment tower balconies at sunset with a city skyline, 3D architectural visualization by Mimar Studios", ar: "شرفات برج سكني عند الغروب مع أفق المدينة، تصور معماري ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/06-residence.webp": { en: "Apartment living and dining area with floor-to-ceiling windows, interior design visualization by Mimar Studios", ar: "منطقة معيشة وطعام في شقة بنوافذ بطول الجدار، تصور للتصميم الداخلي من استوديوهات معمار" },
  "/hero/journey-03-bedroom.webp": { en: "Private bedroom overlooking a lakeside development at dusk, interior 3D rendering by Mimar Studios", ar: "غرفة نوم خاصة تطل على مشروع على ضفاف بحيرة عند الغسق، رندر داخلي ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/fallback.webp": { en: "Low-rise townhouse facades among palm trees at dusk, exterior 3D rendering by Mimar Studios", ar: "واجهات تاون هاوس منخفضة الارتفاع بين أشجار النخيل عند الغسق، رندر خارجي ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/journey-01-exterior.webp": { en: "Lakeside residential building lit at dusk, 3D architectural visualization by Mimar Studios", ar: "مبنى سكني على ضفاف بحيرة تضيئه أنوار الغسق، تصور معماري ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/06-interior.webp": { en: "Living room with a marble feature wall, TV and shelving, interior design visualization by Mimar Studios", ar: "غرفة معيشة بجدار رخامي وتلفاز ورفوف، تصور للتصميم الداخلي من استوديوهات معمار" },
  "/hero/05-amenity.webp": { en: "Residential gym with treadmills and a view of the pool, amenity 3D rendering by Mimar Studios", ar: "نادٍ رياضي سكني بأجهزة جري مع إطلالة على المسبح، رندر ثلاثي الأبعاد للمرافق من استوديوهات معمار" },
  "/hero/03-courtyard.webp": { en: "Residential courtyard with a splash pad and playground between apartment towers, 3D architectural rendering by Mimar Studios", ar: "فناء سكني بمنطقة ألعاب مائية وملعب بين أبراج الشقق، رندر معماري ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/02-exterior.webp": { en: "Terraced apartment complex around a curved resort pool, exterior 3D rendering by Mimar Studios", ar: "مجمع شقق مدرّج حول مسبح منحنٍ بطراز المنتجعات، رندر خارجي ثلاثي الأبعاد من استوديوهات معمار" },
  "/hero/01-aerial.webp": { en: "Aerial view of a landmark residential tower in a master-planned district, 3D architectural visualization by Mimar Studios", ar: "منظر جوي لبرج سكني بارز في حي مخطط، تصور معماري ثلاثي الأبعاد من استوديوهات معمار" },
};

type WorkCopy = { heading1: string; heading2: string; label: string };

function Strip({ images, direction, lang }: { images: string[]; direction: "left" | "right"; lang: Locale }) {
  return (
    <div className="work-mask">
      <div className={`work-track ${direction === "left" ? "work-track-left" : "work-track-right"} flex w-max gap-3 sm:gap-4`}>
        {/* The set is repeated once so the loop (a shift of exactly half the track) is seamless. */}
        {[...images, ...images].map((src, index) => (
          <figure key={`${src}-${index}`} className="relative h-40 w-60 shrink-0 overflow-hidden bg-line sm:h-[226px] sm:w-[340px]">
            <Image src={src} alt={STRIP_ALT[src]?.[lang === "ar" ? "ar" : "en"] ?? ""} fill sizes="(max-width: 640px) 240px, 340px" className="object-cover" />
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
        <Strip images={TOP_ROW} direction="left" lang={lang} />
        <Strip images={BOTTOM_ROW} direction="right" lang={lang} />
      </div>
    </section>
  );
}
