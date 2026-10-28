import Link from "next/link";
import { notFound } from "next/navigation";
import { addActivityAction, deleteLeadAction, saveLeadAction } from "@/app/(site)/admin/leads/actions";
import ActivityTimeline from "@/components/admin/ActivityTimeline";
import ConfirmButton from "@/components/admin/ConfirmButton";
import VisitorCard from "@/components/admin/VisitorCard";
import {
  cardClass,
  dangerButtonClass,
  fieldClass,
  hintClass,
  labelClass,
  primaryButtonClass,
  textareaClass,
} from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { listStaffEmails } from "@/lib/admin/staff";
import {
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  LOGGABLE_TYPES,
  PRIORITY_BADGE,
  STATUS_BADGE,
  STATUS_LABELS,
  formatDay,
  formatWhen,
  fullName,
} from "@/lib/lead-constants";
import { getLeadAdmin, getRelatedByEmail, isDueToday, isOverdue } from "@/lib/leads";

const MAIL_NOTE = {
  sent: "Studio email delivered",
  failed: "Studio email failed - this record is the only copy",
  skipped: "Studio email not sent - this record is the only copy",
} as const;

export default async function AdminLeadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireRole("leads");
  const { id } = await params;
  const { saved, error } = await searchParams;

  const lead = await getLeadAdmin(id);
  if (!lead) notFound();
  const [related, staff] = await Promise.all([getRelatedByEmail(lead.email, lead.id), listStaffEmails()]);
  const assignees = [...new Set([...staff, ...(lead.assignee ? [lead.assignee] : [])])].sort();
  const overdue = isOverdue(lead);
  const phoneDigits = lead.phone?.replace(/\D/g, "") ?? "";
  // wa.me needs the country code, so only offer it for numbers written in international form.
  const whatsapp = lead.phone && /^(\+|00)/.test(lead.phone.trim()) && phoneDigits.length >= 8 ? `https://wa.me/${phoneDigits.replace(/^00/, "")}` : null;
  const subject = encodeURIComponent(`Re: your enquiry to Mimar Studios${lead.service ? ` - ${lead.service}` : ""}`);

  return (
    <div>
      <Link href="/admin/leads" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Lead · received {formatWhen(lead.createdAt)}</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">{fullName(lead)}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <span className={`rounded-full px-3 py-1 ${STATUS_BADGE[lead.status]}`}>{STATUS_LABELS[lead.status]}</span>
            {lead.priority !== "normal" && <span className={`rounded-full px-3 py-1 ${PRIORITY_BADGE[lead.priority]}`}>{lead.priority} priority</span>}
            {overdue && <span className="rounded-full bg-red-50 px-3 py-1 text-red-800">Follow-up overdue</span>}
            {isDueToday(lead) && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">Follow-up due today</span>}
            {lead.jobSeeker && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">Likely job seeker</span>}
            {lead.lang === "ar" && <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">Arabic site</span>}
            {lead.origin === "manual" && <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">Added manually</span>}
          </div>
        </div>
      </div>

      {saved && (
        <p role="status" className="mt-6 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          Saved.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid content-start gap-6">
          <section className={cardClass}>
            <h2 className="eyebrow text-muted">Contact</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="mt-0.5 break-all">
                  <a href={`mailto:${lead.email}?subject=${subject}`} className="hover:text-accent">
                    {lead.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="mt-0.5">
                  {lead.phone ? (
                    <>
                      <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="hover:text-accent">
                        {lead.phone}
                      </a>
                      {whatsapp && (
                        <>
                          {" · "}
                          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            WhatsApp
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-muted">Not given</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Interested in</dt>
                <dd className="mt-0.5">{lead.service ?? <span className="text-muted">Not specified</span>}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Found us through</dt>
                <dd className="mt-0.5">{lead.source ?? <span className="text-muted">Not specified</span>}</dd>
              </div>
            </dl>
            {lead.mailStatus && (
              <p className={`mt-4 text-xs ${lead.mailStatus === "sent" ? "text-muted" : "text-amber-900"}`}>{MAIL_NOTE[lead.mailStatus]}</p>
            )}
          </section>

          <section className={cardClass}>
            <h2 className="eyebrow text-muted">Message</h2>
            <p dir="auto" className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">
              {lead.message}
            </p>
          </section>

          <VisitorCard lead={lead} />

          <section id="timeline" className={`${cardClass} scroll-mt-6`}>
            <h2 className="eyebrow text-muted">Activity</h2>
            <form action={addActivityAction} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={lead.id} />
              <div className="flex flex-wrap gap-3">
                <label className="sr-only" htmlFor="activity-type">
                  What happened
                </label>
                <select id="activity-type" name="type" defaultValue="note" className={`${fieldClass} !w-auto`}>
                  {LOGGABLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type === "note" ? "Add a note" : `Log ${type === "email" ? "an" : "a"} ${type}`}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-muted">
                  Next follow-up
                  <input type="date" name="nextFollowUpAt" className={`${fieldClass} !w-auto`} />
                </label>
              </div>
              <label className="sr-only" htmlFor="activity-text">
                Details
              </label>
              <textarea id="activity-text" name="text" required maxLength={2000} placeholder="What was said or agreed?" className={`${textareaClass} !min-h-24 !font-sans`} />
              <div>
                <button type="submit" className={primaryButtonClass}>
                  Add to timeline
                </button>
              </div>
            </form>
            <div className="mt-6 border-t border-line pt-6">
              <ActivityTimeline activities={lead.activities} />
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <form action={saveLeadAction} className={`${cardClass} grid gap-4`}>
            <input type="hidden" name="id" value={lead.id} />
            <h2 className="eyebrow text-muted">Pipeline</h2>
            <label className={labelClass}>
              Status
              <select name="status" defaultValue={lead.status} className={fieldClass}>
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Priority
              <select name="priority" defaultValue={lead.priority} className={fieldClass}>
                {LEAD_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Assigned to
              <select name="assignee" defaultValue={lead.assignee ?? ""} className={fieldClass}>
                <option value="">Unassigned</option>
                {assignees.map((email) => (
                  <option key={email} value={email}>
                    {email}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              <span>
                Next follow-up <span className={hintClass}>Shows as overdue after this date</span>
              </span>
              <input type="date" name="nextFollowUpAt" defaultValue={lead.nextFollowUpAt ?? ""} className={fieldClass} />
            </label>
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <label className={labelClass}>
                Estimated value
                <input type="number" name="value" min="0" step="any" defaultValue={lead.value ?? ""} className={fieldClass} />
              </label>
              <label className={labelClass}>
                Currency
                <input name="currency" maxLength={3} defaultValue={lead.currency ?? "PKR"} className={`${fieldClass} uppercase`} />
              </label>
            </div>
            <label className={labelClass}>
              <span>
                Tags <span className={hintClass}>Comma separated</span>
              </span>
              <input name="tags" defaultValue={lead.tags.join(", ")} className={fieldClass} />
            </label>
            <label className={labelClass}>
              <span>
                Reason if lost <span className={hintClass}>Only kept when the status is Lost</span>
              </span>
              <textarea name="lostReason" maxLength={300} defaultValue={lead.lostReason ?? ""} className={`${textareaClass} !min-h-20 !font-sans`} />
            </label>
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
          </form>

          {related.length > 0 && (
            <section className={cardClass}>
              <h2 className="eyebrow text-muted">Other enquiries from this email</h2>
              <ul className="mt-4 grid gap-3 text-sm">
                {related.map((other) => (
                  <li key={other.id}>
                    <Link href={`/admin/leads/${other.id}`} className="hover:text-accent">
                      {formatDay(other.createdAt.slice(0, 10))} · {other.service ?? "General enquiry"}
                    </Link>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[other.status]}`}>
                      {STATUS_LABELS[other.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <form action={deleteLeadAction}>
            <input type="hidden" name="id" value={lead.id} />
            <ConfirmButton message="Delete this lead and its whole timeline? This cannot be undone." className={dangerButtonClass}>
              Delete lead
            </ConfirmButton>
          </form>
        </aside>
      </div>
    </div>
  );
}
