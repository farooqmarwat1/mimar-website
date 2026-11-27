"use client";

import { useRef, useState, type FormEvent } from "react";
import PhoneField from "@/components/PhoneField";
import ConsentCheckbox from "@/components/forms/ConsentCheckbox";
import RecaptchaWidget, { RECAPTCHA_SITE_KEY, RecaptchaNotice, recaptchaFailed, type RecaptchaHandle } from "@/components/RecaptchaWidget";
import { services } from "@/lib/site-config";
import { isPlausiblePhone } from "@/lib/phone-country";
import { trackLead } from "@/lib/track";
import { isRtl, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type Status = "idle" | "submitting" | "success" | "error";

/** Values the API receives for "Where'd you find us?" - the dictionary only supplies the visible labels. */
const SOURCE_VALUES = ["LinkedIn", "Instagram", "Facebook", "Google", "Other"];

type Option = { value: string; label: string };

/**
 * Visitor-facing messages. `required`, `email` and `phone` are the inline field errors (both
 * languages). The API answers in English, so the Arabic form also maps the response status to
 * the other messages; the English form shows the API's own text instead.
 */
export type ContactFormMessages = {
  required: string;
  email: string;
  phone: string;
  tooMany: string;
  invalid: string;
  delivery: string;
  generic: string;
};

class ArabicFormError extends Error {}

/** Inline errors when no messages are passed (same text as the English page copy). */
const DEFAULT_FIELD_MESSAGES = {
  required: "Please fill out this field.",
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number.",
};

type FieldMessages = typeof DEFAULT_FIELD_MESSAGES;
type Validatable = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isValidatable(el: Element): el is Validatable {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;
}

/** Error key of a control: its `name`, or `data-field` for the phone input (whose value posts through a hidden input). */
function fieldKey(el: Validatable) {
  return el.name || el.dataset.field || "";
}

/** The inline error for one control, or null when it is valid. A required field of only spaces counts as empty (the API trims it). */
function fieldError(el: Validatable, messages: FieldMessages): string | null {
  if (el.required && !el.value.trim()) return messages.required;
  if (fieldKey(el) === "phone" && el.value.trim() && !isPlausiblePhone(el.value)) return messages.phone;
  if (el.validity.valid) return null;
  if (el.validity.typeMismatch) return messages.email;
  return messages.required;
}

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
  const ph = dict.placeholders;

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldMessages: FieldMessages = messages
    ? { required: messages.required, email: messages.email, phone: messages.phone }
    : DEFAULT_FIELD_MESSAGES;
  const captcha = useRef<RecaptchaHandle>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // The form has noValidate, so the browser's one-field-at-a-time bubble never shows; every
    // invalid field gets its own message under it instead, and the first one takes the focus.
    const errors: Record<string, string> = {};
    let firstInvalid: Validatable | null = null;
    for (const el of Array.from(form.elements)) {
      if (!isValidatable(el) || el.type === "hidden" || !el.willValidate) continue;
      const message = fieldError(el, fieldMessages);
      const key = fieldKey(el);
      if (!message || !key) continue;
      errors[key] = message;
      firstInvalid ??= el;
    }
    setFieldErrors(errors);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    setErrorMsg(null);

    const { consent, ...data } = Object.fromEntries(new FormData(form).entries());
    // The invisible check runs now, after the fields are valid: there is no checkbox to tick.
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
        body: JSON.stringify({ ...data, consent: consent === "on", formType: "contact", lang, recaptchaToken }),
      });
      if (!res.ok) {
        if (rtl && messages) throw new ArabicFormError(arabicErrorFor(res.status, messages));
        throw new Error((await res.json())?.error ?? "Something went wrong.");
      }
      trackLead({ form: "contact", lang, service: String(data.service ?? ""), source: String(data.source ?? "") });
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
    }
  }

  // Once a field shows an error, re-check it as the visitor types, so the message goes away
  // (or changes, e.g. from "fill out" to "valid email") without another submit.
  function onInput(e: FormEvent<HTMLFormElement>) {
    if (!isValidatable(e.target as Element)) return;
    const el = e.target as Validatable;
    const key = fieldKey(el);
    if (!key || !(key in fieldErrors)) return;
    const message = fieldError(el, fieldMessages);
    setFieldErrors((current) => {
      const next = { ...current };
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  if (status === "success") {
    return (
      <div className="border border-line p-8">
        <p className="text-xl tracking-tight">{dict.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onInput={onInput} noValidate className="flex flex-col gap-6">
      {/* Honeypot - hidden from real users via CSS, visible to bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label={dict.firstName} name="firstName" required placeholder={ph.firstName} autoComplete="given-name" error={fieldErrors.firstName} />
        <Field label={dict.lastName} name="lastName" required placeholder={ph.lastName} autoComplete="family-name" error={fieldErrors.lastName} />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label={dict.email} name="email" type="email" required ltr={rtl} placeholder={ph.email} autoComplete="email" error={fieldErrors.email} />
        <PhoneField lang={lang} label={dict.phone} required placeholder={ph.phone} id="contact-phone" error={fieldErrors.phone} />
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
          placeholder={ph.message}
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          className={`min-h-32 w-full resize-none border-b bg-transparent py-2 text-base outline-none transition-colors placeholder:text-muted/50 focus:border-ink ${fieldErrors.message ? "border-red-600" : "border-line"}`}
        />
        <FieldError id="message-error" message={fieldErrors.message} />
      </label>

      <ConsentCheckbox lang={lang} id="contact-consent" error={fieldErrors.consent} />

      {RECAPTCHA_SITE_KEY && <RecaptchaWidget ref={captcha} siteKey={RECAPTCHA_SITE_KEY} lang={lang} />}

      {status === "error" && <p role="alert" className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="button-pill mt-4 border-accent text-accent disabled:opacity-50"
      >
        {status === "submitting" ? dict.sending : dict.send}
      </button>
      <RecaptchaNotice lang={lang} />
    </form>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="text-sm text-red-600">
      {message}
    </span>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  ltr,
  error,
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  /** Email and phone are typed left-to-right even on the Arabic form. */
  ltr?: boolean;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        dir={ltr ? "ltr" : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-11 w-full border-b bg-transparent py-2 text-base outline-none transition-colors placeholder:text-muted/50 focus:border-ink ${error ? "border-red-600" : "border-line"}${ltr ? " text-end" : ""}`}
      />
      <FieldError id={errorId} message={error} />
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
