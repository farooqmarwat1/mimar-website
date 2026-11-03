import "server-only";
import { isOnTopic, parseFeed, regionForText, type FeedItem } from "@/lib/ai/idea-plan";
import { fetchFeed } from "@/lib/ai/safe-fetch";
import { aiIdeas, off, toIdea, type Collector } from "@/lib/ideas/ai";

/**
 * News approach: recent architecture, design and property news worth explaining to developers and
 * buyers. Public RSS feeds only (all checked to answer in November 2026). The general news feeds
 * are filtered to property and construction stories; the article becomes a seed page for the
 * research step, and the originality check keeps the draft from copying it.
 */

const FEEDS: { name: string; url: string; region?: string; general?: boolean }[] = [
  { name: "ArchDaily", url: "https://www.archdaily.com/feed" },
  { name: "Dezeen", url: "https://www.dezeen.com/feed/" },
  { name: "The Architect's Newspaper", url: "https://www.archpaper.com/feed/", region: "USA" },
  { name: "Architectural Digest", url: "https://www.architecturaldigest.com/feed/rss", region: "USA" },
  { name: "Gulf News", url: "https://gulfnews.com/feed", region: "UAE", general: true },
  { name: "The National", url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml", region: "UAE", general: true },
  { name: "Saudi Gazette", url: "https://www.saudigazette.com.sa/rss/business", region: "Saudi Arabia", general: true },
  { name: "Dawn", url: "https://www.dawn.com/feeds/business", region: "Pakistan", general: true },
  { name: "Express Tribune", url: "https://www.tribune.com.pk/feed/business", region: "Pakistan", general: true },
];

/** What a general news story must mention to be about our world. */
const PROPERTY =
  /\b(real estate|property|properties|developer|developers|off[- ]plan|housing|construction|giga[- ]?projects?|master ?plan|masterplan|architect\w*|interior design|villas?|towers?|skyscraper|mega ?project|urban planning|smart city|proptech|mortgage)\b/i;

const MAX_AGE_DAYS = 21;

export const newsCollector: Collector = {
  key: "rss",
  label: "News feeds",
  approach: "news",
  async collect(ctx) {
    if (!ctx.provider) return off("No AI provider is configured.");
    const since = ctx.now.getTime() - MAX_AGE_DAYS * 86_400_000;
    const failed: string[] = [];
    const lists = await Promise.all(
      FEEDS.map(async (feed) => {
        const xml = await fetchFeed(feed.url);
        if (!xml) {
          failed.push(feed.name);
          return [];
        }
        return parseFeed(xml)
          .filter((item) => !item.publishedAt || Date.parse(item.publishedAt) >= since)
          .filter((item) => (feed.general ? PROPERTY.test(`${item.title} ${item.summary}`) : PROPERTY.test(`${item.title} ${item.summary}`) || isOnTopic(item.title)))
          .slice(0, 15)
          .map((item) => ({ ...item, feed: feed.name, region: regionForText(`${item.title} ${item.summary}`) ?? feed.region }));
      }),
    );
    const items: (FeedItem & { feed: string; region?: string })[] = [...new Map(lists.flat().map((item) => [item.link, item])).values()]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 80);
    if (items.length === 0) return { state: failed.length === FEEDS.length ? "error" : "ok", ideas: [], message: failed.length ? `Could not read ${failed.join(", ")}.` : "No relevant stories in the last three weeks." };

    const suggestions = await aiIdeas(ctx, {
      instruction:
        "Each item is a recent news story (source, market, headline, summary). Pick the stories that change something for property developers, buyers or architects in our markets (new rules, big projects, design or market shifts) and turn each into an evergreen-leaning explainer idea: what it means for them and what to do next. Skip celebrity homes, awards, obituaries and one-off building showcases unless they reveal a wider trend.",
      items: items.map((item) => `${item.feed}${item.region ? ` (${item.region})` : ""}: ${item.title} — ${item.summary}`),
      max: 6,
    });
    const ideas = suggestions.map((suggestion) => {
      const backing = suggestion.sources.map((index) => items[index]);
      const links = backing.map((item) => item.link).slice(0, 3);
      const idea = toIdea(suggestion, "news", "rss", { url: links[0], count: backing.length || 1, note: backing[0] ? `${backing[0].feed}: ${backing[0].title}`.slice(0, 160) : suggestion.note }, links);
      return { ...idea, region: idea.region ?? backing.find((item) => item.region)?.region };
    });
    return { state: "ok", ideas, message: `${items.length} relevant stories read${failed.length ? `; could not read ${failed.join(", ")}` : ""}.` };
  },
};
