import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { isNonVisitor } from "@/lib/bots";
import type { Channel } from "@/lib/lead-constants";

/**
 * Cookie-free visit tracking (Firestore collection `siteVisitors`).
 *
 * Nothing is stored in the visitor's browser: no cookie, no localStorage, no sessionStorage. A
 * visitor is recognised on the server by a hash of IP + User-Agent keyed with a secret AND the
 * current UTC day, so the same person gets a different hash tomorrow and nobody can be followed
 * beyond one day. One document per visitor-day holds the journey (landing page, referrer, UTM,
 * pages and time on each) and expires after RETENTION_DAYS (set a Firestore TTL policy on `expireAt`).
 *
 * When that visitor submits the contact form, src/app/api/contact/route.ts recomputes the same hash
 * from the request and copies the journey onto the lead, so the lead keeps it after the visit
 * document has expired. The raw IP is never stored here, only on the lead.
 *
 * Geo comes from the host's edge headers (Vercel), so no visitor IP is sent to a third-party service.
 */

export type VisitPage = { p: string; at: string; s: number };
export type Utm = { source?: string; medium?: string; campaign?: string; term?: string; content?: string };

/** What one visitor-day looks like, and also the snapshot copied onto a lead. */
export type Visit = {
  day: string;
  firstSeenAt: string;
  lastSeenAt: string;
  landingPath: string;
  referrer?: string;
  channel: Channel;
  utm?: Utm;
  pageCount: number;
  pages: VisitPage[];
  activeSeconds: number;
  deviceType: DeviceType;
  browser: string;
  os: string;
  lang?: string;
  tz?: string;
  screenWidth?: number;
  country?: string;
  region?: string;
  city?: string;
};

export type DeviceType = "desktop" | "mobile" | "tablet";

/** What the server can learn from one request on its own (also stored on a lead as `client`). */
export type RequestInfo = {
  ip: string | null;
  userAgent: string;
  lang?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType: DeviceType;
  browser: string;
  os: string;
};

export type VisitEvent =
  | { kind: "view"; path: string; referrer?: string; utm?: Utm; tz?: string; screenWidth?: number }
  | { kind: "leave"; path: string; seconds: number };

// SITE_VISITORS_COLLECTION is for local end-to-end tests only (so test visits never mix with real ones).
const COLLECTION = process.env.SITE_VISITORS_COLLECTION?.trim() || "siteVisitors";
export const RETENTION_DAYS = 30;
export const MAX_PAGES = 40;
const MAX_SECONDS_PER_PAGE = 1800;
const MAX_ACTIVE_SECONDS = 6 * 3600;
const DEV_SECRET = "dev-only-visitor-secret";

// ---- Switches ----

/** The hash key. Without one in production tracking is simply off: never fall back to a guessable key. */
export function hashSecret(): string | null {
  const secret = process.env.VISITOR_HASH_SECRET?.trim();
  if (secret) return secret;
  return process.env.NODE_ENV === "production" ? null : DEV_SECRET;
}

export const trackingEnabled = () =>
  isFirebaseConfigured && process.env.VISIT_TRACKING?.trim().toLowerCase() !== "off" && hashSecret() !== null;

/** Do-Not-Track and Global Privacy Control are honoured: such visitors are not recorded at all. */
export function isOptedOut(headers: Headers): boolean {
  return headers.get("dnt") === "1" || headers.get("sec-gpc") === "1";
}

// ---- Pure helpers (unit-tested) ----

export const dayKey = (now = new Date()) => now.toISOString().slice(0, 10).replace(/-/g, "");

export function visitorHash(ip: string, userAgent: string, day: string, secret: string): string {
  return createHmac("sha256", `${secret}:${day}`).update(`${ip}|${userAgent}`).digest("hex").slice(0, 32);
}

/**
 * The visitor's address from the platform's headers. On Vercel these are set by the platform and a
 * client cannot forge them; the request body is never consulted.
 */
export function clientIp(headers: Headers): string | null {
  const candidates = [
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-real-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const raw of candidates) {
    const value = raw?.trim().replace(/^::ffff:/i, "");
    if (value && isIP(value)) return value;
  }
  return null;
}

