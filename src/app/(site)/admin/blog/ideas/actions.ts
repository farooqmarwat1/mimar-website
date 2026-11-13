"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { planTopicFromIdea } from "@/lib/ai/auto-topic";
import { aiConfigured, aiSetupHint } from "@/lib/ai/generate-post";
import { regionForText, type Approach } from "@/lib/ai/idea-plan";
import { groupForQuery } from "@/lib/ai/keyword-plan";
import { getProvider } from "@/lib/ai/provider";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { addPriorityTopic } from "@/lib/generation";
import { collectIdeas } from "@/lib/ideas/collect";
import { MAX_COMPETITORS } from "@/lib/ideas/competitor-seeds";
import { getIdea, normalizeDomain, saveNewIdeas, setCompetitors, setIdeaStatus } from "@/lib/ideas/store";
import { checkRateLimit } from "@/lib/rate-limit";

export type IdeasState = { error?: string; message?: string };

const PATH = "/admin/blog/ideas";

async function guard(): Promise<IdeasState | null> {
  try {
    await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message };
    throw err;
  }
  return isFirebaseConfigured ? null : { error: "Firebase is not configured." };
}

/** "Write this next": plans a topic from the idea now and queues it ahead of the others. */
export async function writeIdeaNextAction(_prev: IdeasState, formData: FormData): Promise<IdeasState> {
  const refused = await guard();
  if (refused) return refused;
  if (!aiConfigured()) return { error: `${aiSetupHint()}, so ideas cannot be planned yet.` };
  const idea = await getIdea(String(formData.get("id") ?? ""));
  if (!idea || idea.status !== "new") return { error: "This idea is no longer available." };

  try {
    const planned = await planTopicFromIdea(getProvider(), { inputTokens: 0, outputTokens: 0, searches: 0 }, idea);
    await addPriorityTopic({ ...planned, source: "manual" });
  } catch (err) {
    console.error("[ideas] could not plan a topic from idea", idea.id, err);
    return { error: err instanceof Error ? err.message : "Could not plan a topic from this idea." };
  }
  revalidatePath(PATH);
  revalidatePath("/admin/blog/generate");
  redirect("/admin/blog/generate");
}

export async function dismissIdeaAction(formData: FormData) {
  if (await guard()) redirect("/admin/login");
  const id = String(formData.get("id") ?? "");
  if (id) await setIdeaStatus(id, "dismissed");
  revalidatePath(PATH);
}

const MANUAL_APPROACHES: Approach[] = ["social", "news", "community", "customers", "search", "keywords"];

/** A trend or question staff spotted themselves (TikTok, Pinterest, a client meeting). */
export async function addIdeaAction(_prev: IdeasState, formData: FormData): Promise<IdeasState> {
  const refused = await guard();
  if (refused) return refused;
  const approach = String(formData.get("approach") ?? "") as Approach;
  const title = String(formData.get("title") ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  const keyword = String(formData.get("keyword") ?? "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 80);
  const link = String(formData.get("url") ?? "").trim();
  const note = String(formData.get("note") ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  if (!MANUAL_APPROACHES.includes(approach)) return { error: "Choose where the idea comes from." };
  if (title.length < 12) return { error: "Describe the idea in a sentence (at least 12 characters)." };
  if (link && !/^https:\/\/\S+$/.test(link)) return { error: "The link must start with https://." };

  const added = await saveNewIdeas(
    [
      {
        approach,
        source: "manual",
        title,
        keyword: keyword || undefined,
        region: regionForText(`${title} ${keyword}`),
        group: groupForQuery(keyword || title) ?? undefined,
        evidence: { url: link || undefined, note: note || undefined },
        seedUrls: approach === "news" && link ? [link] : [],
      },
    ],
    [],
  );
  revalidatePath(PATH);
  return added ? { message: "Idea added." } : { error: "A very similar idea is already in the list." };
}

export async function saveCompetitorsAction(_prev: IdeasState, formData: FormData): Promise<IdeasState> {
  const refused = await guard();
  if (refused) return refused;
  const lines = String(formData.get("competitors") ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
  const domains = lines.map(normalizeDomain);
  const invalid = lines.filter((_, index) => !domains[index]);
  if (invalid.length) return { error: `Not a website address: ${invalid.slice(0, 3).join(", ")}` };
  if (new Set(domains).size > MAX_COMPETITORS) return { error: `List at most ${MAX_COMPETITORS} competitor sites; each one is read every week.` };
  await setCompetitors(domains as string[]);
  revalidatePath(PATH);
  return { message: `Saved ${domains.length} competitor site${domains.length === 1 ? "" : "s"}. They are read at the next collection.` };
}

/** "Collect now": runs the weekly collection in the background; the page shows its progress. */
export async function collectNowAction(): Promise<IdeasState> {
  const refused = await guard();
  if (refused) return refused;
  const limit = await checkRateLimit([{ key: "blog-ideas:collect", limit: 4, windowSec: 86400 }]);
  if (!limit.allowed) return { error: `Ideas were collected several times today. Try again in about ${Math.ceil(limit.retryAfterSec / 3600)} hour(s).` };
  after(async () => {
    try {
      await collectIdeas();
    } catch (err) {
      console.error("[ideas] manual collection failed", err);
    }
    revalidatePath(PATH);
  });
  return { message: "Collecting ideas. This takes a few minutes; refresh the page to see them." };
}
