import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/admin/AutoRefresh";
import { cardClass, primaryButtonClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { getJob } from "@/lib/generation";

const STALL_AFTER_MS = 8 * 60 * 1000;

// A run that stopped reporting (serverless time limit, deploy) would otherwise spin forever.
function hasStalled(updatedAt: string) {
  return Date.now() - new Date(updatedAt).getTime() > STALL_AFTER_MS;
}

const STEPS = [
  ["researching", "Researching the web"],
  ["writing", "Writing the article"],
  ["checking", "Running quality checks"],
  ["done", "Draft saved"],
] as const;

export default async function GenerationJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  await requireRole("blog");
  const { jobId } = await params;
  const job = await getJob(jobId);
  if (!job) notFound();

  const inProgress = job.status !== "done" && job.status !== "failed";
  const stalled = inProgress && hasStalled(job.updatedAt);
  const stepIndex = STEPS.findIndex(([status]) => status === job.status);

  return (
    <div>
      <AutoRefresh active={inProgress && !stalled} />
      <Link href="/admin/blog/generate" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← Draft with AI
      </Link>
      <h1 className="mb-2 mt-3 text-3xl font-medium tracking-tight">{job.topic}</h1>
      <p className="mb-8 text-sm text-muted">
        {job.geo ? `${job.geo} · ` : ""}started by {job.createdBy}
      </p>

      <div className={`${cardClass} grid gap-6`}>
        <ol className="grid gap-3 text-sm">
          {STEPS.map(([status, label], index) => {
            const doneStep = job.status === "done" || (stepIndex > index && job.status !== "failed");
            const current = status === job.status && inProgress;
            return (
              <li key={status} className={`flex items-center gap-3 ${doneStep || current ? "text-ink" : "text-muted"}`}>
                <span
                  className={`flex size-6 items-center justify-center rounded-full border text-xs ${doneStep ? "border-emerald-600 bg-emerald-600 text-white" : current ? "border-ink" : "border-line"}`}
                  aria-hidden="true"
                >
                  {doneStep ? "✓" : index + 1}
                </span>
                {label}
                {current && !stalled && <span className="text-muted">…</span>}
              </li>
            );
          })}
        </ol>

        {job.status === "failed" && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {job.error ?? "The run failed."}
          </p>
        )}
        {stalled && (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            This run stopped reporting progress and has probably timed out. Start a new one.
          </p>
        )}

        {job.status === "done" && job.postId && (
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/blog/${job.postId}`} className={primaryButtonClass}>
              Review the draft
            </Link>
          </div>
        )}
        {(job.status === "failed" || stalled) && (
          <Link href="/admin/blog/generate" className={`${secondaryButtonClass} w-fit`}>
            Try again
          </Link>
        )}

        {job.log.length > 0 && (
          <div>
            <p className="eyebrow mb-2 text-muted">Progress</p>
            <ul className="grid gap-1 font-mono text-xs text-muted">
              {job.log.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}
        {job.usage && (
          <p className="text-xs text-muted">
            {job.usage.searches} web searches · {job.usage.inputTokens.toLocaleString("en-US")} input / {job.usage.outputTokens.toLocaleString("en-US")} output tokens
          </p>
        )}
      </div>
    </div>
  );
}
