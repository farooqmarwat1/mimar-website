"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import QuoteModal from "@/components/quote/QuoteModal";
import { OPEN_QUOTE_EVENT, type OpenQuoteDetail } from "@/components/quote/open-quote";
import type { ServiceOption } from "@/components/quote/ServicesMultiSelect";
import { trackEvent } from "@/lib/track-event";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Mounted once in each root layout. Every "Get a quote" / "Request a quote" link on the site carries
 * `data-quote` (its value names the spot, for analytics) and keeps its real href to /contact/, so it
 * still works without JavaScript and crawlers see a normal link. A click on one opens the pop-up instead.
 *
 * The click is caught on `document` in the capture phase, before React's own handlers (next/link's
 * navigation) run, and stopped there. Anything that should also react to the pop-up opening (the
 * header closes its menu) listens for the OPEN_QUOTE_EVENT window event, fired for every open.
 * Modified clicks (Ctrl/Cmd/Shift/middle button) are left alone, so "open in new tab" still works.
 */
export default function QuoteModalProvider({
  lang,
  dict,
  services,
}: {
  lang: Locale;
  dict: Dictionary["quoteModal"];
  services: ServiceOption[];
}) {
  const pathname = usePathname();
  // The page the pop-up was opened on: moving to another page (a link inside it) closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  const show = useCallback((source: string | undefined) => {
    opener.current = document.activeElement as HTMLElement | null;
    setOpenOn(pathRef.current);
    trackEvent("quote_open", { source: source || "unknown", lang });
  }, [lang]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLElement>("a[data-quote]");
      if (!link) return;
      event.preventDefault();
      event.stopPropagation();
      // Let the rest of the page (the header menu) know, the same way openQuote() does.
      window.dispatchEvent(new CustomEvent<OpenQuoteDetail>(OPEN_QUOTE_EVENT, { detail: { source: link.dataset.quote } }));
    }
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<OpenQuoteDetail>).detail;
      show(detail?.source);
    }
    document.addEventListener("click", onClick, true);
    window.addEventListener(OPEN_QUOTE_EVENT, onOpen);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener(OPEN_QUOTE_EVENT, onOpen);
    };
  }, [show]);

  const close = useCallback(() => {
    setOpenOn(null);
    opener.current?.focus?.({ preventScroll: true });
  }, []);

  if (openOn === null || openOn !== pathname) return null;
  return <QuoteModal lang={lang} dict={dict} services={services} onClose={close} />;
}
