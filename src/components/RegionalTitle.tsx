"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isRegionCode, regionalTitles, REGION_COOKIE } from "@/lib/region";
import type { Locale } from "@/i18n/config";

function readRegionCookie(): string | null {
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${REGION_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(REGION_COOKIE.length + 1)) : null;
}

const subscribe = () => () => {};
const serverSnapshot = () => null;

/**
 * Sets the browser-tab title of the home page for the visitor's region and renders nothing.
 * The server always sends the default title, so crawlers, answer engines and link previews
 * never see a regional one. Region comes from the `mimar_region` cookie that src/proxy.ts
 * sets for human visitors only (never bots). See src/lib/region.ts.
 */
export default function RegionalTitle({ lang }: { lang: Locale }) {
  const code = useSyncExternalStore(subscribe, readRegionCookie, serverSnapshot);
  const title = isRegionCode(code) ? regionalTitles[lang][code] : undefined;

  useEffect(() => {
    if (!title) return;
    // Next re-applies the page's metadata title right after mount (and when the metadata stream
    // finishes), which would put the default back. Re-assert ours for the first moments only; the
    // observer stops on its own and as soon as the visitor navigates away.
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    const stop = window.setTimeout(() => observer.disconnect(), 4000);
    return () => {
      window.clearTimeout(stop);
      observer.disconnect();
    };
  }, [title]);

  return null;
}
