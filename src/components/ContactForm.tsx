"use client";

import { useState, type FormEvent } from "react";
import { services } from "@/lib/site-config";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Something went wrong.");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-line p-8">
        <p className="text-xl tracking-tight">Thanks - we&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Honeypot - hidden from real users via CSS, visible to bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <SelectField
          label="Pick a service"
          name="service"
          options={services.map((s) => s.title)}
        />
        <SelectField
          label="Where'd you find us?"
          name="source"
          options={["LinkedIn", "Instagram", "Facebook", "Google", "Other"]}
        />
      </div>
      <label className="flex flex-col gap-2">
        <span className="eyebrow text-muted">Message</span>
        <textarea
          name="message"
          required
          rows={5}
        className="min-h-32 w-full resize-none border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
        />
      </label>

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="button-pill mt-4 border-accent text-accent disabled:opacity-50"
      >
        {status === "submitting" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        className="min-h-11 w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted">{label}</span>
      <select
        name={name}
        className="min-h-11 w-full border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink"
        defaultValue=""
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
