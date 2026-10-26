/**
 * Regional home-page tab title.
 *
 * SEO / GEO rule (SEO_MIGRATION.md): nothing a crawler or answer engine reads
 * depends on the visitor's country. The server always renders the default
 * title, meta and JSON-LD; `src/proxy.ts` stores the visitor's region in a
 * cookie (never for bots) and `RegionalTitle` changes `document.title` in the
 * browser after load. Edit the titles here only.
 */

export const REGION_COOKIE = "mimar_region";

export type RegionCode = "sa" | "ae" | "gulf" | "pk" | "us" | "arab";

const GULF_COUNTRIES = ["KW", "QA", "BH", "OM"];

// Arabic-speaking countries without their own copy (SA, UAE and the Gulf above are handled first).
const OTHER_ARAB_COUNTRIES = ["EG", "JO", "LB", "IQ", "SY", "YE", "PS", "MA", "DZ", "TN", "LY", "SD", "MR", "SO", "DJ", "KM", "TD", "EH"];

/** ISO 3166-1 alpha-2 country code -> region, or null when the visitor gets the default copy. */
export function regionFromCountry(country: string | null | undefined): RegionCode | null {
  const code = country?.toUpperCase();
  if (!code) return null;
  if (code === "SA") return "sa";
  if (code === "AE") return "ae";
  if (code === "PK") return "pk";
  if (code === "US") return "us";
  if (GULF_COUNTRIES.includes(code)) return "gulf";
  if (OTHER_ARAB_COUNTRIES.includes(code)) return "arab";
  return null;
}

export function isRegionCode(value: string | null | undefined): value is RegionCode {
  return value === "sa" || value === "ae" || value === "gulf" || value === "pk" || value === "us" || value === "arab";
}

/**
 * Browser-tab title per region, for the home page only. A region with no entry (and every
 * bot / unmapped country) keeps the page's default title, which is the SEO-exact old one.
 * The Arabic default title already leads with Saudi Arabia and the Gulf; the Arabic entries
 * only localise it for the visitor's region.
 */
export const regionalTitles: Record<"en" | "ar", Partial<Record<RegionCode, string>>> = {
  en: {
    sa: "Mimar: 3D Architecture & Rendering Firm in Saudi Arabia",
    ae: "Mimar: 3D Architecture & Rendering Firm in the UAE",
    gulf: "Mimar: 3D Architecture & Rendering Firm in the Gulf",
    pk: "Mimar: 3D Architecture & Rendering Firm in Pakistan",
    us: "Mimar: 3D Architecture & Rendering Firm for US Developers",
  },
  ar: {
    sa: "ميمار ستوديوز: شركة عمارة وتصيير ثلاثي الأبعاد في السعودية",
    gulf: "ميمار ستوديوز: شركة عمارة وتصيير ثلاثي الأبعاد في الخليج",
    arab: "ميمار ستوديوز: شركة عمارة وتصيير ثلاثي الأبعاد في الوطن العربي",
  },
};
