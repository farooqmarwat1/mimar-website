import Link from "next/link";
import { fieldClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_BADGE,
  APPLICATION_STATUS_LABELS,
  filterApplications,
  listApplicationsAdmin,
  type ApplicationStatus,
} from "@/lib/applications";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { formatDay } from "@/lib/lead-constants";

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole("jobs");
  const params = await searchParams;
  const status = APPLICATION_STATUSES.find((value) => value === one(params.status)) as ApplicationStatus | undefined;
  const q = one(params.q);

  const all = isFirebaseConfigured ? await listApplicationsAdmin() : [];
  const rows = filterApplications(all, { status, q });
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((value) => [value, all.filter((row) => row.status === value).length]));
  const href = (next: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries({ status, q, ...next })) if (value) search.set(key, value);
    const text = search.toString();
    return `/admin/applications${text ? `?${text}` : ""}`;
  };

  return (
    <div>
      <div>
        <p className="eyebrow text-muted">Careers</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Applications</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Sent from the careers application form and kept apart from client enquiries. Each one is also emailed to the careers address.
        </p>
      </div>

      {!isFirebaseConfigured && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Firebase is not configured, so applications can&apos;t be saved or shown. Set the FIREBASE_* variables (see .env.example).
        </p>
      )}

      <nav aria-label="Status" className="mt-8 flex flex-wrap gap-2">
        <Link
          href={href({ status: undefined })}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${!status ? "border-ink bg-ink text-paper" : "border-line bg-white text-muted hover:text-ink"}`}
        >
          All · {all.length}
        </Link>
        {APPLICATION_STATUSES.map((value) => (
          <Link
            key={value}
            href={href({ status: value })}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${status === value ? "border-ink bg-ink text-paper" : "border-line bg-white text-muted hover:text-ink"}`}
          >
            {APPLICATION_STATUS_LABELS[value]} · {counts[value]}
          </Link>
        ))}
      </nav>

      <form method="get" className="mt-4 flex flex-wrap gap-3">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="sr-only" htmlFor="application-q">
          Search applications
        </label>
        <input id="application-q" type="search" name="q" defaultValue={q} placeholder="Search name, email, role, note" className={`${fieldClass} max-w-md`} />
        <button type="submit" className={primaryButtonClass}>
          Search
        </button>
        {(q || status) && (
          <Link href="/admin/applications" className={secondaryButtonClass}>
            Clear
          </Link>
        )}
      </form>

      {all.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No applications yet. They appear here as soon as someone submits the form on /careers/apply.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No applications match.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/applications/${row.id}`} className="font-medium hover:text-accent">
                  {row.firstName} {row.lastName}
                </Link>
                <p className="mt-1 truncate text-sm text-muted">
                  {row.role} · {row.email}
                  {row.lang === "ar" ? " · Arabic site" : ""}
                </p>
                {row.mailStatus && row.mailStatus !== "sent" && (
                  <p className="mt-1 text-xs text-amber-900">{row.mailStatus === "failed" ? "HR email failed" : "HR email not sent"}</p>
                )}
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${APPLICATION_STATUS_BADGE[row.status]}`}>
                {APPLICATION_STATUS_LABELS[row.status]}
              </span>
              <span className="w-28 text-xs text-muted">{formatDay(row.createdAt.slice(0, 10))}</span>
              <Link href={`/admin/applications/${row.id}`} className="text-xs uppercase tracking-[0.14em] hover:text-accent">
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
