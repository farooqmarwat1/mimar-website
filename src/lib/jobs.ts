import "server-only";
import { unstable_cache } from "next/cache";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import type { ContentBlock } from "@/lib/content-blocks";

/**
 * Job postings (Firestore collection `jobs`), edited in /admin/jobs and shown
 * on /careers. Public reads are cached under the `jobs` tag and refreshed
 * immediately by the admin actions; with Firebase unconfigured (or down) they
 * return [] so /careers falls back to its "no open roles" copy.
 *
 * Dates are ISO strings, not Firestore Timestamps, so documents are plain JSON
 * and safe to cache and pass to client components.
 */

export const JOB_STATUSES = ["draft", "open", "closed"] as const;
export const WORK_MODES = ["onsite", "hybrid", "remote"] as const;
export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship", "temporary"] as const;
export const APPLY_METHODS = ["email", "url"] as const;
export const SALARY_PERIODS = ["hour", "day", "week", "month", "year"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type WorkMode = (typeof WORK_MODES)[number];
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type ApplyMethod = (typeof APPLY_METHODS)[number];

export type Job = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  /** ISO 3166-1 alpha-2, e.g. "PK". Used for schema.org addressCountry. */
  country: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  experienceLevel?: string;
  salary?: { min?: number; max?: number; currency: string; period: (typeof SALARY_PERIODS)[number] };
  summary: string;
  blocks: ContentBlock[];
  applyMethod: ApplyMethod;
  applyEmail?: string;
  applyUrl?: string;
  status: JobStatus;
  postedAt?: string;
  validThrough?: string;
  updatedAt: string;
  updatedBy: string;
};

const COLLECTION = "siteJobs";
export const JOBS_TAG = "jobs";

function fromDoc(id: string, data: FirebaseFirestore.DocumentData): Job {
  return { ...(data as Omit<Job, "id">), id };
}

/** Is this job publicly listable right now (open, and not past its closing date)? */
export function isJobLive(job: Job, now = new Date()): boolean {
  if (job.status !== "open") return false;
  if (job.validThrough && new Date(`${job.validThrough}T23:59:59Z`) < now) return false;
  return true;
}

const newestFirst = (a: Job, b: Job) => (b.postedAt ?? "").localeCompare(a.postedAt ?? "");

const cachedOpenJobs = unstable_cache(
  async () => {
    const snap = await adminDb().collection(COLLECTION).where("status", "==", "open").get();
    return snap.docs.map((doc) => fromDoc(doc.id, doc.data())).sort(newestFirst);
  },
  ["jobs:open"],
  { tags: [JOBS_TAG], revalidate: 3600 },
);

/** Open, unexpired jobs for the public site. Never throws. */
export async function getOpenJobs(): Promise<Job[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const jobs = await cachedOpenJobs();
    return jobs.filter((job) => isJobLive(job));
  } catch (err) {
    console.error("[jobs] could not load open jobs:", err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * A job by slug for /careers/[slug]. Returns open AND closed jobs (a closed
 * page renders a noindex "position closed" notice); drafts are never public.
 */
export async function getPublicJobBySlug(slug: string): Promise<Job | null> {
  if (!isFirebaseConfigured) return null;
  try {
    const job = await cachedJobBySlug(slug);
    return job && job.status !== "draft" ? job : null;
  } catch (err) {
    console.error("[jobs] could not load job:", err instanceof Error ? err.message : err);
    return null;
  }
}

const cachedJobBySlug = unstable_cache(
  async (slug: string) => {
    const snap = await adminDb().collection(COLLECTION).where("slug", "==", slug).limit(1).get();
    return snap.empty ? null : fromDoc(snap.docs[0].id, snap.docs[0].data());
  },
  ["jobs:by-slug"],
  { tags: [JOBS_TAG], revalidate: 3600 },
);

// ---- Admin reads (uncached, called only after requireRole / assertAccess) ----

export async function listJobsAdmin(): Promise<Job[]> {
  const snap = await adminDb().collection(COLLECTION).get();
  return snap.docs
    .map((doc) => fromDoc(doc.id, doc.data()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getJobAdmin(id: string): Promise<Job | null> {
  const doc = await adminDb().collection(COLLECTION).doc(id).get();
  return doc.exists ? fromDoc(doc.id, doc.data()!) : null;
}

export async function isJobSlugTaken(slug: string, exceptId?: string): Promise<boolean> {
  const snap = await adminDb().collection(COLLECTION).where("slug", "==", slug).limit(2).get();
  return snap.docs.some((doc) => doc.id !== exceptId);
}

export async function saveJob(id: string | null, data: Omit<Job, "id"> & { id?: string }): Promise<string> {
  const col = adminDb().collection(COLLECTION);
  // Firestore rejects undefined fields; drop them. The id is the document key, not a stored field.
  const clean = JSON.parse(JSON.stringify(data)) as Omit<Job, "id"> & { id?: string };
  delete clean.id;
  if (id) {
    await col.doc(id).set(clean);
    return id;
  }
  const ref = await col.add(clean);
  return ref.id;
}

export async function deleteJob(id: string) {
  await adminDb().collection(COLLECTION).doc(id).delete();
}
