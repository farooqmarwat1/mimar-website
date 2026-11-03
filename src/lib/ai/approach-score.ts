/**
 * Which approach works: each published article is checked once at day 30 and once at day 90
 * (src/lib/blog-results.ts), and the approaches are scored from those fixed snapshots, so the verdict
 * does not drift as later traffic comes in. Pure (no server imports) so it can be unit-tested.
 *
 * Score out of 100, from four parts (each shown on /admin/blog/approaches):
 *   indexed   15  share of the approach's articles Google has indexed
 *   page 1    30  share ranking 1-10 on Google for the keyword they were written for (+10 for top 3)
 *   clicks    20  Google clicks per article, relative to the best approach
 *   leads     25  enquiries per article, relative to the best approach
 * A part with no data at all (Search Console not connected) is left out and the others are scaled up,
 * so approaches are still compared fairly. An approach needs MIN_ARTICLES snapshots to be ranked.
 */

export const CHECKPOINT_DAYS = [30, 90] as const;
export type CheckpointDays = (typeof CHECKPOINT_DAYS)[number];
export type CheckpointKey = `d${CheckpointDays}`;
export const checkpointKey = (days: CheckpointDays): CheckpointKey => `d${days}`;

/** Search Console data is complete after about three days, so a day-30 check runs on day 33. */
export const RESULTS_LAG_DAYS = 3;
export const MIN_ARTICLES = 3;
const DAY_MS = 86_400_000;

/** The measured window of a checkpoint: the article's first `days` days, as YYYY-MM-DD (UTC). */
export function checkpointWindow(publishedAt: string, days: CheckpointDays): { start: string; end: string; dueAt: string } {
  const start = Date.parse(`${publishedAt.slice(0, 10)}T00:00:00.000Z`);
  const day = (offset: number) => new Date(start + offset * DAY_MS).toISOString().slice(0, 10);
  return { start: day(0), end: day(days - 1), dueAt: day(days + RESULTS_LAG_DAYS) };
}

/** Checkpoints whose window (plus the lag) has passed and that have not been taken yet. */
export function dueCheckpoints(publishedAt: string | undefined, taken: Partial<Record<CheckpointKey, unknown>>, now = new Date()): CheckpointDays[] {
  if (!publishedAt) return [];
  const today = now.toISOString().slice(0, 10);
  return CHECKPOINT_DAYS.filter((days) => !taken[checkpointKey(days)] && checkpointWindow(publishedAt, days).dueAt <= today);
}

/** What one checkpoint recorded about an article. */
export type Snapshot = {
  takenAt: string;
  /** null when Search Console is not connected or the inspection failed. */
  indexed: boolean | null;
  coverage?: string;
  lastCrawl?: string;
  /** Average Google position for the article's own keyword; null = never shown for it (or unknown, see `gsc`). */
  keywordPosition: number | null;
  /** The same in the target market. */
  countryPosition: number | null;
  /** Page totals in the window (all searches). */
  clicks: number;
  impressions: number;
  position: number;
  /** From our own counters (visits.ts) and leads (leads.ts). */
  views: number;
  organic: number;
  leads: number;
  /** "ok", "off" (not connected) or the error. When not "ok", the Google fields are not known. */
  gsc: string;
};

export type ScoredRow = { approach: string; snapshot: Snapshot };

export type ApproachScore = {
  approach: string;
  articles: number;
  /** Ranked only with MIN_ARTICLES snapshots. */
  rank: number | null;
  score: number | null;
  indexedRate: number | null;
  page1Rate: number | null;
  top3Rate: number | null;
  clicksPerArticle: number;
  leadsPerArticle: number;
  /** Points per part (out of its weight), for the explanation on the page. */
  points: { indexed: number | null; page1: number | null; top3: number | null; clicks: number; leads: number };
};

export const WEIGHTS = { indexed: 15, page1: 30, top3: 10, clicks: 20, leads: 25 } as const;

const round = (value: number, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;

/** One entry per approach in `order` (approaches with no snapshot at all get articles 0), ranked ones first by score. */
export function scoreApproaches(rows: ScoredRow[], order: string[]): ApproachScore[] {
  const base = order.map((approach) => {
    const snaps = rows.filter((row) => row.approach === approach).map((row) => row.snapshot);
    const known = snaps.filter((snap) => snap.gsc === "ok");
    const inspected = known.filter((snap) => snap.indexed !== null);
    const rate = (list: Snapshot[], test: (snap: Snapshot) => boolean) => (list.length ? list.filter(test).length / list.length : null);
    return {
      approach,
      articles: snaps.length,
      indexedRate: rate(inspected, (snap) => snap.indexed === true),
      page1Rate: rate(known, (snap) => snap.keywordPosition !== null && snap.keywordPosition <= 10),
      top3Rate: rate(known, (snap) => snap.keywordPosition !== null && snap.keywordPosition <= 3),
      clicksPerArticle: snaps.length ? known.reduce((sum, snap) => sum + snap.clicks, 0) / snaps.length : 0,
      leadsPerArticle: snaps.length ? snaps.reduce((sum, snap) => sum + snap.leads, 0) / snaps.length : 0,
    };
  });

  const ranked = base.filter((entry) => entry.articles >= MIN_ARTICLES);
  const maxClicks = Math.max(0, ...ranked.map((entry) => entry.clicksPerArticle));
  const maxLeads = Math.max(0, ...ranked.map((entry) => entry.leadsPerArticle));
  const anyGoogle = ranked.some((entry) => entry.page1Rate !== null);

  const scored = base.map((entry): ApproachScore => {
    const points = {
      indexed: entry.indexedRate === null ? null : entry.indexedRate * WEIGHTS.indexed,
      page1: entry.page1Rate === null ? null : entry.page1Rate * WEIGHTS.page1,
      top3: entry.top3Rate === null ? null : entry.top3Rate * WEIGHTS.top3,
      clicks: maxClicks ? (entry.clicksPerArticle / maxClicks) * WEIGHTS.clicks : 0,
      leads: maxLeads ? (entry.leadsPerArticle / maxLeads) * WEIGHTS.leads : 0,
    };
    // Parts with no data anywhere are left out, and the rest scaled to 100.
    const available =
      (points.indexed !== null ? WEIGHTS.indexed : 0) +
      (points.page1 !== null ? WEIGHTS.page1 + WEIGHTS.top3 : 0) +
      (anyGoogle ? WEIGHTS.clicks : 0) +
      WEIGHTS.leads;
    const earned = (points.indexed ?? 0) + (points.page1 ?? 0) + (points.top3 ?? 0) + (anyGoogle ? points.clicks : 0) + points.leads;
    const isRanked = entry.articles >= MIN_ARTICLES;
    return {
      ...entry,
      clicksPerArticle: round(entry.clicksPerArticle),
      leadsPerArticle: round(entry.leadsPerArticle, 2),
      rank: null,
      score: isRanked ? Math.round((earned / available) * 100) : null,
      points: { indexed: points.indexed === null ? null : round(points.indexed), page1: points.page1 === null ? null : round(points.page1), top3: points.top3 === null ? null : round(points.top3), clicks: round(points.clicks), leads: round(points.leads) },
    };
  });

  const order2 = scored
    .filter((entry) => entry.score !== null)
    .sort((a, b) => b.score! - a.score! || b.leadsPerArticle - a.leadsPerArticle || b.clicksPerArticle - a.clicksPerArticle);
  order2.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  return [...order2, ...scored.filter((entry) => entry.score === null)];
}
