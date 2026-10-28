import { titleSimilarity } from "@/lib/ai/similarity";

/**
 * Keyword choice for the scheduled generator, from real Google Search Console data.
 * Pure (no server imports) so it can be unit-tested; search-console.ts fetches the rows.
 *
 * Every automatic draft is one of three blog types ("strategies"), taken in turn, so
 * the owner can compare after a month which type brings visits and enquiries
 * (/admin/blog/performance):
 *
 *   quick-win     - a search where mim.archi already shows on page 2-3 of Google
 *   question      - a how / what / why question people search
 *   buyer-intent  - cost, price, company or comparison searches close to hiring someone
 */

export const STRATEGY_KEYS = ["quick-win", "question", "buyer-intent"] as const;
export type Strategy = (typeof STRATEGY_KEYS)[number];

export type StrategyInfo = {
  key: Strategy;
  label: string;
  description: string;
  /** Extra rule for the topic planner. */
  planner: string;
  /** Extra rule for the article writer. */
  writer: string;
};

export const STRATEGIES: StrategyInfo[] = [
  {
    key: "quick-win",
    label: "Quick win",
    description: "A search where mim.archi already appears on page 2-3 of Google, to push it onto page 1.",
    planner: "The keyword is a search where the studio's site already appears on page 2-3 of Google. Choose the angle that answers that exact search more completely than anything else.",
    writer:
      "This is a QUICK WIN article for a search where the studio's site already ranks on page 2-3. Answer that exact search completely and early, cover the related searches listed, and if the page that already ranks is in the allowed link list, link to it with descriptive anchor text.",
  },
  {
    key: "question",
    label: "Question guide",
    description: "A how / what / why question people type into Google about a service in a region.",
    planner: "Frame the topic as the question a buyer, developer or architect actually asks (how / what / why / which / when).",
    writer:
      "This is a QUESTION GUIDE. Answer the question directly in the opening, then walk through it step by step, and make the FAQ especially strong with the follow-up questions people ask next.",
  },
  {
    key: "buyer-intent",
    label: "Buyer intent",
    description: "Cost, price, company or comparison searches from people close to hiring someone.",
    planner: "Choose a commercial-investigation angle: what drives the cost, how to compare providers, what a brief or quote should include, or one option against another. Never state prices you cannot support.",
    writer:
      "This is a BUYER INTENT article for someone close to hiring. Explain what drives cost and scope (without inventing prices), include a comparison or checklist section that helps choose a provider, and point clearly but without pressure to the relevant service page and /contact.",
  },
];

export const strategyInfo = (key: string | undefined) => STRATEGIES.find((item) => item.key === key);

/** One Search Console row (query x country x page). `page` is stored as a path, without the domain. */
export type KeywordRow = { query: string; country: string; page: string; clicks: number; impressions: number; position: number };

export type KeywordStats = { impressions: number; clicks: number; position: number; country: string; page: string };

/** What a planned topic, job and AI post carry so the report can group them. */
export type BlogTagging = {
  strategy: Strategy;
  /** "search-console" = a real Google search; "ai" = no usable Search Console keyword, so the AI chose one. */
  keywordSource: "search-console" | "ai";
  keywordStats?: KeywordStats;
  relatedQueries?: string[];
};

/** Search Console country codes (ISO 3166-1 alpha-3, lowercase) of the region pages in regions.ts. */
export const COUNTRY_TO_REGION: Record<string, string> = { are: "UAE", usa: "USA", sau: "Saudi Arabia", pak: "Pakistan" };

