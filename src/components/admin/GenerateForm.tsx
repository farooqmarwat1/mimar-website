"use client";
import { useActionState } from "react";
import { startGenerationAction, type GenerateState } from "@/app/(site)/admin/blog/generate/actions";
import { cardClass, hintClass, primaryButtonClass } from "@/components/admin/styles";
export default function GenerateForm() {
  const [state, action, pending] = useActionState<GenerateState, FormData>(startGenerationAction, {});
  return <form action={action} className={cardClass + " grid gap-5"}>
    <h2 className="text-lg font-medium">Generate a draft automatically</h2>
    <p className={hintClass}>AI chooses the next topic, location and category, then researches and writes the article. No topic entry is needed.</p>
    {state.error && <p role="alert" className="text-sm text-red-800">{state.error}</p>}
    <div className="flex flex-wrap items-center gap-4">
      <button type="submit" disabled={pending} className={primaryButtonClass}>{pending ? "Selecting topic…" : "Choose topic & write a draft"}</button>
      <span className={hintClass}>Takes 2–5 minutes. Review and approval are required before publishing.</span>
    </div>
  </form>;
}
