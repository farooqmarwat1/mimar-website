import { approachInfo } from "@/lib/ai/idea-plan";
import { buildBlogReport, WINDOW_DAYS, type GroupSummary } from "@/lib/blog-performance";
import { buildApproachReport } from "@/lib/blog-results";
import { blogRecipients, cronAuthorized, escapeHtml } from "@/lib/cron";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { formatDuration } from "@/lib/lead-constants";
import { getMailer } from "@/lib/mailer";
import { siteConfig } from "@/lib/site-config";

/**
 * Monthly blog report (vercel.json: the 1st of each month). Emails the editors (To) and info@ (CC),
 * the same people as the draft approval emails, which blog type and idea source are working: the same numbers as
 * /admin/blog/performance, plus the AI articles published in the month that just ended.
 * Sent once per month, however often it is called. Only Vercel Cron may call it (src/lib/cron.ts).
 */

export const maxDuration = 120;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseConfigured) return Response.json({ skipped: "Firebase is not configured." });
  const mailer = getMailer();
  if (!mailer) return Response.json({ skipped: "No mailer is configured." });
  const { to, cc } = blogRecipients();
  if (to.length === 0) return Response.json({ skipped: "BLOG_NOTIFY_EMAIL has no valid address." });

  const now = new Date();
  const lastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const month = lastMonth.toISOString().slice(0, 7);
  const status = adminDb().collection("siteBlogPlanner").doc("report");
  const claimed = await adminDb().runTransaction(async (tx) => {
    const previous = await tx.get(status);
    if (previous.get("month") === month || Number(previous.get("leaseUntil") ?? 0) > Date.now()) return false;
    tx.set(status, { leaseUntil: Date.now() + 180_000 }, { merge: true });
    return true;
  });
  if (!claimed) return Response.json({ skipped: `The report for ${month} was already sent.` });

  try {
    const report = await buildBlogReport(now);
    const monthName = lastMonth.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
    const newPosts = report.posts.filter((post) => post.publishedAt?.startsWith(month));
    const base = (process.env.ADMIN_BASE_URL?.trim() || siteConfig.url).replace(/\/$/, "");
    const link = `${base}/admin/blog/performance`;
    const gscNote =
      report.gsc === "ok" ? "" : report.gsc === "off" ? "Search Console is not connected yet, so Google clicks and positions are missing." : `Search Console data could not be loaded: ${report.gsc}`;

    const line = (group: GroupSummary) =>
      `${group.label}: ${group.published} live, ${group.organicPerWeek} Google visits and ${group.viewsPerWeek} views per article per week, ` +
      `${group.leads} leads${group.avgSeconds ? `, ${formatDuration(group.avgSeconds)} on page` : ""}` +
      (report.gsc === "ok" ? `, ${group.clicks} Google clicks, ${group.impressions} impressions, average position ${group.position || "–"}` : "") +
      (group.key !== "other" && group.published < 3 ? " (fewer than 3 live articles: too early to judge)" : "");
    const groups = report.groups.filter((group) => group.published > 0 || group.drafts > 0);
    // The approach ranking from the fixed day-30 checks (/admin/blog/approaches).
    const ranking = await buildApproachReport(30).catch((err) => {
      console.error("[cron] approach ranking unavailable:", err instanceof Error ? err.message : err);
      return null;
    });
    const approachName = (key: string) => approachInfo(key)?.label ?? "Other";
    const rankingLines = ranking
      ? [
          ...ranking.scores
            .filter((entry) => entry.rank !== null)
            .map((entry) => `${entry.rank}. ${approachName(entry.approach)}: ${entry.score}/100 (${entry.articles} articles; ${entry.indexedRate === null ? "indexing unknown" : `${Math.round(entry.indexedRate * 100)}% indexed`}, ${entry.page1Rate === null ? "rank unknown" : `${Math.round(entry.page1Rate * 100)}% on page 1 for their keyword`}, ${entry.leadsPerArticle} leads per article)`),
          ...(ranking.scores.some((entry) => entry.rank === null && entry.articles > 0)
            ? [`Too early to rank: ${ranking.scores.filter((entry) => entry.rank === null && entry.articles > 0).map((entry) => `${approachName(entry.approach)} (${entry.articles} checked)`).join(", ")}`]
            : []),
        ]
      : [];
    const rankingText = rankingLines.length ? rankingLines : ["No approach has 3 articles checked at day 30 yet."];
    const approaches = report.approaches.filter((group) => group.published > 0 || group.drafts > 0);

    const subject = `Blog report for ${monthName}: which blog type and idea source are working`;
    const rankingLink = `${base}/admin/blog/approaches`;
    const text = [
      `Blog report for ${monthName}.`,
      "",
      `Each AI article is measured over its first ${WINDOW_DAYS} days after publishing; the rates are per article per week.`,
      "",
      "By blog type:",
      ...(groups.length ? groups.map(line) : ["No AI articles have been published yet."]),
      "",
      "By idea source:",
      ...(approaches.length ? approaches.map(line) : ["No AI articles have been published yet."]),
      "",
      "Approach ranking (each article checked 30 days after publishing):",
      ...rankingText,
      `Details: ${rankingLink}`,
      "",
      `Published in ${monthName}: ${newPosts.length ? "" : "none"}`,
      ...newPosts.map((post) => `- ${post.title}${post.keyword ? ` ("${post.keyword}")` : ""}`),
      ...(gscNote ? ["", gscNote] : []),
      "",
      `Full report: ${link}`,
    ].join("\n");
    const html = `<p>Blog report for <strong>${escapeHtml(monthName)}</strong>.</p>
<p>Each AI article is measured over its first ${WINDOW_DAYS} days after publishing; the rates are per article per week.</p>
<p><strong>By blog type</strong></p>
<ul>${groups.length ? groups.map((group) => `<li>${escapeHtml(line(group))}</li>`).join("") : "<li>No AI articles have been published yet.</li>"}</ul>
<p><strong>By idea source</strong></p>
<ul>${approaches.length ? approaches.map((group) => `<li>${escapeHtml(line(group))}</li>`).join("") : "<li>No AI articles have been published yet.</li>"}</ul>
<p><strong>Approach ranking</strong> (each article checked 30 days after publishing)</p>
<ul>${rankingText.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
<p><a href="${escapeHtml(rankingLink)}">Open the approach ranking</a></p>
<p><strong>Published in ${escapeHtml(monthName)}:</strong> ${newPosts.length ? "" : "none"}</p>
${newPosts.length ? `<ul>${newPosts.map((post) => `<li>${escapeHtml(post.title)}${post.keyword ? ` (&ldquo;${escapeHtml(post.keyword)}&rdquo;)` : ""}</li>`).join("")}</ul>` : ""}
${gscNote ? `<p>${escapeHtml(gscNote)}</p>` : ""}
<p><a href="${escapeHtml(link)}">Open the full report</a></p>`;

    const from = process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom;
    await mailer.send({ from, to, ...(cc.length ? { cc } : {}), replyTo: to[0], subject, text, html });
    await status.set({ month, sentAt: new Date().toISOString(), leaseUntil: 0 }, { merge: true });
    return Response.json({ ok: true, month, posts: report.posts.length });
  } catch (err) {
    const error = err instanceof Error ? err.message : "The blog report failed.";
    await status.set({ leaseUntil: 0, lastError: error }, { merge: true });
    console.error("[cron] blog report failed:", error);
    return Response.json({ ok: false, error }, { status: 500 });
  }
}
