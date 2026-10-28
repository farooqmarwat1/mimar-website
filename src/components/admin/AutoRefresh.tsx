"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-renders the server page every few seconds while `active`. Skips the refresh while the tab is hidden, so a forgotten tab costs nothing. */
export default function AutoRefresh({ active, everyMs = 4000 }: { active: boolean; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, everyMs);
    return () => window.clearInterval(timer);
  }, [active, everyMs, router]);
  return null;
}
