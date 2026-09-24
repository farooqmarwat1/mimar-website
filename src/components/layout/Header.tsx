"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { navigation } from "@/lib/site-config";

/**
 * Matches the Figma header: a slim 56px bar with a small centered wordmark
 * and a hamburger toggle that opens a full nav overlay - not an inline nav
 * row. The left slot is contextual: "Get a quote" on the home page (matches
 * node 16:3901), "Islamabad" on every inner page (matches projects.svg) -
 * a small local/GEO signal that also avoids repeating the CTA that's
 * already in the nav overlay.
 */
export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hasFullScreenHero = isHome;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAnimatedLogo, setShowAnimatedLogo] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= window.innerHeight - 56);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowAnimatedLogo(false), 4100);
    return () => window.clearTimeout(timer);
  }, []);

  const dark = !hasFullScreenHero || scrolled || open;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 isolate transition-colors duration-500 ${dark ? "bg-paper" : "bg-transparent"}`}>
      <div className="container-page relative flex h-14 items-center justify-between">
        <Link
          href="/contact"
          className={`eyebrow hidden min-[420px]:block ${dark ? "text-ink" : "text-paper"}`}
        >
          Get a quote
        </Link>

        <Link
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Mimar Studios home"
          className="absolute left-1/2 h-10 w-28 -translate-x-1/2 sm:w-36"
        >
          <AnimatePresence initial={false} mode="wait">
            {isHome && showAnimatedLogo ? (
              <motion.span
                key="animated-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 block"
              >
                <Image
                  src="/logos/animation-transparent.gif"
                  alt=""
                  fill
                  priority
                  unoptimized
                  sizes="144px"
                  className="scale-125 object-contain"
                />
              </motion.span>
            ) : (
              <motion.span
                key="static-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 block"
              >
                <Image
                  src="/logos/white.png"
                  alt=""
                  fill
                  priority={isHome}
                  sizes="144px"
                  className={`object-contain transition-opacity duration-500 ${dark ? "opacity-0" : "opacity-100"}`}
                />
                <Image
                  src="/logos/black.png"
                  alt=""
                  fill
                  sizes="144px"
                  className={`object-contain transition-opacity duration-500 ${dark ? "opacity-100" : "opacity-0"}`}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 ml-auto flex min-h-11 min-w-11 items-center justify-end gap-3"
        >
          <span className={`eyebrow hidden sm:inline ${dark ? "text-ink" : "text-paper"}`}>
            {open ? "Close" : "Menu"}
          </span>
          <span className="flex h-4 w-7 flex-col items-end justify-center gap-[6px]">
            <span
              className={`h-px w-full transition-all duration-300 ${dark ? "bg-ink" : "bg-paper"} ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-4 transition-all duration-300 ${dark ? "bg-ink" : "bg-paper"} ${
                open ? "-translate-y-[3.5px] w-full -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[calc(100svh-3.5rem)] overflow-y-auto border-b border-line bg-paper"
          >
            <nav className="container-page flex flex-col gap-1 py-4 sm:py-6">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center border-b border-line py-3 text-2xl tracking-tight text-ink transition-colors hover:text-accent last:border-0"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="button-pill mt-4 text-ink"
              >
                Get a quote
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
