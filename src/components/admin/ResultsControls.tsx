"use client";
import { startTransition, useActionState } from "react";
import { checkResultsNowAction, type ResultsState } from "@/app/(site)/admin/blog/approaches/actions";
import { secondaryButtonClass } from "@/components/admin/styles";

/** "Check now" on /admin/blog/approaches. The action checks access itself. */
export function CheckResultsButton({ running }: { running: boolean }) {
  const [state, action, pending] = useActionState<ResultsState>(checkResultsNowAction, {});
  return (
    <div className="grid justify-items-end gap-2" aria-live="polite">
      <button type="button" disabled={pending || running} onClick={() => startTransition(action)} className={secondaryButtonClass}>
        {running ? "Checking…" : pending ? "Starting…" : "Check now"}
      </button>
      {state.error && <p role="alert" className="text-sm text-red-800">{state.error}</p>}
      {state.message && <p className="text-sm text-emerald-800">{state.message}</p>}
    </div>
  );
}
