import nodemailer from "nodemailer";
import { Resend } from "resend";

export type OutgoingEmail = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  headers?: Record<string, string>;
};

export type Mailer = {
  name: "smtp" | "resend";
  /** Sender to use when CONTACT_FROM_EMAIL is not set. */
  defaultFrom: string;
  /** Resolves once the message is accepted; throws with a loggable message otherwise. */
  send: (email: OutgoingEmail) => Promise<void>;
};

// `||`, not `??`: a blank value copied from .env.example should count as unset.
function env(name: string) {
  return process.env[name]?.trim() || undefined;
}

/**
 * Picks how the contact form sends email:
 * 1. SMTP, when SMTP_HOST, SMTP_USER and SMTP_PASS are all set - the studio's
 *    own mailbox (contact@contact.mim.archi on Titan: smtp.titan.email, 465).
 * 2. Resend, when RESEND_API_KEY is set.
 * Returns null when neither is configured.
 */
export function getMailer(): Mailer | null {
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");

  if (host && user && pass) {
    const port = Number(env("SMTP_PORT") ?? 465);
    // Port 465 is implicit TLS; 587 and 25 upgrade with STARTTLS instead.
    const secure = env("SMTP_SECURE") ? env("SMTP_SECURE") === "true" : port === 465;
    const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

    return {
      name: "smtp",
      // Most SMTP servers, Titan included, only send as the signed-in mailbox.
      defaultFrom: `Mimar Studios Website <${user}>`,
      send: async (email) => {
        await transport.sendMail(email);
      },
    };
  }

  const apiKey = env("RESEND_API_KEY");
  if (apiKey) {
    const resend = new Resend(apiKey);
    return {
      name: "resend",
      defaultFrom: "Mimar Studios Website <site@mim.archi>",
      send: async (email) => {
        const { error } = await resend.emails.send(email);
        if (error) throw new Error(`${error.name}: ${error.message}`);
      },
    };
  }

  return null;
}
