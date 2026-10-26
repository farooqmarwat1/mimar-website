import { localizeDigits, type Locale } from "./config";

/**
 * Renders a standalone number/index badge ("01", "250+", a year, ...):
 * converts its digits to Eastern Arabic-Indic for "ar" and force-isolates
 * it as `dir="ltr"` so the digit order can never be affected by surrounding
 * RTL text, regardless of browser/bidi edge cases. Use this for numbers
 * that stand alone as their own UI token; a number embedded inside a full
 * translated sentence doesn't need this wrapper - see the comment on
 * `localizeDigits` in ./config.
 */
export default function Num({ value, locale, className }: { value: string | number; locale: Locale; className?: string }) {
  // English renders the bare number so the English markup is unchanged.
  if (locale !== "ar") return <>{value}</>;
  return (
    <span dir="ltr" className={`inline-block ${className ?? ""}`}>
      {localizeDigits(value, locale)}
    </span>
  );
}
