import "server-only";
import { FieldPath } from "firebase-admin/firestore";
import { STRATEGIES, type BlogTagging, type Strategy } from "@/lib/ai/keyword-plan";
import { adminDb } from "@/lib/firebase/admin";
import { listLeadJourneys } from "@/lib/leads";
import { POSTS_COLLECTION, type Post } from "@/lib/posts";
import { fetchPageStats, latestCompleteDay, searchConsoleConfigured, type PageStats } from "@/lib/search-console";
import { BLOG_DAILY_COLLECTION } from "@/lib/visits";

/**
 * Which blog type works: the AI articles grouped by blog type (keyword-plan.ts), for
 * /admin/blog/performance and the monthly email (/api/cron/blog-report).
 *
 * Each article is measured over its first WINDOW_DAYS after publishing, so an article published
 * last week is not compared with one that has had three months; rates are per week of age.
 *   - views, Google visits and time on page: the per-day counters (siteBlogDaily, see visits.ts)
 *   - leads: website enquiries whose visitor opened the article before enquiring (leads.ts)
 *   - Google clicks, impressions and average position: Search Console, when configured
 * English and Arabic pages of an article are counted together.
 */

export const WINDOW_DAYS = 28;
const DAY_MS = 86_400_000;

export type GroupKey = Strategy | "other";

export type PostPerformance = {
  id: string;
  title: string;
  path: string;
  status: Post["status"];
  publishedAt?: string;
  group: GroupKey;
  keyword?: string;
  keywordSource?: BlogTagging["keywordSource"];
  geo?: string;
  /** Days of the window that have passed (0 for drafts). */
  ageDays: number;
  views: number;
  organic: number;
  seconds: number;
  leads: number;
  /** Null when Search Console is not configured or failed. */
  gsc: PageStats | null;
};

export type GroupSummary = {
  key: GroupKey;
  label: string;
  description: string;
  published: number;
  drafts: number;
  /** Published articles whose keyword came from Search Console. */
  realKeywords: number;
  viewsPerWeek: number;
  organicPerWeek: number;
  avgSeconds: number;
  leads: number;
  clicks: number;
  impressions: number;
  /** Impression-weighted average Google position; 0 when there were no impressions. */
  position: number;
};

export type BlogReport = {
  generatedAt: string;
  posts: PostPerformance[];
  groups: GroupSummary[];
  /** "ok", "off" (not configured) or the error message. */
  gsc: string;
};

const OTHER = {
  key: "other" as const,
  label: "Other AI drafts",
  description: "Topics typed in by staff, and drafts written before blog types were tracked.",
};

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const counterDay = (date: Date) => isoDay(date).replace(/-/g, "");

/** The measured window of a published article: its first WINDOW_DAYS days, up to today. */
export function measureWindow(publishedAt: string, now = new Date()): { start: Date; end: Date; ageDays: number } {
  const start = new Date(`${publishedAt.slice(0, 10)}T00:00:00.000Z`);
  const today = new Date(`${isoDay(now)}T00:00:00.000Z`);
  const end = new Date(Math.min(start.getTime() + (WINDOW_DAYS - 1) * DAY_MS, today.getTime()));
  return { start, end, ageDays: Math.max(0, Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1) };
}

export type DailyCounters = Record<string, { views?: Record<string, number>; organic?: Record<string, number>; seconds?: Record<string, number> }>;

/** Sums the per-day counters of both language versions of `path` inside the window. */
export function sumCounters(daily: DailyCounters, path: string, start: Date, end: Date) {
  const paths = [path, `/ar${path}`];
  const total = { views: 0, organic: 0, seconds: 0 };
  for (let day = start.getTime(); day <= end.getTime(); day += DAY_MS) {
    const counters = daily[counterDay(new Date(day))];
    if (!counters) continue;
    for (const key of ["views", "organic", "seconds"] as const) for (const p of paths) total[key] += counters[key]?.[p] ?? 0;
  }
  return total;
}

const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

