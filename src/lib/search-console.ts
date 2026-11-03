import "server-only";
import { createSign } from "node:crypto";
import { trimRows, type KeywordRow } from "@/lib/ai/keyword-plan";
import { adminDb } from "@/lib/firebase/admin";
import { resolveCredentials, type ServiceCredentials } from "@/lib/firebase/credentials";

/**
 * Google Search Console (read-only): which searches mim.archi appears for, by country, and how
 * each blog post does in Google. Used by the topic planner (keyword-plan.ts) and the blog
 * performance report.
 *
 * Signs in as a service account with a self-signed JWT (no extra dependency). By default it is the
 * Firebase service account; GSC_CLIENT_EMAIL / GSC_PRIVATE_KEY use another one. Either way that
 * account's email must be added as a user of the property in Search Console, and the Search Console
 * API must be enabled in its Google Cloud project. GSC_SITE_URL is the property, e.g. sc-domain:mim.archi.
 */

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CACHE_DOC = "siteBlogPlanner/keywords";
const CACHE_MS = 24 * 3_600_000;
/** Search Console data is complete after about three days. */
export const GSC_LAG_DAYS = 3;

function credentials(): ServiceCredentials | null {
  const ownKey = process.env.GSC_PRIVATE_KEY?.trim();
  const result = resolveCredentials(
    ownKey
      ? { projectId: "search-console", clientEmail: process.env.GSC_CLIENT_EMAIL, privateKey: ownKey }
      : { projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY },
  );
  return result.ok ? result.credentials : null;
}

const siteUrl = () => process.env.GSC_SITE_URL?.trim() || "";

export const searchConsoleConfigured = () => Boolean(siteUrl() && credentials());

/** The service account to add as a user in Search Console (for setup messages). */
export const searchConsoleAccount = () => credentials()?.clientEmail ?? "";

let token: { value: string; expiresAt: number } | null = null;

async function accessToken(): Promise<string> {
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  const creds = credentials();
  if (!creds) throw new Error("Search Console credentials are not configured.");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: creds.clientEmail, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(creds.privateKey).toString("base64url");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Search Console sign-in failed (HTTP ${response.status}).`);
  const json = (await response.json()) as { access_token: string; expires_in: number };
  token = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return token.value;
}

type ApiRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function query(body: object): Promise<ApiRow[]> {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl())}/searchAnalytics/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (response.status === 403) {
    throw new Error(`Search Console refused access. Add ${searchConsoleAccount()} as a user of ${siteUrl()} in Search Console, and enable the Search Console API in Google Cloud.`);
  }
  if (!response.ok) throw new Error(`Search Console request failed (HTTP ${response.status}).`);
  return ((await response.json()) as { rows?: ApiRow[] }).rows ?? [];
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const daysAgo = (days: number, from = new Date()) => new Date(from.getTime() - days * 86_400_000);

function pathOf(page: string): string {
  try {
    return new URL(page).pathname;
  } catch {
    return page;
  }
}

/** Search x country x page for the last `days` days, trimmed to the target countries. */
export async function fetchKeywordRows(days = 90): Promise<KeywordRow[]> {
  const end = daysAgo(GSC_LAG_DAYS);
  const rows = await query({
    startDate: isoDay(daysAgo(days, end)),
    endDate: isoDay(end),
    dimensions: ["query", "country", "page"],
    rowLimit: 25000,
  });
  return trimRows(
    rows.map((row) => ({
      query: row.keys?.[0] ?? "",
      country: row.keys?.[1] ?? "",
      page: pathOf(row.keys?.[2] ?? ""),
      clicks: row.clicks,
      impressions: row.impressions,
      position: Math.round(row.position * 10) / 10,
    })),
  );
}

/**
 * The keyword rows for the planner, cached in Firestore for a day. An empty list when Search
 * Console is not configured; errors are thrown so the caller can log them and fall back.
 */
export async function getKeywordRows(): Promise<KeywordRow[]> {
  if (!searchConsoleConfigured()) return [];
  const ref = adminDb().doc(CACHE_DOC);
  const cached = await ref.get();
  if (cached.exists && Date.now() - Date.parse(cached.get("fetchedAt") ?? "") < CACHE_MS) return (cached.get("rows") ?? []) as KeywordRow[];
  const rows = await fetchKeywordRows();
  await ref.set({ fetchedAt: new Date().toISOString(), site: siteUrl(), rows });
  return rows;
}

export type PageStats = { clicks: number; impressions: number; ctr: number; position: number };

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Google totals for one article path, English and Arabic together, between two YYYY-MM-DD days. */
export async function fetchPageStats(path: string, startDate: string, endDate: string): Promise<PageStats> {
  const [row] = await query({
    startDate,
    endDate,
    dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "includingRegex", expression: `^https?://[^/]+(/ar)?${escapeRegex(path)}/?$` }] }],
  });
  return row ? { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: Math.round(row.position * 10) / 10 } : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
}

