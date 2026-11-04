/**
 * On-page SEO checks shared by the AI writer's quality gates (editorial-policy.ts) and the editor's
 * publish checklist (post-validation.ts), so an AI draft and a hand-written post are judged alike.
 * Pure (no server imports) so it can be unit-tested.
 *
 * They cover what an SEO review of our first published AI article found:
 *   - meta description length (Google cuts long ones, SEO tools flag anything over ~155 characters)
 *   - keyword placement and flow (keyword in headings and the closing section, natural density,
 *     short sentences and paragraphs)
 *   - local intent (several places, the city in headings and the FAQ)
 *   - image alt text that names the keyword or the place
 * These are editorial rules, not a ranking guarantee.
 */

export const DESCRIPTION_LENGTH = { min: 120, max: 155 } as const;
export const DENSITY = { min: 0.4, max: 2 } as const;
export const MAX_AVERAGE_SENTENCE_WORDS = 22;
export const MAX_PARAGRAPH_WORDS = 90;

// Apostrophes join a word ("Al Sa'fat" -> "safat"), so a keyword typed without one still matches.
const words = (value: string) => value.toLowerCase().replace(/['’]/g, "").match(/[\p{L}\p{N}]+/gu) ?? [];

/** "plans" -> "plan", "societies" -> "society": enough to treat a plural as the same keyword. */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

const stems = (value: string) => words(value).map(stem);

/** Whether text uses the keyword: every keyword word present (plurals and word order allowed). */
export function mentionsKeyword(text: string, keyword: string): boolean {
  const have = new Set(stems(text));
  const need = stems(keyword);
  return need.length > 0 && need.every((word) => have.has(word));
}

/** Whether text names a place (all its words, in order). */
export function mentionsPlace(text: string, place: string): boolean {
  return ` ${words(text).join(" ")} `.includes(` ${words(place).join(" ")} `);
}

/** How often the exact keyword phrase (plurals allowed) occurs, as a share of all words (percent). */
export function keywordDensity(text: string, keyword: string): { count: number; density: number; words: number } {
  const body = stems(text);
  const phrase = stems(keyword);
  let count = 0;
  if (phrase.length) {
    for (let i = 0; i + phrase.length <= body.length; i++) {
      if (phrase.every((word, offset) => body[i + offset] === word)) count++;
    }
  }
  return { count, words: body.length, density: body.length ? Math.round((count / body.length) * 1000) / 10 : 0 };
}

/** Average words per sentence over the paragraphs, and how many paragraphs are too long. */
export function flowStats(paragraphs: string[]): { averageSentenceWords: number; longParagraphs: number } {
  const sentences = paragraphs.flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/)).map((sentence) => words(sentence).length).filter((count) => count > 0);
  const average = sentences.length ? sentences.reduce((sum, count) => sum + count, 0) / sentences.length : 0;
  return {
    averageSentenceWords: Math.round(average * 10) / 10,
    longParagraphs: paragraphs.filter((paragraph) => words(paragraph).length > MAX_PARAGRAPH_WORDS).length,
  };
}

export type SeoInput = {
  keyword?: string;
  description: string;
  /** The article's `## ` headings, in order. */
  headings: string[];
  /** Paragraphs and list items of the body, in order, without link markup. */
  paragraphs: string[];
  faqQuestions: string[];
  geoTerms: string[];
  /** "Islamabad, Pakistan": the city first, the country last. */
  geo?: string;
  /** The cover image's alt text, when known. */
  coverAlt?: string;
};

/**
 * What to fix, one plain instruction each (for the AI's rewrite and for the editor's checklist).
 * `description: false` leaves the description length to the caller's own rule.
 */
