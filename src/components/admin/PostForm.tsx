"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { savePostAction, type PostFormState } from "@/app/(site)/admin/blog/actions";
import BlockEditor from "@/components/admin/BlockEditor";
import { cardClass, fieldClass, hintClass, labelClass, primaryButtonClass, secondaryButtonClass, textareaClass } from "@/components/admin/styles";
import { selectBlogCover } from "@/lib/blog-covers";

export type PostFormInitial = {
  id?: string;
  title: string;
  slug: string;
  /** Public address, e.g. /blog/my-post; fixed for imported articles. */
  path: string;
  legacy: boolean;
  slugLocked: boolean;
  seoTitle: string;
  description: string;
  categories: string[];
  keywords: string;
  geoTerms: string;
  body: string;
  faq: string;
  related: string;
  sources: string;
  coverUrl: string;
  coverAlt: string;
  status: string;
  origin: string;
  notes: string[];
};

export type CategoryOption = { slug: string; label: string };

function Field({ label, hint, error, children }: { label: string; hint?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <label className={labelClass}>
      <span>{label}</span>
      {children}
      {hint && !error && <span className={hintClass}>{hint}</span>}
      {error && <span className="text-xs font-normal text-accent">{error}</span>}
    </label>
  );
}

function Counter({ value, ideal, max }: { value: number; ideal: number; max: number }) {
  const tone = value > max ? "text-accent" : value > ideal ? "text-amber-700" : "text-muted";
  return (
    <span className={`text-xs font-normal ${tone}`}>
      {value} / {ideal} characters{value > ideal ? " - may be cut off in search results" : ""}
    </span>
  );
}

/** Resize and re-encode in the browser so uploads stay well under the 4 MB request limit. */
async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process the image."))), "image/webp", 0.85));
}

