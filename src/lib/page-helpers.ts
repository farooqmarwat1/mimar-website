import { breadcrumbJsonLd } from "@/lib/seo";
import { localeHref, type Locale } from "@/i18n/config";

/**
 * Small helpers shared by the bilingual page views (src/components/pages).
 * They are no-ops for English so the English markup stays byte-for-byte what it
 * was before the Arabic version existed.
 */

/** A class string that only applies to Arabic pages, with a leading space ("" for English). */
export function arClass(lang: Locale, classes: string): string {
  return lang === "ar" ? ` ${classes}` : "";
}

/** BreadcrumbList JSON-LD whose item URLs are locale-aware. `path` is always the English path. */
export function localizedBreadcrumb(lang: Locale, items: { name: string; path: string }[]) {
  return breadcrumbJsonLd(items.map((item) => ({ name: item.name, path: localeHref(lang, item.path) })));
}

/** The "external link" arrow, mirrored for right-to-left pages. */
export function externalArrow(lang: Locale): string {
  return lang === "ar" ? "↖" : "↗";
}

/** The "forward" arrow, mirrored for right-to-left pages. */
export function forwardArrow(lang: Locale): string {
  return lang === "ar" ? "←" : "→";
}
