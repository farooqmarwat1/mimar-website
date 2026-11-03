import "server-only";
import { expiryFor, isDuplicateIdea, type Idea, type IdeaStatus, type NewIdea } from "@/lib/ai/idea-plan";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Firestore bookkeeping for blog ideas (src/lib/ai/idea-plan.ts):
 * - `siteBlogIdeas`: one document per idea, written by the weekly collectors (collect.ts) and by
 *   staff on /admin/blog/ideas, used by the topic planner (auto-topic.ts).
 * - `siteBlogPlanner/ideas`: when the collectors last ran and what each one found.
 * - `siteBlogPlanner/settings`: the competitor sites the search approach compares us with.
 *
 * Ideas never hold personal data: customer ideas are generic questions with a count, no lead ids.
 */

const IDEAS = "siteBlogIdeas";
const STATUS_DOC = "siteBlogPlanner/ideas";
const SETTINGS_DOC = "siteBlogPlanner/settings";

function clean<T extends object>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export async function listIdeas(): Promise<Idea[]> {
  const snap = await adminDb().collection(IDEAS).get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<Idea, "id">), id: doc.id }) as Idea).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getIdea(id: string): Promise<Idea | null> {
  const doc = await adminDb().collection(IDEAS).doc(id).get();
  return doc.exists ? ({ ...(doc.data() as Omit<Idea, "id">), id: doc.id } as Idea) : null;
}

/** Saves the ideas that do not repeat a stored idea (any status) or anything in `covered`. Returns how many were new. */
export async function saveNewIdeas(ideas: NewIdea[], covered: string[], now = new Date()): Promise<number> {
  if (ideas.length === 0) return 0;
  const seen = [...(await listIdeas()).map((idea) => idea.title), ...covered];
  const batch = adminDb().batch();
  let added = 0;
  for (const idea of ideas) {
    if (isDuplicateIdea(idea.title, seen)) continue;
    seen.push(idea.title);
    batch.set(adminDb().collection(IDEAS).doc(), clean({ ...idea, status: "new" as const, createdAt: now.toISOString(), expiresAt: expiryFor(idea.approach, now) }));
    added++;
  }
  if (added) await batch.commit();
  return added;
}

export async function setIdeaStatus(id: string, status: IdeaStatus) {
  await adminDb().collection(IDEAS).doc(id).update({ status });
}

/** Puts an idea back in the pool after its topic failed or was removed (only if it is still marked as taken). */
export async function releaseIdea(id: string | undefined) {
  if (!id) return;
  const ref = adminDb().collection(IDEAS).doc(id);
  await adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists && snap.get("status") === "queued") tx.update(ref, { status: "new" });
  });
}

/** Removes ideas past their expiry date, except ones a queued topic is waiting on. */
export async function deleteExpiredIdeas(now = new Date()): Promise<number> {
  const snap = await adminDb().collection(IDEAS).where("expiresAt", "<", now.toISOString()).get();
  const expired = snap.docs.filter((doc) => doc.get("status") !== "queued");
  for (let i = 0; i < expired.length; i += 400) {
    const batch = adminDb().batch();
    for (const doc of expired.slice(i, i + 400)) batch.delete(doc.ref);
    await batch.commit();
  }
  return expired.length;
}

// ---- Collector status ------------------------------------------------------

export type SourceRun = { state: "ok" | "off" | "error"; found: number; added: number; message: string; at: string };

export type IdeasStatus = { state: "running" | "done" | "failed" | "unknown"; lastRunAt: string; leaseUntil: number; sources: Record<string, SourceRun>; error?: string };

export async function getIdeasStatus(): Promise<IdeasStatus | null> {
  const snap = await adminDb().doc(STATUS_DOC).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  return { state: data.state ?? "unknown", lastRunAt: data.lastRunAt ?? "", leaseUntil: Number(data.leaseUntil ?? 0), sources: data.sources ?? {}, error: data.error };
}

/** Whether a collection run holds the lease right now. */
export const isCollecting = (status: IdeasStatus | null, now = Date.now()) => status?.state === "running" && status.leaseUntil > now;

/** One collection run at a time, across serverless instances. False when one is already running. */
export async function acquireIdeasLease(ms: number): Promise<boolean> {
  const ref = adminDb().doc(STATUS_DOC);
  return adminDb().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (Number(snap.get("leaseUntil") ?? 0) > Date.now()) return false;
    tx.set(ref, { state: "running", lastRunAt: new Date().toISOString(), leaseUntil: Date.now() + ms }, { merge: true });
    return true;
  });
}

export async function finishIdeasRun(result: { sources: Record<string, SourceRun>; error?: string }) {
  await adminDb()
    .doc(STATUS_DOC)
    .set({ state: result.error ? "failed" : "done", leaseUntil: 0, sources: clean(result.sources), error: result.error ?? null }, { merge: true });
}

// ---- Settings --------------------------------------------------------------

/** "https://www.example.com/blog" or "example.com" -> "example.com". Null when it is not a domain. */
export function normalizeDomain(raw: string): string | null {
  const host = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) && !host.endsWith("mim.archi") ? host : null;
}

export async function getCompetitors(): Promise<string[]> {
  const snap = await adminDb().doc(SETTINGS_DOC).get();
  return (snap.get("competitors") as string[] | undefined) ?? [];
}

export async function setCompetitors(domains: string[]) {
  await adminDb().doc(SETTINGS_DOC).set({ competitors: [...new Set(domains)].slice(0, 8) }, { merge: true });
}
