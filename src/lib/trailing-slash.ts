/**
 * Page URLs end in a slash, like the old WordPress site (/about-us/), so every URL Google
 * already knows keeps working as-is (SEO_MIGRATION.md §0.23). This file has no imports so
 * next.config.ts, the proxy and client components can all use it.
 */

/**
 * Paths that are not pages and keep their exact form: APIs, the proxied portal and auth (the
 * portal app does not use slashes, so adding one would loop), the staff portal, Next's assets.
 */
export const NO_SLASH_PREFIX = /^\/(?:api|_next|portal|__|admin|\.well-known)(?:\/|$)/;

/**
 * Adds the trailing slash to an internal page path: "/about-us" -> "/about-us/",
 * "/blog?page=2" -> "/blog/?page=2", "/ar" -> "/ar/". Leaves alone external and protocol
 * links, "#hash" links, files ("/logo.png", "/llms.txt") and the NO_SLASH_PREFIX paths.
 */
export function withTrailingSlash(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? "" : href.slice(cut);
  if (path.endsWith("/") || NO_SLASH_PREFIX.test(path)) return href;
  if (path.slice(path.lastIndexOf("/") + 1).includes(".")) return href;
  return `${path}/${rest}`;
}

/** The path without its trailing slash ("/" stays "/"), for comparing pathnames. */
export function withoutTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.replace(/\/+$/, "") || "/" : path;
}
