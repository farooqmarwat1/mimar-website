import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Shared by the scheduled routes under /api/cron (vercel.json).
 *
 * Vercel Cron calls them with `Authorization: Bearer $CRON_SECRET`. With no
 * secret configured every request is refused, so outsiders can never trigger
 * them to spend API credits or send email.
 */

export function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function parseEmails(value: string | undefined, fallback: string): string[] {
  // `||`, not `??`: a blank value copied from .env.example counts as unset.
  const raw = value?.trim() || fallback;
  if (raw.toLowerCase() === "none") return [];
  return raw
    .split(",")
    .map((address) => address.trim())
    .filter((address) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address));
}

// Who approves (To) and who is only kept informed (CC). Override with BLOG_NOTIFY_EMAIL / BLOG_NOTIFY_CC.
// The approvers are the two blog editors; info@ is the mailbox the owner reads.
const DEFAULT_APPROVERS = "muhammad.farooq@mim.archi,rabia.zaman@mim.archi";
const DEFAULT_CC = "info@mim.archi";

/** Recipients of the blog emails (draft approvals and the monthly report). */
export function blogRecipients(): { to: string[]; cc: string[] } {
  const to = parseEmails(process.env.BLOG_NOTIFY_EMAIL, DEFAULT_APPROVERS);
  const cc = parseEmails(process.env.BLOG_NOTIFY_CC, DEFAULT_CC).filter((address) => !to.includes(address));
  return { to, cc };
}
