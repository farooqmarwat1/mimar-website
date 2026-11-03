import { decodeEntities } from "@/lib/ai/html-entities";
import { classifyStrategies, groupForQuery, isBranded, type Strategy } from "@/lib/ai/keyword-plan";
import { titleSimilarity } from "@/lib/ai/similarity";

/**
 * Where blog topics come from. Pure (no server imports) so it can be unit-tested; the
 * collectors in src/lib/ideas/collectors fetch the raw material and ideas.ts stores it.
 *
 * Five approaches feed the same drafting, approval and tracking pipeline:
 *
 *   search     - what people search on Google: Search Console (keyword-plan.ts), plus
 *                Google autocomplete questions and gaps against competitors' articles
 *   community  - questions people ask on Reddit
 *   social     - design themes trending on Instagram (and trends staff add by hand)
 *   customers  - questions buyers send us through the enquiry form, anonymised
 *   news       - industry and Gulf property news worth explaining to our clients
 *
 * The scheduler takes the approaches in proportion to BLOG_APPROACH_MIX (search-heavy by
 * default), and /admin/blog/performance compares them like it compares blog types.
 */

export const APPROACH_KEYS = ["search", "community", "social", "customers", "news"] as const;
export type Approach = (typeof APPROACH_KEYS)[number];

export type ApproachInfo = {
  key: Approach;
  label: string;
  description: string;
  /** Extra rule for the topic planner. */
  planner: string;
};

export const APPROACHES: ApproachInfo[] = [
  {
    key: "search",
    label: "Search demand",
    description: "Real Google searches: Search Console, Google autocomplete questions and topics competitors cover that we do not.",
    planner: "The idea is a real Google search. Keep the searcher's exact wording as the keyword.",
  },
  {
    key: "community",
    label: "Community questions",
    description: "Questions people ask on Reddit about architecture, design, rendering and property.",
    planner: "The idea is a question real people asked online. Answer that question for a buyer, developer or architect in our market; do not mention Reddit or the people who asked.",
  },
  {
    key: "social",
    label: "Social trends",
    description: "Design themes getting attention on Instagram, plus trends staff spot on TikTok or Pinterest.",
    planner: "The idea is a design trend getting attention on social media. Explain it for our market: what it is, where it works, what it means for a project. Do not mention individual posts or accounts.",
  },
  {
    key: "customers",
    label: "Customer questions",
    description: "Questions buyers keep asking in our own enquiries, anonymised.",
    planner: "The idea is a question several of our own prospective clients asked. Answer it generally and helpfully. Never refer to any client, enquiry or project.",
  },
  {
    key: "news",
    label: "Industry news",
    description: "Architecture, real estate and Gulf development news worth explaining to developers and buyers.",
    planner: "The idea comes from recent industry news. Write the explainer a developer or buyer needs (what it means for them, what to do next), not a news report. Use only facts the research confirms.",
  },
];

export const approachInfo = (key: string | undefined) => APPROACHES.find((item) => item.key === key);

export const IDEA_SOURCES = ["autocomplete", "competitor", "reddit", "instagram", "manual", "leads", "rss"] as const;
export type IdeaSource = (typeof IDEA_SOURCES)[number];

export const SOURCE_LABELS: Record<IdeaSource, string> = {
  autocomplete: "Google autocomplete",
  competitor: "Competitor topics",
  reddit: "Reddit",
  instagram: "Instagram",
  manual: "Added by staff",
  leads: "Our enquiries",
  rss: "News feed",
};

export type IdeaStatus = "new" | "queued" | "used" | "dismissed";

export type IdeaEvidence = {
  /** A public page that shows the idea (never one of our leads). */
  url?: string;
  /** Upvotes or likes. */
  score?: number;
  comments?: number;
  /** How many posts, searches or enquiries back it up. */
  count?: number;
  note?: string;
  /** 0-100: how established a competitor subject is (competitor-intel.ts fameScore). */
  fame?: number;
  /** The signals behind `fame`, one short line each. Never personal data. */
  signals?: string[];
};

