// TURNSTILE-DISABLED (no Cloudflare access yet): not imported anywhere right now. Kept ready for when
// the Cloudflare checkbox is switched on (see TURNSTILE-DISABLED in the contact form).
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true }
  // Cloudflare answered and said no (bad, expired or already-used token).
  | { ok: false; reason: "rejected"; codes: string[] }
  // We could not get an answer at all (network error, timeout, 5xx).
  | { ok: false; reason: "unreachable" };

/**
 * Validates a Turnstile token server-side. The token the browser sends is only
 * a claim - nothing is verified until Cloudflare confirms it here, with the
 * secret key. Tokens are single-use and expire after 5 minutes.
 */
export async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<TurnstileResult> {
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
