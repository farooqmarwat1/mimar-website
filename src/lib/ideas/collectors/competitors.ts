import "server-only";
import { isOnTopic, parseRobotsSitemaps, parseSitemap, slugPhrase } from "@/lib/ai/idea-plan";
import { fetchFeed } from "@/lib/ai/safe-fetch";
import { aiIdeas, off, toIdea, type Collector } from "@/lib/ideas/ai";
import { getCompetitors } from "@/lib/ideas/store";

/**
 * Search approach: topics competitors have written about and we have not. Reads each competitor's
 * public sitemap (the list editors keep on /admin/blog/ideas), turns article URLs into the phrases
 * their slugs spell, and asks the AI which of those subjects we are missing. Only the subject is
 * taken: the competitor's page is never used as a source, so nothing of theirs is copied.
 */

const MAX_CHILD_SITEMAPS = 6;
const MAX_PHRASES_PER_SITE = 120;

/** Article phrases from one site, with the URL each came from. */
async function sitePhrases(domain: string): Promise<{ phrase: string; url: string }[]> {
  const robots = await fetchFeed(`https://${domain}/robots.txt`);
  const roots = robots ? parseRobotsSitemaps(robots) : [];
  if (roots.length === 0) roots.push(`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`);

  const urls: string[] = [];
  const queue = [...new Set(roots)].slice(0, 3);
  let children = 0;
  while (queue.length && children <= MAX_CHILD_SITEMAPS) {
    const xml = await fetchFeed(queue.shift()!);
    children++;
    if (!xml) continue;
    const { urls: pages, sitemaps } = parseSitemap(xml);
    urls.push(...pages);
    // Post and article sitemaps first: those hold the blog.
    queue.push(...sitemaps.sort((a, b) => Number(/post|blog|article|news|insight/i.test(b)) - Number(/post|blog|article|news|insight/i.test(a))));
  }

  const found = new Map<string, string>();
  for (const url of urls) {
    const phrase = slugPhrase(url);
    if (phrase && isOnTopic(phrase) && !found.has(phrase)) found.set(phrase, url);
  }
  return [...found.entries()].slice(0, MAX_PHRASES_PER_SITE).map(([phrase, url]) => ({ phrase, url }));
}

export const competitorsCollector: Collector = {
  key: "competitor",
  label: "Competitor gap",
  approach: "search",
  async collect(ctx) {
    const domains = await getCompetitors();
    if (domains.length === 0) return off("No competitor sites listed yet. Add them on this page.");
    if (!ctx.provider) return off("No AI provider is configured.");

    const perSite = await Promise.all(domains.map(async (domain) => ({ domain, phrases: await sitePhrases(domain).catch(() => []) })));
    const items = perSite.flatMap(({ domain, phrases }) => phrases.map((entry) => ({ ...entry, domain })));
    const unread = perSite.filter((site) => site.phrases.length === 0).map((site) => site.domain);
    if (items.length === 0) return { state: "error", ideas: [], message: `No articles found in the sitemaps of ${domains.join(", ")}.` };

    const suggestions = await aiIdeas(ctx, {
      instruction:
        "Each item is the subject of an article a competitor has published (from its web address). Find the subjects our blog does not cover yet that are worth our own, better article. Prefer subjects more than one competitor covers.",
      items: items.map((item) => `${item.phrase} (${item.domain})`),
      max: 10,
    });
    const ideas = suggestions.map((suggestion) => {
      const backing = suggestion.sources.map((index) => items[index]);
      const sites = [...new Set(backing.map((item) => item.domain))];
      return toIdea(suggestion, "search", "competitor", {
        url: backing[0]?.url,
        count: backing.length || 1,
        note: sites.length ? `Covered by ${sites.join(", ")}` : suggestion.note,
      });
    });
    return { state: "ok", ideas, message: `${items.length} competitor articles read${unread.length ? `; no sitemap found for ${unread.join(", ")}` : ""}.` };
  },
};
