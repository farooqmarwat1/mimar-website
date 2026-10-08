import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildConfirmationEmail, buildLeadEmail } from "@/lib/contact-email";
import { getMailer } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { contact } from "@/lib/site-config";
// TURNSTILE-DISABLED (no Cloudflare access yet): import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Contact form submission endpoint.
 *
 * Abuse protection, in the order a request meets it:
 * 1. Per-IP rate limits (src/lib/rate-limit.ts), before any parsing.
 * 2. Zod validates and caps every field server-side (never trust client input).
 * 3. A hidden honeypot field that real users never fill in.
 * 4. TURNSTILE-DISABLED: Cloudflare Turnstile "I'm human" checkbox. Switched
 *    off until the studio has Cloudflare access; the code is kept, commented
 *    out, below. Search the repo for TURNSTILE-DISABLED to find every place to
 *    switch it back on.
 * 5. A per-email-address limit, so one address can't be flooded with our
 *    confirmation emails. With the bot check off it counts every valid
 *    submission, so someone can use up a stranger's 3 per hour; with it on,
 *    only verified humans count.
 *
 * Delivery: each valid submission is emailed to the studio inbox
 * (contact.email, info@mim.archi), with the visitor's address as Reply-To, and
 * the visitor gets a short confirmation email back (see the "Confirmation" step
 * below). It goes over SMTP when that is configured, otherwise through Resend
 * (src/lib/mailer.ts). Environment variables - one of the two is required in
 * production:
 * - SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (optional SMTP_SECURE)
 *                         the studio mailbox, contact@contact.mim.archi on
 *                         Titan (smtp.titan.email, port 465).
 * - RESEND_API_KEY        used only when SMTP is not configured.
 * - CONTACT_FROM_EMAIL    (optional) sender. Defaults to the SMTP mailbox, or
 *                         to site@mim.archi for Resend (a domain verified there).
 * - CONTACT_TO_EMAIL      (optional) overrides the recipient, e.g. to point a
 *                         staging deploy at a test inbox instead of the studio.
 * - TURNSTILE_SECRET_KEY  (TURNSTILE-DISABLED: not read while the bot check is off)
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (optional) shared counters
 *                         so the rate limits hold across serverless instances.
 */

// `||`, not `??`: a blank value copied from .env.example should count as unset.
const TO = process.env.CONTACT_TO_EMAIL?.trim() || contact.email;

const ContactSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  service: z.string().trim().max(80).optional(),
  source: z.string().trim().max(80).optional(),
  message: z.string().trim().min(1).max(5000),
  // TURNSTILE-DISABLED: Cloudflare Turnstile token (max 2048 characters).
  // turnstileToken: z.string().max(2048).optional(),
  // Honeypot field - real users never fill this in. Deliberately accepted here
  // (not rejected by the schema) so the handler can answer a bot with a quiet
  // "ok" instead of an error that reveals which field gave it away.
  company: z.string().max(500).optional(),
});

// A real visitor rarely submits twice; these only need to stop floods.
const IP_BURST = { limit: 3, windowSec: 60 };
const IP_HOURLY = { limit: 10, windowSec: 3600 };
const EMAIL_HOURLY = { limit: 3, windowSec: 3600 };

// Shown to the visitor when we could not deliver their message. Never claim
// success in that case - a silently dropped lead is worse than an error.
const DELIVERY_FAILED = {
  error: `We couldn't send your message right now. Please email us at ${contact.email} instead.`,
};

function tooManyRequests(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const ipLimit = await checkRateLimit([
    { key: `contact:ip-burst:${ip}`, ...IP_BURST },
    { key: `contact:ip-hourly:${ip}`, ...IP_HOURLY },
  ]);
  if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfterSec);

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

  // TURNSTILE-DISABLED: the bot check below is switched off until the studio has
  // Cloudflare access. To switch it back on, uncomment this block, the import at
  // the top, the turnstileToken schema field, and the pieces in ContactForm.tsx,
  // next.config.ts (CSP) and .env.example. It fails closed: no secret in
  // production, or Cloudflare unreachable, refuses the submission.
  // Bot check. Fails closed in production: with no secret configured, or with
  // Cloudflare unreachable, we refuse rather than let unchecked traffic through.
  // const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  // if (!turnstileSecret) {
  //   if (process.env.NODE_ENV === "production") {
  //     console.error("[contact] TURNSTILE_SECRET_KEY is not set - refusing submissions without a bot check");
  //     return NextResponse.json(DELIVERY_FAILED, { status: 503 });
  //   }
  //   // Local development without keys: don't block working on the form.
  //   console.warn("[contact] TURNSTILE_SECRET_KEY is not set - skipping the bot check in development");
  // } else {
  //   const notHuman = { error: "Please confirm you're human and try again." };
  //   if (!parsed.data.turnstileToken) return NextResponse.json(notHuman, { status: 400 });
  //
  //   const human = await verifyTurnstile(parsed.data.turnstileToken, turnstileSecret, ip);
  //   if (!human.ok) {
  //     if (human.reason === "unreachable") {
  //       console.error("[contact] Could not reach Cloudflare Turnstile to verify a submission");
  //       return NextResponse.json(
  //         { error: `We couldn't verify that you're human right now. Please try again, or email us at ${contact.email}.` },
  //         { status: 503 },
  //       );
  //     }
  //     return NextResponse.json(notHuman, { status: 403 });
  //   }
  // }

  // Per-address quota (hashed: the key may live in Redis, and it needs no
  // readable email in it). TURNSTILE-DISABLED: once the bot check is back on,
  // this runs after it, so only verified humans count against an address.
  const emailHash = createHash("sha256").update(parsed.data.email.toLowerCase()).digest("hex");
  const emailLimit = await checkRateLimit([{ key: `contact:email:${emailHash}`, ...EMAIL_HOURLY }]);
  if (!emailLimit.allowed) return tooManyRequests(emailLimit.retryAfterSec);

  const mailer = getMailer();
  if (!mailer) {
    if (process.env.NODE_ENV === "production") {
      console.error("[contact] Neither SMTP nor RESEND_API_KEY is set - a lead was NOT delivered");
      return NextResponse.json(DELIVERY_FAILED, { status: 503 });
    }
    // Local development without credentials: don't block working on the form.
    console.warn("[contact] Neither SMTP nor RESEND_API_KEY is set - skipping the email in development");
    return NextResponse.json({ ok: true });
  }

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom;
  const lead = buildLeadEmail(parsed.data);

  // 1) The studio notification is the one that matters: if it fails the lead
  //    is lost, so tell the visitor.
  try {
    await mailer.send({
      from,
      to: TO,
      replyTo: parsed.data.email,
      subject: lead.subject,
      text: lead.text,
      html: lead.html,
    });
  } catch (err) {
    // Log the reason only - never the visitor's details.
    console.error(`[contact] Sending via ${mailer.name} failed`, err instanceof Error ? err.message : err);
    return NextResponse.json(DELIVERY_FAILED, { status: 502 });
  }

  // 2) Confirmation to the visitor. Sent only after the studio copy went out
  //    (never confirm something we didn't receive), and a failure here must not
  //    fail the form - the lead is already safely delivered, so just log it.
  const confirmation = buildConfirmationEmail(parsed.data, TO);
  try {
    await mailer.send({
      from,
      to: parsed.data.email,
      replyTo: TO,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      // Marks it as automatic so other auto-responders don't answer it.
      headers: { "Auto-Submitted": "auto-replied" },
    });
  } catch (err) {
    console.error("[contact] Confirmation email failed", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
