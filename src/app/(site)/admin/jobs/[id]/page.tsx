import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteJobAction } from "@/app/(site)/admin/jobs/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import JobForm from "@/components/admin/JobForm";
import { dangerButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { jobToFormValues } from "@/lib/job-form-values";
import { getJobAdmin } from "@/lib/jobs";

export default async function EditJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("jobs");
  const { id } = await params;
  const { saved } = await searchParams;
  const job = await getJobAdmin(id);
  if (!job) notFound();

  return (
    <div>
      <Link href="/admin/jobs" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All jobs
      </Link>
      <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">{job.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {job.status} · last edited by {job.updatedBy}
            {job.status !== "draft" && (
              <>
                {" · "}
                <Link href={`/careers/${job.slug}`} target="_blank" className="text-accent hover:underline">
                  View live page
                </Link>
              </>
            )}
          </p>
        </div>
        <form action={deleteJobAction}>
          <input type="hidden" name="id" value={job.id} />
          <ConfirmButton message={`Permanently delete "${job.title}"? Close it instead if you may reopen it.`} className={dangerButtonClass}>
            Delete
          </ConfirmButton>
        </form>
      </div>
      <JobForm initial={jobToFormValues(job)} saved={saved === "1"} />
    </div>
  );
}
