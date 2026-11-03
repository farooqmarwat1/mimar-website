import { cronAuthorized } from "@/lib/cron";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { collectIdeas } from "@/lib/ideas/collect";

/**
 * Weekly blog idea collection (vercel.json: Sundays, before Monday's draft). Gathers ideas from
 * Google autocomplete, competitor sitemaps, Reddit, Instagram, our enquiries and news feeds into
 * siteBlogIdeas (src/lib/ideas). It never writes or publishes an article: the Monday and Thursday
 * drafting run picks from the ideas, and a person approves every draft.
 *
 * Only Vercel Cron may call it (src/lib/cron.ts).
 */

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseConfigured) return Response.json({ skipped: "Firebase is not configured." });
  try {
    const result = await collectIdeas();
    return Response.json(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : "Collecting ideas failed.";
    console.error("[cron] idea collection failed:", error);
    return Response.json({ ok: false, error }, { status: 500 });
  }
}