export type Idea = {
  id: string;
  approach: Approach;
  source: IdeaSource;
  /** The question, trend or search, in a sentence. */
  title: string;
  /** The phrase people search for, when known. */
  keyword?: string;
  /** Region name from regions.ts, when the idea is about one market. */
  region?: string;
  /** Service group key (auto-topic.ts SERVICE_GROUPS). */
  group?: string;
  evidence: IdeaEvidence;
  /** Public pages the research step should read first (news articles). */
  seedUrls: string[];
  status: IdeaStatus;
  createdAt: string;
  expiresAt: string;
};

export type NewIdea = Omit<Idea, "id" | "status" | "createdAt" | "expiresAt">;

/** How long an unused idea stays useful. */
export const IDEA_LIFETIME_DAYS: Record<Approach, number> = { search: 180, community: 60, social: 30, customers: 180, news: 30 };

export const expiryFor = (approach: Approach, now = new Date()) => new Date(now.getTime() + IDEA_LIFETIME_DAYS[approach] * 86_400_000).toISOString();

// ---- The mix ---------------------------------------------------------------

export const DEFAULT_MIX = "search:4,community:1,social:1,customers:1,news:1";

/** "search:4,community:1,..." -> weights. Approaches left out get 0; a mix with no weight at all falls back to the default. */
export function parseMix(raw: string | undefined): Record<Approach, number> {
  const weights = Object.fromEntries(APPROACH_KEYS.map((key) => [key, 0])) as Record<Approach, number>;
  for (const part of (raw?.trim() || DEFAULT_MIX).split(",")) {
    const [key, value] = part.split(":").map((item) => item.trim().toLowerCase());
    const weight = Number(value);
    if ((APPROACH_KEYS as readonly string[]).includes(key) && Number.isFinite(weight) && weight >= 0) weights[key as Approach] = weight;
  }
  return Object.values(weights).some((weight) => weight > 0) ? weights : parseMix(DEFAULT_MIX);
}

export type ApproachHistoryItem = { approach?: string; createdAt: string };

/**
 * The approach for the next automatic draft: of those with an idea ready (`available`), the one
 * furthest below its share of the mix over the last 30 days; ties go to the next one in turn after
 * the most recent. Search is the fallback because Search Console or the AI can always fill it.
 */
export function nextApproach(history: ApproachHistoryItem[], available: Approach[], mix: Record<Approach, number>, now = new Date()): Approach {
  const candidates = APPROACH_KEYS.filter((key) => mix[key] > 0 && (key === "search" || available.includes(key)));
  if (candidates.length === 0) return "search";
  const since = now.getTime() - 30 * 86_400_000;
  const recent = history
    .filter((item): item is { approach: Approach; createdAt: string } => APPROACH_KEYS.includes(item.approach as Approach) && Date.parse(item.createdAt) >= since)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const share = (key: Approach) => recent.filter((item) => item.approach === key).length / mix[key];
  const last = recent[recent.length - 1]?.approach;
  const start = last ? (APPROACH_KEYS.indexOf(last) + 1) % APPROACH_KEYS.length : 0;
  const ordered = [...APPROACH_KEYS.slice(start), ...APPROACH_KEYS.slice(0, start)].filter((key) => candidates.includes(key));
  let best = ordered[0];
  for (const key of ordered.slice(1)) if (share(key) < share(best)) best = key;
  return best;
}

// ---- Choosing an idea ------------------------------------------------------

/** The blog type an idea reads as: buyer intent or a question guide (quick wins need a Google position). */
export function ideaStrategies(idea: Pick<Idea, "title" | "keyword">): Strategy[] {
  return classifyStrategies({ query: idea.keyword || idea.title, impressions: 0, position: 0 }).filter((key) => key !== "quick-win");
}

export const ideaStrategy = (idea: Pick<Idea, "title" | "keyword">): Strategy => ideaStrategies(idea)[0] ?? "question";

export type IdeaPickOptions = {
  approach: Approach;
  /** Preferred region and service (the rotation's); ideas elsewhere still qualify. */
  region?: string;
  group?: string;
  /** Only ideas that read as this blog type. */
  strategy?: Strategy;
  /** Titles and keywords already covered; anything close to one is skipped. */
  used?: string[];
  now?: Date;
};

const isFresh = (idea: Pick<Idea, "status" | "expiresAt">, now: Date) => idea.status === "new" && Date.parse(idea.expiresAt) > now.getTime();

