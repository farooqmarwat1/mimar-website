import Link from "@/components/ui/Link";
import Reveal from "@/components/ui/Reveal";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { regions } from "@/lib/regions";

/**
 * Home page "Global footprint": crawlable, descriptive links from the home page
 * (the site's strongest page) down to the market pages.
 *
 * Added for Deliverable 4 (19 Nov 2026, SEO_MIGRATION.md point 32): US city and
 * outsourcing queries were landing on the home page while the USA page sat at
 * position 52.7 with almost no internal links. The two US anchors are the
 * consultant's ("3D architectural rendering services in the USA", "Outsource 3D
 * rendering for US real estate developments"). Keep the anchors descriptive -
 * they tell search engines what each page is about.
 */
const content = {
  en: {
    eyebrow: "/ Global footprint",
    heading1: "One studio.",
    heading2: "Developers in 10+ countries.",
    bodyBefore:
      "Developers and architects in the United States, the Gulf and Pakistan send us their drawings and get photorealistic renders, animation and tours back. Building in America? ",
    bodyLink: "Outsource 3D rendering for US real estate developments",
    bodyAfter: " to a team that works from imperial drawings and overlaps your working day.",
    markets: [
      { key: "usa", label: "3D architectural rendering services in the USA", cities: "New York, Los Angeles, San Francisco, Dallas, Houston, Miami" },
      { key: "uae", label: "3D rendering services in Dubai & the UAE", cities: "Dubai, Abu Dhabi, Sharjah" },
      { key: "saudiArabia", label: "3D rendering services in Saudi Arabia", cities: "Riyadh, Jeddah" },
      { key: "middleEast", label: "3D visualization services in the Middle East", cities: "UAE, Saudi Arabia, Oman" },
      { key: "pakistan", label: "3D architecture & rendering firm in Pakistan", cities: "Islamabad, Lahore, Karachi, Multan" },
    ],
  },
  ar: {
    eyebrow: "/ حضورنا العالمي",
    heading1: "استوديو واحد.",
    heading2: "مطورون في أكثر من 10 دول.",
    bodyBefore:
      "يرسل إلينا المطورون والمعماريون في الولايات المتحدة والخليج وباكستان رسوماتهم، ويتسلّمون رندرات فائقة الواقعية ورسوماً متحركة وجولات افتراضية. هل تبني في أمريكا؟ ",
    bodyLink: "أسند الرندرة ثلاثية الأبعاد لمشاريعك العقارية في الولايات المتحدة",
    bodyAfter: " إلى فريق يعمل من الرسومات بالأقدام والبوصات وتتداخل ساعات عمله مع يومك.",
    markets: [
      { key: "usa", label: "خدمات الرندرة المعمارية ثلاثية الأبعاد في الولايات المتحدة", cities: "نيويورك، لوس أنجلوس، سان فرانسيسكو، دالاس، هيوستن، ميامي" },
      { key: "uae", label: "خدمات الرندرة ثلاثية الأبعاد في دبي والإمارات", cities: "دبي، أبوظبي، الشارقة" },
      { key: "saudiArabia", label: "خدمات الرندرة ثلاثية الأبعاد في السعودية", cities: "الرياض، جدة" },
      { key: "middleEast", label: "خدمات التصور ثلاثي الأبعاد في الشرق الأوسط", cities: "الإمارات، السعودية، عُمان" },
      { key: "pakistan", label: "شركة عمارة ورندرة ثلاثية الأبعاد في باكستان", cities: "إسلام آباد، لاهور، كراتشي، ملتان" },
    ],
  },
} as const;

export default function GlobalFootprint({ lang = "en" }: { lang?: Locale }) {
  const c = content[lang === "ar" ? "ar" : "en"];
  const href = (key: string) => localeHref(lang, regions[key].path);
  const arrow = isRtl(lang) ? "←" : "→";

  return (
    <section className="container-page section-py" aria-labelledby="global-footprint-heading">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="global-footprint-heading" className="section-heading mx-auto mt-6">
            <span className="block">{c.heading1}</span>{" "}
            <span className="block text-accent">{localizeDigits(c.heading2, lang)}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-7 max-w-xl">
            {c.bodyBefore}
            <Link href={href("usa")} className="underline decoration-line underline-offset-4 transition-colors hover:text-accent">
              {c.bodyLink}
            </Link>
            {c.bodyAfter}
          </p>
        </Reveal>
      </div>
      <ul className="mx-auto mt-14 grid max-w-7xl gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
        {c.markets.map((market, index) => (
          <li key={market.key}>
            <Reveal delay={(index % 5) * 0.05} className="h-full">
              <Link href={href(market.key)} className="group block h-full border-t border-line pt-5">
                <span className="block text-lg leading-snug tracking-tight transition-colors group-hover:text-accent">
                  {market.label} <span aria-hidden="true">{arrow}</span>
                </span>
                <span className="section-body mt-2 block text-sm">{market.cities}</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
