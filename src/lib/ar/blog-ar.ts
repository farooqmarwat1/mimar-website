import legacySeoArData from "@/content/legacy-seo.ar.json";
import { legacySeoPages, type LegacySeoPage } from "@/lib/legacy-seo";

/**
 * Arabic text of the 45 migrated articles (src/content/legacy-seo.ar.json: same
 * order, paths and block structure as legacy-seo.json). It is the source for the
 * one-time import into Firestore (blog-import.ts) and the fallback the site
 * renders when Firestore cannot be reached. Lists, pagination and routing come
 * from blog-store.ts.
 */
/**
 * The translated JSON keeps the English keyword lists. They are shown in the
 * article sidebar and emitted in Article JSON-LD, so they are replaced here
 * with Arabic equivalents (keyed by article path).
 */
export const keywordsAr: Record<string, string[]> = {
  "/blog/3d-animation-services": ["خدمات الرسوم المتحركة ثلاثية الأبعاد", "خدمات النمذجة ثلاثية الأبعاد", "خدمات الموشن جرافيك", "خدمات الرندرة", "التصور المعماري"],
  "/blog/3d-rendering": ["الرندرة ثلاثية الأبعاد", "خدمات الرندرة ثلاثية الأبعاد", "تطبيقات خدمات الرندرة ثلاثية الأبعاد", "المسح ثلاثي الأبعاد"],
  "/blog/ai-architecture-rendering": ["الرندرة المعمارية بالذكاء الاصطناعي", "كيف تعمل برامج الرندرة بالذكاء الاصطناعي", "فوائد الرندرة المعمارية بالذكاء الاصطناعي"],
  "/blog/apartment-3d-virtual-tour": ["جولة افتراضية ثلاثية الأبعاد للشقق", "جولات افتراضية ثلاثية الأبعاد للشقق", "13 فائدة للجولات الافتراضية للشقق", "الجولات الافتراضية للشقق الاستوديو", "الشقق"],
  "/blog/architectural-services": ["الخدمات المعمارية", "الخدمات المعمارية في باكستان", "الخدمات المعمارية في لاهور", "الخدمات المعمارية في كراتشي", "الخدمات المعمارية في إسلام آباد"],
  "/blog/architecture/stages-of-architectural-design": ["مراحل التصميم المعماري"],
  "/blog/best-architects-in-islamabad": ["المعماريون في إسلام آباد", "أفضل المعماريين في إسلام آباد", "التصور المعماري ثلاثي الأبعاد"],
  "/blog/brand-vs-company": ["العلامة التجارية مقابل الشركة", "ما هي العلامة التجارية؟", "العلامة التجارية مقابل النشاط التجاري", "أساسيات الهوية التجارية", "دور الهوية التجارية"],
  "/blog/elements-in-interior-design": ["عناصر التصميم الداخلي", "التصميم الداخلي في العمارة"],
  "/blog/rendering-techniques": ["تقنيات الرندرة", "أنواع تقنيات الرندرة", "8 نصائح أساسية لتحسين جودة الرندرة ثلاثية الأبعاد", "خدمات النمذجة ثلاثية الأبعاد", "الرندرة ثلاثية الأبعاد"],
  "/blog/visualizing-architecture": ["تصور العمارة", "شركة رندرة معمارية ثلاثية الأبعاد", "الرسوم المتحركة المعمارية"],
  "/metaverse-development-a-complete-guide-for-businesses": ["تطوير الميتافيرس", "الميتافيرس للأعمال", "التوأم الرقمي في العقارات", "صالة العرض الافتراضية"],
};

export const legacySeoPagesAr: LegacySeoPage[] = (legacySeoArData as unknown as LegacySeoPage[]).map((page) => ({
  ...page,
  keywords: keywordsAr[page.path] ?? page.keywords,
}));

export function getLegacySeoPageAr(path: string): LegacySeoPage | undefined {
  const normalized = `/${path.replace(/^\/+|\/+$/g, "")}`;
  return legacySeoPagesAr.find((page) => page.path === normalized);
}

/** Sanity check used by scripts/tests: every English article has an Arabic twin. */
export function missingArabicPaths(): string[] {
  return legacySeoPages.filter((page) => !getLegacySeoPageAr(page.path)).map((page) => page.path);
}
