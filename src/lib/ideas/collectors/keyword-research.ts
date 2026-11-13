import "server-only";
import { REGION_TO_GL, isDuplicateIdea, isOnTopic, sampleEvenly, type NewIdea } from "@/lib/ai/idea-plan";
import { candidateLine, chooseTitle, keywordCandidates, pickResearchKeyword, recheckTitles, scoreCandidate, type CandidateScore } from "@/lib/ai/keyword-research";
import type { KeywordRow } from "@/lib/ai/keyword-plan";
import { mentionsKeyword } from "@/lib/ai/seo-checks";
import { titleSimilarity } from "@/lib/ai/similarity";
import { aiIdeas, inBatches, off, toIdea, type Collector } from "@/lib/ideas/ai";
import { suggestions } from "@/lib/ideas/collectors/autocomplete";
import { listCompetitorPages, type CompetitorPage } from "@/lib/ideas/competitor-pages";
import { getKeywordRows } from "@/lib/search-console";

/**
 * Keyword research approach (src/lib/ai/keyword-research.ts explains the method). It reads the
 * competitor posts the competitor bot already stored (nothing is crawled twice), and:
 *
 *   1. the AI picks the competitor titles most worth an article of our own
 *   2. each title is split into the keywords inside it
 *   3. each keyword is scored: Google autocomplete (live), our Search Console impressions, and how
 *      many competitor posts already target it - estimates, since no paid keyword tool is used
 *   4. the best keyword with real demand wins; the AI writes 3-5 titles for it
 *   5. the titles are rechecked against every stored competitor post and our own articles, and the
 *      one least like anything published becomes the idea, with the others kept as alternates
 *
 * Small on purpose: a few topics a week, a handful of autocomplete requests each.
 */

const TOPICS_PER_RUN = 6;
const CANDIDATES_LOOKED_UP = 4;
const MAX_ITEMS = 80;

const enabled = () => !["false", "0", "off", "no"].includes((process.env.BLOG_KEYWORD_RESEARCH ?? "").trim().toLowerCase());

/** Autocomplete for a phrase: whether Google suggests it, and how many suggestions contain it. */
async function autocompleteFor(keyword: string, gl: string): Promise<{ autocomplete: boolean; suggestions: number } | null> {
  try {
    const found = (await suggestions(keyword, gl)).map((item) => item.toLowerCase());
    const containing = found.filter((item) => mentionsKeyword(item, keyword)).length;
    return { autocomplete: containing > 0, suggestions: containing };
  } catch {
    return null;
  }
}

/** Impressions for the phrase and close variants in our own Search Console data. */
const impressionsFor = (keyword: string, rows: KeywordRow[]) =>
  rows.filter((row) => row.query.includes(keyword) || titleSimilarity(row.query, keyword) >= 0.6).reduce((sum, row) => sum + row.impressions, 0);

