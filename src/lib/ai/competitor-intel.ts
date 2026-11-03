import { decodeEntities } from "@/lib/ai/html-entities";
import { titleSimilarity } from "@/lib/ai/similarity";

/**
 * What the competitor bot (src/lib/ideas/competitor-crawl.ts) learns from a competitor's blog, and how it
 * decides a subject is established enough to write about. Pure (no server imports) so it can be unit-tested.
 *
 * The bot keeps only what a search engine already shows about a page: its title, main heading, section
 * headings, description and date. Never the article text.
 *
 * "Famous" cannot be measured exactly without paid data (competitors' analytics are private and Google
 * cannot be scraped), so it is scored from signals anyone can observe:
 *   - how many competitors cover the subject          (more studios writing about it = proven demand)
 *   - whether a competitor features it as "popular"   (what the site itself thinks works)
 *   - whether it was published recently               (still being written about)
 *   - whether Google autocomplete suggests it         (people really type it)
 *   - whether our own Search Console already shows it (we are already being seen for it)
 * A paid source (search volume, estimated traffic per page) can later add a signal to the same score.
 */

// ---- Reading a page ----------------------------------------------------------

export type ParsedPage = {
  title: string;
  h1: string;
  description: string;
  headings: string[];
  /** ISO date, or "" when the page does not say. */
  publishedAt: string;
  /** Two-letter language of the page ("en", "fr"), or "" when it does not say. */
  lang: string;
};

