import { localeHref, pick, type Locale } from "@/i18n/config";

/**
 * "I agree to the Terms of Use and Privacy Policy" - required on every public form (contact, quote
 * pop-up, careers). Sends `consent=on`; the forms turn it into `consent: true` for the API, which
 * refuses a submission without it. The links open in a new tab so a half-filled form is not lost.
 */
export default function ConsentCheckbox({ lang = "en", id, error }: { lang?: Locale; id: string; error?: string }) {
  const link = "underline underline-offset-2 transition-colors hover:text-accent";
  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
      <input
        id={id}
        type="checkbox"
        name="consent"
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-ink"
      />
      <label htmlFor={id} className="cursor-pointer text-xs leading-relaxed text-muted">
        {pick(lang, "I agree to the ", "أوافق على ")}
        <a href={localeHref(lang, "/terms-of-use")} target="_blank" rel="noopener" className={link}>
          {pick(lang, "Terms of Use", "شروط الاستخدام")}
        </a>
        {pick(lang, " and ", " و")}
        <a href={localeHref(lang, "/privacy-policy")} target="_blank" rel="noopener" className={link}>
          {pick(lang, "Privacy Policy", "سياسة الخصوصية")}
        </a>
        {pick(lang, ".", ".")}
      </label>
      {error && (
        <span id={`${id}-error`} className="w-full text-sm text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
