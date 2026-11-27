"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type FormEvent, type InvalidEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import PhoneField from "@/components/PhoneField";
import ConsentCheckbox from "@/components/forms/ConsentCheckbox";
import RecaptchaWidget, { RECAPTCHA_SITE_KEY, RecaptchaNotice, recaptchaFailed, type RecaptchaHandle } from "@/components/RecaptchaWidget";
import ServicesMultiSelect, { type ServiceOption } from "@/components/quote/ServicesMultiSelect";
import { trackLead } from "@/lib/track";
import { isRtl, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Status = "idle" | "submitting" | "success" | "error";

/** The render on the pop-up's image side: an existing project still, not a new asset. */
const RENDER = "/hero/02-sunset.webp";
const STUDIO_EMAIL = "info@mim.archi";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])';

/**
 * The "Get a quote" pop-up. Two halves like a print spread: a render with the heading on one side,
 * the form on the other; on phones it fills the screen with the render as a short strip on top.
 * Built only from the site's own tokens (ink, paper, accent, line, eyebrow, button-pill).
 *
 * Accessibility: role=dialog with a label, focus moves to the first field and is kept inside
 * (Tab wraps), Escape / the close button / a click on the backdrop close it, page scroll is locked,
 * and focus returns to the link that opened it (QuoteModalProvider).
 */
