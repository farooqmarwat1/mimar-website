"use client";

import { useActionState, useState } from "react";
import { saveJobAction, type JobFormState } from "@/app/(site)/admin/jobs/actions";
import BlockEditor from "@/components/admin/BlockEditor";
import {
  cardClass,
  fieldClass,
  hintClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/admin/styles";

export type JobFormInitial = {
  id?: string;
  title: string;
  slug: string;
  slugLocked: boolean;
  department: string;
  location: string;
  country: string;
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  summary: string;
  description: string;
  applyMethod: string;
  applyEmail: string;
  applyUrl: string;
  validThrough: string;
  status: string;
};

const WORK_MODES = [
  ["onsite", "On-site"],
  ["hybrid", "Hybrid"],
  ["remote", "Remote"],
];
const EMPLOYMENT_TYPES = [
  ["full-time", "Full-time"],
  ["part-time", "Part-time"],
  ["contract", "Contract"],
  ["internship", "Internship"],
  ["temporary", "Temporary"],
];
const PERIODS = ["hour", "day", "week", "month", "year"];

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={labelClass}>
      <span>{label}</span>
      {children}
      {hint && !error && <span className={hintClass}>{hint}</span>}
      {error && <span className="text-xs font-normal text-accent">{error}</span>}
    </label>
  );
}

export default function JobForm({ initial, saved }: { initial: JobFormInitial; saved?: boolean }) {
  const [state, action, pending] = useActionState<JobFormState, FormData>(saveJobAction, {});
  const v = (key: keyof JobFormInitial) => state.values?.[key] ?? String(initial[key] ?? "");
  const err = (key: string) => state.fieldErrors?.[key];
  const [applyMethod, setApplyMethod] = useState(v("applyMethod") || "email");

  return (
    <form action={action} className="grid gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {(state.saved || saved) && !state.error && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          Saved. Changes to open roles are live on /careers right away.
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">The role</h2>
        <Field error={err("title")} label="Job title">
          <input name="title" required defaultValue={v("title")} placeholder="Full Stack Developer" className={fieldClass} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field error={err("department")} label="Department">
            <input name="department" required defaultValue={v("department")} placeholder="Engineering" className={fieldClass} />
          </Field>
          <Field error={err("experienceLevel")} label="Experience level (optional)">
            <input name="experienceLevel" defaultValue={v("experienceLevel")} placeholder="2+ years" className={fieldClass} />
          </Field>
          <Field error={err("location")} label="Location">
            <input name="location" required defaultValue={v("location")} placeholder="Islamabad" className={fieldClass} />
          </Field>
          <Field error={err("country")} label="Country code" hint="2 letters, e.g. PK, AE, SA.">
            <input name="country" required maxLength={2} defaultValue={v("country") || "PK"} className={`${fieldClass} uppercase`} />
          </Field>
          <Field error={err("workMode")} label="Work mode">
            <select name="workMode" defaultValue={v("workMode") || "onsite"} className={fieldClass}>
              {WORK_MODES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field error={err("employmentType")} label="Employment type">
            <select name="employmentType" defaultValue={v("employmentType") || "full-time"} className={fieldClass}>
              {EMPLOYMENT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field error={err("summary")} label="Short summary" hint="One or two sentences shown in the list and in search results (max 300 characters).">
          <textarea name="summary" required rows={3} maxLength={300} defaultValue={v("summary")} className={fieldClass} />
        </Field>
      </section>

      <section className={`${cardClass} grid gap-3`}>
        <h2 className="text-lg font-medium">Job description</h2>
        <p className={hintClass}>Responsibilities, requirements, benefits - whatever candidates need. Shown on the job page and in Google&apos;s job listing.</p>
        <BlockEditor name="description" defaultValue={v("description")} invalid={Boolean(err("description"))} />
        {err("description") && <p className="text-xs text-accent">{err("description")}</p>}
      </section>

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">How to apply</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field error={err("applyMethod")} label="Candidates apply by">
            <select name="applyMethod" value={applyMethod} onChange={(event) => setApplyMethod(event.target.value)} className={fieldClass}>
              <option value="email">Email</option>
              <option value="url">External link (LinkedIn, Google Form…)</option>
            </select>
          </Field>
          {applyMethod === "url" ? (
            <Field error={err("applyUrl")} label="Application link">
              <input name="applyUrl" type="url" defaultValue={v("applyUrl")} placeholder="https://" className={fieldClass} />
            </Field>
          ) : (
            <Field error={err("applyEmail")} label="Send applications to" hint="Leave blank to use the careers address (hr@mim.archi).">
              <input name="applyEmail" type="email" defaultValue={v("applyEmail")} className={fieldClass} />
            </Field>
          )}
        </div>
        <Field error={err("validThrough")} label="Apply by (optional)" hint="After this date the role disappears from the site automatically.">
          <input name="validThrough" type="date" defaultValue={v("validThrough")} className={fieldClass} />
        </Field>
      </section>

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">Salary (optional)</h2>
        <div className="grid gap-5 md:grid-cols-4">
          <Field error={err("salaryMin")} label="From">
            <input name="salaryMin" inputMode="numeric" defaultValue={v("salaryMin")} className={fieldClass} />
          </Field>
          <Field error={err("salaryMax")} label="To">
            <input name="salaryMax" inputMode="numeric" defaultValue={v("salaryMax")} className={fieldClass} />
          </Field>
          <Field error={err("salaryCurrency")} label="Currency">
            <input name="salaryCurrency" maxLength={3} defaultValue={v("salaryCurrency") || "PKR"} className={`${fieldClass} uppercase`} />
          </Field>
          <Field error={err("salaryPeriod")} label="Per">
            <select name="salaryPeriod" defaultValue={v("salaryPeriod") || "month"} className={fieldClass}>
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">Web address</h2>
        {initial.slugLocked ? (
          <p className="text-sm text-muted">
            /careers/<strong className="text-ink">{initial.slug}</strong> · locked because this role has been public. <input type="hidden" name="slug" value={initial.slug} />
          </p>
        ) : (
          <Field error={err("slug")} label="URL ending (optional)" hint="Created from the title if left blank. Locked once the role is public.">
            <input name="slug" defaultValue={v("slug")} placeholder="full-stack-developer" className={fieldClass} />
          </Field>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" name="intent" value="open" disabled={pending} className={primaryButtonClass}>
          {initial.status === "open" ? "Save & keep open" : "Publish role"}
        </button>
        <button type="submit" name="intent" value="draft" disabled={pending} className={secondaryButtonClass}>
          Save as draft
        </button>
        {initial.id && (
          <button type="submit" name="intent" value="closed" disabled={pending} className={secondaryButtonClass}>
            Close role
          </button>
        )}
        {pending && <span className="text-sm text-muted">Saving…</span>}
      </div>
    </form>
  );
}
