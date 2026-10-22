import { timingSafeEqual } from "node:crypto";
import { planAutoTopic } from "@/lib/ai/auto-topic";
import { aiConfigured, runGeneration } from "@/lib/ai/generate-post";
import { getProvider } from "@/lib/ai/provider";
import type { Usage } from "@/lib/ai/types";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { claimNextTopic, createJob, createRunningTopic, finishTopic, type BlogTopic } from "@/lib/generation";
import { getMailer } from "@/lib/mailer";
import { getPostAdmin, listPostsAdmin } from "@/lib/posts";
import { checkRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";

/**
 * Scheduled drafting (vercel.json: Mondays and Thursdays). Each run writes ONE draft:
 *
 *   1. a topic staff queued by hand, if there is one; otherwise
 *   2. an automatically planned topic: the next service x region combination in the
 *      rotation, with the specific topic chosen by the AI (src/lib/ai/auto-topic.ts).
 *
 * It then emails the reviewers that a draft is waiting for approval. It NEVER
 * publishes: a person approves every article in /admin/blog.
 *
 * Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`. With no
 * secret configured the endpoint refuses every request, so outsiders can never
 * trigger it to spend API credits.
 */

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Who approves (To) and who is only kept informed (CC). Override with BLOG_NOTIFY_EMAIL / BLOG_NOTIFY_CC.
const DEFAULT_APPROVERS = "hr@mim.archi";
const DEFAULT_CC = "info@mim.archi";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const autoTopicsEnabled = () => !["false", "0", "off", "no"].includes((process.env.BLOG_AUTO_TOPICS ?? "").trim().toLowerCase());
const maxPendingDrafts = () => Number(process.env.BLOG_MAX_PENDING_DRAFTS) || 6;

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseConfigured || !aiConfigured()) return Response.json({ skipped: "Firebase or the AI key is not configured." });

  const limit = await checkRateLimit([{ key: "blog-gen:day", limit: Number(process.env.BLOG_GENERATION_DAILY_LIMIT) || 10, windowSec: 86400 }]);
  if (!limit.allowed) return Response.json({ skipped: "Daily generation limit reached." });

  // Do not pile up work nobody has approved yet.
  const waiting = (await listPostsAdmin()).filter((post) => post.origin === "ai" && post.status === "draft").length;
  if (waiting >= maxPendingDrafts()) {
    return Response.json({ skipped: `${waiting} AI drafts are still waiting for review (limit ${maxPendingDrafts()}).` });
  }

  let topic: BlogTopic | null = await claimNextTopic();
  let mode: "queued-topic" | "auto-topic" = "queued-topic";
  if (!topic) {
    if (!autoTopicsEnabled()) return Response.json({ skipped: "No queued topics and automatic topics are switched off." });
    try {
      const planned = await planAutoTopic(getProvider(), { inputTokens: 0, outputTokens: 0, searches: 0 } satisfies Usage);
      topic = await createRunningTopic(planned);
      mode = "auto-topic";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not plan a topic.";
      console.error("[cron] topic planning failed:", message);
      return Response.json({ ok: false, error: message }, { status: 500 });
    }
  }

  const jobId = await createJob({
    topic: topic.topic,
    geo: topic.geo,
    category: topic.category,
    seedUrls: [],
    source: "cron",
    createdBy: "scheduler",
  });

  try {
    const postId = await runGeneration(jobId);
    await finishTopic(topic.id, { status: "done", jobId, postId });
    await notifyReviewers(postId, topic, waiting + 1).catch((err) => console.error("[cron] could not email reviewers:", err instanceof Error ? err.message : err));
    return Response.json({ ok: true, mode, postId, topic: topic.topic, service: topic.group, region: topic.region });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    await finishTopic(topic.id, { status: "failed", jobId, error: message });
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function parseEmails(value: string | undefined, fallback: string): string[] {
  // `||`, not `??`: a blank value copied from .env.example counts as unset.
  const raw = value?.trim() || fallback;
  if (raw.toLowerCase() === "none") return [];
  return raw
    .split(",")
    .map((address) => address.trim())
    .filter((address) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address));
}

async function notifyReviewers(postId: string, topic: BlogTopic, waiting: number) {
  const mailer = getMailer();
  const post = await getPostAdmin(postId);
  if (!mailer || !post) return;

  const base = (process.env.ADMIN_BASE_URL?.trim() || siteConfig.url).replace(/\/$/, "");
  const link = `${base}/admin/blog/${postId}`;
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom;
  const where = [topic.group, topic.region].filter(Boolean).join(" / ");
  const subject = `Blog draft ready for your approval: ${post.title}`;
  const text = [
    "A new blog draft was written automatically and is waiting for your approval.",
    "",
    `Title: ${post.title}`,
    where ? `Planned for: ${where}` : "",
    `Drafts waiting for review: ${waiting}`,
    "",
    "It is NOT published. Please check the facts against its listed sources, edit if needed, then publish it or delete it:",
    link,
  ]
    .filter((line, index, all) => line !== "" || all[index - 1] !== "")
    .join("\n");
  const html = `<p>A new blog draft was written automatically and is <strong>waiting for your approval</strong>.</p>
<p><strong>${escapeHtml(post.title)}</strong>${where ? `<br>Planned for: ${escapeHtml(where)}` : ""}<br>Drafts waiting for review: ${waiting}</p>
<p>It is <strong>not published</strong>. Check the facts against its listed sources, edit if needed, then publish it or delete it.</p>
<p><a href="${escapeHtml(link)}">Open the draft</a></p>`;

  // One email: the approvers in To, the people who only need to know in CC.
  const approvers = parseEmails(process.env.BLOG_NOTIFY_EMAIL, DEFAULT_APPROVERS);
  const cc = parseEmails(process.env.BLOG_NOTIFY_CC, DEFAULT_CC).filter((address) => !approvers.includes(address));
  if (approvers.length === 0) {
    console.error("[cron] BLOG_NOTIFY_EMAIL has no valid address; no approval email sent.");
    return;
  }
  await mailer.send({ from, to: approvers, ...(cc.length ? { cc } : {}), replyTo: approvers[0], subject, text, html });
}
