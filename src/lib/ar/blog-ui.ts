import { localizeDigits, type Locale } from "@/i18n/config";
import type { BlogCategory } from "@/lib/legacy-seo";
import type { LegacyCategory } from "@/lib/legacy-categories";

/**
 * Blog / article UI strings and the Arabic overlays for the blog category
 * data (legacy-seo.ts `blogCategories`, legacy-categories.ts). The English
 * modules are never changed; Arabic pages read these instead.
 *
 * Strings with a number or a name in the middle are stored as `[before, after]`
 * pairs and rendered as `{before}{value}{after}`. English keeps exactly the
 * text-node split the original JSX had, so the English HTML is unchanged.
 */

export type BlogUi = {
  home: string;
  blog: string;
  /** "Page" word used in breadcrumb names, e.g. "Page 2". */
  pageWord: string;
  journalEyebrow: string;
  /** H1 of /blog: "Our " + accent "Blog". */
  archiveH1Lead: string;
  archiveH1Accent: string;
  archiveBody: string;
  categoriesHeading: string;
  exploreByTopic: string;
  latestBlogs: string;
  categoriesAria: string;
  allBlogs: string;
  pagesAria: string;
  previous: string;
  next: string;
  /** "/ {n} articles" */
  archiveCount: [string, string];
  /** "Page {page} of {count}" */
  pageOf: [string, string];
  itemListArchive: string;
  /** Eyebrow link on category pages: "/ Blog". */
  breadcrumbBlog: string;
  // Article template
  faqHeading: string;
  relatedHeading: string;
  sourcesHeading: string;
};

const en: BlogUi = {
  home: "Home",
  blog: "Blog",
  pageWord: "Page",
  journalEyebrow: "/ Mimar Journal",
  archiveH1Lead: "Our ",
  archiveH1Accent: "Blog",
  archiveBody:
    "Discover where design meets innovation: Your ultimate blog for everything real estate, architecture, and cutting-edge technology.",
  categoriesHeading: "Categories",
  exploreByTopic: "Explore by topic",
  latestBlogs: "Latest Blogs",
  categoriesAria: "Blog categories",
  allBlogs: "All blogs",
  pagesAria: "Blog pages",
  previous: "← Previous",
  next: "Next →",
  archiveCount: ["/ ", " articles"],
  pageOf: ["Page ", " of "],
  itemListArchive: "Mimar Studios latest blogs",
  breadcrumbBlog: "/ Blog",
  faqHeading: "Frequently asked questions",
  relatedHeading: "Related reading",
  sourcesHeading: "Sources",
};

const ar: BlogUi = {
  home: "الرئيسية",
  blog: "المدونة",
  pageWord: "صفحة",
  journalEyebrow: "/ مجلة ميمار",
  archiveH1Lead: "مدونة ",
  archiveH1Accent: "ميمار",
  archiveBody:
    "اكتشف نقطة التقاء التصميم بالابتكار: مدونتك الشاملة لكل ما يتعلق بالعقارات والعمارة وأحدث التقنيات.",
  categoriesHeading: "التصنيفات",
  exploreByTopic: "تصفّح حسب الموضوع",
  latestBlogs: "أحدث المقالات",
  categoriesAria: "تصنيفات المدونة",
  allBlogs: "كل المقالات",
  pagesAria: "صفحات المدونة",
  previous: "→ السابق",
  next: "التالي ←",
  archiveCount: ["/ ", " مقالاً"],
  pageOf: ["صفحة ", " من "],
  itemListArchive: "أحدث مقالات ميمار ستوديوز",
  breadcrumbBlog: "/ المدونة",
  faqHeading: "الأسئلة الشائعة",
  relatedHeading: "قراءات ذات صلة",
  sourcesHeading: "المصادر",
};

export function blogUi(lang: Locale): BlogUi {
  return lang === "ar" ? ar : en;
}

/** "13 مقالاً", "مقال واحد", "مقالان", "5 مقالات": Arabic count agreement. */
export function articleCountAr(count: number): string {
  if (count === 1) return "مقال واحد";
  if (count === 2) return "مقالان";
  if (count >= 3 && count <= 10) return localizeDigits(`${count} مقالات`, "ar");
  return localizeDigits(`${count} مقالاً`, "ar");
}

/** Metadata for the Arabic blog index and archive pages. */
export const blogMetaAr = {
  title: "أحدث مقالات ميمار",
  description:
    "ابقَ على اطلاع بأحدث الاتجاهات والرؤى في العمارة وتقنيات الرندرة ثلاثية الأبعاد. اكتشف أحدث مقالات ميمار.",
  archiveTitle: (page: number) => `أحدث مقالات ميمار | صفحة ${page}`,
  archiveDescription: "تصفّح المزيد من المقالات حول العمارة والتصور ثلاثي الأبعاد وتقنية العقارات من ميمار.",
};

type CategoryText = Pick<
  BlogCategory,
  "label" | "headingLead" | "headingAccent" | "seoTitle" | "metaDescription" | "description"
>;

/**
 * Arabic equivalents of the four `blogCategories` entries (labels, H1 halves,
 * SEO title / meta description and the on-page intro). The two English meta
 * descriptions that were cut off mid-sentence by the old WordPress site are
 * completed here.
 */
