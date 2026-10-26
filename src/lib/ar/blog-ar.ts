import legacySeoArData from "@/content/legacy-seo.ar.json";
import { blogArchiveArticles, blogPageSize } from "@/lib/blog-archive";
import { blogCategories, legacySeoPages, type LegacySeoPage } from "@/lib/legacy-seo";
import { legacyCategories } from "@/lib/legacy-categories";

/**
 * Arabic blog data. The 45 translated articles live in
 * src/content/legacy-seo.ar.json (same order, paths and block structure as
 * legacy-seo.json). Category membership, archive order and pagination are
 * taken from the English modules and only mapped onto the Arabic pages, so
 * /ar/blog mirrors /blog exactly.
 *
 * Posts written in /admin (Firestore) are English-only and are deliberately
 * not part of any Arabic list or route.
 */
/**
 * The translated JSON keeps the English keyword lists. They are shown in the
 * article sidebar and emitted in Article JSON-LD, so they are replaced here
 * with Arabic equivalents (keyed by article path).
 */
const keywordsAr: Record<string, string[]> = {
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

/** The English page's Arabic counterpart, matched by path. */
function toArabic(pages: LegacySeoPage[]): LegacySeoPage[] {
  return pages
    .map((page) => getLegacySeoPageAr(page.path))
    .filter((page): page is LegacySeoPage => page !== undefined);
}

export const blogArchiveArticlesAr = toArabic(blogArchiveArticles);
export const blogPageCountAr = Math.ceil(blogArchiveArticlesAr.length / blogPageSize);

export function getBlogArchivePageAr(page: number): LegacySeoPage[] {
  if (!Number.isInteger(page) || page < 1 || page > blogPageCountAr) return [];
  const start = (page - 1) * blogPageSize;
  return blogArchiveArticlesAr.slice(start, start + blogPageSize);
}

export function getCategoryArticlesAr(slug: string) {
  const category = blogCategories.find((c) => c.slug === slug);
  if (!category) return { category: undefined, articles: [] as LegacySeoPage[] };
  const articles = category.articlePaths
    .map((path) => getLegacySeoPageAr(path))
    .filter((page): page is LegacySeoPage => page !== undefined);
  return { category, articles };
}

export function getLegacyCategoryAr(slug: string) {
  const category = legacyCategories.find((c) => c.slug === slug);
  const articles = (category?.articlePaths ?? [])
    .map((path) => getLegacySeoPageAr(path))
    .filter((page): page is LegacySeoPage => page !== undefined);
  return { category, articles };
}

/** One-segment /blog/{slug} articles (served by /ar/blog/[category]). */
export function arabicBlogArticleSlugs(): string[] {
  return legacySeoPagesAr
    .map((page) => page.path.slice(1).split("/"))
    .filter((segments) => segments.length === 2 && segments[0] === "blog")
    .map((segments) => segments[1]);
}

/** Every other article path (served by the /ar/[...legacy] catch-all). */
export function arabicCatchAllSegments(): string[][] {
  return legacySeoPagesAr
    .map((page) => page.path.slice(1).split("/"))
    .filter((segments) => !(segments.length === 2 && segments[0] === "blog"));
}

/** Sanity check used by scripts/tests: every English article has an Arabic twin. */
export function missingArabicPaths(): string[] {
  return legacySeoPages.filter((page) => !getLegacySeoPageAr(page.path)).map((page) => page.path);
}
