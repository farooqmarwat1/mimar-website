"use client";
import { startTransition, useActionState } from "react";
import { addIdeaAction, collectNowAction, saveCompetitorsAction, writeIdeaNextAction, type IdeasState } from "@/app/(site)/admin/blog/ideas/actions";
import { MAX_COMPETITORS } from "@/lib/ideas/competitor-seeds";
import { fieldClass, hintClass, labelClass, primaryButtonClass, secondaryButtonClass, textareaClass } from "@/components/admin/styles";

/** The interactive parts of /admin/blog/ideas. Every action checks access itself (actions.ts). */

function Feedback({ state }: { state: IdeasState }) {
  if (state.error) return <p role="alert" className="text-sm text-red-800">{state.error}</p>;
  if (state.message) return <p className="text-sm text-emerald-800">{state.message}</p>;
  return null;
}

export function WriteIdeaButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState<IdeasState, FormData>(writeIdeaNextAction, {});
  return (
    <form action={action} className="grid justify-items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline disabled:opacity-50">
        {pending ? "Planning…" : "Write this next"}
      </button>
      {state.error && <span role="alert" className="max-w-xs text-right text-xs text-red-800">{state.error}</span>}
    </form>
  );
}

export function CollectIdeasButton({ running }: { running: boolean }) {
  const [state, action, pending] = useActionState<IdeasState>(collectNowAction, {});
  return (
    <div className="grid gap-2" aria-live="polite">
      <button type="button" disabled={pending || running} onClick={() => startTransition(action)} className={secondaryButtonClass}>
        {running ? "Collecting…" : pending ? "Starting…" : "Collect ideas now"}
      </button>
      <Feedback state={state} />
    </div>
  );
}

export function CompetitorsForm({ domains }: { domains: string[] }) {
  const [state, action, pending] = useActionState<IdeasState, FormData>(saveCompetitorsAction, {});
  return (
    <form action={action} className="grid gap-3">
      <label className={labelClass}>
        Competitor websites
        <textarea name="competitors" defaultValue={domains.join("\n")} rows={10} placeholder={"example-studio.com\nanother-agency.ae"} className={`${textareaClass} !min-h-28`} />
        <span className={hintClass}>
          One per line, up to {MAX_COMPETITORS}. It starts with a researched list of studios in Pakistan, the UAE, the USA and Canada; edit it freely. Their public blog sitemaps are read weekly to find
          subjects they cover and we do not. Their pages are never copied or used as sources.
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={secondaryButtonClass}>
          {pending ? "Saving…" : "Save competitors"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function AddIdeaForm() {
  const [state, action, pending] = useActionState<IdeasState, FormData>(addIdeaAction, {});
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Where it comes from
          <select name="approach" defaultValue="social" className={fieldClass}>
            <option value="social">Social trend (TikTok, Pinterest, Instagram)</option>
            <option value="news">Industry news</option>
            <option value="community">A question asked online</option>
            <option value="customers">A question clients ask us</option>
            <option value="search">A Google search</option>
          </select>
        </label>
        <label className={labelClass}>
          Search phrase <span className={hintClass}>(optional, 2-6 words)</span>
          <input name="keyword" maxLength={80} placeholder="japandi villa interior" className={fieldClass} />
        </label>
      </div>
      <label className={labelClass}>
        The idea
        <input name="title" required minLength={12} maxLength={200} placeholder="Japandi interiors are trending for Gulf villas: what works in a hot climate?" className={fieldClass} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Link <span className={hintClass}>(optional: the post or article)</span>
          <input name="url" type="url" placeholder="https://" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Why it is worth writing <span className={hintClass}>(optional)</span>
          <input name="note" maxLength={200} placeholder="Several viral TikToks this week" className={fieldClass} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Adding…" : "Add idea"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
