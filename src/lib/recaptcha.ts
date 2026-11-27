import "server-only";

/**
 * Invisible Google reCAPTCHA v2 (no checkbox) for every public form: the contact form,
 * the "Get a quote" pop-up and the careers application.
 *
 * Environment:
 * - NEXT_PUBLIC_RECAPTCHA_SITE_KEY  public, inlined into the browser bundle at BUILD time.
 * - RECAPTCHA_SECRET_KEY            server only.
 * Keys come from https://www.google.com/recaptcha/admin (type: v2 "Invisible reCAPTCHA badge"), with every
 * hostname the forms run on (mim.archi, www.mim.archi, the Hostinger test domain, localhost).
 *
 * Fails closed in production: with no secret, or with Google unreachable, a submission is refused
 * rather than let through unchecked. In development without keys the check is skipped so the forms
 * can still be worked on.
 */

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export type RecaptchaResult =
  | { ok: true }
  // Google answered and said no (bad, expired or already-used token).
  | { ok: false; reason: "rejected"; codes: string[] }
  // We could not get an answer at all (network error, timeout, 5xx).
  | { ok: false; reason: "unreachable" };

/** Checks one token with Google. Tokens are single-use and expire after two minutes. */
export async function verifyRecaptcha(token: string, secret: string, ip?: string): Promise<RecaptchaResult> {
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { ok: false, reason: "unreachable" };

    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    return data.success === true ? { ok: true } : { ok: false, reason: "rejected", codes: data["error-codes"] ?? [] };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

export type HumanCheck = { ok: true } | { ok: false; status: number; error: string };

/**
 * The whole bot check for a form endpoint: decides what to do with a missing secret, a missing token
 * and Google's answer. `tag` prefixes the log lines ("[contact]", "[apply]"); `fallbackEmail` is the
 * address a visitor is told to write to when the check itself cannot run.
 */
export async function checkHuman(token: string | undefined, ip: string, tag: string, fallbackEmail: string): Promise<HumanCheck> {
  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(`${tag} RECAPTCHA_SECRET_KEY is not set - refusing submissions without a bot check`);
      return { ok: false, status: 503, error: `We couldn't send your message right now. Please email us at ${fallbackEmail} instead.` };
    }
    // Local development without keys: don't block working on the forms.
    console.warn(`${tag} RECAPTCHA_SECRET_KEY is not set - skipping the bot check in development`);
    return { ok: true };
  }

  const notHuman = { ok: false as const, status: 400, error: "We couldn't confirm you're not a robot. Please try again." };
  if (!token) return notHuman;

  const result = await verifyRecaptcha(token, secret, ip);
  if (result.ok) return { ok: true };
  if (result.reason === "unreachable") {
    console.error(`${tag} Could not reach Google reCAPTCHA to verify a submission`);
    return {
      ok: false,
      status: 503,
      error: `We couldn't verify that you're human right now. Please try again, or email us at ${fallbackEmail}.`,
    };
  }
  return { ...notHuman, status: 403 };
}
