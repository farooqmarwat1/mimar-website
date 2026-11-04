"use client";

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

// Public IDs, inlined at build time. Leave a variable unset (local work, previews)
// and that tag is simply not loaded, so nothing is sent to the live property.
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
const gaId = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Tag Manager + Google Analytics 4.
 *
 * The staff portal is never tracked, the same rule VisitTracker applies. If the GA4 tag
 * is already configured inside the GTM container, leave NEXT_PUBLIC_GA_ID unset,
 * otherwise every page view is counted twice.
 */
export default function Analytics() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </>
  );
}
