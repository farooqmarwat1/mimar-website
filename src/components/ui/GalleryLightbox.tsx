"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { isRtl, localizeDigits, type Locale } from "@/i18n/config";
import { mediaUi } from "@/lib/ar/media-ui";

export type LightboxItem = { src: string; alt: string; title?: string; text?: string };

/**
 * Click-to-enlarge viewer for a server-rendered gallery. The gallery markup stays in the server
 * component (so its images, alt text and captions are in the HTML); each image is wrapped in a
 * `<button data-lightbox-index="n">`, and this wrapper opens the viewer when one is clicked.
 *
 * Viewer: the render at full size with its caption and "n / total", previous/next buttons, arrow
 * keys, swipe on touch screens, Escape or a click on the backdrop to close. Page scroll is locked
 * while it is open and focus returns to the image that opened it. The viewer is portalled to <body>.
 *
 * RTL: "previous" sits at the logical start and points back along the reading direction, and the
 * arrow keys follow the reading direction (Left = next in Arabic), as in MediaSlider.
 */
export default function GalleryLightbox({
  items,
  label,
  lang = "en",
  children,
}: {
  items: LightboxItem[];
  label: string;
  lang?: Locale;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<number | null>(null);
  const rtl = isRtl(lang);
  const ui = mediaUi[lang];
  const prevGlyph = rtl ? "›" : "‹";
  const nextGlyph = rtl ? "‹" : "›";

  const go = useCallback((delta: number) => {
    setOpen((i) => (i === null ? i : (i + delta + items.length) % items.length));
  }, [items.length]);

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  function onGalleryClick(event: MouseEvent<HTMLDivElement>) {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>("[data-lightbox-index]");
    if (!trigger) return;
    opener.current = trigger;
    setOpen(Number(trigger.dataset.lightboxIndex));
  }

  useEffect(() => {
    if (open === null) return;
    closeButton.current?.focus();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (event.key === "ArrowLeft") go(rtl ? 1 : -1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previousOverflow;
    };
  }, [open, close, go, rtl]);

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "touch") touchStart.current = event.clientX;
  }
  function onPointerUp(event: PointerEvent) {
    if (touchStart.current === null) return;
    const dx = event.clientX - touchStart.current;
    touchStart.current = null;
    // A swipe towards the start of the reading direction shows the next image.
    if (Math.abs(dx) > 50) go((dx < 0) !== rtl ? 1 : -1);
  }

  const item = open === null ? null : items[open];
  const many = items.length > 1;

  return (
    <div onClick={onGalleryClick}>
      {children}
      {/* Portalled to <body> so no stacking context on the page (the fixed header) can sit above it. */}
      {item && open !== null && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[100] flex flex-col bg-black text-paper"
          onClick={close}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <p className="eyebrow text-paper/60" aria-live="polite">
              {localizeDigits(`${open + 1} / ${items.length}`, lang)}
            </p>
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              aria-label={ui.close}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl transition-colors hover:bg-white/20"
            >
              ×
            </button>
          </div>

          <div className="relative min-h-0 flex-1 px-4 md:px-24">
            <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
              <Image key={item.src} src={item.src} alt={item.alt} fill unoptimized sizes="100vw" className="object-contain" />
            </div>
            {many && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(-1);
                  }}
                  aria-label={ui.previous}
                  className="absolute start-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl transition-colors hover:bg-white/25 md:start-6"
                >
                  {rtl ? <span dir="ltr">{prevGlyph}</span> : prevGlyph}
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(1);
                  }}
                  aria-label={ui.next}
                  className="absolute end-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl transition-colors hover:bg-white/25 md:end-6"
                >
                  {rtl ? <span dir="ltr">{nextGlyph}</span> : nextGlyph}
                </button>
              </>
            )}
          </div>

          <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-4 text-center md:pb-8" onClick={(event) => event.stopPropagation()}>
            {item.title && <p className="eyebrow text-paper/60">{item.title}</p>}
            {item.text && <p className="mt-2 text-sm text-paper/85">{item.text}</p>}
          </div>

          {/* Warm the cache for the neighbours so next/previous show at once. */}
          {many && (
            <div className="hidden" aria-hidden="true">
              {[items[(open + 1) % items.length], items[(open - 1 + items.length) % items.length]].map((neighbour) => (
                <Image key={neighbour.src} src={neighbour.src} alt="" width={16} height={9} unoptimized loading="eager" />
              ))}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
