import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { buildConfirmationEmail, buildLeadEmail } from "@/lib/contact-email";
import { contact } from "@/lib/site-config";

/**
 * Contact form submission endpoint.
 *
 * Security notes:
 * - Zod validates and caps every field server-side (never trust client input).
 * - A basic in-memory sliding-window rate limit blocks obvious abuse. This
 *   resets on redeploy/cold start and won't hold across multiple serverless
 *   instances - for real production traffic on Vercel, swap this for
 *   Upstash Redis + @upstash/ratelimit (a few lines).
 *
 * Delivery: each valid submission is emailed through Resend to the studio
 * inbox (contact.email, info@mim.archi), with the visitor's address as
 * Reply-To, and the visitor gets a short confirmation email back (see the
 * "Confirmation" step below). Environment variables:
 * - RESEND_API_KEY      (required in production)
 * - CONTACT_FROM_EMAIL  (optional) sender; must be on a domain verified in
 *                       Resend. Defaults to the mim.archi site address below.
 * - CONTACT_TO_EMAIL    (optional) overrides the recipient, e.g. to point a
 *                       staging deploy at a test inbox instead of the studio.
 */

// `||`, not `??`: a blank value copied from .env.example should count as unset.
const FROM = process.env.CONTACT_FROM_EMAIL?.trim() || "Mimar Studios Website <site@mim.archi>";
const TO = process.env.CONTACT_TO_EMAIL?.trim() || contact.email;

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

// Shown to the visitor when we could not deliver their message. Never claim
// success in that case - a silently dropped lead is worse than an error.
const DELIVERY_FAILED = {
  error: `We couldn't send your message right now. Please email us at ${contact.email} instead.`,
};

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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.error("[contact] RESEND_API_KEY is not set - a lead was NOT delivered");
      return NextResponse.json(DELIVERY_FAILED, { status: 503 });
    }
    // Local development without a key: don't block working on the form.
    console.warn("[contact] RESEND_API_KEY is not set - skipping the email in development");
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(apiKey);
  const lead = buildLeadEmail(parsed.data);

  // 1) The studio notification is the one that matters: if it fails the lead
  //    is lost, so tell the visitor.
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: parsed.data.email,
      subject: lead.subject,
      text: lead.text,
      html: lead.html,
    });
    if (error) {
      // Log the reason only - never the visitor's details.
      console.error("[contact] Resend rejected the message", { name: error.name, message: error.message });
      return NextResponse.json(DELIVERY_FAILED, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Resend request failed", err instanceof Error ? err.message : err);
    return NextResponse.json(DELIVERY_FAILED, { status: 502 });
  }

  // 2) Confirmation to the visitor. Sent only after the studio copy went out
  //    (never confirm something we didn't receive), and a failure here must not
  //    fail the form - the lead is already safely delivered, so just log it.
  const confirmation = buildConfirmationEmail(parsed.data, TO);
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: parsed.data.email,
      replyTo: TO,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      // Marks it as automatic so other auto-responders don't answer it.
      headers: { "Auto-Submitted": "auto-replied" },
    });
    if (error) console.error("[contact] Confirmation email rejected", { name: error.name, message: error.message });
  } catch (err) {
    console.error("[contact] Confirmation email failed", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
