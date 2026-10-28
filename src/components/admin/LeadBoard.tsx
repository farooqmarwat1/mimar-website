"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { moveLeadAction } from "@/app/(site)/admin/leads/actions";
import {
  LEAD_STATUSES,
  PRIORITY_BADGE,
  STATUS_LABELS,
  formatDay,
  formatValue,
  type LeadPriority,
  type LeadStatus,
} from "@/lib/lead-constants";

/** What a board card needs: plain data, so the server can hand it over as props. */
export type BoardItem = {
  id: string;
  name: string;
  email: string;
  service?: string;
  priority: LeadPriority;
  assignee?: string;
  value?: number;
  currency?: string;
  nextFollowUpAt?: string;
  /** Worked out on the server, so the board never depends on the browser's clock. */
  followUp: "overdue" | "today" | null;
  status: LeadStatus;
  jobSeeker?: boolean;
};

const COLUMN_TINT: Record<LeadStatus, string> = {
  new: "border-t-amber-400",
  contacted: "border-t-sky-400",
  qualified: "border-t-indigo-400",
  proposal: "border-t-violet-400",
  won: "border-t-emerald-500",
  lost: "border-t-neutral-300",
};

export default function LeadBoard({ items }: { items: BoardItem[] }) {
  const [optimistic, moveOptimistic] = useOptimistic(items, (state, move: { id: string; status: LeadStatus }) =>
    state.map((item) => (item.id === move.id ? { ...item, status: move.status } : item)),
  );
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [, startTransition] = useTransition();

  function move(id: string, status: LeadStatus) {
    const current = optimistic.find((item) => item.id === id);
    if (!current || current.status === status) return;
    setError(null);
    startTransition(async () => {
      moveOptimistic({ id, status });
      const result = await moveLeadAction(id, status);
      // On failure the optimistic move rolls back by itself when the transition ends.
      if (!result.ok) setError(result.error ?? "Could not move that lead.");
    });
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div className="-mx-5 overflow-x-auto px-5 pb-4">
        <div className="grid min-w-max auto-cols-[17rem] grid-flow-col gap-4">
          {LEAD_STATUSES.map((status) => {
            const column = optimistic.filter((item) => item.status === status);
            const total = column.reduce((sum, item) => sum + (item.value ?? 0), 0);
            return (
              <section
                key={status}
                aria-label={`${STATUS_LABELS[status]} leads`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(status);
                }}
                onDragLeave={() => setDragOver((current) => (current === status ? null : current))}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(null);
                  const id = event.dataTransfer.getData("text/plain");
                  if (id) move(id, status);
                }}
                className={`rounded-2xl border border-t-4 border-line bg-white/60 p-3 transition-colors ${COLUMN_TINT[status]} ${dragOver === status ? "bg-white ring-2 ring-ink/20" : ""}`}
              >
                <header className="mb-3 flex items-baseline justify-between gap-2 px-1">
                  <h2 className="text-sm font-medium">{STATUS_LABELS[status]}</h2>
                  <span className="text-xs text-muted">
                    {column.length}
                    {total > 0 ? ` · ${total.toLocaleString("en-US")}` : ""}
                  </span>
                </header>
                <ul className="grid gap-3">
                  {column.map((item) => (
                    <li
                      key={item.id}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", item.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      className="cursor-grab rounded-xl border border-line bg-white p-3.5 text-sm shadow-sm active:cursor-grabbing"
                    >
                      <Link href={`/admin/leads/${item.id}`} className="font-medium hover:text-accent">
                        {item.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-muted">{item.service || item.email}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                        {item.jobSeeker && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-900">job seeker?</span>}
                        {item.priority !== "normal" && (
                          <span className={`rounded-full px-2 py-0.5 ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>
                        )}
                        {item.value !== undefined && (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-800">
                            {formatValue(item.value, item.currency)}
                          </span>
                        )}
                        {item.nextFollowUpAt && (
                          <span
                            className={`rounded-full px-2 py-0.5 ${
                              item.followUp === "overdue"
                                ? "bg-red-50 text-red-800"
                                : item.followUp === "today"
                                  ? "bg-amber-50 text-amber-900"
                                  : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {item.followUp === "overdue" ? "Overdue · " : item.followUp === "today" ? "Today · " : ""}
                            {formatDay(item.nextFollowUpAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted">{item.assignee ?? "Unassigned"}</span>
                        <label className="sr-only" htmlFor={`move-${item.id}`}>
                          Move {item.name} to
                        </label>
                        <select
                          id={`move-${item.id}`}
                          value={item.status}
                          onChange={(event) => move(item.id, event.target.value as LeadStatus)}
                          className="rounded-md border border-line bg-white px-1.5 py-1 text-xs"
                        >
                          {LEAD_STATUSES.map((option) => (
                            <option key={option} value={option}>
                              {STATUS_LABELS[option]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  ))}
                  {column.length === 0 && <li className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">Drop a lead here</li>}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
