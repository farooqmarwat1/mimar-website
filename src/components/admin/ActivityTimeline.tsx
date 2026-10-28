import { formatWhen, type ActivityType } from "@/lib/lead-constants";
import type { Activity } from "@/lib/leads";

const LABEL: Record<ActivityType, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  status: "Status",
  assignment: "Owner",
  followup: "Follow-up",
  system: "Update",
};

/** People's own entries stand out; automatic ones (status moves, owner changes) stay quiet. */
const PEOPLE: ActivityType[] = ["note", "call", "email", "meeting"];

export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const newestFirst = [...activities].sort((a, b) => b.at.localeCompare(a.at));
  if (newestFirst.length === 0) return <p className="text-sm text-muted">Nothing logged yet.</p>;

  return (
    <ol className="grid gap-4">
      {newestFirst.map((entry) => {
        const byPerson = PEOPLE.includes(entry.type);
        return (
          <li key={entry.id} className="grid grid-cols-[auto_1fr] gap-x-3">
            <span
              aria-hidden
              className={`mt-1.5 h-2.5 w-2.5 rounded-full ${byPerson ? "bg-accent" : "bg-line"}`}
            />
            <div>
              <p className="text-xs text-muted">
                <span className="font-medium uppercase tracking-[0.12em] text-ink">{LABEL[entry.type]}</span>
                {" · "}
                {formatWhen(entry.at)}
                {" · "}
                {entry.by}
              </p>
              <p className={`mt-1 whitespace-pre-wrap break-words text-sm ${byPerson ? "text-ink" : "text-muted"}`}>{entry.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
