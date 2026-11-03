import "server-only";
import { FieldPath } from "firebase-admin/firestore";
import {
  CHECKPOINT_DAYS,
  checkpointKey,
  checkpointWindow,
  dueCheckpoints,
  scoreApproaches,
  type ApproachScore,
  type CheckpointDays,
  type CheckpointKey,
  type Snapshot,
} from "@/lib/ai/approach-score";
import { APPROACHES, regionForText } from "@/lib/ai/idea-plan";
import { COUNTRY_TO_REGION } from "@/lib/ai/keyword-plan";
import { approachOf, sumCounters, type ApproachKey, type DailyCounters } from "@/lib/blog-performance";
import { adminDb } from "@/lib/firebase/admin";
import { listLeadJourneys } from "@/lib/leads";
import { POSTS_COLLECTION, type Post } from "@/lib/posts";
import { fetchKeywordPosition, fetchPageStats, inspectUrl, searchConsoleConfigured } from "@/lib/search-console";
import { siteConfig } from "@/lib/site-config";
import { BLOG_DAILY_COLLECTION } from "@/lib/visits";

/**
 * Fixed results for every published article written in the portal: one snapshot at day 30 and one at
 * day 90 after publishing (collection `siteBlogResults`, one document per post), taken by the daily
 * cron /api/cron/blog-results once Search Console has the complete data (3 days later). A snapshot is
 * never overwritten, so the verdict on /admin/blog/approaches does not drift.
 *
 * Each snapshot records whether Google has indexed the page (URL Inspection API), where it ranks for
 * the keyword it was written for (overall and in its target country), its Google clicks and impressions,
 * and from our own data its views, Google visits and leads, all over its first 30 or 90 days.
 */

const RESULTS = "siteBlogResults";
const STATUS_DOC = "siteBlogPlanner/results";
const LEASE_MS = 330_000;
const DAY_MS = 86_400_000;

export type ArticleResult = {
  /** The post's id. */
  id: string;
  path: string;
  title: string;
  approach: ApproachKey;
  strategy?: string;
  keyword?: string;
  keywordSource?: string;
  geo?: string;
  publishedAt: string;
  checkpoints: Partial<Record<CheckpointKey, Snapshot>>;
};

type ResultPost = Pick<Post, "id" | "path" | "title" | "publishedAt" | "origin"> & { generation?: Post["generation"] };

/** Published articles written in the portal (AI and by hand): the ones the approaches are judged on. */
async function listResultPosts(): Promise<ResultPost[]> {
  const snap = await adminDb()
    .collection(POSTS_COLLECTION)
    .where("status", "==", "published")
    .select("path", "title", "publishedAt", "origin", "legacy", "generation.approach", "generation.strategy", "generation.keyword", "generation.keywordSource", "generation.geo")
    .get();
  return snap.docs
    .filter((doc) => !doc.get("legacy") && doc.get("publishedAt") && doc.get("path"))
    .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ResultPost, "id">) }));
}

async function listResults(): Promise<Map<string, ArticleResult>> {
  const snap = await adminDb().collection(RESULTS).get();
  return new Map(snap.docs.map((doc) => [doc.id, { ...(doc.data() as Omit<ArticleResult, "id">), id: doc.id }]));
}

/** The target market's Search Console country code from a post's geo ("Dubai, UAE" -> "are"). */
function countryCode(geo: string | undefined): string | undefined {
  const region = geo ? regionForText(geo) : undefined;
  return region ? Object.entries(COUNTRY_TO_REGION).find(([, name]) => name === region)?.[0] : undefined;
}

function meta(post: ResultPost): Omit<ArticleResult, "id" | "checkpoints"> {
  const generation = post.generation;
  return {
    path: post.path,
    title: post.title,
    approach: approachOf(generation),
    strategy: generation?.strategy,
    keyword: generation?.keyword,
    keywordSource: generation?.keywordSource,
    geo: generation?.geo,
    publishedAt: post.publishedAt!,
  };
}

async function snapshotFor(post: ResultPost, days: CheckpointDays, data: { daily: DailyCounters; journeys: { createdAt: string; pages: string[] }[] }): Promise<Snapshot> {
  const { start, end } = checkpointWindow(post.publishedAt!, days);
  const windowEnd = Date.parse(`${start}T00:00:00.000Z`) + days * DAY_MS;
  const paths = new Set([post.path, `/ar${post.path}`]);
  const counters = sumCounters(data.daily, post.path, new Date(`${start}T00:00:00.000Z`), new Date(`${end}T00:00:00.000Z`));
  const leads = data.journeys.filter((lead) => {
    const at = Date.parse(lead.createdAt);
    return at >= Date.parse(post.publishedAt!) && at < windowEnd && lead.pages.some((page) => paths.has(page));
  }).length;
  const snapshot: Snapshot = {
    takenAt: new Date().toISOString(),
    indexed: null,
    keywordPosition: null,
    countryPosition: null,
    clicks: 0,
    impressions: 0,
    position: 0,
    views: counters.views,
    organic: counters.organic,
    leads,
    gsc: searchConsoleConfigured() ? "ok" : "off",
  };
  if (snapshot.gsc !== "ok") return snapshot;

  try {
    const keyword = post.generation?.keyword?.trim();
    const [page, ranking, index] = await Promise.all([
      fetchPageStats(post.path, start, end),
      keyword ? fetchKeywordPosition(post.path, keyword, start, end, countryCode(post.generation?.geo)) : Promise.resolve(null),
      inspectUrl(new URL(post.path, siteConfig.url).toString()),
    ]);
    Object.assign(snapshot, {
      clicks: page.clicks,
      impressions: page.impressions,
      position: page.position,
      keywordPosition: ranking?.position ?? null,
      countryPosition: ranking?.countryPosition ?? null,
      indexed: index.indexed,
      coverage: index.coverage,
      lastCrawl: index.lastCrawl,
    });
  } catch (err) {
    snapshot.gsc = (err instanceof Error ? err.message : "Search Console request failed.").slice(0, 300);
  }
  return snapshot;
}

