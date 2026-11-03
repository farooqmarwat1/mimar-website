import "server-only";
import { createHash } from "node:crypto";
import { adminDb } from "@/lib/firebase/admin";

/**
 * What the competitor bot has learned about competitors' blog posts (Firestore collection
 * `siteCompetitorPages`): one small document per post with its title, headings and date, never the
 * article text. Weekly runs add the posts they have not read yet, newest first, so the picture
 * grows week by week. `siteBlogPlanner/competitors` remembers which posts each site features as popular.
 */

const PAGES = "siteCompetitorPages";
const FEATURED_DOC = "siteBlogPlanner/competitors";

export type CompetitorPage = {
  id: string;
  domain: string;
  url: string;
  title: string;
  h1?: string;
  description?: string;
  headings: string[];
  /** ISO. Missing when the page does not say. */
  publishedAt?: string;
  /** From the sitemap, ISO. */
  lastmod?: string;
  firstSeenAt: string;
  fetchedAt: string;
  /** The page could not be read (blocked, not HTML, no title); not retried until it is old. */
  failed?: boolean;
};

export type NewCompetitorPage = Omit<CompetitorPage, "id">;

export const pageId = (url: string) => createHash("sha1").update(url).digest("hex").slice(0, 24);

function clean<T extends object>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function listCompetitorPages(): Promise<CompetitorPage[]> {
  const snap = await adminDb().collection(PAGES).get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<CompetitorPage, "id">), id: doc.id }));
}

export async function saveCompetitorPages(pages: NewCompetitorPage[]) {
  for (let i = 0; i < pages.length; i += 400) {
    const batch = adminDb().batch();
    for (const page of pages.slice(i, i + 400)) batch.set(adminDb().collection(PAGES).doc(pageId(page.url)), clean(page));
    await batch.commit();
  }
}

/** Forgets competitors that are no longer on the list, and failed pages old enough to try again. */
export async function pruneCompetitorPages(domains: string[], now = new Date()): Promise<number> {
  const keep = new Set(domains);
  const retryBefore = now.getTime() - 30 * 86_400_000;
  const stale = (await listCompetitorPages()).filter((page) => !keep.has(page.domain) || (page.failed && Date.parse(page.fetchedAt) < retryBefore));
  for (let i = 0; i < stale.length; i += 400) {
    const batch = adminDb().batch();
    for (const page of stale.slice(i, i + 400)) batch.delete(adminDb().collection(PAGES).doc(page.id));
    await batch.commit();
  }
  return stale.length;
}

const featuredKey = (domain: string) => domain.replace(/\./g, "_");

/** Post URLs each competitor features as popular, by domain. */
export async function getFeatured(domains: string[]): Promise<Record<string, string[]>> {
  const snap = await adminDb().doc(FEATURED_DOC).get();
  const stored = (snap.get("featured") ?? {}) as Record<string, string[]>;
  return Object.fromEntries(domains.map((domain) => [domain, stored[featuredKey(domain)] ?? []]));
}

export async function setFeatured(byDomain: Record<string, string[]>) {
  const featured = Object.fromEntries(Object.entries(byDomain).map(([domain, urls]) => [featuredKey(domain), urls.slice(0, 40)]));
  await adminDb().doc(FEATURED_DOC).set({ featured, at: new Date().toISOString() }, { merge: true });
}