/** How strongly the evidence backs an idea: more people asking, more engagement. */
export function ideaStrength(evidence: IdeaEvidence): number {
  return 1 + Math.log10(1 + (evidence.score ?? 0) + 3 * (evidence.comments ?? 0)) + 2 * Math.log2(1 + (evidence.count ?? 1)) + (evidence.fame ?? 0) / 20;
}

/** The best fresh idea for this approach, or null when there is none. */
export function pickIdea(ideas: Idea[], options: IdeaPickOptions): Idea | null {
  const now = options.now ?? new Date();
  const used = (options.used ?? []).filter((value): value is string => typeof value === "string" && value.length > 0).map((value) => value.toLowerCase());
  const covered = (idea: Idea) =>
    used.some(
      (value) =>
        titleSimilarity(idea.title, value) >= 0.5 ||
        (idea.keyword ? titleSimilarity(idea.keyword, value) >= 0.5 || value.includes(idea.keyword.toLowerCase()) : false),
    );
  const scored = ideas
    .filter((idea) => idea.approach === options.approach && isFresh(idea, now))
    .filter((idea) => !options.strategy || ideaStrategies(idea).includes(options.strategy))
    .filter((idea) => !covered(idea))
    .map((idea) => {
      const ageDays = Math.max(0, (now.getTime() - Date.parse(idea.createdAt)) / 86_400_000);
      const freshness = 1 / (1 + ageDays / IDEA_LIFETIME_DAYS[idea.approach]);
      const fit = (options.region && idea.region === options.region ? 1.5 : 1) * (options.group && idea.group === options.group ? 1.3 : 1);
      return { idea, score: ideaStrength(idea.evidence) * freshness * fit };
    })
    .sort((a, b) => b.score - a.score || b.idea.createdAt.localeCompare(a.idea.createdAt));
  return scored[0]?.idea ?? null;
}

/** Ideas still waiting to be written and not expired. */
export const freshIdeas = (ideas: Idea[], now = new Date()) => ideas.filter((idea) => isFresh(idea, now));

/** Approaches that have at least one fresh idea. */
export const approachesWithIdeas = (ideas: Idea[], now = new Date()): Approach[] => APPROACH_KEYS.filter((key) => ideas.some((idea) => idea.approach === key && isFresh(idea, now)));

/** Whether `title` repeats an idea or article we already have. */
export function isDuplicateIdea(title: string, existing: string[]): boolean {
  const own = normal(title);
  return existing.some((other) => normal(other) === own || titleSimilarity(title, other) >= 0.6);
}

// ---- Regions and relevance ---------------------------------------------------

const normal = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();

const REGION_TERMS: [string, RegExp][] = [
  ["Saudi Arabia", /\b(saudi|ksa|riyadh|jeddah|jiddah|dammam|khobar|neom|red sea global|diriyah|qiddiya|makkah|mecca|madinah|medina|vision 2030)\b/i],
  ["UAE", /\b(uae|emirates|emirati|dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah)\b/i],
  ["Pakistan", /\b(pakistan|pakistani|lahore|karachi|islamabad|rawalpindi|faisalabad|peshawar)\b/i],
  ["USA", /\b(usa|u\.s\.|united states|america|american|new york|california|texas|florida|chicago|los angeles)\b/i],
];

/** The region a piece of text is about, or undefined when it names none of ours. */
export function regionForText(text: string): string | undefined {
  return REGION_TERMS.find(([, pattern]) => pattern.test(text))?.[0];
}

/** ISO 3166-1 alpha-2 country code (as Vercel reports it) -> region name. */
export const COUNTRY_CODE_TO_REGION: Record<string, string> = { AE: "UAE", SA: "Saudi Arabia", PK: "Pakistan", US: "USA" };

/** Region name -> Google's `gl` country code, for autocomplete. */
export const REGION_TO_GL: Record<string, string> = { UAE: "ae", "Saudi Arabia": "sa", Pakistan: "pk", USA: "us" };

/** Whether text is about one of our services at all. */
export const isOnTopic = (text: string) => groupForQuery(text) !== null;

// ---- Parsers -----------------------------------------------------------------

/** Google's suggest endpoint (client=firefox): ["query", ["suggestion", ...]]. */
export function parseAutocomplete(json: unknown): string[] {
  if (!Array.isArray(json) || !Array.isArray(json[1])) return [];
  return (json[1] as unknown[]).filter((item): item is string => typeof item === "string").map((item) => item.trim().replace(/\s+/g, " ")).filter(Boolean);
}

