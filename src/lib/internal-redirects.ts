/**
 * Old internal links inside the migrated WordPress articles (and the Firestore copies of them) that
 * point at a URL `next.config.mjs` redirects. Linking the final URL directly saves crawlers and
 * visitors a redirect hop (27 Nov 2026 re-audit: 13 such links).
 *
 * The redirects in next.config.mjs stay for links from other sites; a .mjs config cannot import
 * TypeScript, so this is a second copy of those destinations. tests/seo-reaudit.test.cjs checks
 * that every entry here still matches what next.config.mjs does.
 */
export const INTERNAL_REDIRECTS: Record<string, string> = {
  "/vr-360-tours": "/services/interactive-services/vr-360-tours",
  "/blog/top-7-elements-of-interior-design": "/blog/elements-in-interior-design",
  "/services/3d-visualization/renders": "/services/3d-visualization/3d-views",
  "/blog/best-ways-to-sell-your-real-estate": "/technology/best-ways-to-sell-your-real-estate",
  "/category/3d-visualization": "/blog/3d-visualization",
  "/category/technology": "/blog/real-estate-tech",
  "/category/blog/real-estate-tech": "/blog/real-estate-tech",
  "/category/meta": "/services/interactive-services/vr-360-tours",
  "/category/meta/app": "/services/interactive-services/vr-360-tours",
  "/1bed": "/tours/the360residences/one-bed",
  "/360-2bed": "/tours/the360residences/two-bed",
  "/tours/serenetower/studio-apartment": "/services/interactive-services/web-tours",
  "/profile": "/about-us",
};

/**
 * The final URL for an internal link: a known old path becomes its destination, keeping any
 * `?query` or `#hash`; everything else (external links, current pages) is returned unchanged.
 */
export function finalInternalPath(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const cut = href.search(/[?#]/);
  const path = cut === -1 ? href : href.slice(0, cut);
  const rest = cut === -1 ? "" : href.slice(cut);
  const key = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const target = INTERNAL_REDIRECTS[key];
  return target ? target + rest : href;
}