const blogCategoriesAr: Record<string, CategoryText> = {
  "3d-visualization": {
    label: "التصور ثلاثي الأبعاد",
    headingLead: "التصور",
    headingAccent: "ثلاثي الأبعاد",
    seoTitle: "التصور ثلاثي الأبعاد - ميمار",
    metaDescription:
      "أصبح الواقع الافتراضي والواقع المعزز مؤثرين للغاية في العديد من القطاعات. في قسم التصور ثلاثي الأبعاد بمدونتنا ناقشنا كل ما تحتاج معرفته عن هذه التقنيات.",
    description:
      "أصبح الواقع الافتراضي والواقع المعزز مؤثرين للغاية في العديد من القطاعات. استكشف مقالاتنا في التصور ثلاثي الأبعاد.",
  },
  "vr-real-estate": {
    label: "الواقع الافتراضي والمعزز في العقارات",
    headingLead: "الواقع المعزز والافتراضي",
    headingAccent: "في العقارات",
    seoTitle: "الواقع الافتراضي في العقارات - ميمار",
    metaDescription:
      "أصبح الواقع الافتراضي والواقع المعزز في العقارات مؤثرين للغاية في العديد من القطاعات. سيتيح لك استخدامهما في العقارات عرض مشاريعك بصورة أكثر تأثيراً وجاذبية.",
    description: "أصبح الواقع الافتراضي والواقع المعزز في العقارات مؤثرين للغاية في العديد من القطاعات.",
  },
  architecture: {
    label: "التصميم المعماري",
    headingLead: "التصميم",
    headingAccent: "المعماري",
    seoTitle: "العمارة - ميمار",
    metaDescription:
      "في مقالاتنا عن العمارة، نلبّي احتياجات المستهلكين، ونساعدهم على تصميم مساحات المعيشة، ونُبرز الإبداع.",
    description: "تتناول مقالاتنا عن العمارة أفكار التصميم ومساحات المعيشة والمقاربات الإبداعية للبيئة المبنية.",
  },
  "real-estate-tech": {
    label: "تقنية العقارات",
    headingLead: "تقنية العقارات",
    headingAccent: "PropTech",
    seoTitle: "تقنية العقارات - ميمار",
    metaDescription:
      "أضافت تقنية العقارات (PropTech) كفاءة إلى سوق العقارات. تستخدم أكثر من 70% من الشركات العاملة في قطاع العقارات التقنية لزيادة الكفاءة وتحسين تجربة العملاء.",
    description:
      "تضيف تقنية العقارات (PropTech) كفاءة إلى سوق العقارات. اكتشف كيف تساعد التقنية المطورين على عرض العقارات وبيعها.",
  },
};

/** A blog category with its text in the page language (English returns it unchanged). */
export function localizeBlogCategory(category: BlogCategory, lang: Locale): BlogCategory {
  if (lang !== "ar") return category;
  const overlay = blogCategoriesAr[category.slug];
  return overlay ? { ...category, ...overlay } : category;
}

type LegacyCategoryText = Pick<
  LegacyCategory,
  "label" | "headingLead" | "headingAccent" | "seoTitle" | "description" | "intro"
>;

const legacyCategoriesAr: Record<string, LegacyCategoryText> = {
  metaverse: {
    label: "الميتافيرس",
    headingLead: "رؤى",
    headingAccent: "الميتافيرس",
    seoTitle: "الميتافيرس - ميمار",
    description:
      "اكتشف مقالات ميمار عن الميتافيرس: كيف تصبح مطوّر ميتافيرس، والتقنيات التي تقف خلفه، وشراء الرموز غير القابلة للاستبدال (NFT)، وأسئلة شائعة عن العقارات الافتراضية.",
    intro:
      "أدلة وإجابات عن الميتافيرس، من كيفية أن تصبح مطوّر ميتافيرس والتقنيات التي تشغّل العوالم الافتراضية، إلى شراء الرموز غير القابلة للاستبدال (NFT) والاستثمار في العقارات الافتراضية.",
  },
  "vr-real-estate": {
    label: "الواقع الافتراضي في العقارات",
    headingLead: "الواقع الافتراضي",
    headingAccent: "في العقارات",
    seoTitle: "الواقع الافتراضي في العقارات - ميمار",
    description:
      "مقالات ميمار عن الواقع الافتراضي في العقارات: أسئلة شائعة عن الواقع المعزز، والفرق بين الواقع المعزز والافتراضي، وتطبيقات الواقع الافتراضي، وكيف يغيّر الواقع الافتراضي قطاع العقارات.",
    intro:
      "مقالات عن الواقع الافتراضي والمعزز في العقارات، من التمييز بين الواقع المعزز والافتراضي إلى القطاعات وفرق العقارات التي تستخدمهما بالفعل.",
  },
};

export function localizeLegacyCategory(category: LegacyCategory, lang: Locale): LegacyCategory {
  if (lang !== "ar") return category;
  const overlay = legacyCategoriesAr[category.slug];
  return overlay ? { ...category, ...overlay } : category;
}

/** Arabic copy for the shared category listing view (pages built on BlogCategoryView). */
export const categoryViewUi = {
  en: {
    latestBlogs: "Latest Blogs",
    itemListName: (label: string) => `Mimar Studios ${label} blogs`,
  },
  ar: {
    latestBlogs: "أحدث المقالات",
    itemListName: (label: string) => `مقالات ${label} من ميمار ستوديوز`,
  },
} as const;