// Order matters: the first match wins ("3d virtual tour" is interactive, "architecture firm branding" is branding).
const GROUP_TERMS: [string, RegExp][] = [
  ["interactive-services", /\b(vr|virtual reality|360|virtual tours?|web tours?|interactive|unit selectors?|property explorers?|smart homes?|metaverse)\b/],
  ["branding", /\b(brand|branding|logo|logos|identity|stationery|collateral)\b/],
  ["marketing", /\b(marketing|seo|social media|web design|website|web development|proptech|off[- ]plan|lead generation)\b/],
  ["3d-visualization", /\b(3d|render|renders|rendering|renderings|visuali[sz]ation|cgi|walk ?through|animation|fly ?through|aerial|vfx)\b/],
  ["architectural-design", /\b(architect|architects|architecture|architectural|interior|interiors|design|urban|master ?plan|master ?planning|survey|surveys|topographic|landscape|floor ?plans?)\b/],
];

const normal = (value: string) => value.toLowerCase().replace(/[-_/]+/g, " ");

/** The service group a search belongs to: from the query first, then from the page Google showed for it. */
export function groupForQuery(query: string, page = ""): string | null {
  for (const text of [normal(query), normal(page)]) {
    for (const [group, pattern] of GROUP_TERMS) if (pattern.test(text)) return group;
  }
  return null;
}

const BRANDED = /\bmim(ar)?\b|mim\s?archi|mimar\s?studios?/i;
const QUESTION = /^(how|what|why|which|when|where|who|can|is|are|does|do|should|will)\b|\b(guide|tips|steps|process|checklist|explained|meaning)\b/i;
const BUYER =
  /\b(cost|costs|price|prices|pricing|rate|rates|fee|fees|quote|cheap|affordable|budget|company|companies|agency|agencies|firm|firms|studio|studios|service|services|best|top|near me|hire|freelancers?|vs|versus|compare|comparison)\b/i;

/** Page 2-3 of Google, and seen often enough to matter. */
export const QUICK_WIN_POSITION = { min: 8, max: 30 } as const;
export const QUICK_WIN_MIN_IMPRESSIONS = 10;

const wordCount = (query: string) => query.trim().split(/\s+/).filter(Boolean).length;

export const isBranded = (query: string) => BRANDED.test(query);

/** Every blog type a (query-level) row could be written as. One search can fit more than one. */
export function classifyStrategies(row: Pick<KeywordRow, "query" | "impressions" | "position">): Strategy[] {
  const found: Strategy[] = [];
  if (row.position >= QUICK_WIN_POSITION.min && row.position <= QUICK_WIN_POSITION.max && row.impressions >= QUICK_WIN_MIN_IMPRESSIONS) found.push("quick-win");
  if (QUESTION.test(row.query)) found.push("question");
  if (BUYER.test(row.query)) found.push("buyer-intent");
  return found;
}

/**
 * Rows worth keeping (Firestore documents are capped at 1 MiB): only the four target countries,
 * no branded searches, 2-6 words, the busiest first.
 */
export function trimRows(rows: KeywordRow[], limit = 2500): KeywordRow[] {
  return rows
    .filter((row) => COUNTRY_TO_REGION[row.country] && !isBranded(row.query) && wordCount(row.query) >= 2 && wordCount(row.query) <= 6)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
}

type Aggregated = KeywordStats & { query: string };

/** One entry per search: totals across pages, impression-weighted position, the page shown most. */
function aggregate(rows: KeywordRow[]): Aggregated[] {
  const byQuery = new Map<string, { rows: KeywordRow[] }>();
  for (const row of rows) {
    const key = row.query.trim().toLowerCase().replace(/\s+/g, " ");
    if (!byQuery.has(key)) byQuery.set(key, { rows: [] });
    byQuery.get(key)!.rows.push(row);
  }
  return [...byQuery.entries()].map(([query, { rows: group }]) => {
    const impressions = group.reduce((sum, row) => sum + row.impressions, 0);
    const clicks = group.reduce((sum, row) => sum + row.clicks, 0);
    const weighted = group.reduce((sum, row) => sum + row.position * row.impressions, 0);
    const top = [...group].sort((a, b) => b.impressions - a.impressions)[0];
    return {
      query,
      impressions,
      clicks,
      position: Math.round((impressions ? weighted / impressions : top.position) * 10) / 10,
      country: top.country,
      page: top.page,
    };
  });
}