export default function PostForm({ initial, categories, saved }: { initial: PostFormInitial; categories: CategoryOption[]; saved?: boolean }) {
  const [state, action, pending] = useActionState<PostFormState, FormData>(savePostAction, {});
  const v = (key: Exclude<keyof PostFormInitial, "categories" | "notes" | "legacy" | "slugLocked">) => state.values?.[key] ?? String(initial[key] ?? "");
  const err = (key: string) => state.fieldErrors?.[key];

  const [title, setTitle] = useState(v("title"));
  const [seoTitle, setSeoTitle] = useState(v("seoTitle"));
  const [description, setDescription] = useState(v("description"));
  const [selected, setSelected] = useState<string[]>(initial.categories);
  const [coverUrl, setCoverUrl] = useState(v("coverUrl"));
  const [coverAlt, setCoverAlt] = useState(v("coverAlt"));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const blob = await compressToWebp(file);
      const body = new FormData();
      body.append("file", new File([blob], "cover.webp", { type: blob.type }));
      const res = await fetch("/admin/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed.");
      setCoverUrl(data.url);
      setCoverAlt("");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const notes = [...initial.notes, ...(state.warnings ?? [])];

  return (
    <form action={action} className="grid gap-6">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}

      {(state.saved || saved) && !state.error && (
        <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          Saved. Published changes are live on the site right away.
        </p>
      )}
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {initial.origin === "ai" && initial.status === "draft" && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          AI draft - check every fact, figure and claim against the listed sources before publishing. The automatic cover comes from Mimar’s service library; review its relevance and alt text.
        </p>
      )}
      {initial.legacy && (
        <p className="rounded-lg bg-sky-50 p-3 text-sm text-sky-900">
          Imported WordPress article. Its address ({initial.path}) is fixed so search rankings and inbound links keep working. Changing the text, title or description here updates the live page; the Arabic version is refreshed automatically.
        </p>
      )}
      {notes.length > 0 && (
        <ul className="grid gap-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      )}

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">Article</h2>
        <Field label="Title (the page heading)" error={err("title")}>
          <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
        </Field>
        <div className="grid gap-2">
          <p className="text-sm font-medium">Article text</p>
          <BlockEditor name="body" defaultValue={v("body")} rows={24} invalid={Boolean(err("body"))} />
          {err("body") && <p className="text-xs text-accent">{err("body")}</p>}
        </div>
        {err("links") && <p className="text-xs text-accent">{err("links")}</p>}
      </section>

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">Search &amp; AI answer engines</h2>
        <Field label="SEO title" hint={<Counter value={(seoTitle || title).length} ideal={60} max={70} />} error={err("seoTitle")}>
          <input name="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title} className={fieldClass} />
        </Field>
        <Field label="Meta description" hint={<Counter value={description.length} ideal={155} max={175} />} error={err("description")}>
          <textarea name="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Keywords" hint="Comma separated. The main phrase first." error={err("keywords")}>
            <input name="keywords" defaultValue={v("keywords")} className={fieldClass} />
          </Field>
          <Field label="Locations this post targets" hint="Cities or countries, comma separated (e.g. Dubai, Riyadh, Islamabad).">
            <input name="geoTerms" defaultValue={v("geoTerms")} className={fieldClass} />
          </Field>
        </div>
        <Field
          label="FAQ (optional)"
          hint="Shown on the page and sent to Google as FAQ data. Format: a line starting Q: then a line starting A:, blank line between pairs."
        >
          <textarea name="faq" rows={8} defaultValue={v("faq")} className={textareaClass} />
        </Field>
      </section>

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">Cover image</h2>
        <input type="hidden" name="coverUrl" value={coverUrl} />
        {coverUrl ? (
          <div className="relative aspect-[16/9] max-w-xl overflow-hidden rounded-xl bg-line">
            <Image src={coverUrl} alt="" fill sizes="576px" className="object-cover" />
          </div>
        ) : (
          <p className={hintClass}>No cover image. Choose a matching library image or upload your own.</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => {
            const cover = selectBlogCover({ title, category: selected[0] });
            setCoverUrl(cover.url);
            setCoverAlt(cover.alt);
          }} className={secondaryButtonClass}>Use matching library image</button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0])} className="text-sm" />
          {coverUrl && (
            <button type="button" onClick={() => setCoverUrl("")} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
              Remove
            </button>
          )}
          {uploading && <span className="text-sm text-muted">Uploading…</span>}
        </div>
        {(uploadError || err("coverUrl")) && <p className="text-xs text-accent">{uploadError || err("coverUrl")}</p>}
        <Field label="Describe the image (alt text)" hint="For screen readers and search. Required if there is a cover." error={err("coverAlt")}>
          <input name="coverAlt" value={coverAlt} onChange={event => setCoverAlt(event.target.value)} className={fieldClass} />
        </Field>
      </section>

      <section className={`${cardClass} grid gap-5`}>
        <h2 className="text-lg font-medium">Organisation</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium">Categories</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {categories.map((option) => (
                <label key={option.slug} className="flex items-center gap-2 text-sm font-normal">
                  <input
                    type="checkbox"
                    name="categories"
                    value={option.slug}
                    checked={selected.includes(option.slug)}
                    onChange={(event) => setSelected((current) => (event.target.checked ? [...current, option.slug] : current.filter((slug) => slug !== option.slug)))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <span className={hintClass}>The article is listed on each ticked category page.</span>
            {err("category") && <span className="text-xs text-accent">{err("category")}</span>}
          </fieldset>
          {initial.slugLocked ? (
            <p className="self-end pb-2 text-sm text-muted">
              <strong className="text-ink">{initial.path}</strong> · locked because this post has been public.
              <input type="hidden" name="slug" value={initial.slug} />
            </p>
          ) : (
            <Field label="URL ending (optional)" hint="Created from the title if blank. Locked once published." error={err("slug")}>
              <input name="slug" defaultValue={v("slug")} placeholder="3d-rendering-costs-in-dubai" className={fieldClass} />
            </Field>
          )}
        </div>
        <Field
          label="Related reading (optional)"
          hint="One per line: Label | /page-on-this-site. Link the matching service page plus 1-3 related articles."
          error={err("related")}
        >
          <textarea name="related" rows={4} defaultValue={v("related")} className={textareaClass} />
        </Field>
        <Field label="Sources (optional)" hint="One per line: Title | https://link. Listed at the bottom of the post." error={err("sources")}>
          <textarea name="sources" rows={4} defaultValue={v("sources")} className={textareaClass} />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" name="intent" value="published" disabled={pending || uploading} className={primaryButtonClass}>
          {initial.status === "published" ? "Save & keep published" : "Publish"}
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending || uploading}
          className={secondaryButtonClass}
          onClick={(event) => {
            if (initial.status === "published" && !window.confirm(`Unpublish this article? ${initial.path} will stop working (404) and it disappears from the blog, the sitemap and search results until you publish it again.`)) {
              event.preventDefault();
            }
          }}
        >
          {initial.status === "published" ? "Unpublish (back to draft)" : "Save draft"}
        </button>
        {pending && <span className="text-sm text-muted">Saving…</span>}
      </div>
    </form>
  );
}
