import "server-only";
import { demandSignals, fameScore, isEstablished, type FameSignals } from "@/lib/ai/competitor-intel";
import { isDuplicateIdea, isOnTopic, sampleEvenly } from "@/lib/ai/idea-plan";
import type { KeywordRow } from "@/lib/ai/keyword-plan";
import { aiIdeas, inBatches, off, toIdea, type Collector } from "@/lib/ideas/ai";
import { crawlCompetitor, type CrawlResult } from "@/lib/ideas/competitor-crawl";
import { getFeatured, listCompetitorPages, pruneCompetitorPages, saveCompetitorPages, setFeatured, type CompetitorPage } from "@/lib/ideas/competitor-pages";
import { getCompetitors, listIdeas } from "@/lib/ideas/store";
import { getKeywordRows } from "@/lib/search-console";

/**
 * Competitors approach: the subjects competitors write about that are established enough to be worth our
 * own, better article. The competitor bot (competitor-crawl.ts) reads each listed competitor's blog
 * politely and keeps titles and headings; the AI groups the titles into subjects; each subject is
 * then scored for how established it is (competitor-intel.ts: how many studios cover it, which a site
 * features as popular, how recent, whether Google suggests it, whether our own Search Console shows
 * it) and only established ones become ideas, with the evidence attached. Only the subject is taken:
 * a competitor's page is never used as a source, so nothing of theirs is copied, and the originality
 * check still runs on every draft.
 *
 * With 20+ sites the AI would be buried in titles, so each site contributes its featured and newest
 * posts, anything we already cover is dropped, and the rest is dealt out one site at a time up to MAX_ITEMS.
 */

const MAX_PHRASES_PER_SITE = 40;
const MAX_ITEMS = 300;
const DAY_MS = 86_400_000;
/** The crawl may use this much of the run (the route allows 300 seconds, shared with the other sources). */
const CRAWL_BUDGET_MS = 110_000;

const crawlEnabled = () => !["false", "0", "off", "no"].includes((process.env.COMPETITOR_CRAWL ?? "").trim().toLowerCase());
const pagesPerSite = () => Math.min(40, Math.max(1, Number(process.env.COMPETITOR_PAGES_PER_SITE) || 20));

type Item = { title: string; url: string; domain: string; featured: boolean; recent: boolean; headings: string[] };

const published = (page: CompetitorPage) => page.publishedAt || page.lastmod || "";

/** One site's readable posts: featured first, then newest, on topic, and not something we already cover. */
function siteItems(pages: CompetitorPage[], featured: Set<string>, covered: string[], now: number): Item[] {
  const usable = pages
    .filter((page) => !page.failed && page.title && isOnTopic(`${page.title} ${page.url}`))
    .map((page) => ({ page, featured: featured.has(page.url) }))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || published(b.page).localeCompare(published(a.page)));
  // The site's own popular posts always make it in; the rest is sampled across the newest-first list.
  const popular = usable.filter((entry) => entry.featured).slice(0, 10);
  return [...popular, ...sampleEvenly(usable.filter((entry) => !entry.featured), MAX_PHRASES_PER_SITE - popular.length)]
    .filter(({ page }) => !isDuplicateIdea(page.title, covered))
    .map(({ page, featured: isFeatured }) => ({
      title: page.title,
      url: page.url,
      domain: page.domain,
      featured: isFeatured,
      recent: Boolean(published(page)) && now - Date.parse(published(page)) <= 365 * DAY_MS,
      headings: page.headings.slice(0, 2),
    }));
}

