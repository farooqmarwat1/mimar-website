"use client";
import { useActionState } from "react";
import { importBriefsAction, queueBriefAction, type GenerateState } from "@/app/(site)/admin/blog/generate/actions";
import { cardClass, fieldClass, hintClass, labelClass, primaryButtonClass, secondaryButtonClass, textareaClass } from "@/components/admin/styles";

/** "Write from a brief" on /admin/blog/generate: an SEO editor's planned article, or a whole file of them. */

function Feedback({ state }: { state: GenerateState }) {
  if (state.error) return <p role="alert" className="text-sm text-red-800">{state.error}</p>;
  if (state.message) return <p className="text-sm text-emerald-800">{state.message}</p>;
  return null;
}

export function ImportBriefsButton({ sets }: { sets: { key: string; label: string }[] }) {
  const [state, action, pending] = useActionState<GenerateState, FormData>(importBriefsAction, {});
  return (
    <form action={action} className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <select name="set" className={`${fieldClass} max-w-md`} defaultValue={sets[0]?.key}>
          {sets.map((set) => (
            <option key={set.key} value={set.key}>
              {set.label}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className={secondaryButtonClass}>
          {pending ? "Queuing…" : "Queue these briefs"}
        </button>
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function BriefForm({ categories }: { categories: { slug: string; label: string }[] }) {
  const [state, action, pending] = useActionState<GenerateState, FormData>(queueBriefAction, {});
  return (
    <form action={action} className={`${cardClass} grid gap-5`}>
      <div>
        <h2 className="text-lg font-medium">Write from a brief</h2>
        <p className={`${hintClass} mt-1`}>
          For an article our SEO consultant has already planned. The AI still researches the web and must pass every quality check, but it uses your title, SEO title and description exactly, follows your outline and links your call-to-action page. The brief jumps the queue; the draft still waits for approval.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Title <span className={hintClass}>(must contain the primary keyword)</span>
          <input name="title" required minLength={12} maxLength={120} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Primary keyword <span className={hintClass}>(2-6 words)</span>
          <input name="keyword" required maxLength={80} placeholder="real estate rendering dubai" className={fieldClass} />
        </label>
        <label className={labelClass}>
          SEO title <span className={hintClass}>(optional, 50-60 characters with the keyword)</span>
          <input name="seoTitle" maxLength={60} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Meta description <span className={hintClass}>(optional, 120-155 characters with the keyword)</span>
          <input name="description" maxLength={155} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Secondary keywords <span className={hintClass}>(comma separated)</span>
          <input name="secondaryKeywords" maxLength={400} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Target place <span className={hintClass}>(optional: “Dubai, UAE”)</span>
          <input name="geo" maxLength={80} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Call-to-action page <span className={hintClass}>(a path on our site)</span>
          <input name="ctaPath" required maxLength={120} placeholder="/3d-visualization-services-uae" className={fieldClass} />
        </label>
        <label className={labelClass}>
          Category
          <select name="category" required className={fieldClass} defaultValue={categories[0]?.slug}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={labelClass}>
        Outline <span className={hintClass}>(one heading per line: “H2: …” or “H3: …”; at least 3 H2s, the keyword in 2 of them)</span>
        <textarea name="outline" required className={textareaClass} placeholder={"H2: Beyond Static Renders in Dubai\nH3: Immersive 360 VR Tours\nH2: …"} />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className={labelClass}>
          Arabic keyword <span className={hintClass}>(optional)</span>
          <input name="arKeyword" dir="rtl" maxLength={80} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Arabic SEO title <span className={hintClass}>(optional, up to 60)</span>
          <input name="arSeoTitle" dir="rtl" maxLength={60} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Arabic description <span className={hintClass}>(optional, up to 160)</span>
          <input name="arDescription" dir="rtl" maxLength={160} className={fieldClass} />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={labelClass}>
          Notes for the writer <span className={hintClass}>(claims to avoid, angle to take)</span>
          <input name="notes" maxLength={600} className={fieldClass} />
        </label>
        <label className={labelClass}>
          Planned visuals <span className={hintClass}>(for the editor; never sent to the AI)</span>
          <input name="visual" maxLength={600} className={fieldClass} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Queuing…" : "Queue this brief"}
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
