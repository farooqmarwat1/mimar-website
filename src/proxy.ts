import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AR_PREFIX, LANG_COOKIE } from "@/i18n/config";
import { arabicLandingCountries } from "@/i18n/geo";
import { REGION_COOKIE, regionFromCountry } from "@/lib/region";

// Search engines and link-preview bots must always get the English home page (ARABIC.md).
const BOT_PATTERN = /bot|crawl|spider|slurp|archiver|facebookexternalhit|embedly|preview|lighthouse|pagespeed|headless|curl|wget/i;

/**
 * First visit to the home page from an Arabic-speaking country (not the UAE) -> /ar.
 * Deliberately narrow: only "/" , only first-time human visitors, 307 (temporary) and uncacheable.
 * Never redirected: bots, anyone who already picked a language with the header switcher
 * (LANG_COOKIE), anyone clicking through from another page of this site, and deep links.
 */
function arabicHomeRedirect(request: NextRequest) {
  if (request.cookies.has(LANG_COOKIE)) return null;
  if (BOT_PATTERN.test(request.headers.get("user-agent") ?? "")) return null;

  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (!country || !arabicLandingCountries.has(country)) return null;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      if (new URL(referer).host === request.nextUrl.host) return null;
    } catch {
      /* malformed referer: ignore it */
    }
  }

  const response = NextResponse.redirect(new URL(AR_PREFIX, request.url), 307);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

/**
 * Stores the visitor's region in a cookie for the home-page tagline and tab title (src/lib/region.ts).
 * Never for bots, so crawlers and the Googlebot renderer always get the default copy. The cookie is
 * rewritten from the country header on every request, so it cannot be spoofed in production. Without
 * the header (local development) a hand-set cookie is left alone, which is how regions are tested.
 */
function withRegionCookie(request: NextRequest, response: NextResponse) {
  const human = !BOT_PATTERN.test(request.headers.get("user-agent") ?? "");
  const country = request.headers.get("x-vercel-ip-country");
  if (!country && process.env.NODE_ENV !== "production") return response;

  const region = human ? regionFromCountry(country) : null;
  if (region) {
    response.cookies.set(REGION_COOKIE, region, { path: "/", sameSite: "lax" });
  } else if (request.cookies.has(REGION_COOKIE)) {
    response.cookies.delete(REGION_COOKIE);
  }
  return response;
}

/**
 * Jobs: (1) the geo landing redirect above, (2) the region cookie, and (3) the optimistic gate for the staff portal:
 * no session cookie -> sign-in page. The portal gate is a UX redirect only. The cookie is not
 * verified here; every admin page and Server Action re-verifies it with Firebase (src/lib/admin/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") return arabicHomeRedirect(request) ?? withRegionCookie(request, NextResponse.next());
  if (pathname === "/ar") return withRegionCookie(request, NextResponse.next());

  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("mimar_admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/ar", "/admin", "/admin/:path*"],
};
