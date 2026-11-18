import { revalidatePath, revalidateTag } from "next/cache";
import { ensureArabic } from "@/lib/ai/translate-post";
import { blogRecipients, cronAuthorized, escapeHtml } from "@/lib/cron";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import { getMailer } from "@/lib/mailer";
import { checkPost } from "@/lib/post-validation";
import { POSTS_TAG, listScheduledDrafts, savePost, type Post } from "@/lib/posts";
import { isKarachiWeekday, karachiDay, nextDue } from "@/lib/publish-schedule";
import { siteConfig } from "@/lib/site-config";

/**
 * Weekday publishing (vercel.json: Monday to Friday). Each run publishes ONE scheduled draft: the
 * earliest whose `scheduledFor` date has come (posts.ts). It runs the same publish checks as the
 * editor's Publish button, writes the Arabic version, refreshes the blog pages and emails the blog
 * team what went live. A draft that fails the checks is left as it is and the next one is tried.
 *
 * Only Vercel Cron may call it (src/lib/cron.ts). Staff stop a post with "Unschedule" in /admin/blog.
 */

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const pagePaths = (path: string) => ["/blog", "/ar/blog", path, `/ar${path}`, "/sitemap.xml", "/llms.txt"];

function refresh(path: string) {
  revalidateTag(POSTS_TAG, { expire: 0 });
  for (const target of pagePaths(path)) revalidatePath(target);
  for (const pattern of ["/blog/[category]", "/ar/blog/[category]", "/[...legacy]", "/ar/[...legacy]"]) revalidatePath(pattern, "page");
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!isFirebaseConfigured) return Response.json({ skipped: "Firebase is not configured." });
  const now = new Date();
  if (!isKarachiWeekday(now)) return Response.json({ skipped: "Not a weekday in Pakistan." });

  // One post per day, even if the job is called twice.
  const today = karachiDay(now);
  const status = adminDb().doc("siteBlogPlanner/publishing");
  const acquired = await adminDb().runTransaction(async (tx) => {
    const previous = await tx.get(status);
    if (previous.get("publishedDay") === today || Number(previous.get("leaseUntil") ?? 0) > Date.now()) return false;
    tx.set(status, { lastRunAt: now.toISOString(), leaseUntil: Date.now() + 300_000 }, { merge: true });
    return true;
  });
  if (!acquired) return Response.json({ skipped: "Today's post is already published or a run is in progress." });

  try {
    const scheduled = await listScheduledDrafts();
    const blocked: string[] = [];
    for (let post = nextDue(scheduled, today); post; post = nextDue(scheduled.filter((item) => !blocked.includes(item.id)), today)) {
      const check = await checkPost({ ...post, keywords: post.keywords, geoTerms: post.geoTerms, geo: post.generation?.geo });
      if (Object.keys(check.errors).length) {
        console.error("[publish-scheduled] not ready:", post.id, check.errors);
        blocked.push(post.id);
        continue;
      }
      const published = await publish(post, now);
      await status.set({ publishedDay: today, leaseUntil: 0, lastPostId: post.id, lastResult: { ok: true, title: post.title } }, { merge: true });
      await notify(published, scheduled.length - 1, blocked).catch((err) => console.error("[publish-scheduled] email failed:", err instanceof Error ? err.message : err));
      return Response.json({ ok: true, postId: post.id, path: post.path, title: post.title, blocked });
    }
    await status.set({ leaseUntil: 0, lastResult: { ok: true, nothingDue: true, blocked } }, { merge: true });
    return Response.json({ ok: true, skipped: blocked.length ? "Every due post failed the publish checks." : "No scheduled post is due.", blocked });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Publishing failed.";
    await status.set({ leaseUntil: 0, lastResult: { ok: false, error } }, { merge: true });
    console.error("[publish-scheduled]", error);
    return Response.json({ ok: false, error }, { status: 500 });
  }
}

async function publish(post: Post, now: Date): Promise<Post> {
  const { scheduledFor: _done, id, ...rest } = post;
  void _done;
  const published: Omit<Post, "id"> = { ...rest, status: "published", publishedAt: post.publishedAt ?? now.toISOString(), updatedAt: now.toISOString(), updatedBy: "weekday schedule" };
  await savePost(id, published);
  // The Arabic version goes live with the English one; a failure is retried when anyone saves the post.
  try {
    await ensureArabic(id);
  } catch (err) {
    console.error("[publish-scheduled] Arabic version failed:", err instanceof Error ? err.message : err);
  }
  refresh(post.path);
  return { ...published, id };
}

async function notify(post: Post, remaining: number, blocked: string[]) {
  const mailer = getMailer();
  const { to, cc } = blogRecipients();
  if (!mailer || to.length === 0) return;
  const base = siteConfig.url.replace(/\/$/, "");
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || mailer.defaultFrom;
  const subject = `Published today: ${post.title}`;
  const lines = [
    "Today's scheduled blog post is live.",
    "",
    `${post.title}`,
    `${base}${post.path}`,
    `Arabic: ${base}/ar${post.path}`,
    "",
    `Still scheduled: ${remaining}.`,
    blocked.length ? `${blocked.length} scheduled post(s) failed the publish checks and were skipped; open /admin/blog to fix them.` : "",
    "To stop a scheduled post, use Unschedule in /admin/blog.",
  ].filter((line, index, all) => line !== "" || all[index - 1] !== "");
  const html = `<p>Today's scheduled blog post is live.</p><p><strong>${escapeHtml(post.title)}</strong><br><a href="${escapeHtml(base + post.path)}">${escapeHtml(base + post.path)}</a><br>Arabic: <a href="${escapeHtml(`${base}/ar${post.path}`)}">${escapeHtml(`${base}/ar${post.path}`)}</a></p><p>Still scheduled: ${remaining}.${blocked.length ? ` ${blocked.length} scheduled post(s) failed the publish checks and were skipped; open /admin/blog to fix them.` : ""}</p><p>To stop a scheduled post, use Unschedule in /admin/blog.</p>`;
  await mailer.send({ from, to, ...(cc.length ? { cc } : {}), replyTo: to[0], subject, text: lines.join("\n"), html });
}
