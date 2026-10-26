"use client";
import { startTransition, useActionState } from "react";
import { prepareAutoTopicAction } from "@/app/(site)/admin/blog/generate/actions";

/**
 * Topics are planned by the scheduler after every run, so the queue normally
 * fills itself. Opening this page never calls the AI; the button below plans
 * the next topic on demand when the queue happens to be empty.
 */
export default function AutoTopicQueue({ needsTopic }: { needsTopic: boolean }) {
  const [state, action, pending] = useActionState(prepareAutoTopicAction, {});
  return (
    <div className="mt-4 text-sm text-muted" aria-live="polite">
      <p>Topics are selected and queued automatically after each draft. The next queued topic is used when you generate a draft or the schedule runs.</p>
      {state.error && <p role="alert" className="mt-2 text-accent">{state.error}</p>}
      {needsTopic && (
        <button type="button" disabled={pending} onClick={() => startTransition(action)} className="mt-3 underline disabled:opacity-50">
          {pending ? "AI is choosing the next topic…" : "Choose the next topic now"}
        </button>
      )}
    </div>
  );
}
