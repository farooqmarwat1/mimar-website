import type { Locale } from "@/i18n/config";

/**
 * Alt text for service-page images (SEO scope item 12). The hero, output tiles and sliders on the
 * service pages used to carry alt="" or only "<title> by Mimar Studios". Each service now has the
 * keyword buyers search for ("3D rendering", "VR 360 tours for real estate", ...), so an image reads
 * "<what it is>: <service keyword> by Mimar Studios". The text names the service and the kind of
 * work, never a subject the image may not show (the gallery files differ from page to page).
 * Keyword choices follow the keyword map in SEO_MIGRATION.md and the Arabic H1 wording in ARABIC.md.
 */
type Keyword = { en: string; ar: string };

const serviceKeyword: Record<string, Keyword> = {
  "architectural-design": { en: "architectural design services", ar: "خدمات التصميم المعماري" },
  "3d-visualization": { en: "3D architectural visualization and rendering services", ar: "خدمات التصور المعماري ثلاثي الأبعاد والرندرة" },
  "interactive-services": { en: "interactive real estate visualization", ar: "الخدمات التفاعلية للتصور العقاري" },
  "vr-360-tours": { en: "VR 360 virtual tours for real estate", ar: "جولات افتراضية VR 360 للعقارات" },
  "web-tours": { en: "web-based 360 virtual property tours", ar: "جولات افتراضية 360 للعقارات عبر الويب" },
  "dual-screen-navigator": { en: "dual screen interactive property navigator", ar: "متصفح عقاري تفاعلي ثنائي الشاشة" },
  "interactive-prints": { en: "interactive architectural prints", ar: "مطبوعات معمارية تفاعلية" },
  "property-explorer": { en: "interactive property explorer for real estate", ar: "مستكشف العقارات التفاعلي" },
  "smart-home": { en: "virtual smart home experience", ar: "تجربة المنزل الذكي الافتراضي" },
  branding: { en: "real estate branding services", ar: "خدمات الهوية التجارية للعقارات" },
  marketing: { en: "real estate marketing services", ar: "خدمات التسويق العقاري" },
  "architectural-design-services": { en: "architectural design services", ar: "خدمات التصميم المعماري" },
  "interior-design-services": { en: "interior design services", ar: "خدمات التصميم الداخلي" },
  "urban-planning": { en: "urban planning and master planning", ar: "التخطيط العمراني والمخططات العامة" },
  "smart-topography-survey": { en: "topography survey and terrain mapping", ar: "المسح الطبوغرافي ورسم خرائط التضاريس" },
  "3d-views": { en: "3D exterior and interior rendering", ar: "الرندرة ثلاثية الأبعاد للواجهات الخارجية والداخلية" },
  aerials: { en: "aerial 3D rendering for real estate projects", ar: "التصور الجوي ثلاثي الأبعاد للمشاريع العقارية" },
  cinematics: { en: "architectural walkthrough animation", ar: "أفلام التجوال المعماري المتحركة" },
  "branding-collateral": { en: "real estate branding collateral", ar: "المواد الدعائية للهوية العقارية" },
  stationery: { en: "corporate stationery design", ar: "تصميم القرطاسية المؤسسية" },
  "marketing-collateral": { en: "real estate marketing collateral", ar: "المواد التسويقية العقارية" },
  "digital-marketing": { en: "digital marketing for real estate", ar: "التسويق الرقمي العقاري" },
  "social-media-marketing": { en: "social media marketing for real estate", ar: "التسويق العقاري عبر وسائل التواصل الاجتماعي" },
  "web-development": { en: "real estate website development", ar: "تطوير مواقع العقارات" },
  seo: { en: "SEO services for real estate", ar: "خدمات تحسين محركات البحث للعقارات" },
};

const byLabel = (lang: Locale) => (lang === "ar" ? "من استوديوهات معمار" : "by Mimar Studios");

/**
 * Alt text for a service image. `detail` names the specific thing shown (an output tile or a slider
 * section); leave it out for the page hero, which then reads "<title>: <keyword> by Mimar Studios".
 * An unknown slug falls back to "<detail or title> by Mimar Studios".
 */
export function serviceImageAlt(slug: string, title: string, lang: Locale, detail?: string): string {
  const subject = detail && detail.trim() ? detail.trim() : title;
  const keyword = serviceKeyword[slug]?.[lang === "ar" ? "ar" : "en"];
  const tail = byLabel(lang);
  if (!keyword || keyword.toLowerCase() === subject.toLowerCase()) return `${subject} ${tail}`;
  return `${subject}: ${keyword} ${tail}`;
}
