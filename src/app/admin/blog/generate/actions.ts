"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { aiConfigured, aiSetupHint, runGeneration } from "@/lib/ai/generate-post";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { addTopics, createJob, removeTopic } from "@/lib/generation";
import { blogCategories } from "@/lib/legacy-seo";
import { checkRateLimit } from "@/lib/rate-limit";

export type GenerateState = { error?: string; values?: Record<string, string> };

const DAILY_LIMIT = Number(process.env.BLOG_GENERATION_DAILY_LIMIT) || 10;

const categorySlugs = blogCategories.map((c) => c.slug);

const startSchema = z.object({
  topic: z.string().trim().min(8, "Describe the topic in a few words (at least 8 characters).").max(200),
  geo: z.string().trim().max(80),
  category: z.string().trim().refine((value) => value === "" || categorySlugs.includes(value), "Unknown category."),
  seedUrls: z.string().max(2000),
});

export async function startGenerationAction(_prev: GenerateState, formData: FormData): Promise<GenerateState> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") values[key] = value;

  let session;
  try {
    session = await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message, values };
    throw err;
  }
  if (!isFirebaseConfigured) return { error: "Firebase is not configured.", values };
  if (!aiConfigured()) return { error: `${aiSetupHint()}, so drafts cannot be generated yet.`, values };

  const parsed = startSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form.", values };

  const seedUrls = parsed.data.seedUrls
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (seedUrls.length > 3 || seedUrls.some((url) => !/^https:\/\/[^\s]+$/.test(url))) {
    return { error: "Seed pages must be full https:// links, at most 3, one per line.", values };
  }

  // Each run costs real money: cap per person and per day across the whole site.
  const limit = await checkRateLimit([
    { key: `blog-gen:user:${session.uid}`, limit: 5, windowSec: 3600 },
    { key: "blog-gen:day", limit: DAILY_LIMIT, windowSec: 86400 },
  ]);
  if (!limit.allowed) {
    return { error: `Generation limit reached. Try again in about ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`, values };
  }

  const jobId = await createJob({
    topic: parsed.data.topic,
    geo: parsed.data.geo || undefined,
    category: parsed.data.category || undefined,
    seedUrls,
    source: "manual",
    createdBy: session.email,
  });

  // Runs after this response is sent; the progress page polls the job document.
  after(async () => {
    await runGeneration(jobId).catch(() => undefined); // failure is recorded on the job
  });

  redirect(`/admin/blog/generate/${jobId}`);
}

/** One topic per line: "topic | location | category-slug" (location and category optional). */
export async function addTopicsAction(formData: FormData) {
  try {
    await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) redirect("/admin/login");
    throw err;
  }
  const topics = String(formData.get("topics") ?? "")
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts[0] && parts[0].length >= 8 && parts[0].length <= 200)
    .slice(0, 30)
    .map(([topic, geo, category]) => ({
      topic,
      geo: geo ? geo.slice(0, 80) : undefined,
      category: category && categorySlugs.includes(category) ? category : undefined,
    }));
  if (topics.length) await addTopics(topics);
  revalidatePath("/admin/blog/generate");
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
