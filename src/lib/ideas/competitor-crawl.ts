import "server-only";
import { isOnTopic, isPostSitemap, parseRobotsSitemaps, parseSitemapEntries, parseSitemap, slugPhrase } from "@/lib/ai/idea-plan";
import { parseArticlePage, popularLinks, robotsAllows, robotsCrawlDelay } from "@/lib/ai/competitor-intel";
import { fetchFeed, fetchHtml } from "@/lib/ai/safe-fetch";
import type { NewCompetitorPage } from "@/lib/ideas/competitor-pages";

/**
 * The competitor bot: reads one competitor's blog politely.
 *
 *   1. robots.txt first: pages it disallows for us are never fetched, and a Crawl-delay is honoured.
 *   2. The public sitemaps list the blog posts (and when each changed); posts we have not read yet are
 *      picked newest first, a few per run, so a big blog is read over several weeks.
 *   3. Each post is fetched at most once a second (never more than one request at a time per site),
 *      under our own name (MimarStudiosBot, see safe-fetch.ts), and only its title, headings and date
 *      are kept (competitor-intel.ts parseArticlePage), never the article.
 *   4. The home page and blog front page are read once for the posts the site promotes as "popular".
 *
 * Everything goes through the SSRF-safe fetchers, and only pages on the competitor's own site are read.
 */

const MAX_CHILD_SITEMAPS = 6;
const DEFAULT_DELAY_MS = 1000;
const MAX_DELAY_MS = 5000;

export type CrawlOptions = {
  /** New posts to read per site this run. */
  perSite: number;
  /** Wait between requests to one site; 0 only in tests. */
  delayMs?: number;
  /** Date.now() after which no more pages are fetched. */
  deadline: number;
  /** Post URLs we already hold. */
  known: Set<string>;
  now?: Date;
};

export type CrawlResult = {
  domain: string;
  /** Blog posts found in the sitemaps. */
  discovered: number;
  /** Pages fetched and kept this run. */
  added: number;
  /** Pages that could not be read. */
  failed: number;
  /** Posts robots.txt keeps us from. */
  blocked: number;
  /** Post URLs this site features as popular. */
  featured: string[];
  pages: NewCompetitorPage[];
};

const pause = (ms: number) => (ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve());

const onSite = (url: string, domain: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "") === domain.replace(/^www\./, "");
  } catch {
    return false;
  }
};

type Candidate = { url: string; lastmod: string };

/** Blog posts listed in a site's sitemaps, one per subject (translated copies of a slug count once). */
async function discoverPosts(domain: string, robots: string | null): Promise<Candidate[]> {
  const roots = robots ? parseRobotsSitemaps(robots) : [];
  if (roots.length === 0) roots.push(`https://${domain}/sitemap.xml`, `https://${domain}/sitemap_index.xml`, `https://${domain}/wp-sitemap.xml`);

  // `posts`: the sitemap lists blog posts, whatever their URL looks like.
  const queue = [...new Set(roots)].slice(0, 3).map((url) => ({ url, posts: isPostSitemap(url) }));
  const found = new Map<string, Candidate>();
  let read = 0;
  while (queue.length && read <= MAX_CHILD_SITEMAPS) {
    const next = queue.shift()!;
    const xml = await fetchFeed(next.url);
    read++;
    if (!xml) continue;
    for (const { loc, lastmod } of parseSitemapEntries(xml)) {
      const phrase = slugPhrase(loc, next.posts);
      if (phrase && isOnTopic(phrase) && onSite(loc, domain) && !found.has(phrase)) found.set(phrase, { url: loc, lastmod });
    }
    queue.push(...parseSitemap(xml).sitemaps.map((url) => ({ url, posts: isPostSitemap(url) })));
    queue.sort((a, b) => Number(b.posts) - Number(a.posts));
  }
  return [...found.values()];
}

export async function crawlCompetitor(domain: string, options: CrawlOptions): Promise<CrawlResult> {
  const now = options.now ?? new Date();
  const robots = await fetchFeed(`https://${domain}/robots.txt`);
  const delay = options.delayMs ?? Math.min(MAX_DELAY_MS, Math.max(DEFAULT_DELAY_MS, robotsCrawlDelay(robots) * 1000));
  const result: CrawlResult = { domain, discovered: 0, added: 0, failed: 0, blocked: 0, featured: [], pages: [] };
  const featured = new Set<string>();
  const allowed = (url: string) => robotsAllows(robots, new URL(url).pathname + new URL(url).search);

  const posts = await discoverPosts(domain, robots);
  result.discovered = posts.length;
  const fresh = posts.filter((post) => !options.known.has(post.url)).sort((a, b) => b.lastmod.localeCompare(a.lastmod));
  result.blocked = fresh.filter((post) => !allowed(post.url)).length;
  const queue = fresh.filter((post) => allowed(post.url)).slice(0, options.perSite);

  // The home page and the blog front page: which posts does the site itself promote?
  const fronts = [`https://${domain}/`, `https://${domain}/blog/`].filter(allowed);
  let first = true;
  const get = async (url: string) => {
    if (!first) await pause(delay);
    first = false;
    return fetchHtml(url);
  };

  for (const front of fronts) {
    if (Date.now() > options.deadline) break;
    const page = await get(front);
    if (page && onSite(page.url, domain)) for (const link of popularLinks(page.html, page.url, domain)) featured.add(link);
  }

  for (const post of queue) {
    if (Date.now() > options.deadline) break;
    const page = await get(post.url);
    const parsed = page && onSite(page.url, domain) ? parseArticlePage(page.html, domain) : null;
    const base = { domain, url: post.url, headings: [] as string[], lastmod: post.lastmod || undefined, firstSeenAt: now.toISOString(), fetchedAt: now.toISOString() };
    // We write in English (Arabic is made from it): translated copies of a competitor's posts are noise.
    if (!page || !parsed || !(parsed.title || parsed.h1) || (parsed.lang && parsed.lang !== "en")) {
      result.failed++;
      result.pages.push({ ...base, title: "", failed: true });
      continue;
    }
    for (const link of popularLinks(page.html, page.url, domain)) featured.add(link);
    result.added++;
    result.pages.push({
      ...base,
      title: parsed.title || parsed.h1,
      h1: parsed.h1 && parsed.h1 !== parsed.title ? parsed.h1 : undefined,
      description: parsed.description || undefined,
      headings: parsed.headings,
      publishedAt: parsed.publishedAt || undefined,
    });
  }
  // Only blog posts count as featured: a "popular" menu of service pages says nothing about topics.
  const key = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const postKeys = new Set(posts.map((post) => key(post.url)));
  result.featured = [...featured].filter((url) => postKeys.has(key(url)));
  return result;
}
