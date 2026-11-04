import { siteConfig } from "./site-config";
import { withTrailingSlash } from "./trailing-slash";

/**
 * Absolute URL of a page, with the old site's trailing slash: siteUrl("/about-us") ->
 * "https://mim.archi/about-us/", siteUrl("/") -> "https://mim.archi/". Use it for every page URL
 * written into the sitemap, JSON-LD, llms.txt or Search Console calls, so they match the canonical.
 * Not for files (images, PDFs): those keep their exact path anyway.
 */
export function siteUrl(path = "/"): string {
  return `${siteConfig.url}${withTrailingSlash(path.startsWith("/") ? path : `/${path}`)}`;
}
