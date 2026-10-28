import Link from "next/link";
import AutoRefresh from "@/components/admin/AutoRefresh";
import Breakdown from "@/components/admin/Breakdown";
import { cardClass, fieldClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { CHANNEL_LABELS, countryName, formatDuration, formatWhen } from "@/lib/lead-constants";
import { computeVisitStats, filterVisits, isActiveNow, listVisitsAdmin, trackingEnabled, type VisitFilters } from "@/lib/visits";

type Params = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

const RANGES = [
  ["today", "Today"],
  ["7d", "Last 7 days"],
  ["all", "All recent"],
] as const;

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={`${cardClass} !p-5`}>
      <p className="eyebrow text-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function AdminVisitorsPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireRole("leads");
  const params = await searchParams;
  const range = RANGES.find(([value]) => value === one(params.range))?.[0] ?? "7d";
  const q = one(params.q);
  const filters: VisitFilters = { range, q };

  const all = isFirebaseConfigured ? await listVisitsAdmin() : [];
  const now = new Date();
  const stats = computeVisitStats(all, now);
  const rows = filterVisits(all, filters, now);
  const href = (next: Record<string, string | undefined>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries({ range, q, ...next })) if (value) search.set(key, value);
    return `/admin/visitors?${search.toString()}`;
  };

  return (
    <div>
      <div>
        <p className="eyebrow text-muted">Visitors</p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight">Who opened the site</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          One row per visitor per day: where they are, what they use, how they arrived and every page they opened. No cookies are used. Bots, Do-Not-Track
          visitors and staff pages are not counted, and records are deleted after 30 days.
        </p>
        <p className="mt-2 flex items-center gap-2 text-xs text-muted">
          <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-500" />
          Live: this page refreshes itself every 15 seconds while the tab is open.
        </p>
        <AutoRefresh active everyMs={15000} />
      </div>

      {!isFirebaseConfigured && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Firebase is not configured, so visits can&apos;t be recorded or shown. Set the FIREBASE_* variables (see .env.example).
        </p>
      )}
      {isFirebaseConfigured && !trackingEnabled() && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Visit tracking is switched off, so new visits are not being recorded. In production this means VISITOR_HASH_SECRET is not set (or VISIT_TRACKING is
          &quot;off&quot;).
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Visitors today" value={String(stats.visitorsToday)} hint="Counted per person per day" />
        <Stat label="Page views today" value={String(stats.viewsToday)} />
        <Stat label="Active now" value={String(stats.activeNow)} hint="Seen in the last 5 minutes" />
        <Stat label="Showing" value={String(rows.length)} hint={`of the ${all.length} most recent visits`} />
      </div>

      {all.length > 0 && (
        <section aria-label="Traffic breakdown" className={`${cardClass} mt-4 grid gap-6 !p-5 md:grid-cols-3`}>
          <Breakdown title="How they arrived" rows={stats.byChannel} total={all.length} />
          <Breakdown title="Where they are" rows={stats.byCountry.map((row) => ({ ...row, label: row.label.length === 2 ? countryName(row.label) : row.label }))} total={all.length} />
          <Breakdown title="Most viewed pages" rows={stats.byPage} total={Math.max(1, stats.byPage[0]?.count ?? 1)} limit={10} />
        </section>
      )}

      <nav aria-label="Time range" className="mt-6 flex flex-wrap gap-2">
        {RANGES.map(([value, label]) => (
          <Link
            key={value}
            href={href({ range: value })}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${range === value ? "border-ink bg-ink text-paper" : "border-line bg-white text-muted hover:text-ink"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <form method="get" className="mt-4 flex flex-wrap gap-3">
        <input type="hidden" name="range" value={range} />
        <label className="sr-only" htmlFor="visitor-q">
          Search visitors
        </label>
        <input id="visitor-q" type="search" name="q" defaultValue={q} placeholder="Search IP, city, country, page, browser" className={`${fieldClass} max-w-md`} />
        <button type="submit" className={primaryButtonClass}>
          Search
        </button>
        {q && (
          <Link href={href({ q: undefined })} className={secondaryButtonClass}>
            Clear
          </Link>
        )}
      </form>

      {all.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No visits recorded yet. They appear here within seconds of someone opening a page of the site.
        </p>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No visits match.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white">
          {rows.map((visit) => {
            const place = [visit.city, visit.country ? countryName(visit.country) : undefined].filter(Boolean).join(", ");
            const currentPage = visit.lastPath ?? visit.pages[visit.pages.length - 1]?.p ?? visit.landingPath;
            const utm = visit.utm ? Object.entries(visit.utm).map(([key, value]) => `${key}: ${value}`).join(" · ") : "";
            return (
              <li key={visit.id}>
                <details className="group">
                  <summary className="grid cursor-pointer list-none grid-cols-[1fr_auto] gap-x-6 gap-y-1 p-5 hover:bg-neutral-50 md:grid-cols-[11rem_1fr_1fr_auto]">
                    <span className="text-xs text-muted">
                      {formatWhen(visit.lastSeenAt)}
                      {isActiveNow(visit, now) && <span className="ms-2 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">active</span>}
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="font-mono text-[13px]">{visit.ip ?? "IP not recorded"}</span>
                      <span className="block truncate text-muted">{place || "Unknown location"}</span>
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="block truncate">
                        <span className="text-muted">{isActiveNow(visit, now) ? "Now on " : "Last on "}</span>
                        {currentPage}
                      </span>
                      <span className="block truncate text-muted">
                        {visit.pageCount} {visit.pageCount === 1 ? "page" : "pages"} · landed on {visit.landingPath} · {CHANNEL_LABELS[visit.channel]} · {visit.deviceType}
                      </span>
                    </span>
                    <span className="self-center text-xs uppercase tracking-[0.14em] text-muted group-open:text-ink">Details</span>
                  </summary>

                  <div className="grid gap-6 border-t border-line bg-neutral-50/60 p-5 text-sm md:grid-cols-2">
                    <dl className="grid gap-3">
                      <div>
                        <dt className="text-xs text-muted">Device</dt>
                        <dd>
                          {visit.deviceType} · {visit.browser} on {visit.os}
                          {visit.screenWidth ? ` · ${visit.screenWidth}px wide` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Language and time zone</dt>
                        <dd>
                          {visit.lang ?? "Unknown"}
                          {visit.tz ? ` · ${visit.tz}` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Arrived via</dt>
                        <dd className="break-all">
                          {CHANNEL_LABELS[visit.channel]}
                          {visit.referrer ? ` · ${visit.referrer}` : ""}
                        </dd>
                      </div>
                      {utm && (
                        <div>
                          <dt className="text-xs text-muted">Campaign tags</dt>
                          <dd>{utm}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs text-muted">First seen · time on site</dt>
                        <dd>
                          {formatWhen(visit.firstSeenAt)} · {formatDuration(visit.activeSeconds)}
                        </dd>
                      </div>
                    </dl>
                    <div>
                      <p className="text-xs text-muted">Pages opened</p>
                      <ol className="mt-2 grid gap-1.5">
                        {visit.pages.map((page, index) => (
                          <li key={`${page.at}-${index}`} className="flex flex-wrap items-baseline justify-between gap-x-4">
                            <span className="break-all">{page.p}</span>
                            <span className="text-xs text-muted">
                              {formatWhen(page.at)}
                              {page.s > 0 ? ` · ${formatDuration(page.s)}` : ""}
                            </span>
                          </li>
                        ))}
                      </ol>
                      {visit.pageCount > visit.pages.length && (
                        <p className="mt-2 text-xs text-muted">Showing the first {visit.pages.length} of {visit.pageCount} page views.</p>
                      )}
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