export default function QuoteModal({
  lang,
  dict,
  services,
  onClose,
}: {
  lang: Locale;
  dict: Dictionary["quoteModal"];
  services: ServiceOption[];
  onClose: () => void;
}) {
  const rtl = isRtl(lang);
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string[]>([]);
  const captcha = useRef<RecaptchaHandle>(null);
  const [copied, setCopied] = useState(false);
  const ph = dict.placeholders;

  // The email link still opens the mail app; the address is also copied, for visitors who have none set up.
  function copyEmail() {
    navigator.clipboard?.writeText(STUDIO_EMAIL).then(
      () => setCopied(true),
      () => {}, // clipboard refused: the mail link still works, so say nothing
    );
  }
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  // Lock the page behind the pop-up and move focus into it.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    firstField.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = previous;
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panel.current) return;
    // Keep Tab inside the dialog.
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function errorFor(status: number) {
    if (status === 429) return dict.errors.tooMany;
    if ((status === 400 || status === 403) && RECAPTCHA_SITE_KEY) return recaptchaFailed(lang);
    if (status === 400 || status === 422) return dict.errors.invalid;
    if (status >= 500) return dict.errors.delivery;
    return dict.errors.generic;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMsg(null);
    const form = event.currentTarget;
    const { consent, ...data } = Object.fromEntries(new FormData(form).entries());
    // The invisible check runs now, not before: there is no checkbox for the visitor to tick.
    let recaptchaToken: string | undefined;
    if (RECAPTCHA_SITE_KEY) {
      const token = captcha.current ? await captcha.current.getToken() : null;
      if (token === undefined) return; // a newer press of Send replaced this one
      if (token === null) {
        setErrorMsg(recaptchaFailed(lang));
        setStatus("error");
        return;
      }
      recaptchaToken = token;
    }
    setStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, services: chosen, consent: consent === "on", formType: "quote", lang, recaptchaToken }),
      });
      if (!res.ok) {
        setErrorMsg(errorFor(res.status));
        setStatus("error");
        return;
      }
      // The same signal the contact form sends; Tag Manager turns it into the GA4 lead event.
      trackLead({ form: "quote", lang, service: chosen.join(", ") });
      setStatus("success");
    } catch {
      setErrorMsg(dict.errors.generic);
      setStatus("error");
    }
  }

  // The browser's own validation text follows the browser UI language, not the page.
  function onInvalid(event: InvalidEvent<HTMLFormElement>) {
    if (!rtl) return;
    const field = event.target as HTMLInputElement;
    field.setCustomValidity(field.validity.valueMissing ? dict.errors.required : dict.errors.email);
  }
  function onInput(event: FormEvent<HTMLFormElement>) {
    if (rtl) (event.target as HTMLInputElement).setCustomValidity("");
  }

  const cell = "flex min-w-0 flex-col gap-1";
  const input =
    "min-h-9 w-full border-b border-line bg-transparent py-1 text-base outline-none transition-colors placeholder:text-muted/50 focus:border-ink";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-stretch justify-center bg-ink/70 md:items-center md:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        dir={rtl ? "rtl" : "ltr"}
        onKeyDown={onKeyDown}
        // Everything is sized to fit the screen without scrolling (owner, 26 Nov 2026): two fields per
        // row and a short render strip on phones. Scrolling stays possible only as a fallback on
        // very small screens or when the browser is zoomed in.
        className="relative flex h-full w-full max-w-5xl flex-col overflow-y-auto overscroll-contain bg-paper text-ink md:grid md:h-auto md:max-h-[calc(100svh-2rem)] md:grid-cols-[5fr_7fr]"
      >
        {/* Image side */}
        <aside className="relative shrink-0 overflow-hidden bg-ink text-paper md:min-h-[min(36rem,calc(100svh-2rem))]">
          {/* unoptimized: the render covers a tall panel, so a width-based resize would be stretched and blurry. */}
          <Image src={RENDER} alt="" fill unoptimized sizes="100vw" className="object-cover object-[22%_50%]" />
          {/* Same recipe as the /contact hero: a black fade from the reading side, so the text stays readable. */}
          {/* On phones the text spans the whole strip, so the fade stays darker to its far end. */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent rtl:bg-gradient-to-l max-md:from-black/80 max-md:via-black/65 max-md:to-black/45" />
          <div className="relative flex h-full flex-col justify-between gap-6 px-5 py-4 pe-16 md:p-10">
            <div>
              <h2 id={titleId} className="text-2xl font-medium uppercase leading-[.92] tracking-[-.045em] rtl:leading-[1.25] md:text-[clamp(2rem,4.2vw,3.4rem)]">
                {dict.heading}
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-snug text-paper/90 md:mt-6 md:text-lg">{dict.intro}</p>
            </div>
            <div className="hidden md:block">
              <p className="eyebrow text-paper/75" aria-live="polite">{copied ? dict.emailCopied : dict.orEmail}</p>
              <a href={`mailto:${STUDIO_EMAIL}`} onClick={copyEmail} dir="ltr" className="mt-2 inline-block text-lg font-medium tracking-tight transition-colors hover:text-accent">
                {STUDIO_EMAIL}
              </a>
            </div>
          </div>
        </aside>

        {/* Form side */}
        <div className="relative flex flex-col justify-center px-5 py-4 max-md:[@media(max-height:660px)]:py-2 md:px-10 md:pb-8 md:pt-12">
          <button
            type="button"
            onClick={onClose}
            aria-label={dict.close}
            className="absolute end-2 top-1 z-10 flex h-11 w-11 items-center justify-center text-2xl text-ink transition-colors hover:text-accent max-md:fixed max-md:end-3 max-md:top-3 max-md:rounded-full max-md:bg-paper/90"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M2 2 14 14M14 2 2 14" />
            </svg>
          </button>

          {status === "success" ? (
            <div className="flex h-full flex-col justify-center gap-4 py-10" role="status">
              <p className="text-3xl font-medium tracking-tight">{dict.successTitle}</p>
              <p className="max-w-sm text-base leading-relaxed text-muted">{dict.successBody}</p>
              <button type="button" onClick={onClose} className="button-pill mt-6 self-start text-ink">
                {dict.successClose}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} onInvalidCapture={onInvalid} onInput={onInput} className="grid grid-cols-2 content-center gap-x-4 gap-y-2.5 max-md:[@media(max-height:660px)]:gap-y-1.5 md:gap-x-6 md:gap-y-4">
              {/* Honeypot - hidden from real users, visible to bots. */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

              {/* Two per row. On phones only name and company share a row; the rest take the full width. */}
              <label className={cell}>
                <span className="eyebrow text-muted">{dict.name}</span>
                <input ref={firstField} name="name" required maxLength={160} autoComplete="name" placeholder={ph.name} className={input} />
              </label>
              <label className={cell}>
                <span className="eyebrow text-muted">{dict.company}</span>
                <input name="organisation" maxLength={120} autoComplete="organization" placeholder={ph.company} className={input} />
              </label>
              <label className={`${cell} col-span-2 md:col-span-1`}>
                <span className="eyebrow text-muted">{dict.email}</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder={ph.email}
                  dir={rtl ? "ltr" : undefined}
                  className={`${input}${rtl ? " text-end" : ""}`}
                />
              </label>
              <div className="col-span-2 min-w-0 md:col-span-1">
                <PhoneField lang={lang} label={dict.phone} placeholder={ph.phone} id="quote-phone" compact />
              </div>
              <div className="col-span-2">
                <ServicesMultiSelect
                  label={dict.services}
                  placeholder={dict.servicesPlaceholder}
                  selectedLabel={dict.servicesSelected}
                  options={services}
                  value={chosen}
                  onChange={setChosen}
                />
              </div>
              <label className={`${cell} col-span-2`}>
                <span className="eyebrow text-muted">{dict.description}</span>
                <textarea name="message" required rows={2} maxLength={5000} placeholder={ph.description} className={`${input} h-16 resize-none max-md:[@media(max-height:660px)]:h-10`} />
              </label>

              <div className="col-span-2">
                <ConsentCheckbox lang={lang} id="quote-consent" />
              </div>

              {status === "error" && (
                <p role="alert" className="col-span-2 text-sm text-red-600">
                  {errorMsg}
                </p>
              )}

              {/* Send is the site's standard pill (as on "Go to services"), with the reCAPTCHA wording beside it. */}
              <div className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                {RECAPTCHA_SITE_KEY && <RecaptchaWidget ref={captcha} siteKey={RECAPTCHA_SITE_KEY} lang={lang} />}
                <button type="submit" disabled={status === "submitting"} className="button-pill text-ink disabled:opacity-50">
                  {status === "submitting" ? dict.sending : dict.send}
                </button>
                <RecaptchaNotice lang={lang} className="min-w-48 flex-1" />
              </div>

              <p className="col-span-2 text-xs text-muted md:hidden [@media(max-height:700px)]:hidden">
                <span aria-live="polite">{copied ? dict.emailCopied : dict.orEmail}</span>{" "}
                <a href={`mailto:${STUDIO_EMAIL}`} onClick={copyEmail} dir="ltr" className="font-medium text-ink underline underline-offset-2">
                  {STUDIO_EMAIL}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
