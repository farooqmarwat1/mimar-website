"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";

const items = [
  { label: "Architectural Design", href: "/services/architectural-design", media: "/services/architectural-design/hero.jpg", type: "image" as const, desc: "Full architectural design services spanning interior and exterior spaces, from concept through construction documentation." },
  { label: "3D Visualization", href: "/services/3d-visualization", media: "/services/3D_rendering.webp", type: "image" as const, desc: "Photorealistic visualization for architecture, interiors, and real estate." },
  { label: "Cinematics", href: "/services/cinematics", media: "/services/animations.mp4", type: "video" as const, desc: "Cinematic walkthroughs, fly-throughs, and design animations that bring spaces to life." },
  { label: "VR 360 Tours", href: "/services/vr-360-tours", media: "/services/approved/vr-experiences.webp", type: "image" as const, desc: "Immersive, interactive experiences that let you explore spaces before they’re built." },
  { label: "Web Tours", href: "/services/web-tours", media: "/services/approved/web-360-updated.webp", type: "image" as const, desc: "Browser-based 360° virtual tours, accessible on any device with no installation." },
  { label: "Dual Screen Navigator", href: "/services/dual-screen-navigator", media: "/services/approved/dual-screen.webp", type: "image" as const, desc: "Synchronized interactive displays for sales offices, showrooms, events, and on-the-go presentations." },
  { label: "Interactive Prints", href: "/services/interactive-prints", media: "/services/approved/interactive-prints.webp", type: "image" as const, desc: "AR-powered marketing collateral that brings brochures and print campaigns to life." },
  { label: "Property Explorer", href: "/services/property-explorer", media: "/services/approved/property-explorer.webp", type: "image" as const, desc: "Interactive tools for exploring units, layouts, amenities, views, and property availability." },
  { label: "Virtual Smart Home", href: "/services/smart-home", media: "/services/approved/virtual-smart-home.webp", type: "image" as const, desc: "Interactive experiences for showcasing smart-home and connected-living features." },
  { label: "Branding", href: "/services/branding", media: "/services/branding/hero.png", type: "image" as const, desc: "Strategic brand identities and visual systems that make projects recognizable across every touchpoint." },
  { label: "Marketing", href: "/services/marketing", media: "/service-media/marketing-hero.png", type: "image" as const, desc: "Integrated digital marketing and web development to amplify a project's reach." },
];

const GROUP_SIZE = 4;
const groups = Array.from({ length: Math.ceil(items.length / GROUP_SIZE) }, (_, i) =>
  items.slice(i * GROUP_SIZE, i * GROUP_SIZE + GROUP_SIZE),
);

/**
 * Scroll-driven services showcase: shows one group of 4 at a time (not all
 * 8 cramped in), and the backdrop crossfades to the next group of 4 as you
 * scroll past. Uses plain CSS `position: sticky` + IntersectionObserver
 * rather than a scrubbed GSAP pin - sticky releases naturally once you
 * scroll past it, so there's no "stuck"/glitchy feeling. Hovering a row
 * still jumps straight to it.
 */
export default function ServicesPreview() {
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeItem, setActiveItem] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sensorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.groupIndex);
            setActiveGroup(idx);
            setActiveItem(idx * GROUP_SIZE);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sensorRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const firstItem = activeGroup * GROUP_SIZE;
    const lastItem = firstItem + groups[activeGroup].length - 1;
    const timer = window.setInterval(() => {
      setActiveItem((current) => current < firstItem || current >= lastItem ? firstItem : current + 1);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [activeGroup, isMobile]);

  const activeMedia = items[activeItem] ?? items[0];

  const goToGroup = (groupIndex: number) => {
    const next = Math.max(0, Math.min(groups.length - 1, groupIndex));
    const target = sensorRefs.current[next];
    if (!target) return;
    setActiveGroup(next);
    setActiveItem(next * GROUP_SIZE);
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top + 1,
      behavior: "smooth",
    });
  };

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${groups.length * 100}svh` }}>
      {groups.map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            sensorRefs.current[i] = el;
          }}
          data-group-index={i}
          className="absolute inset-x-0 h-[100svh]"
          style={{ top: `${i * 100}svh` }}
        />
      ))}

      <div className="sticky top-0 h-[100svh] min-h-[32rem] w-full overflow-hidden md:h-screen">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeMedia.media}
            initial={{ opacity: 0, scale: activeMedia.type === "video" ? 1 : 1.025 }}
            animate={{ opacity: 1, scale: activeMedia.type === "video" ? 1 : 1.08 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.7, ease: "easeOut" },
              scale: { duration: 8, ease: "linear" },
            }}
            className="absolute inset-0"
          >
            {activeMedia.type === "video" ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster="/services/animations-poster.jpg"
                className="h-full w-full object-cover"
                aria-hidden="true"
              >
                <source src={activeMedia.media} type="video/mp4" />
              </video>
            ) : (
              <Image
                src={activeMedia.media}
                alt=""
                fill
                unoptimized
                sizes="100vw"
                priority={activeItem === 0}
                className="object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-ink/42" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,16,0.58)_0%,rgba(10,12,16,0.32)_48%,rgba(10,12,16,0.18)_100%)]" />

        <div className="relative z-10 flex h-full flex-col justify-center">
          <div className="container-page">
            <Reveal>
              <p className="eyebrow mb-5 text-paper/60 sm:mb-8">/ Services · {activeGroup + 1} of {groups.length}</p>
            </Reveal>
            <ul className="border-t border-line-inverse">
              {groups[activeGroup].map((item, i) => {
                const globalIndex = activeGroup * GROUP_SIZE + i;
                return (
                  <li
                    key={item.href}
                    className={`border-b border-line-inverse transition-all duration-500 ${
                      globalIndex === activeItem ? "bg-paper/[0.035]" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Link
                      href={item.href}
                      onMouseEnter={() => setActiveItem(globalIndex)}
                      onFocus={() => setActiveItem(globalIndex)}
                      className="group flex min-h-16 flex-row items-center gap-3 py-3 text-paper sm:min-h-0 sm:flex-col sm:items-start sm:gap-1 sm:py-5 md:flex-row md:items-center md:gap-10 md:py-6"
                    >
                      <span className="eyebrow w-10 shrink-0 text-paper/50 sm:w-16">{String(globalIndex + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-xl tracking-tight transition-opacity group-hover:opacity-70 sm:text-2xl md:text-3xl">
                        {item.label}
                      </span>
                      <span className="hidden max-w-md text-base leading-[1.7] text-paper/60 sm:block">{item.desc}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => goToGroup(activeGroup - 1)} disabled={activeGroup === 0} aria-label="Previous services" className="button-pill flex h-12 w-12 items-center justify-center px-0 text-paper disabled:cursor-not-allowed disabled:opacity-35">←</button>
              <button type="button" onClick={() => goToGroup(activeGroup + 1)} disabled={activeGroup === groups.length - 1} aria-label="Next services" className="button-pill flex h-12 w-12 items-center justify-center px-0 text-paper disabled:cursor-not-allowed disabled:opacity-35">→</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
