import "server-only";
import { randomUUID } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isFirebaseConfigured } from "@/lib/firebase/admin";
import type { RequestInfo, Visit } from "@/lib/visits";
import {
  CHANNEL_LABELS,
  JOB_SEEKER_TAG,
  LEAD_STATUSES,
  STATUS_LABELS,
  isOpenStatus,
  type ActivityType,
  type Channel,
  type LeadLang,
  type LeadOrigin,
  type LeadPriority,
  type LeadStatus,
  type LoggableType,
  type MailStatus,
} from "@/lib/lead-constants";

/**
 * Leads (Firestore collection `siteLeads`): every contact-form submission is
 * saved here BEFORE the notification email goes out, so a lead that lands in a
 * spam folder - or a mailer that is down - never costs us the enquiry. Staff work
 * them in /admin/leads as a small CRM (pipeline, assignee, notes, follow-ups).
 *
 * Leads are personal data and are never public: nothing here is cached for the
 * site, and every reader is called only after requireRole / assertAccess("leads").
 * Dates are ISO strings (follow-ups are plain YYYY-MM-DD dates) so documents are
 * plain JSON, like src/lib/jobs.ts.
 */

export type Activity = {
  id: string;
  type: ActivityType;
  text: string;
  at: string;
  /** Staff email, or "website" / "system" for automatic entries. */
  by: string;
};

export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Lowercased copy of `email`, used to find repeat enquiries from the same person. */
  emailLower: string;
  phone?: string;
  service?: string;
  source?: string;
  message: string;
  lang: LeadLang;
  origin: LeadOrigin;
  /** Whether the studio notification email went out (website leads only). */
  mailStatus?: MailStatus;
  status: LeadStatus;
  priority: LeadPriority;
  assignee?: string;
  tags: string[];
  value?: number;
  currency?: string;
  /** YYYY-MM-DD. */
  nextFollowUpAt?: string;
  firstContactedAt?: string;
  lastContactedAt?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  /** Set when the message or the visit looks like a job seeker (see classifyLead). Never changes the status. */
  jobSeeker?: boolean;
  jobSeekerReasons?: string[];
  /** What the server learned from the submitting request itself: IP, geography, language, device. Website leads only. */
  client?: RequestInfo;
  /** The visitor's journey that day, copied from src/lib/visits.ts at submission. Absent when nothing was tracked. */
  visit?: Visit;
  activities: Activity[];
};

/** A lead without its timeline or full visitor record: what the list, board, stats and export need. */
export type LeadRow = Omit<Lead, "activities" | "client" | "visit"> & {
  client?: Pick<RequestInfo, "country" | "city">;
  visit?: Pick<Visit, "channel" | "landingPath" | "referrer" | "utm">;
};

// SITE_LEADS_COLLECTION is for local end-to-end tests only (so test leads never mix with real ones).
const COLLECTION = process.env.SITE_LEADS_COLLECTION?.trim() || "siteLeads";

const ROW_FIELDS = [
  "firstName", "lastName", "email", "emailLower", "phone", "service", "source", "message", "lang", "origin",
  "mailStatus", "status", "priority", "assignee", "tags", "value", "currency", "nextFollowUpAt",
  "firstContactedAt", "lastContactedAt", "lostReason", "createdAt", "updatedAt", "updatedBy",
  "jobSeeker", "jobSeekerReasons", "client.country", "client.city", "visit.channel", "visit.landingPath",
  "visit.referrer", "visit.utm",
] as const;

const col = () => adminDb().collection(COLLECTION);

function rowFromDoc(id: string, data: FirebaseFirestore.DocumentData): LeadRow {
  return {
    ...(data as Omit<LeadRow, "id" | "tags">),
    tags: Array.isArray(data.tags) ? data.tags : [],
    id,
  };
}

function leadFromDoc(id: string, data: FirebaseFirestore.DocumentData): Lead {
  return {
    ...(data as Omit<Lead, "id" | "tags" | "activities">),
    tags: Array.isArray(data.tags) ? data.tags : [],
    activities: Array.isArray(data.activities) ? data.activities : [],
    id,
  };
}

