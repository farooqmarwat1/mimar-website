import Link from "next/link";
import { addTopicsAction, removeTopicAction } from "@/app/admin/blog/generate/actions";
import GenerateForm from "@/components/admin/GenerateForm";
import { cardClass, hintClass, primaryButtonClass, statusBadgeClass, textareaClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { aiConfigured, aiSetupHint } from "@/lib/ai/generate-post";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { listRecentJobs, listTopics } from "@/lib/generation";
import { blogCategories } from "@/lib/legacy-seo";
import { regionList } from "@/lib/regions";

// The generation itself runs after the form is submitted (see actions.ts) and is
// bounded by this limit. Research + writing normally take 2-5 minutes.
export const maxDuration = 300;

export default async function GenerateBlogPage() {
  await requireRole("blog");
  const [jobs, topics] = isFirebaseConfigured ? await Promise.all([listRecentJobs(), listTopics()]) : [[], []];
  const queued = topics.filter((topic) => topic.status === "queued");

  return (
    <div>
      <Link href="/admin/blog" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All posts
      </Link>
      <h1 className="mb-2 mt-3 text-3xl font-medium tracking-tight">Draft with AI</h1>
      <p className="mb-8 max-w-2xl text-sm text-muted">
        The AI searches the web, writes an original article with SEO fields, FAQ and links to the right Mimar pages, and saves it as a <strong>draft</strong>. A person reviews, fixes and publishes it.
      </p>

      {!aiConfigured() && (
        <p className="mb-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{aiSetupHint()} in this environment, so drafting is disabled.</p>
      )}

      <GenerateForm categories={blogCategories.map(({ slug, label }) => ({ slug, label }))} regions={regionList.map((region) => region.city)} />

      <section className={`${cardClass} mt-10`}>
        <h2 className="text-lg font-medium">Automatic drafts</h2>
        <p className={`${hintClass} mt-1`}>
          Twice a week (Monday and Thursday) one draft is written automatically and the reviewers are emailed to approve it. The topic is chosen for you:
          it rotates through every service in every region (5 services × 4 regions), picking a specific, searchable subject that is not already covered.
          Nothing is published without approval.
        </p>
        <p className={`${hintClass} mt-3`}>
          Want a particular subject? Add it below. Queued topics are written before any automatic one.
        </p>
        <form action={addTopicsAction} className="mt-4 grid gap-3">
          <textarea
            name="topics"
            rows={4}
            className={textareaClass}
            placeholder={"One per line: topic | location | category\nWhat is a 3D walkthrough and when should a developer commission one? | Dubai | 3d-visualization"}
          />
          <button type="submit" className={`${primaryButtonClass} w-fit`}>
            Add to queue
          </button>
        </form>
        {topics.length > 0 && (
          <ul className="mt-6 divide-y divide-line text-sm">
            {topics.map((topic) => (
              <li key={topic.id} className="flex flex-wrap items-center gap-3 py-3">
                <span className="min-w-0 flex-1">
                  {topic.topic}
                  {topic.geo ? <span className="text-muted"> · {topic.geo}</span> : null}
                  {topic.error ? <span className="block text-xs text-accent">{topic.error}</span> : null}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs ${statusBadgeClass[topic.status === "done" ? "published" : topic.status === "queued" ? "draft" : "closed"] ?? ""}`}>{topic.status}</span>
                {topic.postId && (
                  <Link href={`/admin/blog/${topic.postId}`} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
                    Review draft
                  </Link>
                )}
                {topic.status !== "running" && (
                  <form action={removeTopicAction}>
                    <input type="hidden" name="id" value={topic.id} />
                    <button type="submit" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-accent">
                      Remove
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {queued.length === 0 && <p className={`${hintClass} mt-4`}>Nothing queued, so the next scheduled run will plan its own topic.</p>}
      </section>

      {jobs.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3 text-muted">Recent runs</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
            {jobs.map((job) => (
              <li key={job.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
                <Link href={`/admin/blog/generate/${job.id}`} className="min-w-0 flex-1 hover:text-accent">
                  {job.topic}
                </Link>
                <span className="text-muted">{job.createdAt.slice(0, 16).replace("T", " ")}</span>
                <span className={`rounded-full px-3 py-1 text-xs ${job.status === "done" ? "bg-emerald-50 text-emerald-800" : job.status === "failed" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
