"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { LEAD_LANGS, LEAD_PRIORITIES, LEAD_STATUSES, LOGGABLE_TYPES } from "@/lib/lead-constants";
import { addActivity, createLead, deleteLead, updateLead } from "@/lib/leads";

/** Lead data is private: only the admin pages need refreshing, never the public site. */
function refresh(id?: string) {
  revalidatePath("/admin/leads");
  if (id) revalidatePath(`/admin/leads/${id}`);
}

async function guard() {
  try {
    return await assertAccess("leads");
  } catch (err) {
    if (err instanceof AdminAuthError) redirect("/admin/login");
    throw err;
  }
}

const text = (max: number) => z.string().trim().max(max);
const optional = (max: number) =>
  text(max)
    .optional()
    .transform((value) => value || undefined);
const date = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Use a valid date.");

const saveSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES),
  assignee: z
    .union([z.literal(""), z.email().max(200)])
    .transform((value) => value || null)
    .optional(),
  tags: text(400)
    .optional()
    .transform((value) =>
      [...new Set((value ?? "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 10).map((tag) => tag.slice(0, 30)),
    ),
  value: text(20)
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .pipe(z.number().nonnegative().max(1_000_000_000).nullable()),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/)
    .optional()
    .or(z.literal("")),
  nextFollowUpAt: z
    .union([z.literal(""), date])
    .transform((value) => value || null)
    .optional(),
  lostReason: text(300)
    .optional()
    .transform((value) => value || null),
});

const fields = (formData: FormData) => Object.fromEntries([...formData.entries()].filter(([, value]) => typeof value === "string"));

/** Saves the status / owner / follow-up panel on a lead's page. */
export async function saveLeadAction(formData: FormData) {
  const session = await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const parsed = saveSchema.safeParse(fields(formData));
  if (!parsed.success) redirect(`/admin/leads/${id}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the details and try again.")}`);

  const data = parsed.data;
  const ok = await updateLead(
    id,
    {
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      tags: data.tags,
      value: data.value,
      currency: data.currency || undefined,
      nextFollowUpAt: data.nextFollowUpAt,
      // A reason only means something on a lost lead.
      lostReason: data.status === "lost" ? data.lostReason : null,
    },
    session.email,
  );
  if (!ok) redirect("/admin/leads");
  refresh(id);
  redirect(`/admin/leads/${id}?saved=1`);
}

export type MoveResult = { ok: boolean; error?: string };

/** Drag-and-drop on the board and the "Move to" select. Called from a client component, not a form. */
export async function moveLeadAction(id: string, status: string): Promise<MoveResult> {
  let session;
  try {
    session = await assertAccess("leads");
  } catch (err) {
    if (err instanceof AdminAuthError) return { ok: false, error: err.message };
    throw err;
  }
  const parsed = z.enum(LEAD_STATUSES).safeParse(status);
  if (!id || !parsed.success) return { ok: false, error: "Could not move that lead." };
  const ok = await updateLead(id, { status: parsed.data }, session.email);
  if (!ok) return { ok: false, error: "That lead no longer exists." };
  refresh(id);
  return { ok: true };
}

const activitySchema = z.object({
  type: z.enum(LOGGABLE_TYPES),
  text: text(2000).min(1, "Write a short note first."),
  nextFollowUpAt: z.union([z.literal(""), date]).optional(),
});

/** Adds a note or logs a call / email / meeting, optionally scheduling the next follow-up in the same step. */
export async function addActivityAction(formData: FormData) {
  const session = await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const parsed = activitySchema.safeParse(fields(formData));
  if (!parsed.success) redirect(`/admin/leads/${id}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the details and try again.")}#timeline`);

  const { type, text: note, nextFollowUpAt } = parsed.data;
  if (!(await addActivity(id, { type, text: note }, session.email))) redirect("/admin/leads");
  if (nextFollowUpAt) await updateLead(id, { nextFollowUpAt }, session.email);
  refresh(id);
  redirect(`/admin/leads/${id}?saved=1#timeline`);
}

export async function deleteLeadAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteLead(id);
  refresh();
  redirect("/admin/leads");
}

const manualSchema = z.object({
  firstName: text(80).min(1, "Enter a first name."),
  lastName: text(80).min(1, "Enter a last name."),
  email: z.email("Enter a valid email address.").max(200),
  phone: optional(40),
  service: optional(80),
  source: optional(80),
  lang: z.enum(LEAD_LANGS).catch("en"),
  message: text(5000).min(1, "Add what the lead asked for."),
});

/** For leads that did not come through the form: phone calls, WhatsApp, referrals, or ones rescued from a spam folder. */
export async function createManualLeadAction(formData: FormData) {
  const session = await guard();
  const parsed = manualSchema.safeParse(fields(formData));
  if (!parsed.success) redirect(`/admin/leads/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the details and try again.")}`);

  const id = await createLead({ ...parsed.data, origin: "manual", by: session.email });
  refresh();
  redirect(`/admin/leads/${id}?saved=1`);
}
