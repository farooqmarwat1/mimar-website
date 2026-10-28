/**
 * The lead vocabulary (statuses, priorities, labels) and small formatters.
 * No "server-only" here on purpose: the kanban board is a client component and
 * needs these, while src/lib/leads.ts (the Firestore store) is server-only.
 */

export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
export const LEAD_PRIORITIES = ["low", "normal", "high"] as const;
export const LOGGABLE_TYPES = ["note", "call", "email", "meeting"] as const;
export const ACTIVITY_TYPES = [...LOGGABLE_TYPES, "status", "assignment", "followup", "system"] as const;
export const MAIL_STATUSES = ["sent", "failed", "skipped"] as const;
export const LEAD_ORIGINS = ["website", "manual"] as const;
export const LEAD_LANGS = ["en", "ar"] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];
export type LoggableType = (typeof LOGGABLE_TYPES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type MailStatus = (typeof MAIL_STATUSES)[number];
export type LeadOrigin = (typeof LEAD_ORIGINS)[number];
export type LeadLang = (typeof LEAD_LANGS)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

/** How a visitor reached the site (see src/lib/visits.ts). */
export const CHANNELS = ["direct", "organic", "social", "paid", "email", "referral"] as const;
export type Channel = (typeof CHANNELS)[number];
export const CHANNEL_LABELS: Record<Channel, string> = {
  direct: "Direct",
  organic: "Search",
  social: "Social",
  paid: "Paid",
  email: "Email",
  referral: "Referral",
};

/** Added automatically to a lead that looks like a job seeker (see classifyLead in src/lib/leads.ts). */
export const JOB_SEEKER_TAG = "job-seeker";

/** Statuses that still need work: they count for follow-ups and the open pipeline value. */
export const OPEN_STATUSES: readonly LeadStatus[] = ["new", "contacted", "qualified", "proposal"];
export const isOpenStatus = (status: LeadStatus) => OPEN_STATUSES.includes(status);

/** Badge colours, in the same family as statusBadgeClass in components/admin/styles.ts. */
export const STATUS_BADGE: Record<LeadStatus, string> = {
  new: "bg-amber-50 text-amber-900",
  contacted: "bg-sky-50 text-sky-900",
  qualified: "bg-indigo-50 text-indigo-900",
  proposal: "bg-violet-50 text-violet-900",
  won: "bg-emerald-50 text-emerald-800",
  lost: "bg-neutral-100 text-neutral-600",
};

export const PRIORITY_BADGE: Record<LeadPriority, string> = {
  low: "bg-neutral-100 text-neutral-600",
  normal: "bg-neutral-100 text-neutral-800",
  high: "bg-red-50 text-red-800",
};

/** The studio works in Pakistan, so timestamps are shown in its time zone on every device. */
const WHEN = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" });
const DAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "12 Mar 2026, 14:05" from an ISO timestamp. */
export const formatWhen = (iso: string) => WHEN.format(new Date(iso));

/** "12 Mar 2026" from a YYYY-MM-DD follow-up date. */
export const formatDay = (day: string) => DAY.format(new Date(`${day}T00:00:00Z`));

export function formatValue(value: number | undefined, currency = "PKR") {
  return value === undefined ? "" : `${currency} ${value.toLocaleString("en-US")}`;
}

/** "3 min 12 s" from a number of seconds. */
export function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** "Pakistan" from "PK". Falls back to the code itself. */
export function countryName(code: string) {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export const fullName =(lead: { firstName: string; lastName: string }) => `${lead.firstName} ${lead.lastName}`.trim();
