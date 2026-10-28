import { z } from "zod";
import { clientIp, cleanPath, isOptedOut, recordVisit, trackingEnabled, type VisitEvent } from "@/lib/visits";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Receives the page-view beacons from src/components/VisitTracker.tsx.
 *
 * Cookie-free by design: this route never sets a cookie and the browser keeps nothing. The visitor
 * is recognised only by a daily-rotating hash of IP + User-Agent (src/lib/visits.ts).
 *
 * What it will NOT do, so it cannot be abused the way an open telemetry endpoint can:
 * - trust an address or location from the request body: the IP and geography come from the
 *   platform's headers only, and the body is whitelisted and size-capped;
 * - accept calls from another site (same-origin check);
 * - record anyone who sends Do-Not-Track or Global Privacy Control, bots and scripts, or /admin pages;
 * - take unlimited writes from one address (rate limited).
 * It always answers 204 with no body, so a caller learns nothing about why a beacon was ignored.
 */

const Utm = z
  .object({
    source: z.string().max(100),
    medium: z.string().max(100),
    campaign: z.string().max(100),
    term: z.string().max(100),
    content: z.string().max(100),
  })
  .partial();

const Body = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("view"),
    path: z.string().max(300),
    referrer: z.string().max(500).optional(),
    utm: Utm.optional(),
    tz: z.string().max(64).optional(),
    screenWidth: z.number().min(0).max(10_000).optional(),
  }),
  z.object({
    kind: z.literal("leave"),
    path: z.string().max(300),
    seconds: z.number().min(0).max(3600),
  }),
]);

const done = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return request.headers.get("sec-fetch-site") === "same-origin";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!trackingEnabled() || isOptedOut(request.headers)) return done();
  if (!sameOrigin(request)) return new Response(null, { status: 403 });

  const ip = clientIp(request.headers);
  if (!ip) return done();
  if (!(await checkRateLimit([{ key: `track:ip:${ip}`, limit: 120, windowSec: 60 }])).allowed) return done();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return done();
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return done();

  const path = cleanPath(parsed.data.path);
  if (!path || path === "/admin" || path.startsWith("/admin/")) return done();

  const event: VisitEvent =
    parsed.data.kind === "leave"
      ? { kind: "leave", path, seconds: parsed.data.seconds }
      : { kind: "view", path, referrer: parsed.data.referrer, utm: parsed.data.utm, tz: parsed.data.tz, screenWidth: parsed.data.screenWidth };

  try {
    await recordVisit(request.headers, event, request.headers.get("host")?.split(":")[0]);
  } catch (err) {
    // Reason only, never the visitor's details. A tracking failure must never surface to the page.
    console.error("[track] could not record the visit:", err instanceof Error ? err.message : err);
  }
  return done();
}
