/**
 * Conversion events for Google Tag Manager (container GTM-PR8T6S2B, GA4 property mim.archi).
 *
 * The contact form sends `generate_lead` to the GTM dataLayer once the API has accepted the enquiry.
 * In GTM a Custom Event trigger on `generate_lead` fires a GA4 Event tag with the same name, and the
 * event is marked as a key event in GA4. Only non-personal fields go in the payload: never the name,
 * email, phone or message.
 *
 * Pushing straight to `window.dataLayer` (not `sendGTMEvent`) keeps it quiet when GTM is not loaded
 * (local work, previews with no NEXT_PUBLIC_GTM_ID): the push is then a harmless array entry.
 */
type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export type LeadEvent = {
  /** Which form: "contact". */
  form: string;
  /** Site language the form was filled in on. */
  lang: string;
  /** The service picked in the form, in English ("" when none). */
  service?: string;
  /** "Where did you find us?" answer ("" when none). */
  source?: string;
};

export function trackLead({ form, lang, service = "", source = "" }: LeadEvent) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event: "generate_lead", form_name: form, form_lang: lang, lead_service: service, lead_source: source });
}