/** Page furniture that sits inside the article area and is not one of the article's own sections. */
const GENERIC_HEADING = /^(you might also like|related (posts?|articles?|reading)|our services|share( this)?|leave a (comment|reply)|contact( us)?|newsletter|subscribe|recent posts|about (us|the author)|table of contents|follow us|get a (free )?quote|let'?s talk|frequently asked questions)\b/i;

const clean = (raw: string) => decodeEntities(raw.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** The content of a <meta> tag by its name or property ("og:title", "description"). */
function metaContent(html: string, key: string): string {
  for (const tagText of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = new Map<string, string>();
    for (const match of tagText.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs.set(match[1].toLowerCase(), match[2] ?? match[3] ?? "");
    if ((attrs.get("property") ?? attrs.get("name"))?.toLowerCase() === key) return decodeEntities(attrs.get("content") ?? "").replace(/\s+/g, " ").trim();
  }
  return "";
}

const brandCore = (domain: string) => domain.replace(/^www\./, "").split(".")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();

/**
 * A page title without the site name: "How much does rendering cost | Studio" -> "How much does rendering cost".
 * A "|" suffix is always the brand; a " - " / " – " / " — " suffix only when it names the site.
 */
export function cleanTitle(title: string, domain: string): string {
  const parts = title.replace(/\s+/g, " ").trim().split(/\s+[|·•]\s+/);
  let text = parts.length > 1 ? parts.slice(0, -1).join(" | ") : parts[0];
  const dashed = text.split(/\s+[-–—]\s+/);
  if (dashed.length > 1) {
    const last = dashed[dashed.length - 1].replace(/[^a-z0-9]/gi, "").toLowerCase();
    const brand = brandCore(domain);
    if (brand.length >= 4 && last.length >= 3 && (brand.includes(last) || last.includes(brand))) text = dashed.slice(0, -1).join(" - ");
  }
  return text.trim().slice(0, 200);
}

function publishedDate(html: string): string {
  const candidates = [
    metaContent(html, "article:published_time"),
    metaContent(html, "og:article:published_time"),
    /"datePublished"\s*:\s*"([^"]+)"/.exec(html)?.[1] ?? "",
    /<time\b[^>]*\bdatetime\s*=\s*"([^"]+)"/i.exec(html)?.[1] ?? "",
  ];
  for (const candidate of candidates) {
    const parsed = Date.parse(candidate);
    if (candidate && !Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return "";
}

/** Title, main heading, description, section headings and date of a blog post's HTML. Text of the article is never kept. */
export function parseArticlePage(html: string, domain: string): ParsedPage {
  const rawTitle = metaContent(html, "og:title") || clean(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
  const stripped = html.replace(/<(script|style|noscript|svg|nav|footer|header|form|aside)[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const body = /<(article|main)[\s>][\s\S]*?<\/\1>/i.exec(stripped)?.[0] ?? stripped;
  const headings = [...new Set([...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => clean(match[1]).slice(0, 120)).filter((text) => text.length >= 4 && !GENERIC_HEADING.test(text)))].slice(0, 10);
  return {
    title: cleanTitle(rawTitle, domain),
    h1: clean(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(stripped)?.[1] ?? "").slice(0, 200),
    description: (metaContent(html, "description") || metaContent(html, "og:description")).slice(0, 200),
    headings,
    publishedAt: publishedDate(html),
    lang: (/<html\b[^>]*\blang\s*=\s*["']?([a-zA-Z]{2})/i.exec(html)?.[1] ?? metaContent(html, "og:locale").slice(0, 2)).toLowerCase(),
  };
}

const FEATURED_HEADING = /(popular|trending|most (?:read|viewed|popular)|top (?:posts?|stories|reads)|featured (?:posts?|articles?|stories)|recommended (?:reads|posts?))/i;

const WIDGET_END = /<h[1-6][\s>]|<\/(?:aside|section|footer|nav)>/i;

/**
 * Links a site itself promotes as popular: the links in the stretch of HTML right after a "Popular posts",
 * "Trending" or "Most read" label, up to the next heading. Best effort (every theme differs); same-site https links only.
 */
export function popularLinks(html: string, pageUrl: string, domain: string): string[] {
  const found = new Set<string>();
  const core = domain.replace(/^www\./, "");
  for (const label of html.matchAll(new RegExp(`>\\s*([^<>]{0,40}${FEATURED_HEADING.source}[^<>]{0,30})\\s*<`, "gi"))) {
    const start = (label.index ?? 0) + label[0].length;
    const rest = html.slice(start, start + 3500);
    // The widget ends where the next heading or the end of the sidebar / section starts.
    const end = rest.search(WIDGET_END);
    const after = end >= 0 ? rest.slice(0, end) : rest;
    for (const link of after.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"#]+)"/gi)) {
      try {
        const url = new URL(decodeEntities(link[1]), pageUrl);
        const host = url.hostname.replace(/^www\./, "");
        if (url.protocol === "https:" && host === core && url.pathname.replace(/\/$/, "").split("/").filter(Boolean).length >= 1) {
          url.hash = "";
          found.add(url.toString());
        }
      } catch {
        // not a usable link
      }
    }
  }
  return [...found].slice(0, 15);
}

// ---- robots.txt ----------------------------------------------------------------

type RobotsGroup = { agents: string[]; rules: { allow: boolean; pattern: string }[]; delay?: number };

function robotsGroups(robots: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  let lastWasAgent = false;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const match = /^([a-z-]+)\s*:\s*(.*)$/i.exec(line);
    if (!match) continue;
    const field = match[1].toLowerCase();
    const value = match[2].trim();
    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === "allow" || field === "disallow") {
      if (value) current.rules.push({ allow: field === "allow", pattern: value });
    } else if (field === "crawl-delay" && Number.isFinite(Number(value))) current.delay = Number(value);
  }
  return groups;
}

/** The group that names our bot, else the "*" group. */
function robotsFor(robots: string, agent: string): RobotsGroup | undefined {
  const groups = robotsGroups(robots);
  const token = agent.toLowerCase();
  return groups.find((group) => group.agents.some((name) => name !== "*" && token.includes(name))) ?? groups.find((group) => group.agents.includes("*"));
}

function patternMatches(pattern: string, path: string): boolean {
  const regex = new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")}`);
  return regex.test(path);
}

/** Whether robots.txt lets `agent` fetch `path`: the longest matching rule wins, Allow beats Disallow on a tie. */
export function robotsAllows(robots: string | null, path: string, agent = "MimarStudiosBot"): boolean {
  if (!robots) return true;
  const group = robotsFor(robots, agent);
  if (!group) return true;
  let best: { allow: boolean; length: number } | null = null;
  for (const rule of group.rules) {
    if (!patternMatches(rule.pattern, path)) continue;
    const length = rule.pattern.length;
    if (!best || length > best.length || (length === best.length && rule.allow)) best = { allow: rule.allow, length };
  }
  return best ? best.allow : true;
}

/** Seconds the site asks us to wait between requests (0 when it does not say). */
export function robotsCrawlDelay(robots: string | null, agent = "MimarStudiosBot"): number {
  return (robots && robotsFor(robots, agent)?.delay) || 0;
}

// ---- Is a subject established? ---------------------------------------------------

export type DemandSignals = { autocomplete: boolean; impressions: number };

/**
 * What we already know about demand for a keyword: whether Google autocomplete suggested it
 * (`autocomplete` = keywords of stored autocomplete ideas) and how often our own site was shown
 * for similar searches (`rows` = Search Console queries with their impressions).
 */
export function demandSignals(keyword: string, autocomplete: string[], rows: { query: string; impressions: number }[]): DemandSignals {
  const own = keyword.toLowerCase();
  return {
    autocomplete: autocomplete.some((other) => titleSimilarity(other, own) >= 0.5 || other.toLowerCase().includes(own) || own.includes(other.toLowerCase())),
    impressions: rows.filter((row) => titleSimilarity(row.query, own) >= 0.5).reduce((sum, row) => sum + row.impressions, 0),
  };
}

export type FameSignals = {
  /** Distinct competitor sites that cover the subject. */
  competitors: number;
  /** Of those pages, how many a competitor features as popular. */
  featured: number;
  /** Pages published in the last year. */
  recent: number;
  autocomplete: boolean;
  /** Impressions our own site got for similar searches. */
  impressions: number;
};

/** 0-100 and one plain line per signal that counted. */
export function fameScore(signals: FameSignals): { fame: number; notes: string[] } {
  const notes: string[] = [];
  let fame = Math.min(signals.competitors, 5) * 8;
  if (signals.competitors > 0) notes.push(`${signals.competitors} competitor${signals.competitors === 1 ? "" : "s"} cover${signals.competitors === 1 ? "s" : ""} it`);
  if (signals.featured > 0) {
    fame += Math.min(signals.featured, 2) * 10;
    notes.push(`${signals.featured} featured as popular on the competitor's own site`);
  }
  if (signals.recent > 0) {
    fame += 10;
    notes.push("written about in the last year");
  }
  if (signals.autocomplete) {
    fame += 15;
    notes.push("Google autocomplete suggests it");
  }
  if (signals.impressions > 0) {
    fame += Math.min(15, Math.round(Math.log10(1 + signals.impressions) * 6));
    notes.push(`our site was shown ${signals.impressions.toLocaleString("en-US")} times for similar searches`);
  }
  return { fame: Math.min(100, fame), notes };
}

/** A subject worth writing about: more than one studio covers it, or a second signal backs one studio's article. */
export function isEstablished(signals: FameSignals): boolean {
  return signals.competitors >= 2 || (signals.competitors >= 1 && (signals.featured > 0 || signals.autocomplete || signals.impressions > 0));
}