/** Firestore rejects undefined fields. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const today = (now = new Date()) => now.toISOString().slice(0, 10);

function activity(type: ActivityType, text: string, by: string, at: string): Activity {
  return { id: randomUUID(), type, text, at, by };
}

// ---- Writes ----

export type NewLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  phone?: string;
  service?: string;
  source?: string;
  lang?: LeadLang;
  origin?: LeadOrigin;
  mailStatus?: MailStatus;
  assignee?: string;
  /** Staff email for manual leads. */
  by?: string;
  /** Website leads: what the server read from the submitting request. */
  client?: RequestInfo;
  /** Website leads: the visitor's journey, when the tracker saw one. */
  visit?: Visit | null;
};

/** Saves a new lead and returns its id. Throws if Firestore is unavailable; callers decide how to cope. */
export async function createLead(input: NewLeadInput): Promise<string> {
  const now = new Date().toISOString();
  const origin = input.origin ?? "website";
  // Only the visitor's own words and path are judged; a lead typed in by staff is never flagged.
  const signal =
    origin === "website"
      ? classifyLead({ message: input.message, pages: input.visit?.pages.map((page) => page.p), landingPath: input.visit?.landingPath })
      : null;
  const reasons = signal?.likely ? signal.reasons : null;
  const lead: Omit<Lead, "id"> = {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    emailLower: input.email.toLowerCase(),
    phone: input.phone || undefined,
    service: input.service || undefined,
    source: input.source || undefined,
    message: input.message,
    lang: input.lang ?? "en",
    origin,
    mailStatus: input.mailStatus,
    status: "new",
    priority: "normal",
    assignee: input.assignee || undefined,
    tags: reasons ? [JOB_SEEKER_TAG] : [],
    createdAt: now,
    updatedAt: now,
    updatedBy: input.by,
    jobSeeker: signal ? reasons !== null : undefined,
    jobSeekerReasons: reasons ?? undefined,
    client: input.client,
    visit: input.visit ?? undefined,
    activities: [
      activity(
        "system",
        origin === "manual" ? "Lead added manually." : "Enquiry received through the website contact form.",
        input.by ?? "website",
        now,
      ),
      ...(reasons ? [activity("system", `Flagged as a likely job seeker: ${reasons.join("; ")}.`, "system", now)] : []),
    ],
  };
  const ref = await col().add(clean(lead));
  return ref.id;
}

/** Records whether the studio email went out. Deliberately leaves updatedAt alone. */
export async function setMailStatus(id: string, mailStatus: MailStatus) {
  await col().doc(id).update({ mailStatus });
}

export type LeadPatch = {
  status?: LeadStatus;
  priority?: LeadPriority;
  /** null clears it. */
  assignee?: string | null;
  tags?: string[];
  value?: number | null;
  currency?: string;
  nextFollowUpAt?: string | null;
  lostReason?: string | null;
};

/**
 * Applies a patch and writes a timeline entry for every change worth tracing
 * (status, owner, follow-up date, priority). Returns false when the lead is gone.
 */
export async function updateLead(id: string, patch: LeadPatch, by: string): Promise<boolean> {
  const ref = col().doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  const lead = leadFromDoc(id, doc.data()!);

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { updatedAt: now, updatedBy: by };
  const entries: Activity[] = [];
  const del = FieldValue.delete();

  if (patch.status && patch.status !== lead.status) {
    update.status = patch.status;
    entries.push(activity("status", `Status changed from ${STATUS_LABELS[lead.status]} to ${STATUS_LABELS[patch.status]}.`, by, now));
    // The first move out of "new" is the first response; the stats measure how long it took.
    if (lead.status === "new" && !lead.firstContactedAt) update.firstContactedAt = now;
  }
  if (patch.priority && patch.priority !== lead.priority) {
    update.priority = patch.priority;
    entries.push(activity("system", `Priority set to ${patch.priority}.`, by, now));
  }
  if (patch.assignee !== undefined && (patch.assignee ?? undefined) !== lead.assignee) {
    update.assignee = patch.assignee ?? del;
    entries.push(activity("assignment", patch.assignee ? `Assigned to ${patch.assignee}.` : "Unassigned.", by, now));
  }
  if (patch.nextFollowUpAt !== undefined && (patch.nextFollowUpAt ?? undefined) !== lead.nextFollowUpAt) {
    update.nextFollowUpAt = patch.nextFollowUpAt ?? del;
    entries.push(
      activity("followup", patch.nextFollowUpAt ? `Follow-up scheduled for ${patch.nextFollowUpAt}.` : "Follow-up cleared.", by, now),
    );
  }
  if (patch.tags) update.tags = patch.tags;
  if (patch.value !== undefined) update.value = patch.value ?? del;
  if (patch.currency) update.currency = patch.currency;
  if (patch.lostReason !== undefined) update.lostReason = patch.lostReason ?? del;
  if (entries.length) update.activities = FieldValue.arrayUnion(...entries);

  await ref.update(update);
  return true;
}

