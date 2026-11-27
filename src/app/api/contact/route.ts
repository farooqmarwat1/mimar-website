import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildConfirmationEmail, buildLeadEmail } from "@/lib/contact-email";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import type { MailStatus } from "@/lib/lead-constants";
import { createLead, setMailStatus } from "@/lib/leads";
import { getMailer } from "@/lib/mailer";
import { describeRequest, findVisitForRequest } from "@/lib/visits";
import { checkHuman } from "@/lib/recaptcha";
import { checkRateLimit } from "@/lib/rate-limit";
import { contact, services } from "@/lib/site-config";

/**
 * Enquiry endpoint for both website forms: the contact page form (formType "contact") and the
 * "Get a quote" pop-up (formType "quote", src/components/quote/QuoteModal.tsx).
 *
 * Abuse protection, in the order a request meets it:
 * 1. Per-IP rate limits (src/lib/rate-limit.ts), before any parsing.
 * 2. Zod validates and caps every field server-side (never trust client input).
 * 3. A hidden honeypot field that real users never fill in.
 * 4. Invisible Google reCAPTCHA v2 (src/lib/recaptcha.ts). Fails
 *    closed in production; skipped in development when no keys are set.
 * 5. A per-email-address limit, so one address can't be flooded with our
 *    confirmation emails. It runs after the bot check, so only verified humans count.
 *
 * Storage: each valid submission is first saved as a lead in Firestore (shown
 * in /admin/leads), so an email that lands in spam - or fails to send - never
 * loses the enquiry. A failed save never blocks the email.
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
 * - NEXT_PUBLIC_RECAPTCHA_SITE_KEY / RECAPTCHA_SECRET_KEY  the bot check (required in production).
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (optional) shared counters
 *                         so the rate limits hold across serverless instances.
 */

// `||`, not `??`: a blank value copied from .env.example should count as unset.
const TO = process.env.CONTACT_TO_EMAIL?.trim() || contact.email;

/** The English service titles, the only values the service fields accept. */
const SERVICE_TITLES = new Set(services.map((service) => service.title));