/** Places (and sites) autocomplete often adds that are not our markets. */
const ELSEWHERE =
  /\b(india|indian|philippines|australia|uk|united kingdom|london|canada|toronto|nigeria|kenya|malaysia|singapore|bangladesh|south africa|egypt|cairo|qatar|doha|kuwait|bahrain|oman|europe|germany|reddit|quora|youtube|pdf|free download|jobs?|salary|course|courses|internship)\b/i;

/** Searches by people doing it themselves (software, tutorials) rather than hiring someone. */
const DO_IT_YOURSELF = /\b(software|apps?|python|ai|tutorials?|free|blender|sketchup|lumion|revit|3ds max|unreal|plugins?|product rendering|product visualization|games?|minecraft|sims)\b/i;

/** "how" followed by a noun ("how house design") is autocomplete noise, not a question. */
const BROKEN_HOW = /^how (?!to |much |long |many |do |does |is |are |can |should |far |often )/i;

/** Search suggestions worth keeping: about a service, phrased as a question or a buying search, not about us, somewhere else, or DIY. */
export function usefulSuggestion(suggestion: string): boolean {
  const words = suggestion.split(/\s+/).length;
  return (
    words >= 3 &&
    words <= 6 &&
    !isBranded(suggestion) &&
    !ELSEWHERE.test(suggestion) &&
    !DO_IT_YOURSELF.test(suggestion) &&
    !BROKEN_HOW.test(suggestion) &&
    isOnTopic(suggestion) &&
    ideaStrategies({ title: suggestion }).length > 0
  );
}

export type RedditPost = { title: string; text: string; url: string; subreddit: string; score: number; comments: number; createdAt: string };

/** A Reddit listing (/top, /search with raw_json=1). Stickied, NSFW and removed posts are dropped. */
export function parseRedditListing(json: unknown): RedditPost[] {
  const children = (json as { data?: { children?: { data?: Record<string, unknown> }[] } })?.data?.children ?? [];
  return children.flatMap(({ data }) => {
    if (!data || data.stickied || data.over_18 || data.removed_by_category) return [];
    const permalink = String(data.permalink ?? "");
    if (!permalink.startsWith("/r/")) return [];
    return [
      {
        title: String(data.title ?? "").trim(),
        text: String(data.selftext ?? "").replace(/\s+/g, " ").trim().slice(0, 600),
        url: `https://www.reddit.com${permalink}`,
        subreddit: String(data.subreddit ?? ""),
        score: Number(data.score) || 0,
        comments: Number(data.num_comments) || 0,
        createdAt: new Date((Number(data.created_utc) || 0) * 1000).toISOString(),
      },
    ];
  });
}

export type FeedItem = { title: string; link: string; publishedAt: string; summary: string };

const tag = (xml: string, name: string) => new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i").exec(xml)?.[1] ?? "";

/** Element text: CDATA unwrapped, entities decoded, and any HTML inside (often escaped in RSS) stripped. */
function xmlText(raw: string): string {
  const unwrapped = raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ");
  return decodeEntities(unwrapped).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** RSS 2.0 <item>s or Atom <entry>s. Items without a title or an https link are dropped. */
export function parseFeed(xml: string): FeedItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  return blocks.flatMap((block) => {
    const title = xmlText(tag(block, "title"));
    const atomLink = /<link[^>]*href="([^"]+)"/i.exec(block)?.[1] ?? "";
    const link = xmlText(tag(block, "link")) || decodeEntities(atomLink);
    const date = xmlText(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "dc:date"));
    const parsed = Date.parse(date);
    if (!title || !link.startsWith("https://")) return [];
    return [{ title, link, publishedAt: Number.isNaN(parsed) ? "" : new Date(parsed).toISOString(), summary: xmlText(tag(block, "description") || tag(block, "summary") || tag(block, "content")).slice(0, 400) }];
  });
}

/** A sitemap: page URLs (<urlset>) and child sitemaps (<sitemapindex>). */
export function parseSitemap(xml: string): { urls: string[]; sitemaps: string[] } {
  const locs = (block: RegExp) => (xml.match(block) ?? []).map((entry) => xmlText(tag(entry, "loc"))).filter((loc) => loc.startsWith("https://"));
  return { urls: locs(/<url>[\s\S]*?<\/url>/gi), sitemaps: locs(/<sitemap>[\s\S]*?<\/sitemap>/gi) };
}

