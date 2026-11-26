"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ServiceOption = { value: string; label: string };

/**
 * A dropdown with a checkbox per service. Controlled: `value` holds the English titles (what the
 * studio inbox and /admin/leads expect), the labels follow the page language. The list floats over
 * the fields below (two columns when there is room), so opening it never makes the pop-up longer.
 */
export default function ServicesMultiSelect({
  label,
  placeholder,
  selectedLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  /** "{count} selected" */
  selectedLabel: string;
  options: ServiceOption[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const labelId = useId();

  // Close when focus or a click moves outside the field.
  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const chosen = options.filter((option) => value.includes(option.value));
  const summary =
    chosen.length === 0 ? placeholder : chosen.length <= 2 ? chosen.map((option) => option.label).join(", ") : selectedLabel.replace("{count}", String(chosen.length));

  function toggle(service: string) {
    onChange(value.includes(service) ? value.filter((v) => v !== service) : [...value, service]);
  }

  return (
    <div
      ref={root}
      className="relative flex flex-col gap-1"
      onKeyDown={(event) => {
        // Escape closes the list first, not the whole pop-up.
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <span id={labelId} className="eyebrow text-muted">
        {label}
      </span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${label}: ${summary}`}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-9 w-full items-center justify-between gap-3 border-b border-line bg-transparent py-1 text-start text-base outline-none transition-colors focus:border-ink"
      >
        <span className={`truncate ${chosen.length ? "" : "text-muted/50"}`}>{summary}</span>
        <svg
          className={`size-3 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M2 4.5 6 8.5 10 4.5" />
        </svg>
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-full z-20 grid max-h-56 overflow-y-auto border border-line bg-paper py-1 shadow-[0_12px_32px_rgba(14,15,18,.14)] sm:grid-cols-2"
        >
          {options.map((option) => {
            const checked = value.includes(option.value);
            return (
              <li key={option.value} role="option" aria-selected={checked}>
                <label className="flex min-h-9 cursor-pointer items-center gap-3 px-3 py-1.5 text-sm transition-colors hover:bg-ink/[.04]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.value)}
                    className="size-4 shrink-0 cursor-pointer accent-ink"
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
