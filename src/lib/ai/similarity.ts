/**
 * Originality gate for AI drafts: how much of an article's wording also appears
 * in a source page. Word 8-grams ("shingles") are long enough that sharing one
 * means the same phrasing, not just the same topic, so facts restated in new
 * words score ~0 while copied or lightly reworded sentences score high.
 */

const SHINGLE = 8;

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(tokens: string[]): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i + SHINGLE <= tokens.length; i++) set.add(tokens.slice(i, i + SHINGLE).join(" "));
  return set;
}

/** Share (0-1) of the article's 8-grams that also occur in `source`. */
export function overlapRatio(article: string, source: string): number {
  const own = shingles(words(article));
  if (own.size === 0) return 0;
  const theirs = shingles(words(source));
  let shared = 0;
  for (const gram of own) if (theirs.has(gram)) shared++;
  return shared / own.size;
}

/** The worst-offending source, for the reviewer's note. */
export function maxOverlap(article: string, sources: { url: string; text: string }[]) {
  let worst = { url: "", ratio: 0 };
  for (const source of sources) {
    const ratio = overlapRatio(article, source.text);
    if (ratio > worst.ratio) worst = { url: source.url, ratio };
  }
  return worst;
}

const STOP = new Set(["the", "a", "an", "of", "for", "in", "to", "and", "or", "with", "on", "your", "how", "what", "why", "is", "are", "best", "guide"]);

function titleTokens(title: string): Set<string> {
  return new Set(words(title).filter((word) => word.length > 2 && !STOP.has(word)));
}

/** Jaccard similarity of two titles' meaningful words - cheap keyword-cannibalization signal. */
export function titleSimilarity(a: string, b: string): number {
  const x = titleTokens(a);
  const y = titleTokens(b);
  if (x.size === 0 || y.size === 0) return 0;
  let shared = 0;
  for (const token of x) if (y.has(token)) shared++;
  return shared / (x.size + y.size - shared);
}
