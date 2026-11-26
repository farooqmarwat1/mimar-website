import Link from "@/components/ui/Link";
import Reveal from "@/components/ui/Reveal";
import { isRtl, localeHref, localizeDigits, type Locale } from "@/i18n/config";
import { regions } from "@/lib/regions";

/**
 * Home page "Global footprint": crawlable links from the home page (the site's strongest page) down
 * to the market pages.
 *
 * Added for Deliverable 4 (19 Nov 2026, SEO_MIGRATION.md point 32). Reworked on 26 Nov 2026 after
 * the fact checker's review (point 42): card headings are the market names, and the keywords with
 * the cities sit in the description. The whole card is one link, so both are its link text. Keep
 * the exact Deliverable 4 phrase "3D architectural rendering services in the USA" in the USA card.
 */
const content = {
  en: {
    eyebrow: "/ Our markets",
    heading1: "Our global footprint.",
    heading2: "Projects across 10+ countries.",
    body:
      "Mimar Studios is a 3D architecture firm working with developers and architects across the United States, the Gulf and Pakistan, delivering design, visualization and marketing.",
    markets: [
      { key: "usa", label: "USA", cities: "3D architectural rendering services in the USA: New York, Los Angeles, San Francisco, Dallas, Houston, Miami" },
      { key: "uae", label: "Dubai & the UAE", cities: "3D rendering services in Dubai, Abu Dhabi and Sharjah" },
      { key: "saudiArabia", label: "Saudi Arabia", cities: "3D rendering services in Riyadh and Jeddah" },
      { key: "middleEast", label: "Middle East", cities: "3D visualization services for Oman, Qatar and the wider GCC" },
      { key: "pakistan", label: "Pakistan", cities: "3D visualization services in Islamabad, Lahore, Karachi and Multan" },
    ],
  },
  ar: {
    eyebrow: "/ أسواقنا",
    heading1: "حضورنا العالمي.",
    heading2: "مشاريع في أكثر من 10 دول.",
    body:
      "استوديوهات معمار شركة عمارة وتصور ثلاثي الأبعاد تعمل مع المطورين والمعماريين في الولايات المتحدة والخليج وباكستان، وتقدّم خدمات التصميم والتصور البصري والتسويق.",
    markets: [
      { key: "usa", label: "الولايات المتحدة", cities: "خدمات الرندرة المعمارية ثلاثية الأبعاد في الولايات المتحدة: نيويورك، لوس أنجلوس، سان فرانسيسكو، دالاس، هيوستن، ميامي" },
      { key: "uae", label: "دبي والإمارات", cities: "خدمات الرندرة ثلاثية الأبعاد في دبي وأبوظبي والشارقة" },
      { key: "saudiArabia", label: "السعودية", cities: "خدمات الرندرة ثلاثية الأبعاد في الرياض وجدة" },
      { key: "middleEast", label: "الشرق الأوسط", cities: "خدمات التصور ثلاثي الأبعاد لعُمان وقطر وبقية دول الخليج" },
      { key: "pakistan", label: "باكستان", cities: "خدمات التصور ثلاثي الأبعاد في إسلام آباد ولاهور وكراتشي وملتان" },
    ],
  },
} as const;

export default function GlobalFootprint({ lang = "en" }: { lang?: Locale }) {
  const c = content[lang === "ar" ? "ar" : "en"];
  const href = (key: string) => localeHref(lang, regions[key].path);
  const arrow = isRtl(lang) ? "←" : "→";

  return (
    <section className="container-page section-py" aria-labelledby="global-footprint-heading">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="eyebrow text-muted">{c.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 id="global-footprint-heading" className="section-heading mx-auto mt-6">
            <span className="block">{c.heading1}</span>{" "}
            <span className="block text-balance text-accent">{localizeDigits(c.heading2, lang)}</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-body mx-auto mt-7 max-w-xl">
            {c.body}
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
