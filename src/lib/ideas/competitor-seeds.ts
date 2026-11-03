/**
 * The competitor sites the "competitor gap" collector starts with, until an editor saves their own
 * list on /admin/blog/ideas (store.ts getCompetitors). Plain data, so the page can show the limit.
 *
 * Chosen from the November 2026 competitor directory (Pakistan, UAE, USA, Canada), keeping only
 * sites whose public sitemap was checked and lists real, on-topic blog posts. Left out on purpose:
 * - mass-produced city pages with no editorial value: rendimension.com, yantramstudio.com
 * - 3ds Max freebies and scripts: dubai3dmax.com
 * - no readable blog or sitemap (script-built sites, portfolio-only): omegarender.com, 3mdstudio.net,
 *   binyanstudios.com, salamviz.com, spine3d.com, notriangle.com, designblendz.com and others
 * Recheck a site on the Ideas page ("Collect ideas now" reports which sites had no blog).
 */

/** The most competitor sites that can be listed: each is read weekly. */
export const MAX_COMPETITORS = 25;

export const DEFAULT_COMPETITORS: string[] = [
  // Pakistan
  "pixarch.net",
  "tricon3d.com",
  "renderlounge.com",
  "elipsestudio.com",
  // UAE (and studios that serve it)
  "visengine.com",
  "renderatelier.com",
  "maverickframe.com",
  "therenderunit.com",
  "powerkh.com",
  "axeon-360.com",
  "renderby.com",
  "render-vision.com",
  // USA
  "pixready.com",
  "7cgi.com",
  "applet3d.com",
  "neoscape.com",
  "visualhouse.com",
  "kilograph.com",
  // Canada
  "realspace3d.com",
  "render3dquick.com",
  "archicgi.com",
];
