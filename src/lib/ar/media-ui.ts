import type { Locale } from "@/i18n/config";

/**
 * Tiny, client-safe strings for the media widgets (MediaSlider, DriveVideo).
 * Kept apart from service-ui.ts so client bundles do not pull in the site
 * config overlay.
 */
export const mediaUi = {
  en: {
    previous: "Previous",
    next: "Next",
    close: "Close",
    play: (title: string) => `Play ${title}`,
    playSlide: (title: string, n: string) => `Play ${title} - slide ${n}`,
    showSlide: (n: string) => `Show slide ${n}`,
    videoPreview: (title: string) => `${title} video preview`,
  },
  ar: {
    previous: "السابق",
    next: "التالي",
    close: "إغلاق",
    play: (title: string) => `تشغيل ${title}`,
    playSlide: (title: string, n: string) => `تشغيل ${title} - الشريحة ${n}`,
    showSlide: (n: string) => `عرض الشريحة ${n}`,
    videoPreview: (title: string) => `معاينة فيديو ${title}`,
  },
} as const satisfies Record<Locale, unknown>;
