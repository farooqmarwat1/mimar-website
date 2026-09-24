"use client";

import { useEffect, useRef, useState } from "react";

export default function ViewportVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Two-stage loading: `shouldLoad` mounts the <source> (and starts the
  // actual network fetch) well before the clip scrolls into view, so by the
  // time it's visible the buffer already has a head start. `play`/`pause`
  // is then gated separately, tighter to the viewport, purely to save CPU
  // on offscreen decoding.
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          loadObserver.disconnect();
        }
      },
      { rootMargin: "800px 0px", threshold: 0 },
    );
    loadObserver.observe(video);

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "160px 0px", threshold: 0.08 },
    );
    playObserver.observe(video);

    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload={shouldLoad ? "auto" : "none"}
      poster={poster}
      aria-label={label}
      className={className}
    >
      {shouldLoad && <source src={src} type="video/mp4" />}
    </video>
  );
}
