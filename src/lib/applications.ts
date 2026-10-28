import "server-only";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import type { LeadLang, MailStatus } from "@/lib/lead-constants";

/**
 * Job applications (Firestore collection `siteApplications`), sent from /careers/apply and reviewed in
 * /admin/applications by HR. Kept completely apart from client enquiries (src/lib/leads.ts) so a job
 * seeker never lands in the sales pipeline and a project enquiry never lands in HR's inbox.
 *
 * Like leads, an application is saved BEFORE the notification email is sent, so one that lands in a
 * spam folder - or a mailer that is down - is not lost. Applicants give a link to their CV or portfolio;
 * no files are uploaded. Personal data: admin and HR only, never public, never logged.
 * Dates are ISO strings so documents are plain JSON.
 */

export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "rejected", "hired"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  rejected: "Not progressing",
  hired: "Hired",
};

export const APPLICATION_STATUS_BADGE: Record<ApplicationStatus, string> = {
  new: "bg-amber-50 text-amber-900",
  reviewing: "bg-sky-50 text-sky-900",
  shortlisted: "bg-indigo-50 text-indigo-900",
  rejected: "bg-neutral-100 text-neutral-600",
  hired: "bg-emerald-50 text-emerald-800",
};

/** What the role field holds when the applicant is not applying for a listed role. */
export const GENERAL_APPLICATION = "General application";

export type Application = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  /** The title of the open role they chose, or GENERAL_APPLICATION. */
  role: string;
  /** Link to a CV or portfolio. Always http(s): validated before it is saved. */
  portfolioUrl: string;
  message: string;
  lang: LeadLang;
  /** Whether the HR notification email went out. */
  mailStatus?: MailStatus;
  status: ApplicationStatus;
  /** HR's private note. */
  note?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
};

// SITE_APPLICATIONS_COLLECTION is for local end-to-end tests only (so test applications never mix with real ones).
const COLLECTION = process.env.SITE_APPLICATIONS_COLLECTION?.trim() || "siteApplications";

const col = () => adminDb().collection(COLLECTION);

function fromDoc(id: string, data: FirebaseFirestore.DocumentData): Application {
  return { ...(data as Omit<Application, "id">), id };
}

/** Firestore rejects undefined fields. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Only http(s) links are ever shown as links, so a stored "javascript:" value could not run. */
export const isWebUrl = (value: string) => /^https?:\/\//i.test(value);

export type NewApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  portfolioUrl: string;
  message: string;
  lang?: LeadLang;
};

/** Saves an application and returns its id. Throws if Firestore is unavailable; the caller decides how to cope. */
export async function createApplication(input: NewApplicationInput): Promise<string> {
  const now = new Date().toISOString();
  const application: Omit<Application, "id"> = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone || undefined,
    role: input.role,
    portfolioUrl: input.portfolioUrl,
    message: input.message,
    lang: input.lang ?? "en",
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  const ref = await col().add(clean(application));
  return ref.id;
}

/** Records whether the HR email went out. Deliberately leaves updatedAt alone. */
export async function setApplicationMailStatus(id: string, mailStatus: MailStatus) {
  await col().doc(id).update({ mailStatus });
}

/** Returns false when the application no longer exists. */
export async function updateApplication(
  id: string,
  patch: { status: ApplicationStatus; note: string | null },
  by: string,
): Promise<boolean> {
  const ref = col().doc(id);
  if (!(await ref.get()).exists) return false;
  await ref.update({
    status: patch.status,
    note: patch.note ?? null,
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  });
  return true;
}

export async function deleteApplication(id: string) {
  await col().doc(id).delete();
}

// ---- Reads (uncached; call only after requireRole / assertAccess) ----

export async function listApplicationsAdmin(): Promise<Application[]> {
  const snap = await col().get();
  return snap.docs.map((doc) => fromDoc(doc.id, doc.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getApplicationAdmin(id: string): Promise<Application | null> {
  const doc = await col().doc(id).get();
  return doc.exists ? fromDoc(doc.id, doc.data()!) : null;
}

/** For the dashboard badge. Never throws. */
export async function countNewApplications(): Promise<number> {
  if (!isFirebaseConfigured) return 0;
  try {
    const snap = await col().where("status", "==", "new").select().get();
    return snap.size;
  } catch (err) {
    console.error("[applications] could not count applications:", err instanceof Error ? err.message : err);
    return 0;
  }
}

export function filterApplications(rows: Application[], filters: { status?: ApplicationStatus; q?: string }): Application[] {
  const q = filters.q?.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (q && ![row.firstName, row.lastName, row.email, row.role, row.message].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });
}
