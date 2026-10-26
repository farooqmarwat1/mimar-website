"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANG_COOKIE, localeFromPathname, localeHref, stripLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Swaps the current page into the other language, keeping the path: /services/branding <-> /ar/services/branding. English lives at the
 * root and Arabic under /ar, so the target is always derived from the live
 * pathname rather than a fixed route table.
 *
 * It is a plain link (no cookie, no redirect): language is chosen by the
 * visitor, never inferred from IP or Accept-Language, so crawlers and the
 * legacy redirect map never see a locale hop.
 */
export default function LanguageSwitcher({ lang, dict, dark }: { lang: Locale; dict: Dictionary; dark: boolean }) {
  const pathname = usePathname();
  const current = localeFromPathname(pathname) ?? lang;
  const other: Locale = current === "ar" ? "en" : "ar";
  const href = localeHref(other, stripLocale(pathname));

  return (
    <Link
      href={href}
      onClick={() => {
        // Remember the visitor's explicit choice: src/proxy.ts only picks a language for first-time visitors.
        document.cookie = `${LANG_COOKIE}=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
      hrefLang={other}
      lang={other}
      aria-label={dict.languageSwitcher[other]}
      title={dict.languageSwitcher[other]}
      className={`flex min-h-11 items-center px-1 py-1 text-sm font-semibold uppercase transition-colors ${
        dark ? "text-ink hover:text-accent" : "text-paper hover:text-paper/70"
      }`}
    >
      {other}
    </Link>
  );
}