/** The last day Search Console has complete data for. */
export const latestCompleteDay = (now = new Date()) => isoDay(daysAgo(GSC_LAG_DAYS, now));

// ---- Where an article ranks, and whether it is in Google at all (blog-results.ts) --------

export type KeywordPosition = {
  /** Impression-weighted average position for the keyword, all countries. */
  position: number;
  clicks: number;
  impressions: number;
  /** The same in the target country (Search Console's lowercase alpha-3 code), or null when it had no impressions there. */
  countryPosition: number | null;
};

/** Search Console rows of one keyword by country -> overall and target-country position. Null when Google never showed the page for it. */
export function keywordPositionFromRows(rows: { keys?: string[]; clicks: number; impressions: number; position: number }[], country?: string): KeywordPosition | null {
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  if (!impressions) return null;
  const round = (value: number) => Math.round(value * 10) / 10;
  const local = country ? rows.find((row) => row.keys?.[0] === country && row.impressions > 0) : undefined;
  return {
    position: round(rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions),
    clicks: rows.reduce((sum, row) => sum + row.clicks, 0),
    impressions,
    countryPosition: local ? round(local.position) : null,
  };
}

/**
 * Where an article (English and Arabic pages together) ranked for the exact keyword it was written for,
 * between two YYYY-MM-DD days. `country` is the target market's Search Console code ("are", "sau").
 */
export async function fetchKeywordPosition(path: string, keyword: string, startDate: string, endDate: string, country?: string): Promise<KeywordPosition | null> {
  const rows = await query({
    startDate,
    endDate,
    dimensions: ["country"],
    dimensionFilterGroups: [
      {
        filters: [
          { dimension: "page", operator: "includingRegex", expression: `^https?://[^/]+(/ar)?${escapeRegex(path)}/?$` },
          { dimension: "query", operator: "equals", expression: keyword.trim().toLowerCase() },
        ],
      },
    ],
    rowLimit: 250,
  });
  return keywordPositionFromRows(rows, country);
}

export type IndexStatus = {
  /** True when Google has the page in its index ("PASS"). */
  indexed: boolean;
  /** Google's own words, e.g. "Submitted and indexed", "Crawled - currently not indexed". */
  coverage: string;
  /** ISO, when Google last crawled it, if it has. */
  lastCrawl?: string;
};

/** The URL Inspection API's answer, reduced to what the approaches report needs. */
export function indexStatusFromInspection(json: unknown): IndexStatus {
  const result = (json as { inspectionResult?: { indexStatusResult?: { verdict?: string; coverageState?: string; lastCrawlTime?: string } } })?.inspectionResult?.indexStatusResult;
  return { indexed: result?.verdict === "PASS", coverage: result?.coverageState || result?.verdict || "Unknown", lastCrawl: result?.lastCrawlTime || undefined };
}

/** Whether Google has indexed a live URL, from Search Console's URL Inspection API (free, 2,000 a day per site). */
export async function inspectUrl(url: string): Promise<IndexStatus> {
  const response = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { authorization: `Bearer ${await accessToken()}`, "content-type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: siteUrl(), languageCode: "en-US" }),
    cache: "no-store",
  });
  if (response.status === 403) {
    throw new Error(`Search Console refused the URL inspection. Add ${searchConsoleAccount()} as a user of ${siteUrl()} in Search Console.`);
  }
  if (!response.ok) throw new Error(`URL inspection failed (HTTP ${response.status}).`);
  return indexStatusFromInspection(await response.json());
}