export function seoIssues(input: SeoInput, options: { description?: boolean } = {}): string[] {
  const issues: string[] = [];
  const length = input.description.trim().length;
  if (options.description !== false && (length < DESCRIPTION_LENGTH.min || length > DESCRIPTION_LENGTH.max)) {
    issues.push(`The meta description is ${length} characters: keep it ${DESCRIPTION_LENGTH.min}-${DESCRIPTION_LENGTH.max} so Google shows it in full.`);
  }

  const places = (input.geo ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const city = places[0];
  const country = places.length > 1 ? places[places.length - 1] : undefined;
  const keyword = input.keyword?.trim();

  if (keyword) {
    const inHeadings = input.headings.filter((heading) => mentionsKeyword(heading, keyword)).length;
    if (inHeadings < 2) issues.push(`Use the primary keyword "${keyword}" (or a close variant) in at least 2 section headings; it is in ${inHeadings}.`);
    const body = input.paragraphs.join(" ");
    const all = words(body);
    const closing = all.slice(Math.floor(all.length * 0.8)).join(" ");
    if (all.length && !mentionsKeyword(closing, keyword)) issues.push(`Mention "${keyword}" again in the closing section.`);
    const { density, count } = keywordDensity(body, keyword);
    if (all.length >= 300 && density < DENSITY.min) issues.push(`"${keyword}" appears ${count} times (${density}% of the words): use it, or a close variant, a little more naturally through the article.`);
    if (all.length >= 300 && density > DENSITY.max) issues.push(`"${keyword}" appears ${count} times (${density}% of the words): that reads as keyword stuffing; use natural variants instead.`);
    if (input.coverAlt !== undefined && !mentionsKeyword(input.coverAlt, keyword) && !(city && mentionsPlace(input.coverAlt, city))) {
      issues.push(`The cover image's alt text should describe the image and name "${keyword}" or the place.`);
    }
  }

  const flow = flowStats(input.paragraphs);
  if (flow.averageSentenceWords > MAX_AVERAGE_SENTENCE_WORDS) issues.push(`Sentences average ${flow.averageSentenceWords} words: aim for 20 or fewer so the article reads easily.`);
  if (flow.longParagraphs) issues.push(`${flow.longParagraphs} paragraph${flow.longParagraphs === 1 ? " is" : "s are"} over ${MAX_PARAGRAPH_WORDS} words: split ${flow.longParagraphs === 1 ? "it" : "them"} (3 sentences at most each).`);

  if (city) {
    if (input.geoTerms.length < 3) issues.push(`List at least 3 places in geoTerms: ${city}${country ? `, ${country}` : ""} and the nearby districts or cities the research confirms.`);
    const localHeadings = input.headings.filter((heading) => mentionsPlace(heading, city) || (country !== undefined && mentionsPlace(heading, country))).length;
    if (localHeadings < 2) issues.push(`Name ${city}${country ? ` or ${country}` : ""} in at least 2 section headings; ${localHeadings === 1 ? "only 1 does" : "none do"}.`);
    if (!input.faqQuestions.some((question) => mentionsPlace(question, city) || (country !== undefined && mentionsPlace(question, country)))) {
      issues.push(`Add at least one FAQ question about ${city}${country ? ` or ${country}` : ""}.`);
    }
  }
  return issues;
}

/** Headings and paragraphs of an AI article's markdown body (links reduced to their text). */
export function splitMarkdownBody(body: string): { headings: string[]; paragraphs: string[] } {
  const plain = body.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const headings: string[] = [];
  const paragraphs: string[] = [];
  for (const chunk of plain.split(/\n\s*\n/)) {
    for (const line of chunk.split("\n").map((item) => item.trim()).filter(Boolean)) {
      if (line.startsWith("## ")) headings.push(line.slice(3).trim());
      else if (line.startsWith("#")) continue;
      else if (line.startsWith("- ")) paragraphs.push(line.slice(2).trim());
    }
    const text = chunk
      .split("\n")
      .map((item) => item.trim())
      .filter((line) => line && !line.startsWith("#") && !line.startsWith("- "))
      .join(" ");
    if (text) paragraphs.push(text);
  }
  return { headings, paragraphs };
}
