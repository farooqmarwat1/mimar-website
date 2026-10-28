import Link from "next/link";
import { createManualLeadAction } from "@/app/(site)/admin/leads/actions";
import { cardClass, fieldClass, labelClass, primaryButtonClass, textareaClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { services } from "@/lib/site-config";

const SOURCES = ["LinkedIn", "Instagram", "Facebook", "Google", "Phone call", "WhatsApp", "Referral", "Other"];

export default async function NewLeadPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireRole("leads");
  const { error } = await searchParams;

  return (
    <div>
      <Link href="/admin/leads" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All leads
      </Link>
      <p className="eyebrow mt-4 text-muted">Leads</p>
      <h1 className="mt-2 text-3xl font-medium tracking-tight">Add a lead</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        For enquiries that did not come through the website form: a phone call, WhatsApp, a referral, or an email you found in a spam folder.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <form action={createManualLeadAction} className={`${cardClass} mt-8 grid max-w-2xl gap-4`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            First name
            <input name="firstName" required maxLength={80} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Last name
            <input name="lastName" required maxLength={80} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Email
            <input type="email" name="email" required maxLength={200} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Phone
            <input type="tel" name="phone" maxLength={40} className={fieldClass} />
          </label>
          <label className={labelClass}>
            Interested in
            <select name="service" defaultValue="" className={fieldClass}>
              <option value="">Not specified</option>
              {services.map((service) => (
                <option key={service.title} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Found us through
            <select name="source" defaultValue="" className={fieldClass}>
              <option value="">Not specified</option>
              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className={labelClass}>
          What they asked for
          <textarea name="message" required maxLength={5000} className={`${textareaClass} !font-sans`} />
        </label>
        <div>
          <button type="submit" className={primaryButtonClass}>
            Save lead
          </button>
        </div>
      </form>
    </div>
  );
}
