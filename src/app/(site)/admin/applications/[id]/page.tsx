import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteApplicationAction, saveApplicationAction } from "@/app/(site)/admin/applications/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { cardClass, dangerButtonClass, fieldClass, labelClass, primaryButtonClass, textareaClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  getApplicationAdmin,
  isWebUrl,
} from "@/lib/applications";
import { formatWhen } from "@/lib/lead-constants";

const MAIL_NOTE = {
  sent: "HR email delivered",
  failed: "HR email failed - this record is the only copy",
  skipped: "HR email not sent - this record is the only copy",
} as const;

export default async function AdminApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireRole("jobs");
  const { id } = await params;
  const { saved, error } = await searchParams;

  const app = await getApplicationAdmin(id);
  if (!app) notFound();

  const subject = encodeURIComponent(`Your application to Mimar Studios - ${app.role}`);
  const phoneDigits = app.phone?.replace(/[^\d+]/g, "");

  return (
    <div>
      <Link href="/admin/applications" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All applications
      </Link>

      <div className="mt-4">
        <p className="eyebrow text-muted">Application · received {formatWhen(app.createdAt)}</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">
          {app.firstName} {app.lastName}
        </h1>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
          <span className={`rounded-full px-3 py-1 ${APPLICATION_STATUS_BADGE[app.status]}`}>{APPLICATION_STATUS_LABELS[app.status]}</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">{app.role}</span>
          {app.lang === "ar" && <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-700">Arabic site</span>}
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
            <h2 className="eyebrow text-muted">Applicant</h2>
            <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Email</dt>
                <dd className="mt-0.5 break-all">
                  <a href={`mailto:${app.email}?subject=${subject}`} className="hover:text-accent">
                    {app.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Phone</dt>
                <dd className="mt-0.5">
                  {app.phone ? (
                    <a href={`tel:${phoneDigits}`} className="hover:text-accent">
                      {app.phone}
                    </a>
                  ) : (
                    <span className="text-muted">Not given</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Applying for</dt>
                <dd className="mt-0.5">{app.role}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">CV / portfolio</dt>
                <dd className="mt-0.5 break-all">
                  {isWebUrl(app.portfolioUrl) ? (
                    <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-accent hover:underline">
                      {app.portfolioUrl}
                    </a>
                  ) : (
                    app.portfolioUrl
                  )}
                </dd>
              </div>
            </dl>
            {app.mailStatus && (
              <p className={`mt-4 text-xs ${app.mailStatus === "sent" ? "text-muted" : "text-amber-900"}`}>{MAIL_NOTE[app.mailStatus]}</p>
            )}
          </section>

          <section className={cardClass}>
            <h2 className="eyebrow text-muted">About them</h2>
            <p dir="auto" className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed">
              {app.message}
            </p>
          </section>
        </div>

        <aside className="grid content-start gap-6">
          <form action={saveApplicationAction} className={`${cardClass} grid gap-4`}>
            <input type="hidden" name="id" value={app.id} />
            <h2 className="eyebrow text-muted">Review</h2>
            <label className={labelClass}>
              Status
              <select name="status" defaultValue={app.status} className={fieldClass}>
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {APPLICATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Private note
              <textarea name="note" maxLength={2000} defaultValue={app.note ?? ""} className={`${textareaClass} !min-h-32 !font-sans`} />
            </label>
            {app.updatedBy && <p className="text-xs text-muted">Last changed by {app.updatedBy}, {formatWhen(app.updatedAt)}.</p>}
            <button type="submit" className={primaryButtonClass}>
              Save changes
            </button>
          </form>

          <form action={deleteApplicationAction}>
            <input type="hidden" name="id" value={app.id} />
            <ConfirmButton message="Delete this application? This cannot be undone." className={dangerButtonClass}>
              Delete application
            </ConfirmButton>
          </form>
        </aside>
      </div>
    </div>
  );
}
