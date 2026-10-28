// Search engines and link-preview bots must always get the English home page (ARABIC.md).
// src/proxy.ts uses this list for that, so changing it changes redirect behaviour.
export const BOT_PATTERN = /bot|crawl|spider|slurp|archiver|facebookexternalhit|embedly|preview|lighthouse|pagespeed|headless|curl|wget/i;

// Visit tracking (src/lib/visits.ts) also ignores scripts and uptime checkers, which are not visitors.
const NON_VISITOR_PATTERN = new RegExp(
  `${BOT_PATTERN.source}|python-requests|httpclient|go-http-client|node-fetch|axios|monitor|uptime`,
  "i",
);

/** True for crawlers, scripts and anything that sends no User-Agent at all. */
export const isNonVisitor = (userAgent: string | null | undefined) => !userAgent || NON_VISITOR_PATTERN.test(userAgent);
