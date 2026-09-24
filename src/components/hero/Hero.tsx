"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const textureRef = useRef<HTMLDivElement>(null);

  const moveTexture = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || !textureRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    textureRef.current.style.setProperty("--texture-x", `${event.clientX - bounds.left}px`);
    textureRef.current.style.setProperty("--texture-y", `${event.clientY - bounds.top}px`);
    textureRef.current.style.opacity = "1";
  };

  const hideTexture = () => {
    if (textureRef.current) textureRef.current.style.opacity = "0";
  };

  return (
    <section
      className="relative h-[100svh] min-h-[32rem] w-full overflow-hidden bg-ink text-paper md:h-screen md:min-h-[38rem]"
      aria-label="Introduction"
      onPointerMove={moveTexture}
      onPointerLeave={hideTexture}
    >
      <div className="absolute inset-0">
        {reduceMotion ? (
          <Image
            src="/hero/hero-section-poster.jpg"
            alt="Lakeside residential building illuminated at dusk"
            fill
            priority
            quality={90}
            sizes="(max-width: 640px) 400vw, (max-width: 900px) 250vw, 100vw"
            className="object-cover"
          />
        ) : (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/hero/hero-section-poster.jpg"
            className="h-full w-full object-cover"
            aria-label="Architectural journey through a Mimar Studios development"
          >
            <source src="/hero/hero-section.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      </div>

      {!reduceMotion && (
        <div
          ref={textureRef}
          className="pointer-events-none absolute inset-0 z-[1] opacity-0 mix-blend-overlay transition-opacity duration-300"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at center, rgba(255,255,255,.9) 0 1px, transparent 1px 4px), repeating-linear-gradient(115deg, rgba(255,255,255,.24) 0 1px, transparent 1px 7px)",
            maskImage:
              "radial-gradient(circle 170px at var(--texture-x, 50%) var(--texture-y, 50%), black 0%, rgba(0,0,0,.9) 32%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle 170px at var(--texture-x, 50%) var(--texture-y, 50%), black 0%, rgba(0,0,0,.9) 32%, transparent 72%)",
          }}
          aria-hidden="true"
        />
      )}

      <div className="container-page relative z-10 flex h-full items-end justify-center pb-14 text-center md:pb-14">
        <h1 className="flex w-full justify-center">
          <Image
            src="/hero/hero-text.webp"
            alt="Mimar Studios - 3D Architecture Firm in Pakistan"
            width={1800}
            height={157}
            priority
            sizes="(max-width: 640px) 90vw, 45vw"
            className="h-auto w-[92vw] opacity-90 md:w-[clamp(18rem,45vw,56rem)] md:max-w-[90vw] md:opacity-80"
          />
        </h1>
      </div>
    </section>
  );
}