export type ResultsRun = { ok: true; taken: number; remaining: number } | { ok: false; skipped: string };

/** Takes the checkpoints that are due (oldest first, at most `limit`). Safe to run any number of times. */
export async function takeDueSnapshots({ limit = 50, now = new Date() } = {}): Promise<ResultsRun> {
  const status = adminDb().doc(STATUS_DOC);
  const acquired = await adminDb().runTransaction(async (tx) => {
    const previous = await tx.get(status);
    if (Number(previous.get("leaseUntil") ?? 0) > Date.now()) return false;
    tx.set(status, { state: "running", lastRunAt: now.toISOString(), leaseUntil: Date.now() + LEASE_MS }, { merge: true });
    return true;
  });
  if (!acquired) return { ok: false, skipped: "A results check is already running." };

  try {
    const [posts, results] = await Promise.all([listResultPosts(), listResults()]);
    const due = posts
      .flatMap((post) => dueCheckpoints(post.publishedAt, results.get(post.id)?.checkpoints ?? {}, now).map((days) => ({ post, days })))
      .sort((a, b) => a.post.publishedAt!.localeCompare(b.post.publishedAt!) || a.days - b.days);
    const batch = due.slice(0, limit);

    let taken = 0;
    if (batch.length) {
      const earliest = batch.map((item) => item.post.publishedAt!.slice(0, 10)).sort()[0];
      const [counters, journeys] = await Promise.all([
        adminDb().collection(BLOG_DAILY_COLLECTION).where(FieldPath.documentId(), ">=", earliest.replace(/-/g, "")).get(),
        listLeadJourneys(`${earliest}T00:00:00.000Z`),
      ]);
      const daily: DailyCounters = {};
      for (const doc of counters.docs) daily[doc.id] = doc.data() as DailyCounters[string];

      for (const { post, days } of batch) {
        const snapshot = await snapshotFor(post, days, { daily, journeys });
        await adminDb()
          .collection(RESULTS)
          .doc(post.id)
          .set(JSON.parse(JSON.stringify({ ...meta(post), checkpoints: { [checkpointKey(days)]: snapshot } })), { merge: true });
        taken++;
      }
    }
    await status.set({ state: "done", leaseUntil: 0, taken, remaining: due.length - taken, error: null }, { merge: true });
    return { ok: true, taken, remaining: due.length - taken };
  } catch (err) {
    await status.set({ state: "failed", leaseUntil: 0, error: err instanceof Error ? err.message : "Results check failed." }, { merge: true }).catch(() => undefined);
    throw err;
  }
}

export type ResultsStatus = { state: string; lastRunAt: string; leaseUntil: number; taken?: number; remaining?: number; error?: string };

export async function getResultsStatus(): Promise<ResultsStatus | null> {
  const snap = await adminDb().doc(STATUS_DOC).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return { state: data.state ?? "unknown", lastRunAt: data.lastRunAt ?? "", leaseUntil: Number(data.leaseUntil ?? 0), taken: data.taken, remaining: data.remaining, error: data.error ?? undefined };
}

/** Whether a results check holds the lease right now. */
export const resultsRunning = (status: ResultsStatus | null, now = Date.now()) => status?.state === "running" && status.leaseUntil > now;

export type ApproachRow = Omit<ArticleResult, "checkpoints"> & {
  snapshot?: Snapshot;
  /** When the checkpoint will be taken (YYYY-MM-DD), for articles still waiting. */
  dueAt: string;
};

export type ApproachReport = {
  days: CheckpointDays;
  scores: ApproachScore[];
  rows: ApproachRow[];
  gsc: boolean;
};

/** Everything /admin/blog/approaches and the monthly email show, at one checkpoint. */
export async function buildApproachReport(days: CheckpointDays): Promise<ApproachReport> {
  const [posts, results] = await Promise.all([listResultPosts(), listResults()]);
  const key = checkpointKey(days);
  const rows: ApproachRow[] = posts
    .map((post) => {
      const stored = results.get(post.id);
      return { id: post.id, ...meta(post), snapshot: stored?.checkpoints?.[key], dueAt: checkpointWindow(post.publishedAt!, days).dueAt };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const order = [...APPROACHES.map((item) => item.key), "other"];
  const scores = scoreApproaches(rows.flatMap((row) => (row.snapshot ? [{ approach: row.approach, snapshot: row.snapshot }] : [])), order);
  return { days, scores, rows, gsc: searchConsoleConfigured() };
}

export { CHECKPOINT_DAYS };
