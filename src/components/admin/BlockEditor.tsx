"use client";

import { useState } from "react";
import { parseBlocks, splitInlineLinks, countWords, isTextBlock } from "@/lib/content-blocks";
import { hintClass, textareaClass } from "@/components/admin/styles";

/**
 * Plain-text editor for the site's block format (## heading, - bullet,
 * blank line between paragraphs) with a live preview of what will be rendered.
 */
export default function BlockEditor({
  name,
  defaultValue,
  rows = 16,
  invalid,
  onChangeText,
}: {
  name: string;
  defaultValue: string;
  rows?: number;
  invalid?: boolean;
  onChangeText?: (value: string) => void;
}) {
  const [text, setText] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const blocks = parseBlocks(text);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={hintClass}>
          <code>## Heading</code> · <code>### Sub-heading</code> · <code>- Bullet</code> · blank line between paragraphs · {countWords(blocks)} words
          {blocks.some((block) => !isTextBlock(block)) && <> · lines like <code>[image: /path | description | 1920x1080]</code> are pictures: move or delete the whole line</>}
        </p>
        <button type="button" onClick={() => setPreview((value) => !value)} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      <textarea
        name={name}
        rows={rows}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChangeText?.(event.target.value);
        }}
        aria-invalid={invalid || undefined}
        className={`${textareaClass} ${preview ? "hidden" : ""} ${invalid ? "border-accent" : ""}`}
      />

      {preview && (
        <div className="min-h-40 rounded-lg border border-line bg-white p-5">
          {blocks.length === 0 && <p className="text-sm text-muted">Nothing to preview yet.</p>}
          {blocks.map((block, index) => {
            if (block.type === "img") return <p key={index} className="mt-3 rounded border border-dashed border-line p-2 text-xs text-muted">Picture: {block.alt || block.src}</p>;
            if (block.type === "video") return <p key={index} className="mt-3 rounded border border-dashed border-line p-2 text-xs text-muted">Video: {block.src}</p>;
            if (block.type === "embed") return <p key={index} className="mt-3 rounded border border-dashed border-line p-2 text-xs text-muted">YouTube: {block.id}</p>;
            const inline = splitInlineLinks(block.text).map((part, i) =>
              part.href ? (
                <span key={i} className="text-accent underline">
                  {part.text}
                </span>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            );
            if (block.type === "h2") return <h2 key={index} className="mb-3 mt-6 text-xl font-medium first:mt-0">{inline}</h2>;
            if (block.type === "h3") return <h3 key={index} className="mb-2 mt-4 text-lg font-medium">{inline}</h3>;
            if (block.type === "li") return <p key={index} className="ml-5 mt-1.5 text-sm before:-ml-4 before:mr-2 before:text-accent before:content-['•']">{inline}</p>;
            return <p key={index} className="mt-3 text-sm leading-relaxed">{inline}</p>;
          })}
        </div>
      )}
    </div>
  );
}
