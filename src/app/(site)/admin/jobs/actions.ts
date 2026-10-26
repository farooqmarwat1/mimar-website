"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { parseTextBlocks } from "@/lib/content-blocks";
import { contact } from "@/lib/site-config";
import { slugify } from "@/lib/slug";
import {
  APPLY_METHODS,
  EMPLOYMENT_TYPES,
  JOBS_TAG,
  JOB_STATUSES,
  SALARY_PERIODS,
  WORK_MODES,
  deleteJob,
  getJobAdmin,
  isJobSlugTaken,
  saveJob,
  type Job,
  type JobStatus,
} from "@/lib/jobs";

export type JobFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: boolean;
  /** Echoed back so a failed submit does not wipe what the editor typed. */
  values?: Record<string, string>;
};

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const optionalNumber = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value) : undefined))
  .pipe(z.number().nonnegative().max(1_000_000_000).optional());

const schema = z
  .object({
    intent: z.enum(JOB_STATUSES),
    title: z.string().trim().min(3, "Enter a job title.").max(120),
    slug: optionalText(80),
    department: z.string().trim().min(2, "Enter a department.").max(80),
    location: z.string().trim().min(2, "Enter a location.").max(120),
    country: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2}$/, "Use a 2-letter country code, e.g. PK."),
    workMode: z.enum(WORK_MODES),
    employmentType: z.enum(EMPLOYMENT_TYPES),
    experienceLevel: optionalText(80),
    salaryMin: optionalNumber,
    salaryMax: optionalNumber,
    salaryCurrency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).optional().or(z.literal("")),
    salaryPeriod: z.enum(SALARY_PERIODS).optional().or(z.literal("")),
    summary: z.string().trim().min(20, "Write a short summary (at least 20 characters).").max(300, "Keep the summary under 300 characters."),
    description: z.string().max(20000),
    applyMethod: z.enum(APPLY_METHODS),
    applyEmail: optionalText(200),
    applyUrl: optionalText(500),
    validThrough: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined)
      .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.").optional()),
  })
  .superRefine((value, ctx) => {
    if (value.applyMethod === "email" && value.applyEmail && !z.email().safeParse(value.applyEmail).success) {
      ctx.addIssue({ code: "custom", path: ["applyEmail"], message: "Enter a valid email address." });
    }
    if (value.applyMethod === "url") {
      const ok = value.applyUrl && /^https:\/\/[^\s]+$/.test(value.applyUrl) && z.url().safeParse(value.applyUrl).success;
      if (!ok) ctx.addIssue({ code: "custom", path: ["applyUrl"], message: "Enter a full https:// link." });
    }
    if (value.salaryMin !== undefined && value.salaryMax !== undefined && value.salaryMin > value.salaryMax) {
      ctx.addIssue({ code: "custom", path: ["salaryMax"], message: "Maximum must be at least the minimum." });
    }
    if ((value.salaryMin !== undefined || value.salaryMax !== undefined) && !value.salaryCurrency) {
      ctx.addIssue({ code: "custom", path: ["salaryCurrency"], message: "Add a 3-letter currency code, e.g. PKR." });
    }
    if (value.intent === "open" && value.validThrough && value.validThrough < new Date().toISOString().slice(0, 10)) {
      ctx.addIssue({ code: "custom", path: ["validThrough"], message: "The closing date is in the past." });
    }
  });

function revalidateJobs(slug: string) {
  updateTag(JOBS_TAG);
  revalidatePath("/careers");
  revalidatePath("/ar/careers"); // the Arabic careers page lists open roles too
  revalidatePath(`/careers/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}

function snapshot(formData: FormData) {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string" && key !== "id") values[key] = value;
  return values;
}

export async function saveJobAction(_prev: JobFormState, formData: FormData): Promise<JobFormState> {
  const values = snapshot(formData);

  let session;
  try {
    session = await assertAccess("jobs");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message, values };
    throw err;
  }

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please fix the highlighted fields.", fieldErrors, values };
  }
  const input = parsed.data;

  const blocks = parseTextBlocks(input.description);
  if (input.intent === "open" && blocks.length === 0) {
    return { error: "Add the job description before opening the role.", fieldErrors: { description: "Required to open the role." }, values };
  }

  const id = String(formData.get("id") ?? "") || null;
  const existing = id ? await getJobAdmin(id) : null;
  if (id && !existing) return { error: "That job no longer exists.", values };

  // The URL is locked once the job has been public, so shared links keep working.
  let slug = existing?.postedAt ? existing.slug : slugify(input.slug || input.title);
  if (!slug) return { error: "Could not build a URL from that title.", fieldErrors: { title: "Use letters or numbers." }, values };
  if (await isJobSlugTaken(slug, id ?? undefined)) {
    if (input.slug && !existing?.postedAt) return { error: "That URL is already used by another job.", fieldErrors: { slug: "Already taken." }, values };
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const now = new Date().toISOString();
  const status: JobStatus = input.intent;
  const hasSalary = input.salaryMin !== undefined || input.salaryMax !== undefined;

  const job: Omit<Job, "id"> = {
    slug,
    title: input.title,
    department: input.department,
    location: input.location,
    country: input.country,
    workMode: input.workMode,
    employmentType: input.employmentType,
    experienceLevel: input.experienceLevel,
    salary: hasSalary
      ? {
          min: input.salaryMin,
          max: input.salaryMax,
          currency: input.salaryCurrency || "PKR",
          period: input.salaryPeriod || "month",
        }
      : undefined,
    summary: input.summary,
    blocks,
    applyMethod: input.applyMethod,
    applyEmail: input.applyMethod === "email" ? input.applyEmail || contact.email : undefined,
    applyUrl: input.applyMethod === "url" ? input.applyUrl : undefined,
    status,
    // postedAt is stamped the first time a job goes open and never moves, so datePosted stays honest.
    postedAt: existing?.postedAt ?? (status === "open" ? now : undefined),
    validThrough: input.validThrough,
    updatedAt: now,
    updatedBy: session.email,
  };

  const savedId = await saveJob(id, job);
  revalidateJobs(slug);
  if (existing && existing.slug !== slug) revalidateJobs(existing.slug);

  if (!id) redirect(`/admin/jobs/${savedId}?saved=1`);
  return { saved: true, values };
}

async function guard() {
  try {
    return await assertAccess("jobs");
  } catch (err) {
    if (err instanceof AdminAuthError) redirect("/admin/login");
    throw err;
  }
}

export async function setJobStatusAction(formData: FormData) {
  const session = await guard();
  const id = String(formData.get("id") ?? "");
  const status = z.enum(JOB_STATUSES).safeParse(formData.get("status"));
  if (!id || !status.success) return;
  const job = await getJobAdmin(id);
  if (!job) return;
  if (status.data === "open" && job.blocks.length === 0) return;

  const now = new Date().toISOString();
  await saveJob(id, {
    ...job,
    status: status.data,
    postedAt: job.postedAt ?? (status.data === "open" ? now : undefined),
    updatedAt: now,
    updatedBy: session.email,
  });
  revalidateJobs(job.slug);
  revalidatePath("/admin/jobs");
}

export async function deleteJobAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const job = await getJobAdmin(id);
  if (!job) return;
  await deleteJob(id);
  revalidateJobs(job.slug);
  redirect("/admin/jobs");
}
