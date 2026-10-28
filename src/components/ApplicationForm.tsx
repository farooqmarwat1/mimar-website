"use client";

import Link from "next/link";
import { useState, type FormEvent, type InvalidEvent } from "react";
import PhoneField from "@/components/PhoneField";
import { isRtl, type Locale } from "@/i18n/config";
import type { ApplyFormCopy } from "@/content/pages/apply";

type Status = "idle" | "submitting" | "success" | "error";

/** Careers application form. Posts to /api/careers/apply, which saves it, emails HR and confirms to the applicant. */
export default function ApplicationForm({
  lang = "en",
  copy,
  roles,
  careersHref,
}: {
  lang?: Locale;
  copy: ApplyFormCopy;
  /** Titles of the open roles. The first choice is always the general application. */
  roles: string[];
  careersHref: string;
}) {
  const rtl = isRtl(lang);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    // The "general application" choice is sent under its English name so HR sees one consistent value.
    if (data.role === "") data.role = "General application";

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang }),
      });
      if (!res.ok) {
        const { errors } = copy;
        setErrorMsg(res.status === 429 ? errors.tooMany : res.status === 400 || res.status === 422 ? errors.invalid : res.status >= 500 ? errors.delivery : errors.generic);
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg(copy.errors.generic);
      setStatus("error");
    }
  }

  // The browser's own validation text follows the browser UI language, not the page, so Arabic uses ours.
  function onInvalid(e: InvalidEvent<HTMLFormElement>) {
    if (!rtl) return;
    const field = e.target as HTMLInputElement;
    field.setCustomValidity(
      field.validity.valueMissing ? copy.errors.required : field.type === "url" ? copy.errors.url : copy.errors.email,
    );
  }

  function onInput(e: React.FormEvent<HTMLFormElement>) {
    if (rtl) (e.target as HTMLInputElement).setCustomValidity("");
  }

  if (status === "success") {
    return (
      <div className="border border-line p-8">
        <p className="text-xl tracking-tight">{copy.successTitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{copy.successBody}</p>
        <Link href={careersHref} className="button-pill mt-8 inline-flex border-accent text-accent">
          {copy.back}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onInvalidCapture={onInvalid} onInput={onInput} className="flex flex-col gap-6">
      {/* Honeypot - hidden from real users, visible to bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label={copy.firstName} name="firstName" required />
        <Field label={copy.lastName} name="lastName" required />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label={copy.email} name="email" type="email" required ltr={rtl} />
        <PhoneField lang={lang} label={copy.phone} />
      </div>

      <label className="flex flex-col gap-2">
        <span className="eyebrow text-muted">{copy.role}</span>
        <select
          name="role"
          defaultValue=""
          className="min-h-11 w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
        >
          <option value="">{copy.generalRole}</option>
          {roles.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="eyebrow text-muted">{copy.portfolio}</span>
        <input
          type="url"
          name="portfolioUrl"
          required
          placeholder="https://"
          dir="ltr"
          className={`min-h-11 w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-ink${rtl ? " text-end" : ""}`}
        />
        <span className="text-xs text-muted">{copy.portfolioHint}</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="eyebrow text-muted">{copy.message}</span>
        <textarea
          name="message"
          required
          rows={5}
          maxLength={3000}
          className="min-h-32 w-full resize-none border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
        />
        <span className="text-xs text-muted">{copy.messageHint}</span>
      </label>

      {status === "error" && <p role="alert" className="text-sm text-red-600">{errorMsg}</p>}

      <button type="submit" disabled={status === "submitting"} className="button-pill mt-4 border-accent text-accent disabled:opacity-50">
        {status === "submitting" ? copy.sending : copy.send}
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
