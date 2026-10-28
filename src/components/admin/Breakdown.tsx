/** A small ranked list with proportional bars: "how they found us", "where they are", "top pages". */
export default function Breakdown({
  title,
  rows,
  total,
  limit = 5,
}: {
  title: string;
  rows: { label: string; count: number }[];
  /** What a full bar stands for. */
  total: number;
  limit?: number;
}) {
  return (
    <div>
      <h2 className="eyebrow text-muted">{title}</h2>
      <ul className="mt-3 grid gap-2 text-sm">
        {rows.slice(0, limit).map((row) => (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate" title={row.label}>
                {row.label}
              </span>
              <span className="text-xs text-muted">{row.count}</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-neutral-100">
              <div className="h-1 rounded-full bg-ink/70" style={{ width: `${Math.max(4, Math.round((row.count / Math.max(total, 1)) * 100))}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
