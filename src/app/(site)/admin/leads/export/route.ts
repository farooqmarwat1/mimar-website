import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { filterLeads, leadsToCsv, listLeadsAdmin, type LeadFilters } from "@/lib/leads";
import { CHANNELS, LEAD_LANGS, LEAD_PRIORITIES, LEAD_STATUSES } from "@/lib/lead-constants";

// Under /admin on purpose: the session cookie is scoped to that path.
export const dynamic = "force-dynamic";

const pick = <T extends string>(value: string | null, allowed: readonly T[]) =>
  value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

/** Downloads the leads matching the same filters the list page is showing. */
export async function GET(request: Request) {
  try {
    await assertAccess("leads");
  } catch (err) {
    if (err instanceof AdminAuthError) return Response.json({ error: err.message }, { status: err.status });
    throw err;
  }

  const params = new URL(request.url).searchParams;
  const filters: LeadFilters = {
    q: params.get("q") || undefined,
    status: pick(params.get("status"), LEAD_STATUSES),
    priority: pick(params.get("priority"), LEAD_PRIORITIES),
    lang: pick(params.get("lang"), LEAD_LANGS),
    assignee: params.get("assignee") || undefined,
    source: params.get("source") || undefined,
    service: params.get("service") || undefined,
    overdue: params.get("overdue") === "1",
    channel: pick(params.get("channel"), CHANNELS),
    country: params.get("country") || undefined,
    jobSeekers: pick(params.get("jobSeekers"), ["only", "hide"] as const),
  };

  const rows = filterLeads(await listLeadsAdmin(), filters);
  const stamp = new Date().toISOString().slice(0, 10);
  // The BOM makes Excel read the file as UTF-8, so Arabic messages stay intact.
  return new Response(`﻿${leadsToCsv(rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mimar-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