export const keywordResearchCollector: Collector = {
  key: "keyword-research",
  label: "Keyword research",
  approach: "keywords",
  async collect(ctx) {
    if (!enabled()) return off("Switched off with BLOG_KEYWORD_RESEARCH.");
    if (!ctx.provider) return off("No AI provider is configured.");

    const pages = (await listCompetitorPages()).filter((page) => !page.failed && page.title);
    if (pages.length === 0) return off("No competitor posts have been read yet. The competitor bot fills them in on its first run.");

    // 1. A spread of on-topic competitor titles we do not cover yet, newest first per site.
    const bySite = new Map<string, CompetitorPage[]>();
    for (const page of pages) if (isOnTopic(`${page.title} ${page.url}`) && !isDuplicateIdea(page.title, ctx.covered)) bySite.set(page.domain, [...(bySite.get(page.domain) ?? []), page]);
    const sampled = [...bySite.values()].flatMap((list) => sampleEvenly(list.sort((a, b) => (b.publishedAt ?? b.lastmod ?? "").localeCompare(a.publishedAt ?? a.lastmod ?? "")), 6)).slice(0, MAX_ITEMS);
    if (sampled.length === 0) return { state: "ok", ideas: [], message: `${pages.length} competitor posts known; we already cover every on-topic one.` };

    const picks = await aiIdeas(ctx, {
      instruction:
        "Each item is the title of a blog post a competitor published. Choose the ones most worth a better article of our own, for a buyer, developer or architect in our markets. For each, set title to the competitor's title as given, keyword to the most searchable 2-6 word phrase inside it, and sources to that one item's number. Skip titles about a competitor's own projects or company.",
      items: sampled.map((page) => `${page.title} (${page.domain})`),
      max: TOPICS_PER_RUN,
    });

    const rows = await getKeywordRows().catch((): KeywordRow[] => []);
    const allPosts = pages.map((page) => ({ title: page.title, url: page.url }));
    const competitorTitles = pages.flatMap((page) => [page.title, page.h1 ?? ""]).filter(Boolean);
    let lookupsFailed = 0;
    let noDemand = 0;

    // 2-4. Keywords for each chosen title, scored; the best one with real demand.
    type Planned = { page: CompetitorPage; region: string; best: CandidateScore; ranked: CandidateScore[] };
    const planned = (
      await inBatches(picks, 2, async (pick): Promise<Planned | null> => {
        const page = sampled[pick.sources[0] ?? -1];
        if (!page) return null;
        const region = pick.region || "";
        const gl = REGION_TO_GL[region] ?? "us";
        const phrases = [...new Set([pick.keyword.toLowerCase().trim(), ...keywordCandidates(page.title)])].filter((phrase) => phrase.split(" ").length >= 2 && phrase.split(" ").length <= 6);
        const offline = phrases.map((keyword) => scoreCandidate({ keyword, autocomplete: false, suggestions: 0, impressions: impressionsFor(keyword, rows), competitors: competitorTitles.filter((title) => mentionsKeyword(title, keyword)).length }));
        // Only the most promising few are looked up live, so Google is asked a handful of times per topic.
        const lookup = [...offline].sort((a, b) => Number(b.onTopic) - Number(a.onTopic) || b.score - a.score).slice(0, CANDIDATES_LOOKED_UP);
        const live = await inBatches(lookup, 2, async (item) => {
          const found = await autocompleteFor(item.keyword, gl);
          if (!found) lookupsFailed++;
          return scoreCandidate({ ...item, ...(found ?? { autocomplete: false, suggestions: 0 }) });
        });
        const ranked = [...live, ...offline.filter((item) => !lookup.includes(item))].sort((a, b) => b.score - a.score);
        const best = pickResearchKeyword(live);
        if (!best) {
          noDemand++;
          return null;
        }
        return { page, region, best, ranked };
      })
    ).filter((item): item is Planned => item !== null);
    if (planned.length === 0) return { state: "ok", ideas: [], message: `${picks.length} competitor titles chosen; none had a keyword with real demand (autocomplete or Search Console)${lookupsFailed ? `; ${lookupsFailed} autocomplete lookups failed` : ""}.` };

    // 4. 3-5 titles per keyword, in one AI call.
    const titles = await aiIdeas(ctx, {
      instruction:
        'Each item is a primary keyword for one of our articles, with the angle a competitor took. For EACH item write 3 to 5 different blog titles: each contains the keyword word for word, is 40-90 characters, promises something specific, takes a clearly different angle from the competitor\'s title, and makes no claim we cannot back (no "best", no guarantees, no numbers we do not have). Return every title as its own idea with keyword set to the item\'s keyword exactly and sources set to that item\'s number.',
      items: planned.map(({ best, page, region }) => `keyword: "${best.keyword}"${region ? ` (market: ${region})` : ""} - competitor's angle: ${page.title}`),
      max: planned.length * 5,
    });

    // 5. Recheck against competitors and ourselves; keep the freshest title.
    let rejected = 0;
    const ideas: NewIdea[] = planned.flatMap(({ page, region, best, ranked }, index) => {
      const own = titles.filter((title) => title.sources.includes(index)).map((title) => title.title);
      const checks = recheckTitles(own, best.keyword, allPosts, ctx.covered);
      const chosen = chooseTitle(checks);
      if (!chosen) {
        rejected++;
        return [];
      }
      const closest = checks.find((check) => check.title === chosen.title)?.closest;
      return [
        toIdea({ title: chosen.title, keyword: best.keyword, region }, "keywords", "keyword-research", {
          url: page.url,
          count: best.competitors,
          // Higher demand ranks the idea higher when the scheduler picks one (idea-plan.ts ideaStrength).
          fame: best.demand,
          note: `From the competitor title "${page.title}" (${page.domain})`.slice(0, 200),
          signals: [
            closest ? `closest competitor post "${closest.title}" (similarity ${closest.score})` : "no similar competitor post",
            ...checks.filter((check) => !check.ok && check.reason).slice(0, 3).map((check) => `dropped "${check.title}": ${check.reason}`),
          ],
          candidates: ranked.slice(0, 5).map(candidateLine),
          alternates: chosen.alternates.slice(0, 4),
        }),
      ];
    });

    return {
      state: "ok",
      ideas,
      message: `${sampled.length} competitor titles sampled, ${picks.length} chosen, ${planned.length} with a keyword that has real demand, ${ideas.length} with a title no one has published${noDemand ? `; ${noDemand} dropped for no demand` : ""}${rejected ? `; ${rejected} dropped because every title was already taken` : ""}${lookupsFailed ? `; ${lookupsFailed} autocomplete lookups failed` : ""}.`,
    };
  },
};
