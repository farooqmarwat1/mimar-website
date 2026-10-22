"use client";
import { startTransition, useActionState, useEffect, useRef } from "react";
import { prepareAutoTopicAction } from "@/app/admin/blog/generate/actions";

export default function AutoTopicQueue({ needsTopic }: { needsTopic: boolean }) {
  const [state, action, pending] = useActionState(prepareAutoTopicAction, {});
  const requested = useRef(false);
  useEffect(() => {
    if (!needsTopic) requested.current = false;
    if (needsTopic && !requested.current) {
      requested.current = true;
      startTransition(action);
    }
  }, [needsTopic, action]);
  return <div className="mt-4 text-sm text-muted" aria-live="polite">
    {pending ? "AI is choosing the next topic for the queue…" : state.error ? <>
      <p role="alert">{state.error}</p>
      <button onClick={() => startTransition(action)} className="mt-2 underline">Try again</button>
    </> : "Topics are selected and queued automatically. The next queued topic is used when you generate a draft or the schedule runs."}
  </div>;
}
