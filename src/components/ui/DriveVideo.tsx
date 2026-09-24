"use client";

import Image from "next/image";
import { useState } from "react";

export default function DriveVideo({ src, title }: { src: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const fileId = src.match(/\/file\/d\/([^/]+)/)?.[1];
  const thumbnail = fileId
    ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`
    : null;

  if (playing || !thumbnail) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative h-full w-full cursor-pointer overflow-hidden text-paper"
      aria-label={`Play ${title}`}
    >
      <Image
        src={thumbnail}
        alt={`${title} video preview`}
        fill
        unoptimized
        sizes="100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/15" />
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/35 text-2xl backdrop-blur-sm transition-transform group-hover:scale-105">
        <span className="ml-1" aria-hidden="true">▶</span>
      </span>
    </button>
  );
}
