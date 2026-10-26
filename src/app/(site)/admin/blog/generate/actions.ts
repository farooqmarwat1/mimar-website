"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureAutoTopicQueued } from "@/lib/ai/topic-queue";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { aiConfigured, aiSetupHint, runGeneration } from "@/lib/ai/generate-post";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { createJob, removeTopic, claimNextTopic, finishTopic } from "@/lib/generation";
import { checkRateLimit } from "@/lib/rate-limit";

export type GenerateState = { error?: string };

const DAILY_LIMIT = Number(process.env.BLOG_GENERATION_DAILY_LIMIT) || 10;

export async function startGenerationAction(): Promise<GenerateState> {
  let session;
  try {
    session = await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message };
    throw err;
  }
  if (!isFirebaseConfigured) return { error: "Firebase is not configured." };
  if (!aiConfigured()) return { error: `${aiSetupHint()}, so drafts cannot be generated yet.` };

  // Each run costs real money: cap per person and per day across the whole site.
  const limit = await checkRateLimit([
    { key: `blog-gen:user:${session.uid}`, limit: 5, windowSec: 3600 },
    { key: "blog-gen:day", limit: DAILY_LIMIT, windowSec: 86400 },
  ]);
  if (!limit.allowed) {
    return { error: `Generation limit reached. Try again in about ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` };
  }

  let topic;
  try {
    await ensureAutoTopicQueued();
    topic = await claimNextTopic();
  } catch (err) {
    console.error("[blog] automatic topic planning failed", err);
    return { error: "Could not select a topic. Please try again shortly." };
  }
  if (!topic) return { error: "AI is selecting the next topic. Please try again shortly." };
  let jobId;
  try {
    jobId = await createJob({ topic: topic.topic, keyword: topic.keyword, geo: topic.geo, category: topic.category, seedUrls: [], source: "manual", createdBy: session.email });
  } catch (err) {
    await finishTopic(topic.id, { status: "queued" });
    throw err;
  }
  const topicId = topic.id;
  after(async () => {
    try {
      const postId = await runGeneration(jobId);
      await finishTopic(topicId, { status: "done", jobId, postId });
    } catch (err) {
      await finishTopic(topicId, { status: "failed", jobId, error: err instanceof Error ? err.message : "Generation failed." });
    }
    await ensureAutoTopicQueued().catch((err) => console.error("[blog] could not refill queue", err));
  });

  redirect(`/admin/blog/generate/${jobId}`);
}

export async function removeTopicAction(formData: FormData) {
  try {
    await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) redirect("/admin/login");
    throw err;
  }
  const id = String(formData.get("id") ?? "");
  if (id) await removeTopic(id);
  revalidatePath("/admin/blog/generate");
}

export async function prepareAutoTopicAction(): Promise<GenerateState> {
  try {
    await assertAccess("blog");
    if (!isFirebaseConfigured || !aiConfigured()) return { error: "Firebase and an AI provider must be configured." };
    await ensureAutoTopicQueued();
    revalidatePath("/admin/blog/generate");
    return {};
  } catch (err) {
    console.error("[blog] could not prepare topic", err);
    return { error: "Could not select the next topic. Please try again." };
  }
}
