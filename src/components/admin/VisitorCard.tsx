import { cardClass } from "@/components/admin/styles";
import { CHANNEL_LABELS, countryName, formatDuration, formatWhen } from "@/lib/lead-constants";
import type { Lead } from "@/lib/leads";

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  );
}

const none = <span className="text-muted">Unknown</span>;

/** Where the enquiry came from and what the visitor did first. Website leads only; the data is described in src/lib/visits.ts. */
export default function VisitorCard({ lead }: { lead: Lead }) {
  const { client, visit } = lead;
  if (lead.origin !== "website") return null;

  const place = [client?.city, client?.region, client?.country ? countryName(client.country) : undefined].filter(Boolean).join(", ");
  const utm = visit?.utm ? Object.entries(visit.utm).map(([key, value]) => `${key}: ${value}`).join(" · ") : "";

  return (
    <section className={cardClass}>
      <h2 className="eyebrow text-muted">Visitor</h2>

      {lead.jobSeeker && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-medium">Likely a job seeker</span>
          {lead.jobSeekerReasons?.length ? `: ${lead.jobSeekerReasons.join("; ")}.` : "."} Check before replying with a project quote.
        </p>
      )}

      <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        <Item label="Location">{place || none}</Item>
        <Item label="IP address">{client?.ip ?? none}</Item>
        <Item label="Device">
          {client ? `${client.deviceType} · ${client.browser} on ${client.os}` : none}
        </Item>
        <Item label="Browser language">{client?.lang ?? none}</Item>
        {visit && (
          <>
            <Item label="Arrived via">
              {CHANNEL_LABELS[visit.channel]}
              {visit.referrer ? ` · ${visit.referrer}` : ""}
            </Item>
            <Item label="Landing page">{visit.landingPath}</Item>
            {utm && <Item label="Campaign tags">{utm}</Item>}
            <Item label="Time on site">
              {formatDuration(visit.activeSeconds)} · {visit.pageCount} {visit.pageCount === 1 ? "page" : "pages"}
            </Item>
            {visit.tz && <Item label="Time zone">{visit.tz}</Item>}
            {visit.screenWidth && <Item label="Screen width">{visit.screenWidth}px</Item>}
          </>
        )}
      </dl>

      {visit ? (
        <div className="mt-6 border-t border-line pt-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Pages viewed before sending</h3>
          <ol className="mt-3 grid gap-2 text-sm">
            {visit.pages.map((page, index) => (
              <li key={`${page.at}-${index}`} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="break-all">{page.p}</span>
                <span className="text-xs text-muted">
                  {formatWhen(page.at)}
                  {page.s > 0 ? ` · ${formatDuration(page.s)}` : ""}
                </span>
              </li>
            ))}
          </ol>
          {visit.pageCount > visit.pages.length && (
            <p className="mt-2 text-xs text-muted">Showing the first {visit.pages.length} of {visit.pageCount} page views.</p>
          )}
        </div>
      ) : (
        <p className="mt-5 text-xs text-muted">
          No browsing history for this visitor: they may have blocked tracking or sent Do Not Track, or they browsed on an earlier day.
          The details above come from the form submission itself.
        </p>
      )}
    </section>
  );
}
