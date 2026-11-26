/**
 * Opens the "Get a quote" pop-up from anywhere in the browser (the corner contact menu, the AI
 * agent). Links do it without JavaScript of their own: any `<a data-quote>` opens it on click
 * (see QuoteModalProvider), and still works as a plain link to /contact/ without JavaScript.
 */
export const OPEN_QUOTE_EVENT = "mimar:open-quote";

export type OpenQuoteDetail = { source?: string };

export function openQuote(source?: string) {
  window.dispatchEvent(new CustomEvent<OpenQuoteDetail>(OPEN_QUOTE_EVENT, { detail: { source } }));
}
