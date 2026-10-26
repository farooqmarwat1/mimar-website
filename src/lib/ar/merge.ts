import { localizeDigitsDeep, type Locale } from "@/i18n/config";

/**
 * Arabic overlay helpers for the sub-service data files.
 *
 * An overlay has the same keys and ordering as the English module but every
 * field is optional, so a page can be translated piece by piece and anything
 * missing falls back to the English value. The English data files themselves
 * are never touched (they carry SEO-exact legacy copy).
 */
export type DeepPartial<T> = T extends readonly (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recursively lays `overlay` over `base`. Only keys that exist in `base` are
 * read, arrays merge index by index (so an overlay can translate just the
 * `alt` of each image and keep its `src`), and blank strings fall back to
 * the base value.
 */
export function mergeOverlay<T>(base: T, overlay: unknown): T {
  if (overlay === undefined || overlay === null) return base;
  if (typeof base === "string") {
    return (typeof overlay === "string" && overlay.trim() ? overlay : base) as T;
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(overlay)) return base;
    const length = Math.max(base.length, overlay.length);
    return Array.from({ length }, (_, index) =>
      index < base.length ? mergeOverlay(base[index], overlay[index]) : overlay[index],
    ) as unknown as T;
  }
  if (isPlainObject(base)) {
    if (!isPlainObject(overlay)) return base;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(base)) out[key] = mergeOverlay(base[key], overlay[key]);
    return out as T;
  }
  return base;
}

/**
 * English returns `base` untouched (same object, so the English page renders
 * exactly as before). Arabic merges the overlay over it; digits in the Arabic
 * text become Eastern Arabic-Indic. Only the overlay is digit-converted, never
 * the base, so image paths and slugs can never be rewritten.
 */
export function applyOverlay<T>(base: T, overlay: DeepPartial<T> | undefined, lang: Locale): T {
  if (lang !== "ar" || !overlay) return base;
  return mergeOverlay(base, localizeDigitsDeep(overlay, lang));
}