/** One row per blog type (+ "other"), in the fixed order of STRATEGIES. */
export function summarize(posts: PostPerformance[]): GroupSummary[] {
  return [...STRATEGIES, OTHER].map(({ key, label, description }) => {
    const group = posts.filter((post) => post.group === key);
    const live = group.filter((post) => post.status === "published" && post.ageDays > 0);
    const perWeek = (value: (post: PostPerformance) => number) => (live.length ? round(live.reduce((sum, post) => sum + (value(post) / post.ageDays) * 7, 0) / live.length) : 0);
    const views = live.reduce((sum, post) => sum + post.views, 0);
    const impressions = live.reduce((sum, post) => sum + (post.gsc?.impressions ?? 0), 0);
    return {
      key,
      label,
      description,
      published: live.length,
      drafts: group.filter((post) => post.status === "draft").length,
      realKeywords: live.filter((post) => post.keywordSource === "search-console").length,
      viewsPerWeek: perWeek((post) => post.views),
      organicPerWeek: perWeek((post) => post.organic),
      avgSeconds: views ? Math.round(live.reduce((sum, post) => sum + post.seconds, 0) / views) : 0,
      leads: live.reduce((sum, post) => sum + post.leads, 0),
      clicks: live.reduce((sum, post) => sum + (post.gsc?.clicks ?? 0), 0),
      impressions,
      position: impressions ? round(live.reduce((sum, post) => sum + (post.gsc?.position ?? 0) * (post.gsc?.impressions ?? 0), 0) / impressions) : 0,
    };
  });
}

type PostDoc = Pick<Post, "title" | "path" | "status" | "publishedAt"> & { generation?: Post["generation"] };

export async function buildBlogReport(now = new Date()): Promise<BlogReport> {
  const snap = await adminDb()
    .collection(POSTS_COLLECTION)
    .where("origin", "==", "ai")
    .select("title", "path", "status", "publishedAt", "generation.strategy", "generation.keywordSource", "generation.keyword", "generation.geo")
    .get();
  const docs = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as PostDoc) }));

  const published = docs.filter((doc) => doc.status === "published" && doc.publishedAt);
  const earliest = published.map((doc) => doc.publishedAt!.slice(0, 10)).sort()[0];

  const daily: DailyCounters = {};
  let journeys: { createdAt: string; pages: string[] }[] = [];
  if (earliest) {
    const [counters, leads] = await Promise.all([
      adminDb().collection(BLOG_DAILY_COLLECTION).where(FieldPath.documentId(), ">=", earliest.replace(/-/g, "")).get(),
      listLeadJourneys(`${earliest}T00:00:00.000Z`),
    ]);
    for (const doc of counters.docs) daily[doc.id] = doc.data() as DailyCounters[string];
    journeys = leads;
  }

  let gsc = searchConsoleConfigured() ? "ok" : "off";
  const lastGscDay = latestCompleteDay(now);
  const posts = await Promise.all(
    docs.map(async (doc): Promise<PostPerformance> => {
      const strategy = doc.generation?.strategy;
      const row: PostPerformance = {
        id: doc.id,
        title: doc.title ?? "",
        path: doc.path ?? "",
        status: doc.status ?? "draft",
        publishedAt: doc.publishedAt,
        group: STRATEGIES.some((item) => item.key === strategy) ? strategy! : "other",
        keyword: doc.generation?.keyword,
        keywordSource: doc.generation?.keywordSource,
        geo: doc.generation?.geo,
        ageDays: 0,
        views: 0,
        organic: 0,
        seconds: 0,
        leads: 0,
        gsc: null,
      };
      if (row.status !== "published" || !row.publishedAt || !row.path) return row;

      const { start, end, ageDays } = measureWindow(row.publishedAt, now);
      const windowEnd = start.getTime() + WINDOW_DAYS * DAY_MS;
      const paths = new Set([row.path, `/ar${row.path}`]);
      row.ageDays = ageDays;
      Object.assign(row, sumCounters(daily, row.path, start, end));
      row.leads = journeys.filter((lead) => {
        const at = Date.parse(lead.createdAt);
        return at >= Date.parse(row.publishedAt!) && at < windowEnd && lead.pages.some((page) => paths.has(page));
      }).length;

      if (gsc === "ok") {
        const gscEnd = isoDay(end) < lastGscDay ? isoDay(end) : lastGscDay;
        try {
          row.gsc = isoDay(start) <= gscEnd ? await fetchPageStats(row.path, isoDay(start), gscEnd) : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
        } catch (err) {
          gsc = err instanceof Error ? err.message : "Search Console request failed.";
        }
      }
      return row;
    }),
  );
  if (gsc !== "ok") for (const post of posts) post.gsc = null;

  posts.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  return { generatedAt: now.toISOString(), posts, groups: summarize(posts), gsc };
}
