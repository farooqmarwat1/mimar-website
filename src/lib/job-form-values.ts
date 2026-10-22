import { blocksToText } from "@/lib/content-blocks";
import type { JobFormInitial } from "@/components/admin/JobForm";
import type { Job } from "@/lib/jobs";

// Kept out of lib/jobs.ts (server-only) so it can be imported by plain server pages without pulling the form's client module into a server-only file.
export function jobToFormValues(job: Job): JobFormInitial {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    slugLocked: Boolean(job.postedAt),
    department: job.department,
    location: job.location,
    country: job.country,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel ?? "",
    salaryMin: job.salary?.min?.toString() ?? "",
    salaryMax: job.salary?.max?.toString() ?? "",
    salaryCurrency: job.salary?.currency ?? "",
    salaryPeriod: job.salary?.period ?? "",
    summary: job.summary,
    description: blocksToText(job.blocks),
    applyMethod: job.applyMethod,
    applyEmail: job.applyEmail ?? "",
    applyUrl: job.applyUrl ?? "",
    validThrough: job.validThrough ?? "",
    status: job.status,
  };
}

export const emptyJobForm: JobFormInitial = {
  title: "",
  slug: "",
  slugLocked: false,
  department: "",
  location: "Islamabad",
  country: "PK",
  workMode: "onsite",
  employmentType: "full-time",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "PKR",
  salaryPeriod: "month",
  summary: "",
  description: "## Responsibilities\n- \n\n## Requirements\n- \n\n## What we offer\n- ",
  applyMethod: "email",
  applyEmail: "",
  applyUrl: "",
  validThrough: "",
  status: "draft",
};