/** Page URLs of a sitemap with their last-modified date (ISO, or "" when it gives none). */
export function parseSitemapEntries(xml: string): { loc: string; lastmod: string }[] {
  return (xml.match(/<url>[\s\S]*?<\/url>/gi) ?? []).flatMap((entry) => {
    const loc = xmlText(tag(entry, "loc"));
    const parsed = Date.parse(xmlText(tag(entry, "lastmod")));
    return loc.startsWith("https://") ? [{ loc, lastmod: Number.isNaN(parsed) ? "" : new Date(parsed).toISOString() }] : [];
  });
}

/** Sitemap URLs from robots.txt. */
export const parseRobotsSitemaps = (robots: string) => [...robots.matchAll(/^\s*sitemap:\s*(https:\/\/\S+)/gim)].map((match) => match[1]);

const ARTICLE_PATH = /\/(blog|blogs|insights?|news|articles?|journal|resources|guides?|stories|knowledge)\//i;

const POST_SITEMAP = /post|blog|article|news|insight|journal/i;
const OTHER_SITEMAP = /page|categor|tag|author|team|project|portfolio|case|service|product|showcase|local|location|geo|listicle|elementor|video|expertise|tour|member|people/i;

/**
 * Whether a sitemap file lists blog posts (WordPress / Yoast "post-sitemap.xml", "wp-sitemap-posts-post-1.xml",
 * "sitemap-blog.xml"). Those sites often put posts at the root ("/how-much-does-rendering-cost/"),
 * so every URL in such a sitemap is an article whatever its path.
 */
export function isPostSitemap(url: string): boolean {
  const name = url.split("?")[0].split("/").pop() ?? "";
  return POST_SITEMAP.test(name) && !OTHER_SITEMAP.test(name);
}

/** `count` items spread evenly over the list (not just its start), so a long blog is sampled across its years. */
export function sampleEvenly<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, index) => items[Math.floor(index * step)]);
}

/**
 * An article URL as the phrase its slug spells ("/blog/how-much-does-3d-rendering-cost" -> "how much does 3d rendering cost").
 * `anyPath` is for URLs from a post sitemap (isPostSitemap), which need no "/blog/" in the path.
 */
export function slugPhrase(url: string, anyPath = false): string | null {
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    return null;
  }
  if (!anyPath && !ARTICLE_PATH.test(path)) return null;
  const slug = path.replace(/\/$/, "").split("/").pop() ?? "";
  const phrase = decodeURIComponent(slug)
    .replace(/\.(html?|php|aspx?)$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\d{3,}\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return phrase.split(" ").length >= 3 && /[a-z]/.test(phrase) ? phrase : null;
}

// ---- Privacy -----------------------------------------------------------------

/**
 * Enquiry text with contact details and self-introductions removed, before it goes to the AI.
 * The AI is also told to generalise, and ideas.ts never stores the messages themselves.
 */
export function scrubLeadText(text: string, names: string[] = []): string {
  let clean = text
    .replace(/\S+@\S+\.\S+/g, " ")
    .replace(/(https?:\/\/|www\.)\S+/gi, " ")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, " ")
    .replace(/\b(my name is|this is|i am|i'm)\s+[A-Z][\p{L}'-]+(\s+[A-Z][\p{L}'-]+)?/gu, "$1 [name]")
    .replace(/\b(regards|thanks|thank you|best|sincerely|cheers)\b[,!.\s]*[\s\S]{0,80}$/i, " ");
  for (const name of names.map((value) => value.trim()).filter((value) => value.length >= 3)) {
    clean = clean.replace(new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), "[name]");
  }
  return clean.replace(/\s+/g, " ").trim().slice(0, 600);
}

/** Whether AI output about enquiries still carries something personal (a name, an email, a phone number). */
export function leaksPersonalData(text: string, names: string[]): boolean {
  if (/\S+@\S+\.\S+/.test(text) || /\+?\d[\d\s().-]{6,}\d/.test(text)) return true;
  const lower = text.toLowerCase();
  return names.some((name) => name.trim().length >= 3 && new RegExp(`\\b${name.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower));
}
