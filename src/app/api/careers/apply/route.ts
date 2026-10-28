import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildApplicationConfirmation, buildApplicationEmail } from "@/lib/application-email";
import { createApplication, setApplicationMailStatus } from "@/lib/applications";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import type { MailStatus } from "@/lib/lead-constants";
import { getMailer } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { contact } from "@/lib/site-config";

/**
 * Job application endpoint (the form on /careers/apply and /ar/careers/apply).
 *
 * Mirrors src/app/api/contact/route.ts but is a separate path on purpose, so job seekers never reach
 * the client enquiry inbox or the sales pipeline: the application is saved to Firestore first (shown in
 * /admin/applications), then emailed to the careers address, then the applicant gets a short confirmation.
 *
 * Abuse protection, in the order a request meets it: per-IP rate limits, zod validation with caps on
 * every field (the CV/portfolio link must be http(s)), a hidden honeypot, then a per-email limit.
 *
 * Environment: the same mail settings as the contact form (SMTP_* or RESEND_API_KEY, CONTACT_FROM_EMAIL),
 * plus CAREERS_TO_EMAIL (optional) to send applications somewhere other than hr@mim.archi, e.g. a test inbox.
 */

// `||`, not `??`: a blank value copied from .env.example should count as unset.
const TO = process.env.CAREERS_TO_EMAIL?.trim() || contact.hrEmail;

const ApplySchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.string().trim().min(1).max(120),
  portfolioUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => /^https?:\/\//i.test(value) && z.url().safeParse(value).success, "Enter a full http(s) link."),
  message: z.string().trim().min(1).max(3000),
  lang: z.enum(["en", "ar"]).optional().catch(undefined),
  // Honeypot: real people never fill this in. Accepted by the schema so the handler can answer a bot with a quiet "ok".
  company: z.string().max(500).optional(),
});

// A real applicant rarely submits twice; these only need to stop floods.
const IP_BURST = { limit: 3, windowSec: 60 };
const IP_HOURLY = { limit: 8, windowSec: 3600 };
const EMAIL_HOURLY = { limit: 3, windowSec: 3600 };

const DELIVERY_FAILED = {
  error: `We couldn't send your application right now. Please email it to ${contact.hrEmail} instead.`,
};

function tooManyRequests(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const ipLimit = await checkRateLimit([
    { key: `apply:ip-burst:${ip}`, ...IP_BURST },
    { key: `apply:ip-hourly:${ip}`, ...IP_HOURLY },
  ]);
  if (!ipLimit.allowed) return tooManyRequests(ipLimit.retryAfterSec);

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = ApplySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data.", issues: parsed.error.flatten() }, { status: 422 });
  }
  if (parsed.data.company) return NextResponse.json({ ok: true });

  const emailHash = createHash("sha256").update(parsed.data.email.toLowerCase()).digest("hex");
  const emailLimit = await checkRateLimit([{ key: `apply:email:${emailHash}`, ...EMAIL_HOURLY }]);
  if (!emailLimit.allowed) return tooManyRequests(emailLimit.retryAfterSec);

  // Save before anything can go wrong with the email. A failed save never blocks the email.
  let applicationId: string | null = null;
  if (isFirebaseConfigured) {
    try {
      applicationId = await createApplication(parsed.data);
    } catch (err) {
      // Reason only - never the applicant's details.
      console.error("[apply] Could not save the application", err instanceof Error ? err.message : err);
    }
  }
  const markMail = async (status: MailStatus) => {
    if (!applicationId) return;
    try {
      await setApplicationMailStatus(applicationId, status);
    } catch (err) {
      console.error("[apply] Could not record the email status", err instanceof Error ? err.message : err);
    }
  };

  const mailer = getMailer();
  if (!mailer) {
    await markMail("skipped");
    if (process.env.NODE_ENV === "production" && !applicationId) {
      console.error("[apply] Neither SMTP nor RESEND_API_KEY is set - an application was NOT delivered");
      return NextResponse.json(DELIVERY_FAILED, { status: 503 });
    }
    // Saved in /admin/applications (or local development without credentials): the application is not lost.
    console.warn("[apply] Neither SMTP nor RESEND_API_KEY is set - skipping the email");
    return NextResponse.json({ ok: true });
  }

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom;
  const notice = buildApplicationEmail(parsed.data);

  try {
    await mailer.send({
      from,
      to: TO,
      replyTo: parsed.data.email,
      subject: notice.subject,
      text: notice.text,
      html: notice.html,
    });
    await markMail("sent");
  } catch (err) {
    console.error(`[apply] Sending via ${mailer.name} failed`, err instanceof Error ? err.message : err);
    await markMail("failed");
    if (applicationId) return NextResponse.json({ ok: true });
    return NextResponse.json(DELIVERY_FAILED, { status: 502 });
  }

  // Confirmation to the applicant, only after HR's copy went out. A failure here must not fail the form.
  const confirmation = buildApplicationConfirmation(parsed.data, TO);
  try {
    await mailer.send({
      from,
      to: parsed.data.email,
      replyTo: TO,
      subject: confirmation.subject,
      text: confirmation.text,
      html: confirmation.html,
      headers: { "Auto-Submitted": "auto-replied" },
    });
  } catch (err) {
    console.error("[apply] Confirmation email failed", err instanceof Error ? err.message : err);
  }

  return NextResponse.json({ ok: true });
}
