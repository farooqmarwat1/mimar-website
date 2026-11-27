/**
 * Pushes a named event to the Google Tag Manager data layer (src/components/Analytics.tsx), so GA4
 * can count quote pop-up opens and sends, WhatsApp / email / booking taps and AI-agent use. A no-op
 * where no tag is loaded (local work, previews). Never pass personal details (names, emails, messages).
 */
export function trackEvent(event: string, params: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, page_path: window.location.pathname, ...params });
}
