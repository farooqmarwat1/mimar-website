import { siteConfigAr } from "./site-config.ar";
import { localizeDigits, type Locale } from "@/i18n/config";

/**
 * UI strings shown by the service sub-page views (hero, section headings,
 * buttons). Kept here, not in the shared dictionaries. The English values are
 * exactly the strings the English pages have always rendered.
 */
export const serviceUi = {
  en: {
    home: "Home",
    services: "Services",
    requestQuote: "Request a quote",
    featuredProjects: "Transforming featured projects",
    designProcess: "Our design process",
    ourProcess: "Our process",
    benefits: "Benefits",
    selectedWork: "Selected work",
    showreels: "Showreels",
    freeConsultation: "Get a free consultation",
    contactUs: "Contact us",
    backToService: "Back to service",
  },
  ar: {
    home: "الرئيسية",
    services: "الخدمات",
    requestQuote: "اطلب عرض سعر",
    featuredProjects: "مشاريع مميزة من أعمالنا",
    designProcess: "مراحل عملية التصميم لدينا",
    ourProcess: "مراحل عملنا",
    benefits: "المزايا",
    selectedWork: "أعمال مختارة",
    showreels: "عروض الأعمال المرئية",
    freeConsultation: "احصل على استشارة مجانية",
    contactUs: "تواصل معنا",
    backToService: "العودة إلى الخدمة",
  },
} as const;

export type ServiceUi = Record<keyof (typeof serviceUi)["en"], string>;

export function getServiceUi(lang: Locale): ServiceUi {
  return serviceUi[lang];
}

/** "{title} by Mimar Studios" image alt text. */
export function byMimar(title: string, lang: Locale): string {
  return lang === "ar" ? `${title} من ميمار ستوديوز` : `${title} by Mimar Studios`;
}

/** Title of a main service (architectural-design, 3d-visualization, branding, marketing...) in the page language. */
export function localizedServiceTitle(slug: string, englishTitle: string, lang: Locale): string {
  if (lang !== "ar") return englishTitle;
  const ar = (siteConfigAr.services as Record<string, { title: string }>)[slug];
  return ar ? localizeDigits(ar.title, lang) : englishTitle;
}
