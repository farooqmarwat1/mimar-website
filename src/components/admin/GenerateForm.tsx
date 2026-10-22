"use client";

import { useActionState } from "react";
import { startGenerationAction, type GenerateState } from "@/app/admin/blog/generate/actions";
import { cardClass, fieldClass, hintClass, labelClass, primaryButtonClass } from "@/components/admin/styles";

export default function GenerateForm({ categories, regions }: { categories: { slug: string; label: string }[]; regions: string[] }) {
  const [state, action, pending] = useActionState<GenerateState, FormData>(startGenerationAction, {});
  const v = (key: string) => state.values?.[key] ?? "";

  return (
    <form action={action} className={`${cardClass} grid gap-5`}>
      <label className={labelClass}>
        Topic or target keyword
        <input
          name="topic"
          required
          defaultValue={v("topic")}
          placeholder="How much does 3D architectural rendering cost for a residential tower?"
          className={fieldClass}
        />
        <span className={hintClass}>A specific question or keyword works best. The AI researches it on the web and writes an original article.</span>
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className={labelClass}>
          Target location (optional)
          <input name="geo" list="regions" defaultValue={v("geo")} placeholder="Dubai" className={fieldClass} />
          <datalist id="regions">
            {regions.map((region) => (
              <option key={region} value={region} />
            ))}
          </datalist>
          <span className={hintClass}>Adds region-specific facts and local search terms.</span>
        </label>
        <label className={labelClass}>
          Category (optional)
          <select name="category" defaultValue={v("category")} className={fieldClass}>
            <option value="">Let the AI choose</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className={labelClass}>
        Pages to start from (optional, up to 3)
        <textarea name="seedUrls" rows={3} defaultValue={v("seedUrls")} placeholder="https://…" className={fieldClass} />
        <span className={hintClass}>One link per line. They are read as background only; the article is never copied from them.</span>
      </label>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Starting…" : "Research & write a draft"}
        </button>
        <span className={hintClass}>Takes 2-5 minutes. The result is a draft - nothing is published automatically.</span>
      </div>
    </form>
  );
}
