import Link from "next/link";
import { cardClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { STRATEGIES, strategyInfo } from "@/lib/ai/keyword-plan";
import { buildBlogReport, WINDOW_DAYS, type BlogReport } from "@/lib/blog-performance";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { formatDuration } from "@/lib/lead-constants";
import { searchConsoleAccount } from "@/lib/search-console";

const number = (value: number) => value.toLocaleString("en-US");
const position = (value: number) => (value ? value.toFixed(1) : "–");

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={`${cardClass} !p-5`}>
      <p className="eyebrow text-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function GscNotice({ gsc }: { gsc: string }) {
  if (gsc === "ok") return null;
  return (
    <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
      {gsc === "off"
        ? `Search Console is not connected, so Google clicks, impressions and positions are not shown, and the AI chooses keywords itself. Set GSC_SITE_URL and add ${searchConsoleAccount() || "the service account"} as a user of the property in Search Console (see ADMIN_PORTAL.md).`
        : `Search Console data could not be loaded: ${gsc}`}
    </p>
  );
}

export default async function BlogPerformancePage() {
  await requireRole("blog");
  const report: BlogReport | null = isFirebaseConfigured ? await buildBlogReport() : null;
  const live = report?.posts.filter((post) => post.status === "published") ?? [];
  const best = report?.groups
    .filter((group) => group.key !== "other" && group.published >= 3)
    .sort((a, b) => b.organicPerWeek - a.organicPerWeek || b.viewsPerWeek - a.viewsPerWeek)[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Blog</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Which blog type works</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            The automatic drafts take three blog types in turn, each built on a real Google search for a service in one of our regions. Every published AI article is
            measured over its first {WINDOW_DAYS} days, and the rates are per week, so new and older articles compare fairly. English and Arabic are counted together.
          </p>
        </div>
        <Link href="/admin/blog" className={secondaryButtonClass}>
          All articles
        </Link>
      </div>

      {!report ? (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Firebase is not configured, so there is nothing to report. Set the FIREBASE_* variables (see .env.example).
        </p>
      ) : (
        <>
          <GscNotice gsc={report.gsc} />

          <dl className="mt-8 grid gap-4 md:grid-cols-3">
            {STRATEGIES.map((item) => (
              <div key={item.key} className={`${cardClass} !p-5`}>
                <dt className="font-medium">{item.label}</dt>
                <dd className="mt-1 text-sm text-muted">{item.description}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="AI articles live" value={String(live.length)} />
            <Stat label="Drafts waiting" value={String(report.posts.filter((post) => post.status === "draft").length)} />
            <Stat label="Leads from AI articles" value={String(report.groups.reduce((sum, group) => sum + group.leads, 0))} hint={`Enquiries within ${WINDOW_DAYS} days of reading one`} />
            <Stat
              label="Leading type so far"
              value={best ? best.label : "Too early"}
              hint={best ? "Most Google visits per article per week" : "Needs at least 3 live articles of a type"}
            />
          </div>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[56rem] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="p-4 font-medium">Blog type</th>
                  <th className="p-4 font-medium">Live</th>
                  <th className="p-4 font-medium">Drafts</th>
                  <th className="p-4 font-medium" title="Average per article per week">Views / wk</th>
                  <th className="p-4 font-medium" title="Visits from search engines, average per article per week">Google visits / wk</th>
                  <th className="p-4 font-medium">Time on page</th>
                  <th className="p-4 font-medium">Leads</th>
                  <th className="p-4 font-medium">Google clicks</th>
                  <th className="p-4 font-medium">Impressions</th>
                  <th className="p-4 font-medium">Avg position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {report.groups.map((group) => (
                  <tr key={group.key}>
                    <td className="p-4">
                      <span className="font-medium">{group.label}</span>
                      {group.key !== "other" && group.published > 0 && group.published < 3 && <span className="block text-xs text-amber-800">Fewer than 3 live articles: too early to judge</span>}
                      {group.key !== "other" && group.published > 0 && (
                        <span className="block text-xs text-muted">
                          {group.realKeywords} of {group.published} on a real Google search
                        </span>
                      )}
                    </td>
                    <td className="p-4">{group.published}</td>
                    <td className="p-4">{group.drafts}</td>
                    <td className="p-4">{group.viewsPerWeek}</td>
                    <td className="p-4">{group.organicPerWeek}</td>
                    <td className="p-4">{group.avgSeconds ? formatDuration(group.avgSeconds) : "–"}</td>
                    <td className="p-4">{group.leads}</td>
                    <td className="p-4">{report.gsc === "ok" ? number(group.clicks) : "–"}</td>
                    <td className="p-4">{report.gsc === "ok" ? number(group.impressions) : "–"}</td>
                    <td className="p-4">{report.gsc === "ok" ? position(group.position) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="eyebrow mb-3 mt-10 text-muted">Articles ({report.posts.length})</h2>
          {report.posts.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No AI articles yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <thead className="text-xs text-muted">
                  <tr className="border-b border-line">
                    <th className="p-4 font-medium">Article</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Days measured</th>
                    <th className="p-4 font-medium">Views</th>
                    <th className="p-4 font-medium">Google visits</th>
                    <th className="p-4 font-medium">Leads</th>
                    <th className="p-4 font-medium">Clicks</th>
                    <th className="p-4 font-medium">Impressions</th>
                    <th className="p-4 font-medium">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {report.posts.map((post) => (
                    <tr key={post.id} className="align-top">
                      <td className="max-w-md p-4">
                        <Link href={`/admin/blog/${post.id}`} className="font-medium hover:text-accent">
                          {post.title || "Untitled"}
                        </Link>
                        <span className="block text-xs text-muted">
                          {post.keyword ? `“${post.keyword}”` : "No keyword recorded"}
                          {post.keywordSource === "search-console" ? " · Google search" : post.keywordSource === "ai" ? " · chosen by AI" : ""}
                          {post.geo ? ` · ${post.geo}` : ""}
                        </span>
                      </td>
                      <td className="p-4">{strategyInfo(post.group)?.label ?? "Other"}</td>
                      <td className="p-4">
                        {post.status === "draft" ? (
                          <span className="text-muted">Draft</span>
                        ) : post.ageDays < WINDOW_DAYS ? (
                          <span title="Still collecting">
                            {post.ageDays} of {WINDOW_DAYS}
                          </span>
                        ) : (
                          WINDOW_DAYS
                        )}
                      </td>
                      <td className="p-4">{post.status === "draft" ? "–" : post.views}</td>
                      <td className="p-4">{post.status === "draft" ? "–" : post.organic}</td>
                      <td className="p-4">{post.status === "draft" ? "–" : post.leads}</td>
                      <td className="p-4">{post.gsc ? number(post.gsc.clicks) : "–"}</td>
                      <td className="p-4">{post.gsc ? number(post.gsc.impressions) : "–"}</td>
                      <td className="p-4">{post.gsc ? position(post.gsc.position) : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">
            Google numbers lag about three days. Views count from when this report was added; earlier views were not counted per article.
          </p>
        </>
      )}
    </div>
  );
}
