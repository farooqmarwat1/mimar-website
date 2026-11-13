"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BRIEF_SETS, queueBriefs } from "@/lib/ai/brief-queue";
import { ensureAutoTopicQueued } from "@/lib/ai/topic-queue";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { aiConfigured, aiSetupHint, runGeneration } from "@/lib/ai/generate-post";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { createJob, removeTopic, claimNextTopic, finishTopic } from "@/lib/generation";
import { releaseIdea, setIdeaStatus } from "@/lib/ideas/store";
import { checkRateLimit } from "@/lib/rate-limit";

export type GenerateState = { error?: string; message?: string };

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
    jobId = await createJob({
      topic: topic.topic,
      keyword: topic.keyword,
      geo: topic.geo,
      category: topic.category,
      seedUrls: topic.seedUrls ?? [],
      source: "manual",
      createdBy: session.email,
      strategy: topic.strategy,
      keywordSource: topic.keywordSource,
      keywordStats: topic.keywordStats,
      relatedQueries: topic.relatedQueries,
      approach: topic.approach,
      ideaId: topic.ideaId,
      ideaBrief: topic.ideaBrief,
      ideaUrl: topic.ideaUrl,
      brief: topic.brief,
    });
  } catch (err) {
    await finishTopic(topic.id, { status: "queued" });
    throw err;
  }
  const { id: topicId, ideaId } = topic;
  after(async () => {
    try {
      const postId = await runGeneration(jobId);
      await finishTopic(topicId, { status: "done", jobId, postId });
      if (ideaId) await setIdeaStatus(ideaId, "used");
    } catch (err) {
      await finishTopic(topicId, { status: "failed", jobId, error: err instanceof Error ? err.message : "Generation failed." });
      await releaseIdea(ideaId);
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
  const removed = id ? await removeTopic(id) : null;
  // A queued topic planned from an idea gives the idea back to the inbox.
  if (removed?.status === "queued") await releaseIdea(removed.ideaId);
  revalidatePath("/admin/blog/generate");
  revalidatePath("/admin/blog/ideas");
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

async function briefGuard(): Promise<GenerateState | null> {
  try {
    await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message };
    throw err;
  }
  return isFirebaseConfigured ? null : { error: "Firebase is not configured." };
}

function describeQueued(result: Awaited<ReturnType<typeof queueBriefs>>): GenerateState {
  const skipped = result.skipped.map((item) => `${item.title}: ${item.reason}`).join(" ");
  if (result.queued.length === 0) return { error: skipped || "Nothing to queue." };
  return {
    message: `Queued ${result.queued.length} brief${result.queued.length === 1 ? "" : "s"} ahead of the automatic topics.${skipped ? ` Skipped: ${skipped}` : ""}`,
  };
}

/** "Write from a brief": one brief typed in by the SEO editor, queued ahead of the automatic topics. */
export async function queueBriefAction(_prev: GenerateState, formData: FormData): Promise<GenerateState> {
  const refused = await briefGuard();
  if (refused) return refused;
  const field = (name: string) => String(formData.get(name) ?? "");
  const result = await queueBriefs([
    {
      title: field("title"),
      keyword: field("keyword"),
      secondaryKeywords: field("secondaryKeywords"),
      outline: field("outline"),
      ctaPath: field("ctaPath"),
      geo: field("geo"),
      category: field("category"),
      seoTitle: field("seoTitle"),
      description: field("description"),
      ar: { keyword: field("arKeyword"), seoTitle: field("arSeoTitle"), description: field("arDescription") },
      notes: field("notes"),
      visual: field("visual"),
    },
  ]);
  revalidatePath("/admin/blog/generate");
  return describeQueued(result);
}

/** Queues every brief in one of the brief files (src/content/briefs) that is not queued or written yet. */
export async function importBriefsAction(_prev: GenerateState, formData: FormData): Promise<GenerateState> {
  const refused = await briefGuard();
  if (refused) return refused;
  const set = BRIEF_SETS[String(formData.get("set") ?? "")];
  if (!set) return { error: "Choose a set of briefs." };
  const result = await queueBriefs(set.briefs);
  revalidatePath("/admin/blog/generate");
  return describeQueued(result);
}
