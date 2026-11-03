import "server-only";
import { aiIdeas, off, toIdea, type Collector } from "@/lib/ideas/ai";

/**
 * Social approach: design themes getting attention on Instagram, through Meta's official Graph API
 * (hashtag search + each hashtag's top posts). Needs our Instagram business account (IG_USER_ID)
 * linked to a Facebook page, and a long-lived token (META_ACCESS_TOKEN) from a Meta app approved
 * for "Instagram Public Content Access". Meta allows 30 different hashtags per 7 days; we use 10.
 * Only captions, like/comment counts and the public link are used; account names never are.
 * TikTok and Pinterest have no free trends API, so staff add those trends by hand on /admin/blog/ideas.
 */

const HASHTAGS = [
  "interiordesign",
  "villadesign",
  "architecturedesign",
  "dubaiinteriors",
  "riyadh",
  "saudiarchitecture",
  "3drendering",
  "archviz",
  "realestatemarketing",
  "luxuryhomes",
];

type Media = { caption?: string; like_count?: number; comments_count?: number; permalink?: string; timestamp?: string };

const version = () => process.env.META_GRAPH_VERSION?.trim() || "v23.0";

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `https://graph.facebook.com/${version()}/${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${process.env.META_ACCESS_TOKEN!.trim()}` },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  return json;
}

export const instagramCollector: Collector = {
  key: "instagram",
  label: "Instagram",
  approach: "social",
  async collect(ctx) {
    const userId = process.env.IG_USER_ID?.trim();
    if (!userId || !process.env.META_ACCESS_TOKEN?.trim()) return off("Set IG_USER_ID and META_ACCESS_TOKEN (see ADMIN_PORTAL.md). Trends can still be added by hand.");
    if (!ctx.provider) return off("No AI provider is configured.");

    const errors: string[] = [];
    const lists = await Promise.all(
      HASHTAGS.map(async (hashtag) => {
        try {
          const found = await graph<{ data?: { id: string }[] }>("ig_hashtag_search", { user_id: userId, q: hashtag });
          const id = found.data?.[0]?.id;
          if (!id) return [];
          const top = await graph<{ data?: Media[] }>(`${id}/top_media`, { user_id: userId, fields: "caption,like_count,comments_count,permalink,timestamp", limit: "25" });
          return (top.data ?? []).map((media) => ({ ...media, hashtag }));
        } catch (err) {
          errors.push(`#${hashtag}: ${err instanceof Error ? err.message : "failed"}`);
          return [];
        }
      }),
    );
    const since = ctx.now.getTime() - 30 * 86_400_000;
    const posts = lists
      .flat()
      .filter((media) => media.caption && media.permalink?.startsWith("https://") && (!media.timestamp || Date.parse(media.timestamp) >= since))
      .sort((a, b) => (b.like_count ?? 0) + 3 * (b.comments_count ?? 0) - ((a.like_count ?? 0) + 3 * (a.comments_count ?? 0)))
      .slice(0, 80);
    if (posts.length === 0) return { state: errors.length === HASHTAGS.length ? "error" : "ok", ideas: [], message: errors.length ? errors.slice(0, 3).join("; ") : "No recent top posts found." };

    const suggestions = await aiIdeas(ctx, {
      instruction:
        "Each item is a top Instagram post this month (hashtag, likes, comments, caption). Find the design themes, styles, materials or property-marketing formats that several posts share and that are getting real attention. Turn each into a blog idea that explains the trend for a buyer or developer in our markets.",
      items: posts.map((post) => `#${post.hashtag} (${post.like_count ?? 0} likes, ${post.comments_count ?? 0} comments): ${post.caption!.replace(/[#@]\S+/g, " ").slice(0, 400)}`),
      max: 6,
    });
    const ideas = suggestions.map((suggestion) => {
      const backing = suggestion.sources.map((index) => posts[index]).sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));
      return toIdea(suggestion, "social", "instagram", {
        url: backing[0]?.permalink,
        score: backing.reduce((sum, post) => sum + (post.like_count ?? 0), 0),
        comments: backing.reduce((sum, post) => sum + (post.comments_count ?? 0), 0),
        count: backing.length || 1,
        note: suggestion.note,
      });
    });
    return { state: "ok", ideas, message: `${posts.length} top posts read${errors.length ? `; ${errors.length} hashtags failed (${errors[0]})` : ""}.` };
  },
};