const clean = (value: string | null | undefined, max: number) =>
  // eslint-disable-next-line no-control-regex
  value ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) || undefined : undefined;

function decodeHeader(value: string | null) {
  if (!value) return undefined;
  try {
    return clean(decodeURIComponent(value), 80);
  } catch {
    return clean(value, 80);
  }
}

export function parseUserAgent(ua: string): { browser: string; os: string; deviceType: DeviceType } {
  const browser = /edg(e|a|ios)?\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : /chrome|crios/i.test(ua)
            ? "Chrome"
            : /safari/i.test(ua)
              ? "Safari"
              : "Other";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /android/i.test(ua)
      ? "Android"
      : /iphone|ipad|ipod/i.test(ua)
        ? "iOS"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /cros/i.test(ua)
            ? "ChromeOS"
            : /linux/i.test(ua)
              ? "Linux"
              : "Other";
  const deviceType: DeviceType = /ipad|tablet|(android(?!.*mobile))/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  return { browser, os, deviceType };
}

/** Everything the server learns from a request itself: address, edge geography, language, device. */
export function describeRequest(headers: Headers): RequestInfo {
  const userAgent = clean(headers.get("user-agent"), 200) ?? "";
  const country = headers.get("x-vercel-ip-country")?.trim().toUpperCase();
  return {
    ip: clientIp(headers),
    userAgent,
    lang: headers.get("accept-language")?.match(/^[a-z]{2,3}(-[a-z0-9]{2,8})?/i)?.[0]?.toLowerCase(),
    country: country && /^[A-Z]{2}$/.test(country) ? country : undefined,
    region: clean(headers.get("x-vercel-ip-country-region"), 10),
    city: decodeHeader(headers.get("x-vercel-ip-city")),
    ...parseUserAgent(userAgent),
  };
}

const SEARCH_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|baidu|yandex|ecosia|startpage|brave|naver|qwant)\./i;
const SOCIAL_HOSTS =
  /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|x|t|youtube|youtu|pinterest|tiktok|whatsapp|wa|behance|dribbble|reddit|snapchat|telegram)\.(com|me|in|be|co|net|org)$/i;

/** Marketing channel from the UTM tags first, then from who sent the visitor. */
export function classifyChannel(utm: Utm | undefined, referrer: string | undefined, siteHost?: string): Channel {
  const medium = utm?.medium?.toLowerCase() ?? "";
  const source = utm?.source?.toLowerCase() ?? "";
  if (/^(cpc|ppc|paid|paidsearch|paid-search|paidsocial|paid-social|display|cpm|retargeting)$/.test(medium)) return "paid";
  if (medium === "email" || /^(email|newsletter|mailchimp)$/.test(source)) return "email";
  if (/^(social|social-media|sm)$/.test(medium) || SOCIAL_HOSTS.test(`${source}.com`)) return "social";
  if (medium === "organic") return "organic";

  let host: string | undefined;
  try {
    host = referrer ? new URL(referrer).hostname : undefined;
  } catch {
    host = undefined;
  }
  if (!host || (siteHost && host === siteHost)) return "direct";
  if (SEARCH_HOSTS.test(host)) return "organic";
  if (SOCIAL_HOSTS.test(host)) return "social";
  return "referral";
}

