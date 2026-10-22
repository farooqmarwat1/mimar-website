import Link from "next/link";
import JobForm from "@/components/admin/JobForm";
import { requireRole } from "@/lib/admin/auth";
import { emptyJobForm } from "@/lib/job-form-values";

export default async function NewJobPage() {
  await requireRole("jobs");
  return (
    <div>
      <Link href="/admin/jobs" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All jobs
      </Link>
      <h1 className="mb-8 mt-3 text-3xl font-medium tracking-tight">New job</h1>
      <JobForm initial={emptyJobForm} />
    </div>
  );
}
