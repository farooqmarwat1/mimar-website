import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Contact form submission endpoint.
 *
 * Security notes:
 * - Zod validates and caps every field server-side (never trust client input).
 * - A basic in-memory sliding-window rate limit blocks obvious abuse. This
 *   resets on redeploy/cold start and won't hold across multiple serverless
 *   instances - for real production traffic on Vercel, swap this for
 *   Upstash Redis + @upstash/ratelimit (a few lines; see comment below).
 * - No email is actually sent yet - wire up Resend/SendGrid/Postmark where
 *   marked TODO. Keeping it a stub avoids shipping fake credentials.
 */

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().trim().max(80).optional(),
  source: z.string().trim().max(80).optional(),
  message: z.string().trim().min(1).max(5000),
  // Honeypot field - real users never fill this in.
  company: z.string().max(0).optional().or(z.literal("")),
});

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = ContactSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data.", issues: parsed.error.flatten() }, { status: 422 });
  }

  if (parsed.data.company) {
    // Honeypot tripped - silently succeed so bots don't learn anything.
    return NextResponse.json({ ok: true });
  }

  // TODO: send via your provider of choice, e.g.:
  //   await resend.emails.send({ from: "site@mim.archi", to: "info@mim.archi", ... })
  console.log("[contact] new submission", { ...parsed.data, ip });

  return NextResponse.json({ ok: true });
}
