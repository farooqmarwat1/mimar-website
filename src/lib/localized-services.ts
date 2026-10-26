import type { ServiceCard } from "./service-cards";
import type { ServiceDetail } from "./service-details";
import { serviceCardsAr } from "./ar/service-cards.ar";
import { serviceDetailsAr } from "./ar/service-details.ar";
import { localizeDigits, type Locale } from "@/i18n/config";

/**
 * Locale-aware views of the English service data (service-cards.ts and
 * service-details.ts). English is returned untouched. Arabic merges the overlay
 * modules in src/lib/ar over it by slug; array fields only take the overlay
 * when it has the same length as the English list, so a missing or mismatched
 * entry falls back to the English copy instead of dropping content. Only
 * human-readable text is touched (never slugs, links or image paths), with
 * digits converted to Eastern Arabic-Indic.
 */

const d = (value: string, lang: Locale) => localizeDigits(value, lang);

function sameLength<T>(english: readonly unknown[], arabic: T[] | undefined): T[] | undefined {
  return arabic && arabic.length === english.length ? arabic : undefined;
}

export function localizeServiceCards(cards: ServiceCard[], lang: Locale): ServiceCard[] {
  if (lang !== "ar") return cards;
  return cards.map((card) => {
    const ar = serviceCardsAr[card.slug];
    if (!ar) return card;
    const deliverables = sameLength(card.deliverables, ar.deliverables);
    return {
      ...card,
      title: d(ar.title, lang),
      description: d(ar.description, lang),
      deliverables: (deliverables ?? card.deliverables).map((item) => d(item, lang)),
    };
  });
}

export function localizeServiceDetail(detail: ServiceDetail, lang: Locale): ServiceDetail {
  if (lang !== "ar") return detail;
  const ar = serviceDetailsAr[detail.slug];
  if (!ar) return detail;

  const outputs = sameLength(detail.outputs, ar.outputs);
  const facts = detail.facts ? sameLength(detail.facts, ar.facts) : undefined;
  const process = sameLength(detail.process, ar.process);
  const included = sameLength(detail.included, ar.included);
  const faqs = sameLength(detail.faqs, ar.faqs);
  const categories = detail.portfolio ? sameLength(detail.portfolio, ar.portfolioCategories) : undefined;
  const tours = detail.tours ? sameLength(detail.tours, ar.tours) : undefined;

  return {
    ...detail,
    title: d(ar.title, lang),
    eyebrow: d(ar.eyebrow, lang),
    intro: d(ar.intro, lang),
    outputs: (outputs ?? detail.outputs).map((item) => d(item, lang)),
    facts: facts ? facts.map(([a, b]) => [d(a, lang), d(b, lang)] as [string, string]) : detail.facts,
    process: (process ?? detail.process).map(([a, b]) => [d(a, lang), d(b, lang)] as [string, string]),
    included: (included ?? detail.included).map((item) => d(item, lang)),
    includedLabel: detail.includedLabel && ar.includedLabel ? d(ar.includedLabel, lang) : detail.includedLabel,
    faqs: (faqs ?? detail.faqs).map(([a, b]) => [d(a, lang), d(b, lang)] as [string, string]),
    portfolio: detail.portfolio?.map((item, index) => ({
      ...item,
      category: categories ? d(categories[index], lang) : item.category,
    })),
    tours: detail.tours?.map((tour, index) => ({
      ...tour,
      project: tours ? d(tours[index].project, lang) : tour.project,
      title: tours ? d(tours[index].title, lang) : tour.title,
    })),
  };
}
