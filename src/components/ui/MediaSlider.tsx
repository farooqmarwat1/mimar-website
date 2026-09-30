"use client";

import Image from "next/image";
import { useState } from "react";

export type MediaSlide = {
  image: string;
  /** Present only for slides that have a real, still-available source video. */
  video?: string;
};

/**
 * A slide gallery: a large image with prev/next arrows and a thumbnail
 * strip, plus a fullscreen lightbox video player for slides that carry a
 * `video`. Slides without one are still navigable, just not playable -
 * the play button only appears where a real video exists.
 */
export default function MediaSlider({ slides, title }: { slides: MediaSlide[]; title: string }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = slides[active];

  function go(delta: number) {
    setActive((i) => (i + delta + slides.length) % slides.length);
    setPlaying(false);
  }

  return (
    <div>
      <div className="group relative aspect-video overflow-hidden bg-ink/5">
        <Image src={current.image} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        {current.video && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
            aria-label={`Play ${title} - slide ${active + 1}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/80 bg-black/35 text-2xl text-paper backdrop-blur-sm transition-transform group-hover:scale-105">
              <span className="ml-1" aria-hidden="true">▶</span>
            </span>
          </button>
        )}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-paper backdrop-blur-sm transition-colors hover:bg-ink/70"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ink/50 text-paper backdrop-blur-sm transition-colors hover:bg-ink/70"
            >
              ›
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => {
                setActive(index);
                setPlaying(false);
              }}
              aria-label={`Show slide ${index + 1}`}
              className={`relative aspect-video w-24 shrink-0 overflow-hidden bg-ink/5 md:w-28 ${index === active ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"}`}
            >
              <Image src={slide.image} alt="" fill unoptimized sizes="120px" className="object-cover" />
              {slide.video && <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs text-paper">▶</span>}
            </button>
          ))}
        </div>
      )}

      {playing && current.video && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPlaying(false)}>
          <button type="button" onClick={() => setPlaying(false)} aria-label="Close" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-paper hover:bg-white/20">
            ×
          </button>
          <video
            key={current.video}
            src={current.video}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full"
          />
        </div>
      )}
    </div>
  );
}
