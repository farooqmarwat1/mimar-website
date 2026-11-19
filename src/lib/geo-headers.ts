/**
 * Where the visitor's country and address come from.
 *
 * On Vercel the platform sets `x-vercel-ip-country` and `x-vercel-forwarded-for` itself and a client
 * cannot forge them. Behind Cloudflare (self-hosting, e.g. Hostinger) the equivalents are
 * `CF-IPCountry` and `CF-Connecting-IP`. Those are only safe to read when every request really
 * passes through Cloudflare, because anyone who finds the origin address could otherwise send them
 * by hand. So they are opt-in: set `TRUST_CF_HEADERS=1` on the server once the origin only serves
 * Cloudflare traffic. Without it, and on Vercel, behaviour is exactly as before.
 *
 * No `server-only` import: src/proxy.ts and the unit tests use this too.
 */

type HeaderReader = { get(name: string): string | null };

export function trustCloudflareHeaders(): boolean {
  return process.env.TRUST_CF_HEADERS === "1";
}

/** Two-letter country code of the request, or null. Cloudflare's "XX" (unknown) and "T1" (Tor) count as none. */
export function requestCountry(headers: HeaderReader): string | null {
  const raw = headers.get("x-vercel-ip-country") ?? (trustCloudflareHeaders() ? headers.get("cf-ipcountry") : null);
  const code = raw?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) && code !== "XX" && code !== "T1" ? code : null;
}

/** The visitor address Cloudflare saw, only when Cloudflare headers are trusted. */
export function cloudflareClientIp(headers: HeaderReader): string | null {
  return trustCloudflareHeaders() ? headers.get("cf-connecting-ip") : null;
}
