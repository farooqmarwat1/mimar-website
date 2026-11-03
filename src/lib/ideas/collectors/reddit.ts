import "server-only";
import { isOnTopic, parseRedditListing, type RedditPost } from "@/lib/ai/idea-plan";
import { aiIdeas, off, toIdea, type Collector } from "@/lib/ideas/ai";

/**
 * Community approach: questions people ask on Reddit. Uses Reddit's official API with an app-only
 * token (REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET from a "script" or "web" app at
 * https://www.reddit.com/prefs/apps; Reddit may ask us to register for API access first). About a
 * dozen requests a week, far inside the free limit. Only titles, a little of the post text and the
 * public link are kept; usernames never are.
 */

const SUBREDDITS: { name: string; search?: string; region?: string }[] = [
  { name: "architecture" },
  { name: "InteriorDesign" },
  { name: "archviz" },
  { name: "Architects" },
  { name: "RealEstate", search: "render OR renders OR \"virtual tour\" OR \"floor plan\" OR architect OR marketing" },
  { name: "realestateinvesting", search: "\"off plan\" OR \"off-plan\" OR developer OR renders" },
  { name: "saudiarabia", search: "architect OR villa OR \"interior design\" OR construction OR \"real estate\"", region: "Saudi Arabia" },
  { name: "dubai", search: "architect OR villa OR \"interior design\" OR \"off plan\" OR \"real estate\"", region: "UAE" },
  { name: "UAE", search: "architect OR villa OR \"interior design\" OR \"off plan\"", region: "UAE" },
  { name: "pakistan", search: "architect OR \"house design\" OR construction OR \"interior design\"", region: "Pakistan" },
];

const QUESTION = /\?\s*$|^(how|what|why|which|when|where|who|can|is|are|does|do|should|will|any|need|looking for)\b/i;

const userAgent = () => process.env.REDDIT_USER_AGENT?.trim() || "web:archi.mim.blog-ideas:v1.0 (by Mimar Studios)";

async function token(): Promise<string> {
  const id = process.env.REDDIT_CLIENT_ID!.trim();
  const secret = process.env.REDDIT_CLIENT_SECRET!.trim();
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded", "user-agent": userAgent() },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Reddit sign-in failed (HTTP ${res.status}). Check REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.`);
  return ((await res.json()) as { access_token: string }).access_token;
}

async function listing(path: string, accessToken: string): Promise<RedditPost[]> {
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: { authorization: `Bearer ${accessToken}`, "user-agent": userAgent() },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseRedditListing(await res.json());
}

export const redditCollector: Collector = {
  key: "reddit",
  label: "Reddit",
  approach: "community",
  async collect(ctx) {
    if (!process.env.REDDIT_CLIENT_ID?.trim() || !process.env.REDDIT_CLIENT_SECRET?.trim()) return off("Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET (see ADMIN_PORTAL.md).");
    if (!ctx.provider) return off("No AI provider is configured.");

    const accessToken = await token();
    const failed: string[] = [];
    const lists = await Promise.all(
      SUBREDDITS.map(async ({ name, search }) => {
        const path = search
          ? `/r/${name}/search?q=${encodeURIComponent(search)}&restrict_sr=1&sort=top&t=month&limit=50&raw_json=1`
          : `/r/${name}/top?t=month&limit=50&raw_json=1`;
        try {
          return await listing(path, accessToken);
        } catch {
          failed.push(name);
          return [];
        }
      }),
    );
    const posts = [...new Map(lists.flat().map((post) => [post.url, post])).values()]
      .filter((post) => QUESTION.test(post.title) && isOnTopic(`${post.title} ${post.text}`))
      .sort((a, b) => b.score + 3 * b.comments - (a.score + 3 * a.comments))
      .slice(0, 60);
    if (posts.length === 0) return { state: failed.length === SUBREDDITS.length ? "error" : "ok", ideas: [], message: failed.length ? `Could not read r/${failed.join(", r/")}.` : "No relevant questions this month." };

    const suggestions = await aiIdeas(ctx, {
      instruction:
        "Each item is a question someone asked on Reddit this month (subreddit, title, and the start of the post). Group questions that ask the same thing and turn each group into one blog idea that answers it well. Prefer questions many people engaged with.",
      items: posts.map((post) => `r/${post.subreddit}: ${post.title} — ${post.text.slice(0, 300)}`),
      max: 8,
    });
    const ideas = suggestions.map((suggestion) => {
      const backing = suggestion.sources.map((index) => posts[index]).sort((a, b) => b.score - a.score);
      const idea = toIdea(suggestion, "community", "reddit", {
        url: backing[0]?.url,
        score: backing.reduce((sum, post) => sum + post.score, 0),
        comments: backing.reduce((sum, post) => sum + post.comments, 0),
        count: backing.length || 1,
        note: suggestion.note,
      });
      // A question from a country's own subreddit is about that market even when it does not say so.
      const local = backing.map((post) => SUBREDDITS.find((sub) => sub.name.toLowerCase() === post.subreddit.toLowerCase())?.region).find(Boolean);
      return { ...idea, region: idea.region ?? local };
    });
    return { state: "ok", ideas, message: `${posts.length} relevant questions read from ${SUBREDDITS.length - failed.length} subreddits${failed.length ? `; could not read r/${failed.join(", r/")}` : ""}.` };
  },
};
