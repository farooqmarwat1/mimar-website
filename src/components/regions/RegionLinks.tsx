import Link from "@/components/ui/Link";
import Reveal from "@/components/ui/Reveal";
import { isRtl, localeHref, pick, type Locale } from "@/i18n/config";
import { regionList } from "@/lib/regions";
import { localizeRegion } from "@/lib/ar/regions.ar";

/**
 * "Where we deliver": links from a core service page down to the five region
 * pages, with each page's short label as the anchor. Deliverable 5 asks for
 * link equity to flow between the core 3D Visualization page and the regional
 * pages in both directions; the region pages already link up in their market
 * copy (SEO_MIGRATION.md point 36).
 */
export default function RegionLinks({ lang = "en" }: { lang?: Locale }) {
  const arrow = isRtl(lang) ? "←" : "→";
  const regions = regionList.map((region) => localizeRegion(region, lang));
  return (
    <section className="container-page py-16 md:py-28" aria-labelledby="region-links-heading">
      <Reveal>
        <h2 id="region-links-heading" className="eyebrow mb-10 text-muted">
          {pick(lang, "/ Where we deliver 3D visualization", "/ أين نقدّم خدمات التصور ثلاثي الأبعاد")}
        </h2>
      </Reveal>
      <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region, index) => (
          <li key={region.path}>
            <Reveal delay={(index % 3) * 0.05} className="h-full">
              <Link href={localeHref(lang, region.path)} className="group block h-full border-t border-line pt-5">
                <span className="block text-lg leading-snug transition-colors group-hover:text-accent">
                  {region.label} <span aria-hidden="true">{arrow}</span>
                </span>
                <span className="section-body mt-2 block text-sm">{region.city}</span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
