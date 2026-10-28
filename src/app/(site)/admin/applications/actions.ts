"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { APPLICATION_STATUSES, deleteApplication, updateApplication } from "@/lib/applications";

// Applications are reviewed by whoever can manage jobs (HR and admins).
async function guard() {
  try {
    return await assertAccess("jobs");
  } catch (err) {
    if (err instanceof AdminAuthError) redirect("/admin/login");
    throw err;
  }
}

const schema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  note: z
    .string()
    .trim()
    .max(2000, "Keep the note under 2000 characters.")
    .optional()
    .transform((value) => value || null),
});

/** Saves the status and private note on an application. */
export async function saveApplicationAction(formData: FormData) {
  const session = await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const parsed = schema.safeParse({ status: formData.get("status"), note: formData.get("note") ?? undefined });
  if (!parsed.success) {
    redirect(`/admin/applications/${id}?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Check the details and try again.")}`);
  }
  if (!(await updateApplication(id, parsed.data, session.email))) redirect("/admin/applications");

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  redirect(`/admin/applications/${id}?saved=1`);
}

export async function deleteApplicationAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteApplication(id);
  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}
