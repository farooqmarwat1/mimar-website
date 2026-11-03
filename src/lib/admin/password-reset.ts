import "server-only";
import type { Auth } from "firebase-admin/auth";
import { isAdminRole } from "@/lib/admin/auth";
import { escapeHtml } from "@/lib/contact-email";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";
import { getMailer, type Mailer } from "@/lib/mailer";
import { contact } from "@/lib/site-config";

/**
 * Password reset for the staff portal.
 *
 * Who gets a link: only a real, enabled STAFF account (one carrying a `role` claim). The Firebase project is
 * shared with the CRM portal, so its users must not be able to reset their passwords through this form.
 * Anyone else - an unknown address, a CRM user, a disabled account - gets nothing, and the caller shows the
 * same message either way so the form never reveals whether an address belongs to staff.
 *
 * How it is sent: the link is generated with the Admin SDK and emailed from the studio mailbox (the same
 * SMTP / Resend setup as the contact form), which lands in inboxes far more reliably than Firebase's own
 * noreply sender. If the studio mailer is missing or fails, it falls back to Firebase's own reset email.
 *
 * The link opens Firebase's hosted "choose a new password" page. Changing the password revokes every existing
 * session of that account (the portal verifies sessions with revocation checks).
 */

export type ResetOutcome = "sent" | "skipped";

export type ResetDeps = {
  auth?: Pick<Auth, "getUserByEmail" | "generatePasswordResetLink">;
  mailer?: Mailer | null;
  fetchImpl?: typeof fetch;
  webApiKey?: string;
};

export function buildPasswordResetEmail(link: string) {
  const subject = "Reset your Mimar staff portal password";
  const text = [
    "Hello,",
    "",
    "Someone asked to reset the password for your Mimar Studios staff portal account. Use this link to choose a new one:",
    "",
    link,
    "",
    "The link works once and expires in about an hour. If you did not ask for this, ignore this email: your password stays as it is.",
    "",
    "Mimar Studios",
  ].join("\n");

  const safeLink = escapeHtml(link);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#111">
<p>Hello,</p>
<p>Someone asked to reset the password for your Mimar Studios staff portal account. Use the button below to choose a new one.</p>
<p style="margin:24px 0"><a href="${safeLink}" style="background:#0e0f12;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;display:inline-block">Choose a new password</a></p>
<p style="color:#555;font-size:13px">If the button does not work, paste this link into your browser:<br><span style="word-break:break-all">${safeLink}</span></p>
<p style="color:#555;font-size:13px">The link works once and expires in about an hour. If you did not ask for this, ignore this email: your password stays as it is.</p>
<p style="margin-top:24px">Mimar Studios</p>
</div>`;

  return { subject, text, html };
}

/** Firebase's own reset email, used only when the studio mailer is unavailable. */
async function sendViaFirebase(email: string, fetchImpl: typeof fetch, webApiKey: string | undefined): Promise<boolean> {
  if (!webApiKey) return false;
  try {
    const res = await fetchImpl(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(webApiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sends a reset link to a staff account. Never throws and never says why it did not send: the caller answers
 * the visitor identically in every case. `skipped` is for logs and tests only.
 */
export async function sendStaffPasswordReset(email: string, deps: ResetDeps = {}): Promise<ResetOutcome> {
  if (!deps.auth && !isFirebaseConfigured) return "skipped";
  try {
    const auth = deps.auth ?? adminAuth();

    let user;
    try {
      user = await auth.getUserByEmail(email);
    } catch {
      return "skipped"; // no such account
    }
    if (user.disabled || !isAdminRole(user.customClaims?.role)) return "skipped"; // not staff

    // Looked up only when the Firebase fallback actually runs.
    const fetchImpl: typeof fetch = deps.fetchImpl ?? ((...args) => fetch(...args));
    const webApiKey = deps.webApiKey ?? process.env.FIREBASE_WEB_API_KEY?.trim();
    const mailer = deps.mailer === undefined ? getMailer() : deps.mailer;

    if (mailer) {
      try {
        const link = await auth.generatePasswordResetLink(email);
        const message = buildPasswordResetEmail(link);
        await mailer.send({
          from: process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom,
          to: email,
          replyTo: contact.email,
          subject: message.subject,
          text: message.text,
          html: message.html,
          headers: { "Auto-Submitted": "auto-generated" },
        });
        return "sent";
      } catch (err) {
        // Reason only - never the address or the link.
        console.error("[admin] password reset email failed, trying Firebase's own email:", err instanceof Error ? err.message : err);
      }
    }

    if (await sendViaFirebase(email, fetchImpl, webApiKey)) return "sent";
    console.error("[admin] could not send a password reset email (no working mailer and no Firebase fallback)");
    return "skipped";
  } catch (err) {
    console.error("[admin] password reset failed:", err instanceof Error ? err.message : err);
    return "skipped";
  }
}
