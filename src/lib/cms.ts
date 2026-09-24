import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import { projects as fallbackProjects, services as fallbackServices, type Project, type Service } from "./site-config";

/**
 * Headless CMS layer (Sanity).
 *
 * The site works with zero CMS configuration out of the box - every fetcher
 * below falls back to the seed data in `site-config.ts` when Sanity env vars
 * aren't set. This means the site is deployable immediately, and editors can
 * be handed a real Sanity Studio later without any code changes on the
 * frontend.
 *
 * Required env vars once a real project is connected (see .env.example):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_READ_TOKEN (only needed for drafts / private datasets)
 */

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = "2025-01-01";

export const isCmsConfigured = Boolean(projectId);

let client: SanityClient | null = null;
if (isCmsConfigured) {
  client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_READ_TOKEN,
    perspective: process.env.SANITY_API_READ_TOKEN ? "previewDrafts" : "published",
  });
}

export function urlFor(source: unknown) {
  if (!client) return null;
  return imageUrlBuilder(client).image(source as never);
}

const projectPriority = [
  "faisal-town-ii",
  "hmr",
  "the-garden-residences",
  "360-residences",
  "amer-al-ghurair",
  "h-and-s",
];

function orderProjects(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const aIndex = projectPriority.indexOf(a.slug);
    const bIndex = projectPriority.indexOf(b.slug);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

/**
 * Generic safe query wrapper - logs and falls back rather than breaking the
 * build if the CMS is unreachable or misconfigured.
 */
async function safeFetch<T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> {
  if (!client) return fallback;
  try {
    const result = await client.fetch<T>(query, params, { cache: "force-cache", next: { revalidate: 300 } } as never);
    return result ?? fallback;
  } catch (err) {
    console.error("[cms] query failed, using fallback content:", err);
    return fallback;
  }
}

export async function getProjects(): Promise<Project[]> {
  const projects = await safeFetch<Project[]>(
    `*[_type == "project"] | order(order asc){ slug, title, category, summary, cover, featured, year, location, span, gallery }`,
    {},
    fallbackProjects,
  );
  return orderProjects(projects);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const all = await getProjects();
  return safeFetch<Project | undefined>(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug },
    all.find((p) => p.slug === slug),
  );
}

export async function getServices(): Promise<Service[]> {
  return safeFetch<Service[]>(
    `*[_type == "service"] | order(order asc){ slug, title, short, description }`,
    {},
    fallbackServices,
  );
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const all = await getServices();
  return safeFetch<Service | undefined>(
    `*[_type == "service" && slug.current == $slug][0]`,
    { slug },
    all.find((s) => s.slug === slug),
  );
}

/** Page-level SEO/GEO override document, keyed by route. */
export type PageSeo = {
  route: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keyFacts?: string[];
  faqs?: { question: string; answer: string }[];
};

export async function getPageSeo(route: string): Promise<PageSeo | undefined> {
  return safeFetch<PageSeo | undefined>(
    `*[_type == "pageSeo" && route == $route][0]`,
    { route },
    undefined,
  );
}
