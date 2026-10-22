// Shared class strings for the staff portal. Plain Tailwind on the site's tokens
// (ink / paper / accent / line / muted) so /admin looks like the rest of the brand.

export const labelClass = "grid gap-2 text-sm font-medium text-ink";
export const hintClass = "text-xs font-normal text-muted";
export const fieldClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink";
export const textareaClass = `${fieldClass} min-h-40 font-mono leading-relaxed`;
export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 text-xs font-medium uppercase tracking-[0.16em] text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-ink px-6 text-xs font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-50";
export const dangerButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-accent px-6 text-xs font-medium uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-paper disabled:cursor-not-allowed disabled:opacity-50";
export const cardClass = "rounded-2xl border border-line bg-white p-6";

export const statusBadgeClass: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-800",
  published: "bg-emerald-50 text-emerald-800",
  draft: "bg-amber-50 text-amber-800",
  closed: "bg-neutral-100 text-neutral-600",
};
