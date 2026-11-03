import Link from "next/link";
import { dismissIdeaAction } from "@/app/(site)/admin/blog/ideas/actions";
import { AddIdeaForm, CollectIdeasButton, CompetitorsForm, WriteIdeaButton } from "@/components/admin/IdeasControls";
import { cardClass, hintClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { APPROACHES, SOURCE_LABELS, approachInfo, freshIdeas, ideaStrength, parseMix, type Idea } from "@/lib/ai/idea-plan";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { COLLECTORS } from "@/lib/ideas/collect";
import { getCompetitors, getIdeasStatus, isCollecting, listIdeas, type IdeasStatus } from "@/lib/ideas/store";

// "Collect now" runs the collectors after the response (actions.ts) within this limit.
export const maxDuration = 300;

const stateBadge: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-800",
  off: "bg-neutral-100 text-neutral-600",
  error: "bg-red-50 text-red-800",
};

const pakistanTime = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" });

function Evidence({ idea }: { idea: Idea }) {
  const { score, comments, count, note, url, fame, signals } = idea.evidence;
  const parts = [
    SOURCE_LABELS[idea.source],
    idea.region,
    fame ? `fame ${fame}/100` : "",
    count && count > 1 && !fame ? `${count} ${idea.source === "leads" ? "enquiries" : idea.source === "autocomplete" ? "searches" : "posts"}` : "",
    score ? `${score.toLocaleString("en-US")} reactions` : "",
    comments ? `${comments.toLocaleString("en-US")} comments` : "",
    `added ${idea.createdAt.slice(0, 10)}`,
  ].filter(Boolean);
  return (
    <span className="mt-1 block text-xs text-muted">
      {idea.keyword && idea.keyword !== idea.title.toLowerCase() ? <>“{idea.keyword}” · </> : null}
      {parts.join(" · ")}
      {signals?.length ? <span className="block">Why it counts as established: {signals.join("; ")}.</span> : null}
      {note && note !== idea.title ? <span className="block">{note}</span> : null}
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer nofollow" className="text-accent hover:underline">
          See source
        </a>
      ) : null}
    </span>
  );
}

function StatusPanel({ status }: { status: IdeasStatus | null }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="text-xs text-muted">
          <tr className="border-b border-line">
            <th className="p-4 font-medium">Source</th>
            <th className="p-4 font-medium">Approach</th>
            <th className="p-4 font-medium">Last run</th>
            <th className="p-4 font-medium">New ideas</th>
            <th className="p-4 font-medium">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {COLLECTORS.map((collector) => {
            const run = status?.sources[collector.key];
            return (
              <tr key={collector.key} className="align-top">
                <td className="p-4 font-medium">{collector.label}</td>
                <td className="p-4">{approachInfo(collector.approach)?.label}</td>
                <td className="p-4">
                  {run ? (
                    <span className={`rounded-full px-3 py-1 text-xs ${stateBadge[run.state] ?? ""}`}>{run.state === "off" ? "not set up" : run.state}</span>
                  ) : (
                    <span className="text-muted">never</span>
                  )}
                </td>
                <td className="p-4">{run ? `${run.added} of ${run.found}` : "–"}</td>
                <td className="max-w-md p-4 text-xs text-muted">{run?.message ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function BlogIdeasPage() {
  await requireRole("blog");
  const [ideas, status, competitors] = isFirebaseConfigured ? await Promise.all([listIdeas(), getIdeasStatus(), getCompetitors()]) : [[], null, []];
  const fresh = freshIdeas(ideas);
  const running = isCollecting(status);
  const mix = parseMix(process.env.BLOG_APPROACH_MIX);
  const total = Object.values(mix).reduce((sum, weight) => sum + weight, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Blog</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Blog ideas</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every Sunday the studio collects ideas from six places. The Monday and Thursday drafts take them in turn, and you can pick any idea to be written next. Every draft still waits for
            your approval.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/blog/generate" className={secondaryButtonClass}>
            Draft with AI
          </Link>
          <Link href="/admin/blog/approaches" className={secondaryButtonClass}>
            Approaches
          </Link>
          <Link href="/admin/blog/performance" className={secondaryButtonClass}>
            Performance
          </Link>
        </div>
      </div>

      {!isFirebaseConfigured && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Firebase is not configured, so ideas cannot be collected or stored. Set the FIREBASE_* variables (see .env.example).
        </p>
      )}

      <dl className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {APPROACHES.map((item) => (
          <div key={item.key} className={`${cardClass} !p-5`}>
            <dt className="font-medium">{item.label}</dt>
            <dd className="mt-1 text-xs text-muted">{item.description}</dd>
            <dd className="mt-3 text-xs">
              {total ? Math.round((mix[item.key] / total) * 100) : 0}% of automatic drafts · {fresh.filter((idea) => idea.approach === item.key).length} ideas ready
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Sources</h2>
            <p className={`${hintClass} mt-1`}>
              {status?.lastRunAt ? `Last collected ${pakistanTime(status.lastRunAt)} (Pakistan time)${status.error ? `, failed: ${status.error}` : ""}.` : "Not collected yet."} Runs every
              Sunday automatically.
            </p>
          </div>
          {isFirebaseConfigured && <CollectIdeasButton running={running} />}
        </div>
        <StatusPanel status={status} />
      </section>

      {APPROACHES.map((item) => {
        const list = fresh.filter((idea) => idea.approach === item.key).sort((a, b) => ideaStrength(b.evidence) - ideaStrength(a.evidence));
        return (
          <section key={item.key} className="mt-10">
            <h2 className="eyebrow mb-3 text-muted">
              {item.label} ({list.length})
            </h2>
            {list.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">No ideas ready. They appear after the next collection.</p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
                {list.slice(0, 25).map((idea) => (
                  <li key={idea.id} className="flex flex-wrap items-start gap-x-6 gap-y-2 p-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{idea.title}</span>
                      <Evidence idea={idea} />
                    </div>
                    <div className="flex items-start gap-5">
                      <WriteIdeaButton id={idea.id} />
                      <form action={dismissIdeaAction}>
                        <input type="hidden" name="id" value={idea.id} />
                        <button type="submit" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-accent">
                          Dismiss
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {isFirebaseConfigured && (
        <>
          <section className={`${cardClass} mt-10`}>
            <h2 className="text-lg font-medium">Add an idea</h2>
            <p className={`${hintClass} mb-5 mt-1`}>
              For trends you spot on TikTok or Pinterest (they have no free trends feed), questions clients ask in meetings, or news worth explaining.
            </p>
            <AddIdeaForm />
          </section>

          <section className={`${cardClass} mt-6`}>
            <h2 className="mb-4 text-lg font-medium">Competitor gap</h2>
            <CompetitorsForm domains={competitors} />
          </section>
        </>
      )}
    </div>
  );
}