/** A page path from the client: no query or hash, always starting with "/", capped. Null when unusable. */
export function cleanPath(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const path = raw.split(/[?#]/)[0].replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120);
  return path.startsWith("/") && !path.startsWith("//") ? path : null;
}

/** Origin + path of the referring page. The query string is dropped because it can carry tokens. */
export function cleanReferrer(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return `${url.origin}${url.pathname}`.slice(0, 200);
  } catch {
    return undefined;
  }
}

export function cleanUtm(raw: Utm | undefined): Utm | undefined {
  if (!raw) return undefined;
  const utm: Utm = {};
  for (const key of ["source", "medium", "campaign", "term", "content"] as const) {
    const value = clean(raw[key], 80);
    if (value) utm[key] = value;
  }
  return Object.keys(utm).length ? utm : undefined;
}

/**
 * Applies one browser event to a visitor-day. Pure: returns the new document, or null when there is
 * nothing to write (a "leave" for a day we never saw, or a duplicate view).
 */
export function applyEvent(existing: Visit | null, event: VisitEvent, req: RequestInfo, day: string, now: Date, siteHost?: string): Visit | null {
  const at = now.toISOString();

  if (event.kind === "leave") {
    if (!existing) return null;
    const seconds = Math.max(0, Math.min(MAX_SECONDS_PER_PAGE, Math.round(event.seconds)));
    const pages = existing.pages.map((page) => ({ ...page }));
    for (let i = pages.length - 1; i >= 0; i -= 1) {
      if (pages[i].p === event.path) {
        pages[i].s = Math.min(MAX_SECONDS_PER_PAGE, pages[i].s + seconds);
        break;
      }
    }
    return { ...existing, pages, activeSeconds: Math.min(MAX_ACTIVE_SECONDS, existing.activeSeconds + seconds), lastSeenAt: at };
  }

  if (!existing) {
    const utm = cleanUtm(event.utm);
    const referrer = cleanReferrer(event.referrer);
    return {
      day,
      firstSeenAt: at,
      lastSeenAt: at,
      landingPath: event.path,
      referrer,
      channel: classifyChannel(utm, referrer, siteHost),
      utm,
      pageCount: 1,
      pages: [{ p: event.path, at, s: 0 }],
      activeSeconds: 0,
      deviceType: req.deviceType,
      browser: req.browser,
      os: req.os,
      lang: req.lang,
      tz: clean(event.tz, 64),
      screenWidth: event.screenWidth && event.screenWidth > 0 && event.screenWidth < 10000 ? Math.round(event.screenWidth) : undefined,
      country: req.country,
      region: req.region,
      city: req.city,
    };
  }

  // A double fire (e.g. React strict mode in development) is not a second page view.
  const last = existing.pages[existing.pages.length - 1];
  if (last && last.p === event.path && now.getTime() - Date.parse(last.at) < 2000) return null;

  return {
    ...existing,
    pageCount: existing.pageCount + 1,
    pages: existing.pages.length >= MAX_PAGES ? existing.pages : [...existing.pages, { p: event.path, at, s: 0 }],
    lastSeenAt: at,
  };
}

// ---- Store ----

function stripUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Records one browser event for the visitor behind this request. Returns false when nothing was recorded. */
export async function recordVisit(headers: Headers, event: VisitEvent, siteHost?: string, now = new Date()): Promise<boolean> {
  if (!trackingEnabled() || isOptedOut(headers)) return false;
  const req = describeRequest(headers);
  const secret = hashSecret();
  if (!secret || !req.ip || isNonVisitor(req.userAgent)) return false;

  const day = dayKey(now);
  const ref = adminDb().collection(COLLECTION).doc(`${day}_${visitorHash(req.ip, req.userAgent, day, secret)}`);
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const next = applyEvent(snap.exists ? (snap.data() as Visit) : null, event, req, day, now, siteHost);
    if (!next) return false;
    tx.set(ref, { ...stripUndefined(next), expireAt: new Date(now.getTime() + RETENTION_DAYS * 86_400_000) });
    return true;
  });
}

/**
 * The journey of the visitor behind this request, for copying onto a lead. Looks at today's
 * document and, only if it ended within the last two hours, yesterday's (a visit that crossed UTC
 * midnight). Never throws: a lead must not fail because tracking is down.
 */
export async function findVisitForRequest(headers: Headers, now = new Date()): Promise<Visit | null> {
  if (!trackingEnabled()) return null;
  const secret = hashSecret();
  const req = describeRequest(headers);
  if (!secret || !req.ip) return null;

  try {
    const yesterday = new Date(now.getTime() - 86_400_000);
    for (const date of [now, yesterday]) {
      const day = dayKey(date);
      const snap = await adminDb().collection(COLLECTION).doc(`${day}_${visitorHash(req.ip, req.userAgent, day, secret)}`).get();
      if (!snap.exists) continue;
      const visit = snap.data() as Visit & { expireAt?: unknown };
      delete visit.expireAt;
      if (date === now || now.getTime() - Date.parse(visit.lastSeenAt) < 2 * 3_600_000) return visit;
    }
  } catch (err) {
    console.error("[visits] could not look up the visit:", err instanceof Error ? err.message : err);
  }
  return null;
}