/**
 * Adds a note or a logged call / email / meeting to the timeline. Logging a real
 * contact stamps lastContactedAt, and on a brand-new lead it also moves the lead
 * to "contacted" so nobody has to do that by hand.
 */
export async function addActivity(id: string, input: { type: LoggableType; text: string }, by: string): Promise<boolean> {
  const ref = col().doc(id);
  const doc = await ref.get();
  if (!doc.exists) return false;
  const lead = leadFromDoc(id, doc.data()!);

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { updatedAt: now, updatedBy: by };
  const entries = [activity(input.type, input.text, by, now)];

  if (input.type !== "note") {
    update.lastContactedAt = now;
    if (!lead.firstContactedAt) update.firstContactedAt = now;
    if (lead.status === "new") {
      update.status = "contacted";
      entries.push(activity("status", `Status changed from ${STATUS_LABELS.new} to ${STATUS_LABELS.contacted}.`, by, now));
    }
  }
  update.activities = FieldValue.arrayUnion(...entries);
  await ref.update(update);
  return true;
}

export async function deleteLead(id: string) {
  await col().doc(id).delete();
}

// ---- Reads (uncached; call only after requireRole / assertAccess) ----

export async function listLeadsAdmin(): Promise<LeadRow[]> {
  const snap = await col()
    .select(...ROW_FIELDS)
    .get();
  return snap.docs.map((doc) => rowFromDoc(doc.id, doc.data())).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getLeadAdmin(id: string): Promise<Lead | null> {
  const doc = await col().doc(id).get();
  return doc.exists ? leadFromDoc(doc.id, doc.data()!) : null;
}

/** Other enquiries from the same email address, newest first. */
export async function getRelatedByEmail(email: string, exceptId: string): Promise<LeadRow[]> {
  const snap = await col().where("emailLower", "==", email.toLowerCase()).get();
  return snap.docs
    .filter((doc) => doc.id !== exceptId)
    .map((doc) => rowFromDoc(doc.id, doc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * For the nav and dashboard badges: how many leads are new, and how many open leads are past their
 * follow-up date. Never throws. Deliberately NOT cached: a cache key shared by every collection once
 * left a stale number from a test collection on the badge. Two cheap queries do the job: an
 * aggregate count (no documents read) and a range query on the few leads that have a follow-up date.
 */
export async function getLeadBadgeCounts(): Promise<{ newCount: number; overdue: number }> {
  if (!isFirebaseConfigured) return { newCount: 0, overdue: 0 };
  try {
    const [fresh, dated] = await Promise.all([
      col().where("status", "==", "new").count().get(),
      col().where("nextFollowUpAt", "<", today()).select("status", "nextFollowUpAt").get(),
    ]);
    return {
      newCount: fresh.data().count,
      overdue: dated.docs.filter((doc) => isOverdue(doc.data() as Pick<LeadRow, "status" | "nextFollowUpAt">)).length,
    };
  } catch (err) {
    console.error("[leads] could not count leads:", err instanceof Error ? err.message : err);
    return { newCount: 0, overdue: 0 };
  }
}

// ---- Pure helpers (unit-tested) ----

type FollowUp = Pick<LeadRow, "status" | "nextFollowUpAt">;

/** An open lead whose follow-up date is before today. */
export function isOverdue(lead: FollowUp, now = new Date()): boolean {
  return Boolean(lead.nextFollowUpAt) && isOpenStatus(lead.status) && lead.nextFollowUpAt! < today(now);
}

export function isDueToday(lead: FollowUp, now = new Date()): boolean {
  return isOpenStatus(lead.status) && lead.nextFollowUpAt === today(now);
}

export type LeadFilters = {
  q?: string;
  status?: LeadStatus;
  /** An email, or "unassigned". */
  assignee?: string;
  priority?: LeadPriority;
  source?: string;
  service?: string;
  lang?: LeadLang;
  overdue?: boolean;
  channel?: Channel;
  /** ISO 3166-1 alpha-2, or "unknown" for leads whose country could not be read. */
  country?: string;
  /** "only" keeps likely job seekers, "hide" drops them. */
  jobSeekers?: "only" | "hide";
};

export function filterLeads(rows: LeadRow[], filters: LeadFilters, now = new Date()): LeadRow[] {
  const q = filters.q?.trim().toLowerCase();
  return rows.filter((row) => {
    if (filters.status && row.status !== filters.status) return false;
    if (filters.channel && row.visit?.channel !== filters.channel) return false;
    if (filters.country && (filters.country === "unknown" ? row.client?.country : row.client?.country !== filters.country)) return false;
    if (filters.jobSeekers === "only" && !row.jobSeeker) return false;
    if (filters.jobSeekers === "hide" && row.jobSeeker) return false;
    if (filters.priority && row.priority !== filters.priority) return false;
    if (filters.lang && row.lang !== filters.lang) return false;
    if (filters.source && row.source !== filters.source) return false;
    if (filters.service && row.service !== filters.service) return false;
    if (filters.assignee) {
      if (filters.assignee === "unassigned" ? row.assignee : row.assignee !== filters.assignee) return false;
    }
    if (filters.overdue && !isOverdue(row, now)) return false;
    if (q) {
      const haystack = [row.firstName, row.lastName, row.email, row.phone, row.service, row.message, ...row.tags]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export type LeadStats = {
  total: number;
  newThisMonth: number;
  byStatus: Record<LeadStatus, number>;
  /** Sum of the estimated value of leads still open. */
  pipelineValue: number;
  /** won / (won + lost), or null before any lead is closed. */
  winRate: number | null;
  overdue: number;
  dueToday: number;
  /** Mean hours from enquiry to first contact, or null when nobody has been contacted yet. */
  avgFirstContactHours: number | null;
  bySource: { label: string; count: number }[];
  byService: { label: string; count: number }[];
  /** How the visitor arrived. Leads the tracker never saw (opt-out, ad blocker, added by hand) count as "Not tracked". */
  byChannel: { label: string; count: number }[];
  byCountry: { label: string; count: number }[];
  /** The page each tracked visitor first landed on, most common first (top 8). */
  byLanding: { label: string; count: number }[];
  jobSeekers: number;
};

function tally(values: (string | undefined)[], fallback = "Not specified") {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = value || fallback;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

export function computeStats(rows: LeadRow[], now = new Date()): LeadStats {
  const month = now.toISOString().slice(0, 7);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<LeadStatus, number>;
  for (const row of rows) byStatus[row.status] += 1;

  const closed = byStatus.won + byStatus.lost;
  const waits = rows
    .filter((row) => row.firstContactedAt)
    .map((row) => (Date.parse(row.firstContactedAt!) - Date.parse(row.createdAt)) / 3_600_000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0);

  return {
    total: rows.length,
    newThisMonth: rows.filter((row) => row.createdAt.startsWith(month)).length,
    byStatus,
    pipelineValue: rows.filter((row) => isOpenStatus(row.status)).reduce((sum, row) => sum + (row.value ?? 0), 0),
    winRate: closed ? byStatus.won / closed : null,
    overdue: rows.filter((row) => isOverdue(row, now)).length,
    dueToday: rows.filter((row) => isDueToday(row, now)).length,
    avgFirstContactHours: waits.length ? waits.reduce((sum, hours) => sum + hours, 0) / waits.length : null,
    bySource: tally(rows.map((row) => row.source)),
    byService: tally(rows.map((row) => row.service)),
    byChannel: tally(rows.map((row) => (row.visit?.channel ? CHANNEL_LABELS[row.visit.channel] : undefined)), "Not tracked"),
    byCountry: tally(rows.map((row) => row.client?.country), "Unknown"),
    byLanding: tally(rows.map((row) => row.visit?.landingPath), "Not tracked").slice(0, 8),
    jobSeekers: rows.filter((row) => row.jobSeeker).length,
  };
}

// Strong signals only. Words like "application", "position" or "opening" are deliberately left out:
// clients write "mobile application", "brand positioning" and "showroom opening" all the time.
// Lookarounds on letters instead of \b, because \b does not treat the é of "résumé" as a word character.
const JOB_WORDS =
  /(?<![a-z])(cv|resume|résumé|curriculum vitae|job|jobs|hiring|vacanc(y|ies)|internships?|interns?|careers?|recruitment|employment|looking for work|work experience|join (your|the) team)(?![a-z])/i;
const JOB_WORDS_AR = ["وظيفة", "وظائف", "توظيف", "التوظيف", "سيرة ذاتية", "السيرة الذاتية", "فرصة عمل", "فرص عمل", "متدرب", "تدريب صيفي"];

export type JobSignal = { likely: boolean; reasons: string[] };

/**
 * Does this enquiry look like a job seeker rather than a client? Judged from the visitor's own
 * message, and from landing on a careers page. It only labels: it never changes the status or deletes anything.
 */
export function classifyLead(input: { message: string; pages?: string[]; landingPath?: string }): JobSignal {
  const reasons: string[] = [];
  const word = input.message.match(JOB_WORDS)?.[0] ?? JOB_WORDS_AR.find((term) => input.message.includes(term));
  if (word) reasons.push(`message mentions "${word.toLowerCase()}"`);

  const onCareers = (path?: string) => /^\/(ar\/)?careers(\/|$)/.test(path ?? "");
  if (onCareers(input.landingPath)) reasons.push("first landed on a careers page");
  else if (reasons.length && input.pages?.some(onCareers)) reasons.push("also visited a careers page");

  return { likely: reasons.length > 0, reasons };
}

/**
 * One CSV cell. A cell starting with = + - @ (or a tab / carriage return) is
 * read as a formula by spreadsheet apps, and the message and name fields come
 * straight from the public form, so those get a leading apostrophe.
 */
export function csvCell(value: string | number | undefined): string {
  let text = value === undefined ? "" : String(value);
  // A phone number like +923001234567 starts with "+" but has no letters or brackets to run anything, so it stays as is.
  const plainNumber = /^[+-]?\d[\d\s().-]*$/.test(text);
  if (!plainNumber && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function leadsToCsv(rows: LeadRow[]): string {
  const header = [
    "Created", "First name", "Last name", "Email", "Phone", "Service", "Source", "Language", "Status", "Priority",
    "Assignee", "Tags", "Value", "Currency", "Next follow-up", "Last contacted", "Email delivery", "Likely job seeker",
    "Country", "City", "Channel", "Landing page", "Referrer", "UTM source", "UTM medium", "UTM campaign", "Message",
  ];
  const lines = rows.map((row) =>
    [
      row.createdAt, row.firstName, row.lastName, row.email, row.phone, row.service, row.source, row.lang,
      STATUS_LABELS[row.status], row.priority, row.assignee, row.tags.join("; "), row.value, row.currency,
      row.nextFollowUpAt, row.lastContactedAt, row.mailStatus, row.jobSeeker ? "yes" : "",
      row.client?.country, row.client?.city, row.visit?.channel ? CHANNEL_LABELS[row.visit.channel] : "",
      row.visit?.landingPath, row.visit?.referrer, row.visit?.utm?.source, row.visit?.utm?.medium,
      row.visit?.utm?.campaign, row.message,
    ]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}
