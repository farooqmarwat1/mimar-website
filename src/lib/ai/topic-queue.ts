import "server-only";
import { adminDb } from "@/lib/firebase/admin";
import { listTopics, type BlogTopic } from "@/lib/generation";
import { planAutoTopic } from "./auto-topic";
import { getProvider } from "./provider";

/** One planner at a time, including across concurrent serverless instances. */
export async function ensureAutoTopicQueued() {
  const db = adminDb();
  const lock = db.collection("siteBlogPlanner").doc("queue");
  const acquired = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(lock);
    if (Number(snapshot.get("leaseUntil") ?? 0) > Date.now()) return false;
    tx.set(lock, { leaseUntil: Date.now() + 300_000 });
    return true;
  });
  if (!acquired) return;
  try {
    if ((await listTopics()).some((topic) => topic.status === "queued")) return;
    const planned = await planAutoTopic(getProvider(), { inputTokens: 0, outputTokens: 0, searches: 0 });
    const topic: Omit<BlogTopic, "id"> = {
      ...planned, source: "auto", status: "queued", createdAt: new Date().toISOString(),
    };
    await db.collection("siteBlogTopics").add(topic);
  } finally {
    await lock.set({ leaseUntil: 0 });
  }
}
