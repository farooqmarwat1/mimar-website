import Link from "@/components/ui/Link";
import { localeHref, type Locale } from "@/i18n/config";
import { splitInlineLinks } from "@/lib/content-blocks";

/**
 * Text with `[words](/english-path)` turned into internal links in the page
 * language (the Arabic page gets the /ar URL). Only site-relative paths become
 * links - see splitInlineLinks. Used by the project stories and the region
 * pages' market copy.
 */
export function linkedText(
  text: string,
  lang: Locale,
  className = "text-ink underline underline-offset-4 transition-colors hover:text-accent",
) {
  return splitInlineLinks(text).map((part, index) =>
    part.href ? (
      <Link key={index} href={localeHref(lang, part.href)} className={className}>
        {part.text}
      </Link>
    ) : (
      part.text
    ),
  );
}
