import type { Locale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import ar from "./dictionaries/ar";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

/**
 * Shared chrome and reusable-section copy. Server pages call this once with
 * their `lang` and pass `dict` down; client components receive it as a prop
 * so the dictionaries stay out of the client bundle.
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
