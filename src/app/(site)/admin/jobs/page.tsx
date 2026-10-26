import Link from "next/link";
import { setJobStatusAction } from "@/app/(site)/admin/jobs/actions";
import { primaryButtonClass, statusBadgeClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { isJobLive, listJobsAdmin, type Job } from "@/lib/jobs";

function StatusButton({ job, status, label }: { job: Job; status: string; label: string }) {
  return (
    <form action={setJobStatusAction}>
      <input type="hidden" name="id" value={job.id} />
      <input type="hidden" name="status" value={status} />
      <button type="submit" className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
        {label}
      </button>
    </form>
  );
}

export default async function AdminJobsPage() {
  await requireRole("jobs");
  const jobs = isFirebaseConfigured ? await listJobsAdmin() : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Careers</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Job postings</h1>
        </div>
        <Link href="/admin/jobs/new" className={primaryButtonClass}>
          New job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          No jobs yet. Create one and publish it to show it on /careers.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line rounded-2xl border border-line bg-white">
          {jobs.map((job) => {
            const expired = job.status === "open" && !isJobLive(job);
            const label = expired ? "expired" : job.status;
            return (
              <li key={job.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/jobs/${job.id}`} className="font-medium hover:text-accent">
                    {job.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {job.department} · {job.location} · {job.employmentType}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${expired ? "bg-neutral-100 text-neutral-600" : (statusBadgeClass[job.status] ?? "")}`}
                >
                  {label}
                </span>
                <div className="flex items-center gap-5">
                  <Link href={`/admin/jobs/${job.id}`} className="text-xs uppercase tracking-[0.14em] hover:text-accent">
                    Edit
                  </Link>
                  {job.status === "open" ? (
                    <StatusButton job={job} status="closed" label="Close" />
                  ) : (
                    <StatusButton job={job} status="open" label={job.status === "closed" ? "Reopen" : "Publish"} />
                  )}
                  {job.status !== "draft" && (
                    <Link href={`/careers/${job.slug}`} target="_blank" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
                      View
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
