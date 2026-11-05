import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AR_PREFIX, LANG_COOKIE } from "@/i18n/config";
import { arabicLandingCountries } from "@/i18n/geo";
import { BOT_PATTERN } from "@/lib/bots";
import { REGION_COOKIE, regionFromCountry } from "@/lib/region";
import { withTrailingSlash, withoutTrailingSlash } from "@/lib/trailing-slash";

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

  // Straight to the final URL with its trailing slash (src/lib/trailing-slash.ts), so no second hop.
  const response = NextResponse.redirect(new URL(`${AR_PREFIX}/`, request.url), 307);
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
 * Spam query strings on the home page from the old site's hack (SEO_MIGRATION.md §6):
 * "/?shop/X472359913/", "/?cate-12-1056", "/?page_id=12". Without this they render the home page
 * with a 200 and Google keeps them. Only these prefixes, so ?utm_…, ?gclid= and other real
 * queries on "/" still get the home page. Next re-encodes the query before the proxy sees it
 * ("?shop/X1/" arrives as "?shop%2FX1%2F="), so the slash is matched in both forms.
 */
const JUNK_HOME_QUERY = /^\?(?:shop(?:\/|%2F)|cate-\d|page_id=)/i;

function junkHomeQuery(url: URL) {
  if (url.pathname !== "/" || !JUNK_HOME_QUERY.test(url.search)) return null;
  return new NextResponse("Gone", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=86400" },
  });
}

/**
 * Jobs: (0) 410 for the junk home-page queries above, (1) the trailing slash: every page URL ends
 * in "/", like the old WordPress site, so a page path without it gets one 308 (SEO_MIGRATION.md §0.23; legacy URLs were already sent straight to
 * their final slash URL by next.config.ts redirects(), which run first), (2) the geo landing
 * redirect above, (3) the region cookie, and (4) the optimistic gate for the staff portal:
 * no session cookie -> sign-in page. The portal gate is a UX redirect only. The cookie is not
 * verified here; every admin page and Server Action re-verifies it with Firebase (src/lib/admin/auth.ts).
 */
export function proxy(request: NextRequest) {
  // The path exactly as requested: request.nextUrl hides the trailing slash when trailingSlash is on.
  const url = new URL(request.url);
  const gone = junkHomeQuery(url);
  if (gone) return gone;
  const slashed = withTrailingSlash(url.pathname);
  if (slashed !== url.pathname) {
    url.pathname = slashed;
    return NextResponse.redirect(url, 308);
  }
  const pathname = withoutTrailingSlash(url.pathname);

  if (pathname === "/") return arabicHomeRedirect(request) ?? withRegionCookie(request, NextResponse.next());
  if (pathname === AR_PREFIX) return withRegionCookie(request, NextResponse.next());
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) return NextResponse.next();

  // The sign-in and forgot-password pages are the only /admin pages a signed-out visitor may open.
  if (pathname === "/admin/login" || pathname === "/admin/forgot-password") return NextResponse.next();
  if (!request.cookies.has("mimar_admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Every page path, so the slash rule above can run. Skipped: files (a dot in the last segment),
  // the API, Next's assets, the proxied portal and its auth handler (src/lib/trailing-slash.ts).
  matcher: ["/((?!api(?:/|$)|_next/|portal(?:/|$)|__/|\\.well-known/|(?:.*/)?[^/]*\\.[^/]*$).*)"],
};