export type KeywordPick = { keyword: string; stats: KeywordStats; related: string[]; group: string | null };

export type PickOptions = {
  strategy: Strategy;
  /** Region name from regions.ts (e.g. "UAE"); any target region when omitted. */
  region?: string;
  /** Service group key; any group when omitted. */
  group?: string;
  /** Titles and keywords already covered; anything close to one is skipped. */
  used: string[];
  /** Pages that are articles. A quick win whose ranking page is an article should be an update of that article, not a new one. */
  isArticlePage?: (path: string) => boolean;
};

const defaultIsArticle = (path: string) => /^(\/ar)?\/blog\/[^/]+\/?$/.test(path);

/** The best Search Console keyword for this blog type, region and service, or null when there is none. */
export function pickKeyword(rows: KeywordRow[], options: PickOptions): KeywordPick | null {
  const isArticle = options.isArticlePage ?? defaultIsArticle;
  const inRegion = rows.filter((row) => COUNTRY_TO_REGION[row.country] && (!options.region || COUNTRY_TO_REGION[row.country] === options.region));
  const searches = aggregate(inRegion);
  const usedLower = options.used.map((value) => value.toLowerCase());

  const candidates = searches
    .filter((item) => !isBranded(item.query) && wordCount(item.query) >= 2 && wordCount(item.query) <= 6)
    .filter((item) => classifyStrategies(item).includes(options.strategy))
    .filter((item) => !options.group || groupForQuery(item.query, item.page) === options.group)
    .filter((item) => !(options.strategy === "quick-win" && isArticle(item.page)))
    .filter((item) => !usedLower.some((used) => used.includes(item.query) || titleSimilarity(item.query, used) >= 0.5))
    .map((item) => ({
      item,
      // Quick wins: busy searches closest to page 1 first. Otherwise: the busiest search.
      score: options.strategy === "quick-win" ? item.impressions * ((QUICK_WIN_POSITION.max + 1 - item.position) / (QUICK_WIN_POSITION.max + 1 - QUICK_WIN_POSITION.min)) : item.impressions,
    }))
    .sort((a, b) => b.score - a.score || a.item.query.localeCompare(b.item.query));

  const best = candidates[0]?.item;
  if (!best) return null;
  const related = searches
    .filter((item) => item.query !== best.query && !isBranded(item.query) && (item.page === best.page || titleSimilarity(item.query, best.query) >= 0.3))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8)
    .map((item) => item.query);
  const { query, ...stats } = best;
  return { keyword: query, stats, related, group: groupForQuery(query, best.page) };
}

export type StrategyHistoryItem = { strategy?: string; createdAt: string };

/**
 * The blog type for the next automatic draft: the one used least in the last 30 days, ties going
 * to the next one in turn after the most recent, so each type gets about the same number of drafts.
 */
export function nextStrategy(history: StrategyHistoryItem[], now = new Date()): Strategy {
  const since = now.getTime() - 30 * 86_400_000;
  const recent = history
    .filter((item): item is { strategy: Strategy; createdAt: string } => STRATEGY_KEYS.includes(item.strategy as Strategy) && Date.parse(item.createdAt) >= since)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const count = (key: Strategy) => recent.filter((item) => item.strategy === key).length;
  const last = recent[recent.length - 1]?.strategy;
  const start = last ? (STRATEGY_KEYS.indexOf(last) + 1) % STRATEGY_KEYS.length : 0;
  let best: Strategy = STRATEGY_KEYS[start];
  for (let i = 1; i < STRATEGY_KEYS.length; i++) {
    const key = STRATEGY_KEYS[(start + i) % STRATEGY_KEYS.length];
    if (count(key) < count(best)) best = key;
  }
  return best;
}
