"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Sends page-view beacons to /api/track (see src/lib/visits.ts for what the server does with them).
 *
 * Deliberately cookie-free AND storage-free: it never touches cookies, localStorage or
 * sessionStorage. The only state is in memory for the life of the page. The visitor is recognised
 * on the server by a daily-rotating hash, so this component sends no identifier at all.
 *
 * Sends: the path on every page view; the referrer, UTM tags, time zone and screen width once per
 * full page load; and the seconds the tab was visible when a page is left or the tab is hidden.
 */

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

function send(payload: object) {
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
}

function utmFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(`utm_${key}`);
    if (value) utm[key] = value.slice(0, 100);
  }
  return Object.keys(utm).length ? utm : undefined;
}

export default function VisitTracker() {
  const pathname = usePathname();
  const current = useRef<string | null>(null);
  const seconds = useRef(0);
  const visibleSince = useRef<number | null>(null);
  const firstLoad = useRef(true);

  // The seconds the tab has been visible on the current page are sent whenever the page is left or hidden.
  const flush = useCallback(() => {
    const path = current.current;
    if (visibleSince.current !== null) {
      seconds.current += (Date.now() - visibleSince.current) / 1000;
      visibleSince.current = document.visibilityState === "visible" ? Date.now() : null;
    }
    if (path && seconds.current >= 1) send({ kind: "leave", path, seconds: Math.round(seconds.current) });
    seconds.current = 0;
  }, []);

  useEffect(() => {
    flush();
    if (pathname.startsWith("/admin")) {
      current.current = null;
      return;
    }
    current.current = pathname;
    if (visibleSince.current === null && document.visibilityState === "visible") visibleSince.current = Date.now();

    const first = firstLoad.current;
    firstLoad.current = false;
    send({
      kind: "view",
      path: pathname,
      ...(first
        ? {
            referrer: document.referrer || undefined,
            utm: utmFromLocation(),
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenWidth: window.screen.width,
          }
        : {}),
    });
  }, [pathname, flush]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else if (visibleSince.current === null) visibleSince.current = Date.now();
    };
    const onHide = () => flush();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onHide);
    };
  }, [flush]);

  return null;
}
