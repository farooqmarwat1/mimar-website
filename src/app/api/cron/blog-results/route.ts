import { takeDueSnapshots } from "@/lib/blog-results";
import { cronAuthorized } from "@/lib/cron";
import { isFirebaseConfigured } from "@/lib/firebase/admin";

/**
 * Daily (vercel.json): takes the day-30 and day-90 result snapshots that are due for published articles
 * (src/lib/blog-results.ts): indexed or not, rank for their own keyword, Google clicks, views and leads.
 * /admin/blog/approaches ranks the approaches from them. Only Vercel Cron may call it (src/lib/cron.ts).
 */

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseConfigured) return Response.json({ skipped: "Firebase is not configured." });
  try {
    return Response.json(await takeDueSnapshots());
  } catch (err) {
    const error = err instanceof Error ? err.message : "The results check failed.";
    console.error("[cron] blog results failed:", error);
    return Response.json({ ok: false, error }, { status: 500 });
  }
}
