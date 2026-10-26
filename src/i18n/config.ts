/**
 * Core i18n primitives for the Arabic version of the site.
 *
 * URL structure (owner decision, see ARABIC.md): English is the default
 * locale and stays at the root (`/services/...`), Arabic lives under `/ar`
 * (`/ar/services/...`). The English route files are untouched; `src/app/ar`
 * is a mirror tree of thin pages that render the same view components with
 * `lang="ar"`. There is no locale redirect: language is switched with the
 * header link only, so crawlers and the legacy redirect map never see a hop.
 */

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie holding the visitor's explicit language choice (set by the header switcher, read by src/proxy.ts). */
export const LANG_COOKIE = "mimar_lang";

/** Path segment Arabic pages live under. English has no prefix. */
export const AR_PREFIX = "/ar";

const rtlLocales: readonly Locale[] = ["ar"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** BCP 47 tag for `<html lang>`, hreflang and JSON-LD `inLanguage`. */
export const localeTags: Record<Locale, string> = {
  en: "en",
  ar: "ar",
};

/** Open Graph locale codes. */
export const ogLocales: Record<Locale, string> = {
  en: "en_US",
  ar: "ar_AR",
};

/**
 * A string with a translation per locale. Used by the Arabic overlays and the
 * few places where English and Arabic copy sit side by side.
 */
export type LocalizedText = { en: string; ar: string };

/** Pick the copy for a locale; falls back to English if the Arabic is empty. */
export function t(value: LocalizedText | string, locale: Locale): string {
  const resolved = typeof value === "string" ? value : value[locale]?.trim() ? value[locale] : value.en;
  return localizeDigits(resolved, locale);
}

/** Choose between two values by locale: `pick(lang, "Services", "الخدمات")`. */
export function pick<T>(locale: Locale, en: T, ar: T): T {
  return locale === "ar" ? ar : en;
}

const EASTERN_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Converts Western digits (0-9) to Eastern Arabic-Indic numerals (٠-٩) for
 * the Arabic locale; a no-op for English. Only swaps the glyphs; the Unicode
 * bidi algorithm already lays digit runs out left-to-right inside RTL text.
 * Digits touching a Latin letter are left alone ("4YFN", "H2O"): they are
 * brand names or codes, not quantities.
 */
export function localizeDigits(value: string | number, locale: Locale): string {
  const str = String(value);
  if (locale !== "ar") return str;
  return str.replace(/(?<![A-Za-z])[0-9]+(?![A-Za-z])/g, (run) =>
    run.replace(/[0-9]/g, (digit) => EASTERN_ARABIC_DIGITS[Number(digit)]),
  );
}

/** `localizeDigits` applied to every string inside an object/array. */
export function localizeDigitsDeep<T>(value: T, locale: Locale): T {
  if (locale !== "ar") return value;
  if (typeof value === "string") return localizeDigits(value, locale) as unknown as T;
  if (Array.isArray(value)) return value.map((item) => localizeDigitsDeep(item, locale)) as unknown as T;
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) out[key] = localizeDigitsDeep(item, locale);
    return out as T;
  }
  return value;
}

/**
 * Prefix an internal path for a locale: `localeHref("ar", "/projects")` ->
 * "/ar/projects"; English paths are returned unchanged. External links,
 * mailto:, tel: and hash links always pass through. Static files (PDFs, tour
 * folders) and `/admin` are language-neutral: wrap only page links.
 */
export function localeHref(locale: Locale, href: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("#")) return href;
  if (locale === defaultLocale) return href;
  const path = href.startsWith("/") ? href : `/${href}`;
  if (path === AR_PREFIX || path.startsWith(`${AR_PREFIX}/`) || path.startsWith(`${AR_PREFIX}?`)) return path;
  return path === "/" ? AR_PREFIX : `${AR_PREFIX}${path}`;
}

/** The locale of a pathname: "ar" under /ar, otherwise English. */
export function localeFromPathname(pathname: string): Locale {
  return pathname === AR_PREFIX || pathname.startsWith(`${AR_PREFIX}/`) ? "ar" : "en";
}

/** Strip a leading /ar segment: "/ar/projects" -> "/projects", "/ar" -> "/". */
export function stripLocale(pathname: string): string {
  if (pathname === AR_PREFIX) return "/";
  if (pathname.startsWith(`${AR_PREFIX}/`)) return pathname.slice(AR_PREFIX.length);
  return pathname;
}

/** The locale-correct list separator: "، " for Arabic, ", " for English. */
export function comma(locale: Locale): string {
  return locale === "ar" ? "، " : ", ";
}
