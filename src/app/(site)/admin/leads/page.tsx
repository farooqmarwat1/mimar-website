import Link from "next/link";
import LeadBoard, { type BoardItem } from "@/components/admin/LeadBoard";
import { cardClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { listStaffEmails } from "@/lib/admin/staff";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import {
  CHANNELS,
  CHANNEL_LABELS,
  LEAD_LANGS,
  LEAD_PRIORITIES,
  LEAD_STATUSES,
  PRIORITY_BADGE,
  STATUS_BADGE,
  STATUS_LABELS,
  countryName,
  formatDay,
  formatValue,
  fullName,
} from "@/lib/lead-constants";
import { computeStats, filterLeads, isDueToday, isOverdue, listLeadsAdmin, type LeadFilters, type LeadRow } from "@/lib/leads";

type Params = Record<string, string | string[] | undefined>;

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
const pick = <T extends string>(value: string | undefined, allowed: readonly T[]) =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

function readFilters(params: Params): LeadFilters {
  return {
    q: one(params.q),
    status: pick(one(params.status), LEAD_STATUSES),
    priority: pick(one(params.priority), LEAD_PRIORITIES),
    lang: pick(one(params.lang), LEAD_LANGS),
    assignee: one(params.assignee),
    source: one(params.source),
    service: one(params.service),
    overdue: one(params.overdue) === "1",
    channel: pick(one(params.channel), CHANNELS),
    country: one(params.country),
    jobSeekers: pick(one(params.jobSeekers), ["only", "hide"] as const),
  };
}

function query(filters: LeadFilters, extra: Record<string, string | undefined> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, overdue: filters.overdue ? "1" : undefined, ...extra })) {
    if (value) search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

const distinct = (values: (string | undefined)[]) => [...new Set(values.filter((value): value is string => Boolean(value)))].sort();

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "alert" }) {
  return (
    <div className={`${cardClass} !p-5`}>
      <p className="eyebrow text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-medium tracking-tight ${tone === "alert" ? "text-red-800" : ""}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Breakdown({ title, rows, total }: { title: string; rows: { label: string; count: number }[]; total: number }) {
  return (
    <div>
      <h2 className="eyebrow text-muted">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm">
        {rows.slice(0, 5).map((row) => (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate" title={row.label}>
                {row.label}
              </span>
              <span className="text-xs text-muted">{row.count}</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-neutral-100">
              <div className="h-1 rounded-full bg-ink/70" style={{ width: `${Math.max(4, Math.round((row.count / total) * 100))}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatHours(hours: number | null) {
  if (hours === null) return "–";
  if (hours < 1) return "< 1 h";
  if (hours < 48) return `${Math.round(hours)} h`;
  return `${Math.round(hours / 24)} days`;
}

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole("leads");
  const params = await searchParams;
  const filters = readFilters(params);
  const view = one(params.view) === "list" ? "list" : "board";

  const all: LeadRow[] = isFirebaseConfigured ? await listLeadsAdmin() : [];
  const staff = isFirebaseConfigured ? await listStaffEmails() : [];
  const now = new Date();
  const stats = computeStats(all, now);
  const rows = filterLeads(all, filters, now);
  const filtered = Object.values({ ...filters, overdue: filters.overdue || undefined }).some(Boolean);

  const assignees = distinct([...staff, ...all.map((row) => row.assignee)]);
  const sources = distinct(all.map((row) => row.source));
  const services = distinct(all.map((row) => row.service));
  const countries = distinct(all.map((row) => row.client?.country));

  const items: BoardItem[] = rows.map((row) => ({
    id: row.id,
    name: fullName(row),
    email: row.email,
    service: row.service,
    priority: row.priority,
    assignee: row.assignee,
    value: row.value,
    currency: row.currency,
    nextFollowUpAt: row.nextFollowUpAt,
    followUp: isOverdue(row, now) ? "overdue" : isDueToday(row, now) ? "today" : null,
    status: row.status,
    jobSeeker: row.jobSeeker,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Leads</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Enquiries &amp; follow-ups</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`/admin/leads/export${query(filters)}`} className={secondaryButtonClass}>
            Export CSV
          </a>
          <Link href="/admin/leads/new" className={primaryButtonClass}>
            Add lead
          </Link>
        </div>
      </div>

      {!isFirebaseConfigured && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Firebase is not configured, so leads can&apos;t be saved or shown. Set the FIREBASE_* variables (see .env.example).
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="New this month" value={String(stats.newThisMonth)} hint={`${stats.total} leads in total`} />
        <Stat label="Open pipeline" value={formatValue(stats.pipelineValue) || "PKR 0"} hint="Estimated value of open leads" />
        <Stat
          label="Win rate"
          value={stats.winRate === null ? "–" : `${Math.round(stats.winRate * 100)}%`}
          hint={`${stats.byStatus.won} won · ${stats.byStatus.lost} lost`}
        />
        <Stat
          label="Overdue follow-ups"
          value={String(stats.overdue)}
          hint={stats.dueToday ? `${stats.dueToday} due today` : "None due today"}
          tone={stats.overdue > 0 ? "alert" : undefined}
        />
        <Stat label="First response" value={formatHours(stats.avgFirstContactHours)} hint="Average time to first contact" />
        <Stat
          label="Likely job seekers"
          value={String(stats.jobSeekers)}
          hint={stats.total ? `${Math.round((stats.jobSeekers / stats.total) * 100)}% of all leads` : "No leads yet"}
        />
      </div>

      {stats.total > 0 && (
        <section aria-label="Where leads come from" className={`${cardClass} mt-4 grid gap-6 !p-5 md:grid-cols-3`}>
          <Breakdown title="How they found us" rows={stats.byChannel} total={stats.total} />
          <Breakdown title="Where they are" rows={stats.byCountry.map((row) => ({ ...row, label: row.label.length === 2 ? countryName(row.label) : row.label }))} total={stats.total} />
          <Breakdown title="First page they saw" rows={stats.byLanding} total={stats.total} />
        </section>
      )}

      <nav aria-label="Pipeline" className="mt-6 flex flex-wrap gap-2">
        <Link
          href={`/admin/leads${query({ ...filters, status: undefined }, { view })}`}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${!filters.status ? "border-ink bg-ink text-paper" : "border-line bg-white text-muted hover:text-ink"}`}
        >
          All · {stats.total}
        </Link>
        {LEAD_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/leads${query({ ...filters, status }, { view })}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${filters.status === status ? "border-ink bg-ink text-paper" : "border-line bg-white text-muted hover:text-ink"}`}
          >
            {STATUS_LABELS[status]} · {stats.byStatus[status]}
          </Link>
        ))}
      </nav>

      <form method="get" className={`${cardClass} mt-4 grid gap-3 !p-4 sm:grid-cols-2 lg:grid-cols-4`}>
        <input type="hidden" name="view" value={view} />
        {filters.status && <input type="hidden" name="status" value={filters.status} />}
        <label className="sr-only" htmlFor="lead-q">
          Search leads
        </label>
        <input id="lead-q" type="search" name="q" defaultValue={filters.q} placeholder="Search name, email, message, tag" className={`${fieldClass} lg:col-span-2`} />
        <select name="assignee" defaultValue={filters.assignee ?? ""} aria-label="Assignee" className={fieldClass}>
          <option value="">Anyone</option>
          <option value="unassigned">Unassigned</option>
          {assignees.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={filters.priority ?? ""} aria-label="Priority" className={fieldClass}>
          <option value="">Any priority</option>
          {LEAD_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <select name="source" defaultValue={filters.source ?? ""} aria-label="Source" className={fieldClass}>
          <option value="">Any source</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <select name="service" defaultValue={filters.service ?? ""} aria-label="Service" className={fieldClass}>
          <option value="">Any service</option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        <select name="lang" defaultValue={filters.lang ?? ""} aria-label="Language" className={fieldClass}>
          <option value="">English &amp; Arabic</option>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
        </select>
        <select name="channel" defaultValue={filters.channel ?? ""} aria-label="How they found us" className={fieldClass}>
          <option value="">Any channel</option>
          {CHANNELS.map((channel) => (
            <option key={channel} value={channel}>
              {CHANNEL_LABELS[channel]}
            </option>
          ))}
        </select>
        <select name="country" defaultValue={filters.country ?? ""} aria-label="Country" className={fieldClass}>
          <option value="">Any country</option>
          <option value="unknown">Unknown</option>
          {countries.map((code) => (
            <option key={code} value={code}>
              {countryName(code)}
            </option>
          ))}
        </select>
        <select name="jobSeekers" defaultValue={filters.jobSeekers ?? ""} aria-label="Job seekers" className={fieldClass}>
          <option value="">All enquiries</option>
          <option value="hide">Without job seekers</option>
          <option value="only">Only likely job seekers</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="overdue" value="1" defaultChecked={filters.overdue} />
          Overdue only
        </label>
        <div className="flex gap-3 sm:col-span-2 lg:col-span-4 lg:justify-end">
          {filtered && (
            <Link href={`/admin/leads${query({}, { view })}`} className={secondaryButtonClass}>
              Clear
            </Link>
          )}
          <button type="submit" className={primaryButtonClass}>
            Filter
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {rows.length} {rows.length === 1 ? "lead" : "leads"}
          {filtered ? " match" : ""}
        </p>
        <div role="group" aria-label="View" className="flex rounded-full border border-line bg-white p-1 text-xs font-medium">
          {(["board", "list"] as const).map((option) => (
            <Link
              key={option}
              href={`/admin/leads${query(filters, { view: option })}`}
              aria-current={view === option ? "page" : undefined}
              className={`rounded-full px-4 py-1.5 capitalize ${view === option ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
            >
              {option}
            </Link>
          ))}
        </div>
      </div>

      {all.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No leads yet. New contact-form enquiries will appear here automatically, or add one by hand.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No leads match those filters.</p>
      ) : view === "board" ? (
        <div className="mt-4">
          <LeadBoard items={items} />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((row) => {
            const overdue = isOverdue(row, now);
            return (
              <li key={row.id} className={`flex flex-wrap items-center gap-x-6 gap-y-3 p-5 ${overdue ? "bg-red-50/50" : ""}`}>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/leads/${row.id}`} className="font-medium hover:text-accent">
                    {fullName(row)}
                  </Link>
                  <p className="mt-1 truncate text-sm text-muted">
                    {row.email}
                    {row.service ? ` · ${row.service}` : ""}
                    {row.lang === "ar" ? " · Arabic" : ""}
                  </p>
                  {(row.client?.country || row.visit?.channel) && (
                    <p className="mt-1 text-xs text-muted">
                      {[row.client?.country ? countryName(row.client.country) : null, row.visit?.channel ? CHANNEL_LABELS[row.visit.channel] : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {row.mailStatus && row.mailStatus !== "sent" && (
                    <p className="mt-1 text-xs text-amber-900">
                      {row.mailStatus === "failed" ? "Notification email failed" : "Notification email not sent"}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                  <span className={`rounded-full px-3 py-1 ${STATUS_BADGE[row.status]}`}>{STATUS_LABELS[row.status]}</span>
                  {row.jobSeeker && <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">Job seeker?</span>}
                  {row.priority !== "normal" && <span className={`rounded-full px-3 py-1 ${PRIORITY_BADGE[row.priority]}`}>{row.priority}</span>}
                  {row.nextFollowUpAt && (
                    <span className={`rounded-full px-3 py-1 ${overdue ? "bg-red-50 text-red-800" : "bg-neutral-100 text-neutral-700"}`}>
                      {overdue ? "Overdue · " : "Follow up · "}
                      {formatDay(row.nextFollowUpAt)}
                    </span>
                  )}
                </div>
                <div className="w-40 text-xs text-muted">
                  <p className="truncate">{row.assignee ?? "Unassigned"}</p>
                  <p className="mt-0.5">{formatDay(row.createdAt.slice(0, 10))}</p>
                </div>
                <Link href={`/admin/leads/${row.id}`} className="text-xs uppercase tracking-[0.14em] hover:text-accent">
                  Open
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
