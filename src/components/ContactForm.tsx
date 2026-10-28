"use client";

import { useState, type FormEvent, type InvalidEvent } from "react";
// TURNSTILE-DISABLED (no Cloudflare access yet): import TurnstileWidget from "@/components/TurnstileWidget";
import PhoneField from "@/components/PhoneField";
import { services } from "@/lib/site-config";
import { isRtl, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

// TURNSTILE-DISABLED (no Cloudflare access yet). To switch the "I'm human" checkbox back on,
// uncomment every line marked TURNSTILE-DISABLED in this file, plus the matching
// code in src/app/api/contact/route.ts, next.config.ts and .env.example.
// Public key of the Cloudflare Turnstile widget (inlined at build time). When
// it is unset - e.g. local development without keys - the checkbox is skipped.
// const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null;

type Status = "idle" | "submitting" | "success" | "error";

/** Values the API receives for "Where'd you find us?" - the dictionary only supplies the visible labels. */
const SOURCE_VALUES = ["LinkedIn", "Instagram", "Facebook", "Google", "Other"];

type Option = { value: string; label: string };

/**
 * Visitor-facing messages for the Arabic form. The API answers in English, so
 * the Arabic form maps the response status to these instead. Unused for English.
 */
export type ContactFormMessages = {
  required: string;
  email: string;
  tooMany: string;
  invalid: string;
  delivery: string;
  generic: string;
};

class ArabicFormError extends Error {}

function arabicErrorFor(status: number, messages: ContactFormMessages) {
  if (status === 429) return messages.tooMany;
  if (status === 400 || status === 422) return messages.invalid;
  if (status >= 500) return messages.delivery;
  return messages.generic;
}

export default function ContactForm({
  lang = "en",
  dict,
  serviceOptions,
  messages,
}: {
  lang?: Locale;
  /** The contactForm section of the page dictionary, passed from the server so the dictionaries stay out of the client bundle. */
  dict: Dictionary["contactForm"];
  /** Service dropdown: `value` is always the English title the studio inbox expects, `label` is the page language. */
  serviceOptions?: Option[];
  messages?: ContactFormMessages;
}) {
  const rtl = isRtl(lang);
  const serviceChoices: Option[] = serviceOptions ?? services.map((s) => ({ value: s.title, label: s.title }));
  const sourceChoices: Option[] = SOURCE_VALUES.map((value, index) => ({ value, label: dict.sourceOptions[index] ?? value }));

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // TURNSTILE-DISABLED (no Cloudflare access yet):
  // const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // const [turnstileReset, setTurnstileReset] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // TURNSTILE-DISABLED (no Cloudflare access yet): send the token with the form:
        // body: JSON.stringify({ ...data, turnstileToken }),
        body: JSON.stringify({ ...data, lang }),
      });
      if (!res.ok) {
        if (rtl && messages) throw new ArabicFormError(arabicErrorFor(res.status, messages));
        throw new Error((await res.json())?.error ?? "Something went wrong.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      if (rtl) {
        // A network failure surfaces as an English browser error; keep the Arabic form in Arabic.
        setErrorMsg(err instanceof ArabicFormError ? err.message : (messages?.generic ?? dict.genericError));
      } else {
        setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      }
      // TURNSTILE-DISABLED (no Cloudflare access yet): a Turnstile token works once, so ask for a fresh check before the retry.
      // setTurnstileToken(null);
      // setTurnstileReset((n) => n + 1);
    }
  }

  // Arabic validation messages: the browser's own text follows the browser UI language, not the page.
  function onInvalid(e: InvalidEvent<HTMLFormElement>) {
    if (!rtl || !messages) return;
    const field = e.target as HTMLInputElement;
    field.setCustomValidity(field.validity.valueMissing ? messages.required : messages.email);
  }

  function onInput(e: FormEvent<HTMLFormElement>) {
    if (!rtl) return;
    (e.target as HTMLInputElement).setCustomValidity("");
  }

  if (status === "success") {
    return (
      <div className="border border-line p-8">
        <p className="text-xl tracking-tight">{dict.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onInvalidCapture={onInvalid} onInput={onInput} className="flex flex-col gap-6">
      {/* Honeypot - hidden from real users via CSS, visible to bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label={dict.firstName} name="firstName" required />
        <Field label={dict.lastName} name="lastName" required />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label={dict.email} name="email" type="email" required ltr={rtl} />
        <PhoneField lang={lang} label={dict.phone} />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SelectField label={dict.pickService} name="service" options={serviceChoices} placeholder={dict.select} />
        <SelectField label={dict.whereFindUs} name="source" options={sourceChoices} placeholder={dict.select} />
      </div>
      <label className="flex flex-col gap-2">
        <span className="eyebrow text-muted">{dict.message}</span>
        <textarea
          name="message"
          required
          rows={5}
        className="min-h-32 w-full resize-none border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
        />
      </label>

      {/* TURNSTILE-DISABLED (no Cloudflare access yet):
      {TURNSTILE_SITE_KEY && (
        <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} resetSignal={turnstileReset} />
      )}
      */}

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      {/* TURNSTILE-DISABLED (no Cloudflare access yet): with the checkbox on, Send is also locked until it is ticked:
          disabled={status === "submitting" || (TURNSTILE_SITE_KEY !== null && !turnstileToken)} */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="button-pill mt-4 border-accent text-accent disabled:opacity-50"
      >
        {status === "submitting" ? dict.sending : dict.send}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  ltr,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  /** Email and phone are typed left-to-right even on the Arabic form. */
  ltr?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        dir={ltr ? "ltr" : undefined}
        className={`min-h-11 w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink${ltr ? " text-end" : ""}`}
      />
    </label>
  );
}

function SelectField({ label, name, options, placeholder }: { label: string; name: string; options: Option[]; placeholder: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted">{label}</span>
      <select
        name={name}
        className="min-h-11 w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
        defaultValue=""
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
