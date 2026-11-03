import Link from "next/link";
import { CheckResultsButton } from "@/components/admin/ResultsControls";
import { cardClass, hintClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { MIN_ARTICLES, WEIGHTS, type CheckpointDays, type Snapshot } from "@/lib/ai/approach-score";
import { APPROACHES, approachInfo } from "@/lib/ai/idea-plan";
import { strategyInfo } from "@/lib/ai/keyword-plan";
import { buildApproachReport, getResultsStatus, resultsRunning, type ApproachReport, type ApproachRow } from "@/lib/blog-results";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { searchConsoleAccount } from "@/lib/search-console";
import { siteConfig } from "@/lib/site-config";

// "Check now" takes the due snapshots after the response (actions.ts) within this limit.
export const maxDuration = 300;

const label = (key: string) => approachInfo(key)?.label ?? "Other (written by hand)";
const percent = (value: number | null) => (value === null ? "–" : `${Math.round(value * 100)}%`);
const day = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00.000Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const rank = (position: number | null) => (position === null ? "not shown" : position.toFixed(1));

function Indexed({ snapshot }: { snapshot: Snapshot }) {
  if (snapshot.indexed === null) return <span className="text-muted" title={snapshot.gsc === "ok" ? "Not checked" : snapshot.gsc}>–</span>;
  return (
    <span title={snapshot.coverage} className={`rounded-full px-3 py-1 text-xs ${snapshot.indexed ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
      {snapshot.indexed ? "Indexed" : "Not indexed"}
    </span>
  );
}

function ArticleTable({ rows, days }: { rows: ApproachRow[]; days: CheckpointDays }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[60rem] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="p-4 font-medium">Article</th>
            <th className="p-4 font-medium">Keyword</th>
            <th className="p-4 font-medium">Google</th>
            <th className="p-4 font-medium" title="Average Google position for the article's own keyword: overall, and in its target market">Keyword rank</th>
            <th className="p-4 font-medium">Clicks</th>
            <th className="p-4 font-medium">Impressions</th>
            <th className="p-4 font-medium">Views</th>
            <th className="p-4 font-medium">Leads</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.id} className="align-top">
              <td className="max-w-sm p-4">
                <a href={new URL(row.path, siteConfig.url).toString()} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-accent">
                  {row.title}
                </a>
                <span className="block text-xs text-muted">
                  {row.path} · published {day(row.publishedAt)}
                  {strategyInfo(row.strategy) ? ` · ${strategyInfo(row.strategy)!.label}` : ""} ·{" "}
                  <Link href={`/admin/blog/${row.id}`} className="underline hover:text-accent">
                    edit
                  </Link>
                </span>
              </td>
              <td className="p-4">{row.keyword ? `“${row.keyword}”` : <span className="text-muted">none recorded</span>}</td>
              {row.snapshot ? (
                <>
                  <td className="p-4">
                    <Indexed snapshot={row.snapshot} />
                  </td>
                  <td className="p-4">
                    {row.snapshot.gsc === "ok" ? (
                      <>
                        {rank(row.snapshot.keywordPosition)}
                        {row.snapshot.countryPosition !== null && <span className="block text-xs text-muted">{row.snapshot.countryPosition.toFixed(1)} in its market</span>}
                      </>
                    ) : (
                      "–"
                    )}
                  </td>
                  <td className="p-4">{row.snapshot.gsc === "ok" ? row.snapshot.clicks : "–"}</td>
                  <td className="p-4">{row.snapshot.gsc === "ok" ? row.snapshot.impressions : "–"}</td>
                  <td className="p-4">{row.snapshot.views}</td>
                  <td className="p-4">{row.snapshot.leads}</td>
                </>
              ) : (
                <td colSpan={6} className="p-4 text-muted">
                  Day-{days} check on {day(row.dueAt)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Ranking({ report }: { report: ApproachReport }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="p-4 font-medium">Rank</th>
            <th className="p-4 font-medium">Approach</th>
            <th className="p-4 font-medium">Score</th>
            <th className="p-4 font-medium" title={`${WEIGHTS.indexed} points`}>Indexed</th>
            <th className="p-4 font-medium" title={`${WEIGHTS.page1} points, plus ${WEIGHTS.top3} for the top 3`}>Page 1 / top 3</th>
            <th className="p-4 font-medium" title={`${WEIGHTS.clicks} points, relative to the best approach`}>Clicks / article</th>
            <th className="p-4 font-medium" title={`${WEIGHTS.leads} points, relative to the best approach`}>Leads / article</th>
            <th className="p-4 font-medium">Checked</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {report.scores.map((entry) => (
            <tr key={entry.approach} className={entry.rank === 1 ? "bg-emerald-50/40" : ""}>
              <td className="p-4 text-lg font-medium">{entry.rank ?? "–"}</td>
              <td className="p-4">
                <span className="font-medium">{label(entry.approach)}</span>
                {entry.rank === null && (
                  <span className="block text-xs text-amber-800">
                    Too early: {entry.articles} of {MIN_ARTICLES} articles checked
                  </span>
                )}
              </td>
              <td className="p-4 text-lg font-medium">{entry.score ?? "–"}</td>
              <td className="p-4">{percent(entry.indexedRate)}</td>
              <td className="p-4">
                {percent(entry.page1Rate)} / {percent(entry.top3Rate)}
              </td>
              <td className="p-4">{entry.clicksPerArticle}</td>
              <td className="p-4">{entry.leadsPerArticle}</td>
              <td className="p-4">{entry.articles}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BlogApproachesPage({ searchParams }: { searchParams: Promise<{ checkpoint?: string }> }) {
  await requireRole("blog");
  const days: CheckpointDays = (await searchParams).checkpoint === "90" ? 90 : 30;
  const [report, status] = isFirebaseConfigured ? await Promise.all([buildApproachReport(days), getResultsStatus()]) : [null, null];
  const running = resultsRunning(status);
  const approaches = [...APPROACHES.map((item) => ({ key: item.key, label: item.label, description: item.description })), { key: "other", label: label("other"), description: "Posts written by hand in the editor." }];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Blog</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Which approach works</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Every published article is checked twice, over its first 30 and its first 90 days (each check runs three days later, once Google&apos;s data is complete): is it in Google, where
            does it rank for the keyword it was written for, and how many clicks, views and enquiries did it bring in that time. The results are fixed once taken. Each approach is
            then scored out of 100: indexed {WEIGHTS.indexed}, page 1 for its keyword {WEIGHTS.page1} (+{WEIGHTS.top3} for the top 3), Google clicks {WEIGHTS.clicks} and leads {WEIGHTS.leads}, and ranked
            once it has {MIN_ARTICLES} checked articles.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/blog/ideas" className={secondaryButtonClass}>
            Ideas
          </Link>
          <Link href="/admin/blog/performance" className={secondaryButtonClass}>
            Performance
          </Link>
          <Link href="/admin/blog" className={secondaryButtonClass}>
            All articles
          </Link>
        </div>
      </div>

      {!report ? (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Firebase is not configured, so there is nothing to report. Set the FIREBASE_* variables (see .env.example).
        </p>
      ) : (
        <>
          {!report.gsc && (
            <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              Search Console is not connected, so indexing, keyword ranks and Google clicks cannot be checked; approaches are compared on views and leads only. Set GSC_SITE_URL and add{" "}
              {searchConsoleAccount() || "the service account"} as a user of the property in Search Console (see ADMIN_PORTAL.md).
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
            <nav aria-label="Checkpoint" className="flex gap-2">
              {([30, 90] as const).map((option) => (
                <Link
                  key={option}
                  href={`/admin/blog/approaches?checkpoint=${option}`}
                  aria-current={option === days ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] ${option === days ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
                >
                  Day {option}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-start gap-4">
              <p className={`${hintClass} max-w-xs pt-3 text-right`}>
                {status?.lastRunAt ? `Last checked ${day(status.lastRunAt)}${status.error ? `, failed: ${status.error}` : ""}.` : "Not checked yet."} Runs every day.
              </p>
              <CheckResultsButton running={running} />
            </div>
          </div>

          <Ranking report={report} />

          {approaches.map((approach) => {
            const rows = report.rows.filter((row) => row.approach === approach.key);
            if (rows.length === 0 && approach.key === "other") return null;
            return (
              <section key={approach.key} className="mt-10">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg font-medium">{approach.label}</h2>
                  <span className={hintClass}>{approach.description}</span>
                </div>
                {rows.length === 0 ? (
                  <p className={`${cardClass} text-center text-sm text-muted`}>No published articles from this approach yet.</p>
                ) : (
                  <ArticleTable rows={rows} days={days} />
                )}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