export const competitorsCollector: Collector = {
  key: "competitor",
  label: "Competitor topics",
  approach: "competitors",
  async collect(ctx) {
    const domains = await getCompetitors();
    if (domains.length === 0) return off("No competitor sites listed yet. Add them on this page.");
    if (!ctx.provider) return off("No AI provider is configured.");
    const now = ctx.now.getTime();

    // 1. Read the blogs: new posts only, newest first, politely.
    let crawls: CrawlResult[] = [];
    if (crawlEnabled()) {
      const known = new Set((await listCompetitorPages()).map((page) => page.url));
      const deadline = Date.now() + CRAWL_BUDGET_MS;
      crawls = await inBatches(domains, 21, (domain) => crawlCompetitor(domain, { perSite: pagesPerSite(), known, deadline, now: ctx.now }).catch((): CrawlResult => ({ domain, discovered: 0, added: 0, failed: 0, blocked: 0, featured: [], pages: [] })));
      await saveCompetitorPages(crawls.flatMap((crawl) => crawl.pages));
      if (crawls.some((crawl) => crawl.featured.length)) await setFeatured({ ...(await getFeatured(domains)), ...Object.fromEntries(crawls.filter((crawl) => crawl.featured.length).map((crawl) => [crawl.domain, crawl.featured])) });
    }
    await pruneCompetitorPages(domains, ctx.now).catch((err) => console.error("[ideas] could not prune competitor pages:", err instanceof Error ? err.message : err));

    // 2. Everything read so far, per site.
    const [stored, featuredByDomain] = await Promise.all([listCompetitorPages(), getFeatured(domains)]);
    const bySite = new Map(domains.map((domain) => [domain, [] as CompetitorPage[]]));
    for (const page of stored) bySite.get(page.domain)?.push(page);
    const sampled = domains.map((domain) => ({ domain, items: siteItems(bySite.get(domain) ?? [], new Set(featuredByDomain[domain] ?? []), ctx.covered, now) }));

    const readable = domains.filter((domain) => (bySite.get(domain) ?? []).some((page) => !page.failed && page.title));
    const unread = domains.filter((domain) => !readable.includes(domain));
    const total = stored.filter((page) => !page.failed && page.title).length;
    const added = crawls.reduce((sum, crawl) => sum + crawl.added, 0);
    const blocked = crawls.reduce((sum, crawl) => sum + crawl.blocked, 0);
    const crawlNote = crawlEnabled() ? `${added} new posts read${blocked ? `, ${blocked} skipped because robots.txt asks bots not to fetch them` : ""}` : "crawling switched off, using what was read before";
    if (total === 0) return { state: "error", ideas: [], message: `No blog posts could be read from ${domains.join(", ")}. ${crawlNote}.` };

    // 3. Deal the titles out one site at a time.
    const items: Item[] = [];
    for (let round = 0; items.length < MAX_ITEMS; round++) {
      let dealt = false;
      for (const site of sampled) {
        const item = site.items[round];
        if (!item || items.length >= MAX_ITEMS) continue;
        items.push(item);
        dealt = true;
      }
      if (!dealt) break;
    }
    if (items.length === 0) return { state: "ok", ideas: [], message: `${total} competitor posts known; we already cover all the sampled subjects. ${crawlNote}.` };

    // 4. The AI groups them into subjects; each subject is scored.
    const suggestions = await aiIdeas(ctx, {
      instruction:
        "Each item is a blog post a competitor has published (its title, the site, and its first section headings). Group posts that are about the same subject and turn each group into one subject our own blog could cover better. Prefer subjects that several different sites cover, and skip ones about a competitor's own projects or services. Skip subjects our blog already covers.",
      items: items.map((item) => `${item.title} (${item.domain})${item.headings.length ? ` — covers: ${item.headings.map((heading) => heading.slice(0, 60)).join("; ")}` : ""}`),
      max: 12,
    });

    const [ideasStored, rows] = await Promise.all([
      listIdeas().catch(() => []),
      getKeywordRows().catch((): KeywordRow[] => []),
    ]);
    const autocomplete = ideasStored.filter((idea) => idea.source === "autocomplete").map((idea) => idea.keyword ?? idea.title);

    let skipped = 0;
    const ideas = suggestions.flatMap((suggestion) => {
      const backing = suggestion.sources.map((index) => items[index]).filter(Boolean);
      const sites = [...new Set(backing.map((item) => item.domain))];
      const demand = demandSignals(suggestion.keyword, autocomplete, rows);
      const signals: FameSignals = { competitors: sites.length, featured: backing.filter((item) => item.featured).length, recent: backing.filter((item) => item.recent).length, ...demand };
      if (!isEstablished(signals)) {
        skipped++;
        return [];
      }
      const { fame, notes } = fameScore(signals);
      const lead = [...backing].sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.recent) - Number(a.recent))[0];
      return [
        toIdea(suggestion, "competitors", "competitor", {
          url: lead?.url,
          count: sites.length,
          fame,
          signals: notes,
          note: `Covered by ${sites.join(", ")}`.slice(0, 200),
        }),
      ];
    });
    return {
      state: "ok",
      ideas,
      message: `${total} posts from ${readable.length} of ${domains.length} sites known (${crawlNote}); ${items.length} sampled, ${ideas.length} established subjects kept${skipped ? `, ${skipped} dropped as covered by one site only` : ""}${unread.length ? `; no readable blog for ${unread.join(", ")}` : ""}.`,
    };
  },
};