const ContactSchema = z
  .object({
    // Which form sent it. Older cached contact pages don't send it.
    formType: z.enum(["contact", "quote"]).catch("contact"),
    // The contact page sends first and last name; the quote pop-up sends one `name`.
    firstName: z.string().trim().max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
    name: z.string().trim().max(160).optional(),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    service: z.string().trim().max(80).optional(),
    // Quote pop-up: every service ticked. Unknown values are dropped, not rejected.
    services: z
      .array(z.string().trim().max(80))
      .max(20)
      .optional()
      .transform((list) => [...new Set((list ?? []).filter((title) => SERVICE_TITLES.has(title)))]),
    // Quote pop-up: the visitor's company. Named `organisation` because `company` is the honeypot.
    organisation: z.string().trim().max(120).optional(),
    source: z.string().trim().max(80).optional(),
    message: z.string().trim().min(1).max(5000),
    // "I agree to the Terms of Use and Privacy Policy" must be ticked.
    consent: z.literal(true),
    // The site language the form was filled in on (older cached pages don't send it).
    lang: z.enum(["en", "ar"]).optional().catch(undefined),
    // Google reCAPTCHA v2 token.
    recaptchaToken: z.string().max(4000).optional(),
    // Honeypot field - real users never fill this in. Deliberately accepted here
    // (not rejected by the schema) so the handler can answer a bot with a quiet
    // "ok" instead of an error that reveals which field gave it away.
    company: z.string().max(500).optional(),
  })
  .transform((data) => {
    // One "name" field is split at the first space: "Sara Al Harbi" -> "Sara" + "Al Harbi".
    if (data.name) {
      const [first = "", ...rest] = data.name.split(/\s+/);
      return { ...data, firstName: first, lastName: rest.join(" ") };
    }
    return { ...data, firstName: data.firstName ?? "", lastName: data.lastName ?? "" };
  })
  .refine((data) => data.firstName.length > 0, { path: ["firstName"], message: "Required" })
  // The contact page form asks for both names; the quote pop-up has one name field.
  .refine((data) => data.formType === "quote" || data.lastName.length > 0, { path: ["lastName"], message: "Required" });

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

  // Bot check. Fails closed in production: with no secret configured, or with
  // Google unreachable, we refuse rather than let unchecked traffic through.
  const human = await checkHuman(parsed.data.recaptchaToken, ip, "[contact]", contact.email);
  if (!human.ok) return NextResponse.json({ error: human.error }, { status: human.status });

  // Per-address quota (hashed: the key may live in Redis, and it needs no
  // readable email in it). Runs after the bot check, so only verified humans
  // count against an address.
  const emailHash = createHash("sha256").update(parsed.data.email.toLowerCase()).digest("hex");
  const emailLimit = await checkRateLimit([{ key: `contact:email:${emailHash}`, ...EMAIL_HOURLY }]);
  if (!emailLimit.allowed) return tooManyRequests(emailLimit.retryAfterSec);

  // The quote pop-up can tick several services; `service` keeps them joined for the
  // existing lead list, search and email subject.
  const isQuote = parsed.data.formType === "quote";
  const service = isQuote ? parsed.data.services.join(", ") || undefined : parsed.data.service;
  const enquiry = { ...parsed.data, service };

  // Save the lead before anything can go wrong with the email. The admin portal
  // is then the source of truth; the studio email is just the notification.
  let leadId: string | null = null;
  if (isFirebaseConfigured) {
    try {
      leadId = await createLead({
        firstName: enquiry.firstName,
        lastName: enquiry.lastName,
        email: enquiry.email,
        phone: enquiry.phone,
        service,
        source: enquiry.source,
        message: enquiry.message,
        lang: enquiry.lang,
        formType: enquiry.formType,
        services: isQuote ? enquiry.services : undefined,
        organisation: isQuote ? enquiry.organisation : undefined,
        consent: enquiry.consent,
        // From the request itself (platform headers, never the body): address, geography, language, device.
        client: describeRequest(req.headers),
        // The visitor's journey today, matched by the daily hash. Null when tracking saw nothing
        // (Do-Not-Track, an ad blocker, a bot) - the lead is still saved with the request details above.
        visit: await findVisitForRequest(req.headers),
      });
    } catch (err) {
      // Log the reason only - never the visitor's details. The email below still goes out.
      console.error("[contact] Could not save the lead", err instanceof Error ? err.message : err);
    }
  }
  const markMail = async (status: MailStatus) => {
    if (!leadId) return;
    try {
      await setMailStatus(leadId, status);
    } catch (err) {
      console.error("[contact] Could not record the email status", err instanceof Error ? err.message : err);
    }
  };

  const mailer = getMailer();
  if (!mailer) {
    await markMail("skipped");
    if (process.env.NODE_ENV === "production" && !leadId) {
      console.error("[contact] Neither SMTP nor RESEND_API_KEY is set - a lead was NOT delivered");
      return NextResponse.json(DELIVERY_FAILED, { status: 503 });
    }
    // Saved in /admin/leads (or local development without credentials): the visitor's message is not lost.
    console.warn("[contact] Neither SMTP nor RESEND_API_KEY is set - skipping the email");
    return NextResponse.json({ ok: true });
  }

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom;
  const lead = buildLeadEmail(enquiry);

  // 1) The studio notification: if it fails and the lead is not saved either,
  //    the lead is lost, so tell the visitor. A saved lead is safe in /admin/leads.
  try {
    await mailer.send({
      from,
      to: TO,
      replyTo: parsed.data.email,
      subject: lead.subject,
      text: lead.text,
      html: lead.html,
    });
    await markMail("sent");
  } catch (err) {
    // Log the reason only - never the visitor's details.
    console.error(`[contact] Sending via ${mailer.name} failed`, err instanceof Error ? err.message : err);
    await markMail("failed");
    if (leadId) return NextResponse.json({ ok: true });
    return NextResponse.json(DELIVERY_FAILED, { status: 502 });
  }

  // 2) Confirmation to the visitor. Sent only after the studio copy went out
  //    (never confirm something we didn't receive), and a failure here must not
  //    fail the form - the lead is already safely delivered, so just log it.
  const confirmation = buildConfirmationEmail(enquiry, TO);
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
