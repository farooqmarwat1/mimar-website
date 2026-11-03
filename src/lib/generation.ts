import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import type { BlogTagging } from "@/lib/ai/keyword-plan";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Firestore bookkeeping for the AI blog generator:
 * - `generationJobs`: one document per run, polled by the admin UI while it works.
 * - `blogTopics`: a queue of topics for the scheduled (cron) generator.
 */

export type JobStatus = "queued" | "researching" | "writing" | "checking" | "done" | "failed";

export type GenerationJob = {
  id: string;
  topic: string;
  keyword?: string;
  geo?: string;
  category?: string;
  seedUrls: string[];
  status: JobStatus;
  log: string[];
  postId?: string;
  error?: string;
  usage?: { inputTokens: number; outputTokens: number; searches: number };
  source: "manual" | "cron";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
} & Partial<BlogTagging>;

export type BlogTopic = {
  id: string;
  topic: string;
  geo?: string;
  category?: string;
  status: "queued" | "running" | "done" | "failed";
  createdAt: string;
  jobId?: string;
  postId?: string;
  error?: string;
  /** "auto" = planned by the weekly planner; anything else was typed in by staff or picked from an idea. */
  source?: "manual" | "auto";
  /** Taken before any other queued topic (an idea an editor chose to write next). */
  priority?: boolean;
  /** Pages the research reads first (the news article an idea came from). */
  seedUrls?: string[];
  /** Service group and region the planner covered; drives the rotation. */
  group?: string;
  region?: string;
  keyword?: string;
} & Partial<BlogTagging>;

const JOBS = "siteGenerationJobs";
const TOPICS = "siteBlogTopics";
const now = () => new Date().toISOString();

export async function getScheduleStatus(): Promise<{ state: string; lastRunAt: string; message?: string } | null> {
  const snapshot = await adminDb().collection("siteBlogPlanner").doc("schedule").get();
  if (!snapshot.exists) return null;
  const data = snapshot.data()!;
  return { state: data.state ?? "unknown", lastRunAt: data.lastRunAt ?? "", message: data.lastResult?.error ?? data.lastResult?.skipped };
}

function clean<T extends object>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function createJob(input: Pick<GenerationJob, "topic" | "keyword" | "geo" | "category" | "seedUrls" | "source" | "createdBy"> & Partial<BlogTagging>): Promise<string> {
  const ref = await adminDb()
    .collection(JOBS)
    .add(clean({ ...input, status: "queued", log: [], createdAt: now(), updatedAt: now() }));
  return ref.id;
}

export async function getJob(id: string): Promise<GenerationJob | null> {
  const doc = await adminDb().collection(JOBS).doc(id).get();
  return doc.exists ? ({ ...(doc.data() as Omit<GenerationJob, "id">), id: doc.id } as GenerationJob) : null;
}

export async function listRecentJobs(limit = 8): Promise<GenerationJob[]> {
  const snap = await adminDb().collection(JOBS).get();
  return snap.docs
    .map((doc) => ({ ...(doc.data() as Omit<GenerationJob, "id">), id: doc.id }) as GenerationJob)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function updateJob(id: string, patch: Partial<Omit<GenerationJob, "id" | "log">>, logLine?: string) {
  const update: Record<string, unknown> = { ...clean(patch), updatedAt: now() };
  if (logLine) update.log = FieldValue.arrayUnion(`${new Date().toISOString().slice(11, 19)} ${logLine}`);
  await adminDb().collection(JOBS).doc(id).update(update);
}

// ---- Topic queue --------------------------------------------------------

export async function addTopics(topics: { topic: string; geo?: string; category?: string }[]) {
  const batch = adminDb().batch();
  for (const item of topics) batch.set(adminDb().collection(TOPICS).doc(), clean({ ...item, status: "queued", createdAt: now() }));
  await batch.commit();
}

export async function listTopics(): Promise<BlogTopic[]> {
  const snap = await adminDb().collection(TOPICS).get();
  return snap.docs
    .map((doc) => ({ ...(doc.data() as Omit<BlogTopic, "id">), id: doc.id }) as BlogTopic)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** A topic planned from an idea an editor chose on /admin/blog/ideas: queued ahead of the others. */
export async function addPriorityTopic(topic: Omit<BlogTopic, "id" | "status" | "createdAt" | "priority">): Promise<string> {
  const ref = await adminDb()
    .collection(TOPICS)
    .add(clean({ ...topic, priority: true, status: "queued" as const, createdAt: now() }));
  return ref.id;
}

/** Deletes a topic and returns what it was (so a topic planned from an idea can give the idea back). */
export async function removeTopic(id: string): Promise<BlogTopic | null> {
  const ref = adminDb().collection(TOPICS).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.delete();
  return { ...(snap.data() as Omit<BlogTopic, "id">), id };
}

/** Atomically takes the next queued topic, priority ones first, then the oldest (two overlapping cron runs never get the same one). */
export async function claimNextTopic(): Promise<BlogTopic | null> {
  const db = adminDb();
  const queued = (await listTopics()).filter((topic) => topic.status === "queued").sort((a, b) => Number(Boolean(b.priority)) - Number(Boolean(a.priority)));
  for (const candidate of queued) {
    const ref = db.collection(TOPICS).doc(candidate.id);
    const claimed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.get("status") !== "queued") return false;
      tx.update(ref, { status: "running" });
      return true;
    });
    if (claimed) return { ...candidate, status: "running" };
  }
  return null;
}

/** An automatically planned topic, recorded as already running (so it can never be picked twice). */
export async function createRunningTopic(topic: Pick<BlogTopic, "topic" | "geo" | "category" | "group" | "region" | "keyword" | "seedUrls"> & Partial<BlogTagging>): Promise<BlogTopic> {
  const data = clean({ ...topic, source: "auto" as const, status: "running" as const, createdAt: now() });
  const ref = await adminDb().collection(TOPICS).add(data);
  return { ...data, id: ref.id };
}

export async function finishTopic(id: string, patch: Partial<Pick<BlogTopic, "status" | "jobId" | "postId" | "error">>) {
  await adminDb().collection(TOPICS).doc(id).update(clean(patch));
}
