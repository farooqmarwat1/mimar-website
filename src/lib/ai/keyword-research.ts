import { classifyStrategies, groupForQuery, type Strategy } from "@/lib/ai/keyword-plan";
import { mentionsKeyword } from "@/lib/ai/seo-checks";
import { titleSimilarity } from "@/lib/ai/similarity";

/**
 * The keyword-research approach: our SEO consultant's own way of finding a blog topic, automated.
 *
 *   1. take an interesting title a competitor has published
 *      ("Why US Real Estate Developers Are Investing More in Architectural Visualization")
 *   2. split it into the keywords inside it ("us real estate developers", "real estate developers",
 *      "architectural visualization", ...)
 *   3. look up each keyword's demand, difficulty and intent, and keep the best one
 *   4. have the AI write 3-5 titles for that keyword
 *   5. recheck those titles against what competitors (and we) already published, and keep the
 *      one nobody has written yet
 *
 * There is no paid keyword tool behind step 3 (the owner chose a ~$0 running cost), so demand and
 * difficulty are ESTIMATES from free signals: Google autocomplete, our own Search Console data, and
 * how many competitor posts already target the phrase. Every idea says so.
 * Pure (no server imports) so it can be unit-tested; collectors/keyword-research.ts does the fetching.
 */

/** Words a keyword never starts or ends with ("for architectural visualization", "investing more in"). */
const EDGE = new Set(
  "a an the of for in on to and or with by from at as into about your our their its this that these those how what why when which who whom whose is are was were be been do does did can could should would will may might must need needs every all any some more most less best top ultimate guide complete vs versus why new way ways tips ideas reasons things it we you they i my me".split(" "),
);

const tokens = (title: string) =>
  (title.toLowerCase().replace(/['’]/g, "").match(/[\p{L}\p{N}]+/gu) ?? []).filter((word) => !/^(19|20)\d\d$/.test(word));

/** Every 2-5 word phrase in a title that could be a keyword, most specific (longest) first. */
export function keywordCandidates(title: string, max = 15): string[] {
  const words = tokens(title);
  const found = new Set<string>();
  for (let size = 5; size >= 2; size--) {
    for (let start = 0; start + size <= words.length; start++) {
      const gram = words.slice(start, start + size);
      if (EDGE.has(gram[0]) || EDGE.has(gram[gram.length - 1])) continue;
      // A bare number ("8 top rendering techniques") is a listicle count, not part of a search.
      if (gram.some((word) => /^\d+$/.test(word) && word !== "360")) continue;
      found.add(gram.join(" "));
    }
  }
  return [...found].slice(0, max);
}

export type CandidateSignals = {
  keyword: string;
  /** Google autocomplete suggests the phrase itself (or a longer search containing it). */
  autocomplete: boolean;
  /** How many autocomplete suggestions contain the phrase. */
  suggestions: number;
  /** Our Search Console impressions for the phrase and close variants (90 days). */
  impressions: number;
  /** Competitor posts whose title targets the phrase. */
  competitors: number;
};

export type CandidateScore = CandidateSignals & {
  score: number;
  /** Demand estimate, 0-100. */
  demand: number;
  /** Difficulty estimate, 0-100: how crowded the phrase already is. */
  difficulty: number;
  intent: Strategy | "informational";
  onTopic: boolean;
  notes: string[];
};

/** How the phrase reads: buying, a question, or plain information. Quick wins need a Google position, so they are never guessed here. */
function intentOf(keyword: string): CandidateScore["intent"] {
  const types = classifyStrategies({ query: keyword, impressions: 0, position: 0 }).filter((key) => key !== "quick-win");
  return types[0] ?? "informational";
}

/** One candidate keyword scored on the free signals. Demand counts most; a crowded phrase counts against it. */
export function scoreCandidate(signals: CandidateSignals): CandidateScore {
  const words = signals.keyword.split(" ").length;
  const onTopic = groupForQuery(signals.keyword) !== null;
  const demand = Math.min(100, (signals.autocomplete ? 35 : 0) + Math.min(25, signals.suggestions * 5) + Math.min(40, Math.round(Math.log10(1 + signals.impressions) * 13)));
  const difficulty = Math.min(100, signals.competitors * 12);
  const intent = intentOf(signals.keyword);
  const score = Math.round((demand * (onTopic ? 1 : 0.3) - difficulty * 0.3 + (words >= 3 && words <= 5 ? 6 : 0) + (intent === "buyer-intent" ? 6 : intent === "question" ? 3 : 0)) * 10) / 10;

  const notes = [
    signals.autocomplete ? `Google autocomplete suggests it (${signals.suggestions} suggestion${signals.suggestions === 1 ? "" : "s"})` : "not suggested by Google autocomplete",
    signals.impressions ? `our site was shown ${signals.impressions.toLocaleString("en-US")} times for it` : "no Search Console impressions yet",
    `${signals.competitors} competitor post${signals.competitors === 1 ? "" : "s"} target${signals.competitors === 1 ? "s" : ""} it`,
    `intent: ${intent}`,
  ];
  return { ...signals, score, demand, difficulty, intent, onTopic, notes };
}

/** The keyword to write about: the best-scoring one about our services that shows real demand, or null. */
export function pickResearchKeyword(scored: CandidateScore[]): CandidateScore | null {
  return [...scored].filter((item) => item.onTopic && (item.autocomplete || item.impressions > 0)).sort((a, b) => b.score - a.score || b.keyword.split(" ").length - a.keyword.split(" ").length)[0] ?? null;
}

/** One line for the idea card: estimates, clearly labelled as such. */
export const candidateLine = (item: CandidateScore) => `"${item.keyword}": demand ~${item.demand}/100, difficulty ~${item.difficulty}/100, ${item.intent} (${item.notes.slice(0, 3).join("; ")})`;

export type TitleCheck = { title: string; ok: boolean; reason?: string; closest?: { title: string; url?: string; score: number } };

/**
 * Step 5: each candidate title against competitor posts and our own titles. A title too close to an
 * existing post is the same article again; it is kept only when nobody has written it yet.
 */
export function recheckTitles(titles: string[], keyword: string, competitorPosts: { title: string; url?: string }[], ours: string[], limit = 0.5): TitleCheck[] {
  return titles.map((raw) => {
    const title = raw.replace(/\s+/g, " ").trim();
    const closest = competitorPosts.map((post) => ({ ...post, score: titleSimilarity(title, post.title) })).sort((a, b) => b.score - a.score)[0];
    const own = ours.map((other) => ({ title: other, score: titleSimilarity(title, other) })).sort((a, b) => b.score - a.score)[0];
    const check: TitleCheck = { title, ok: true, closest: closest ? { title: closest.title, url: closest.url, score: Math.round(closest.score * 100) / 100 } : undefined };
    if (title.length < 12 || title.length > 120) return { ...check, ok: false, reason: "length" };
    if (!mentionsKeyword(title, keyword)) return { ...check, ok: false, reason: "keyword missing" };
    if (closest && closest.score >= limit) return { ...check, ok: false, reason: `a competitor already published "${closest.title}"` };
    if (own && own.score >= limit) return { ...check, ok: false, reason: `we already have "${own.title}"` };
    return check;
  });
}

/** The title to write: the passing one least like any competitor post. Alternates are the other passing titles. */
export function chooseTitle(checks: TitleCheck[]): { title: string; alternates: string[] } | null {
  const passing = checks.filter((check) => check.ok).sort((a, b) => (a.closest?.score ?? 0) - (b.closest?.score ?? 0));
  if (passing.length === 0) return null;
  return { title: passing[0].title, alternates: passing.slice(1).map((check) => check.title) };
}
