import { DESCRIPTION_LENGTH, mentionsPlace } from "@/lib/ai/seo-checks";
import { titleSimilarity } from "@/lib/ai/similarity";

/**
 * A blog brief: an article an SEO editor has already planned (title, keywords, outline, call to
 * action), for the AI to research and write instead of planning its own topic. Briefs come from
 * the "Write from a brief" form on /admin/blog/generate, or from a file of briefs such as
 * src/content/briefs/deliverable-6.json (the SEO consultant's Deliverable 6).
 *
 * The writer follows the brief, and the normal quality gates still apply. Fields the brief fixes
 * (title, SEO title, description) are used exactly as written, so they must pass those gates
 * themselves; briefProblems() says what to fix before a brief is queued.
 * Pure (no server imports) so it can be unit-tested.
 */

export type BriefHeading = { level: 2 | 3; text: string };

export type BlogBrief = {
  /** Where the brief came from, e.g. "D6-B1" (Deliverable 6, blog 1). Used to avoid queuing it twice. */
  ref?: string;
  title: string;
  /** The primary keyword, 2-6 words. */
  keyword: string;
  secondaryKeywords: string[];
  /** The article's sections, in order. */
  outline: BriefHeading[];
  /** The page the call to action links to, e.g. /3d-visualization-usa. */
  ctaPath: string;
  /** Other pages on our site the writer may link to (an older article on the same subject). */
  links?: string[];
  /** "City, Country", or several places separated by commas (the first is treated as the city). */
  geo?: string;
  /** A blogCategories slug (legacy-seo.ts). */
  category: string;
  /** Used exactly when given: 50-60 characters with the keyword. */
  seoTitle?: string;
  /** Used exactly when given: 120-155 characters with the keyword. */
  description?: string;
  /** The Arabic version's own targeting, as on the old WordPress sheet's AR rows. */
  ar?: { keyword?: string; seoTitle?: string; description?: string };
  /** Cautions for the writer: claims to avoid, angles to take. */
  notes?: string;
  /** The planned hero and graphics, for the editor who finishes the draft. Never sent to the writer. */
  visual?: string;
};

const clean = (value: unknown, max: number) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const wordCount = (value: string) => value.split(/\s+/).filter(Boolean).length;

/**
 * An outline typed as lines: "## Heading" or "H2: Heading" for sections, "### Heading" or
 * "H3: Heading" for sub-sections. A line with neither marker is a section. Bullets ("- ", "○ ") are ignored.
 */
export function parseOutline(text: string): BriefHeading[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•○●]\s*/, "").trim())
    .filter(Boolean)
    .map((line) => {
      const h3 = /^(###\s*|h3\s*[:.-]\s*)/i.exec(line);
      const h2 = /^(##\s*|h2\s*[:.-]\s*)/i.exec(line);
      const marker = h3 ?? h2;
      return { level: h3 ? 3 : 2, text: clean(marker ? line.slice(marker[0].length) : line, 140) } as BriefHeading;
    })
    .filter((heading) => heading.text.length > 0);
}

export const outlineText = (outline: BriefHeading[]) => outline.map((heading) => `${heading.level === 3 ? "###" : "##"} ${heading.text}`).join("\n");

/** A brief from untrusted input (a form or a JSON file), trimmed to sensible lengths. */
export function normalizeBrief(input: Record<string, unknown>): BlogBrief {
  const list = (value: unknown) =>
    (Array.isArray(value) ? value : String(value ?? "").split(/[,\n]/))
      .map((item) => clean(item, 80).toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  const ar = (input.ar ?? {}) as Record<string, unknown>;
  const outline = Array.isArray(input.outline)
    ? (input.outline as { level?: unknown; text?: unknown }[]).map((item) => ({ level: Number(item.level) === 3 ? 3 : 2, text: clean(item.text, 140) }) as BriefHeading).filter((item) => item.text)
    : parseOutline(String(input.outline ?? ""));
  const optional = (value: unknown, max: number) => clean(value, max) || undefined;
  const arabic = { keyword: optional(ar.keyword, 80), seoTitle: optional(ar.seoTitle, 80), description: optional(ar.description, 200) };
  return {
    ref: optional(input.ref, 40),
    title: clean(input.title, 140),
    keyword: clean(input.keyword, 80).toLowerCase(),
    secondaryKeywords: list(input.secondaryKeywords),
    outline: outline.slice(0, 16),
    ctaPath: clean(input.ctaPath, 120).replace(/\/+$/, "") || "/",
    links: Array.isArray(input.links) ? (input.links as unknown[]).map((link) => clean(link, 160).replace(/\/+$/, "")).filter((link) => link.startsWith("/") && !link.startsWith("//")).slice(0, 4) : undefined,
    geo: optional(input.geo, 80),
    category: clean(input.category, 40),
    seoTitle: optional(input.seoTitle, 80),
    description: optional(input.description, 200),
    ar: Object.values(arabic).some(Boolean) ? arabic : undefined,
    notes: optional(input.notes, 600),
    visual: optional(input.visual, 600),
  };
}

/** What stops a brief from passing the article gates as written. Empty when it is ready to queue. */
export function briefProblems(brief: BlogBrief, categories: string[]): string[] {
  const problems: string[] = [];
  const { keyword } = brief;
  if (brief.title.length < 12 || brief.title.length > 120) problems.push("The title needs 12-120 characters.");
  if (wordCount(keyword) < 2 || wordCount(keyword) > 6) problems.push("The primary keyword needs 2-6 words.");
  // The article gates want the keyword word for word (editorial-policy.ts), so "in Dubai" must be in it if the title says so.
  else if (!mentionsPlace(brief.title, keyword)) problems.push(`The title must contain the primary keyword "${keyword}" word for word.`);
  if (brief.seoTitle) {
    if (brief.seoTitle.length < 50 || brief.seoTitle.length > 60) problems.push(`The SEO title is ${brief.seoTitle.length} characters; it needs 50-60.`);
    if (keyword && !mentionsPlace(brief.seoTitle, keyword)) problems.push("The SEO title must contain the primary keyword word for word.");
  }
  if (brief.description) {
    const length = brief.description.length;
    if (length < DESCRIPTION_LENGTH.min || length > DESCRIPTION_LENGTH.max) problems.push(`The meta description is ${length} characters; it needs ${DESCRIPTION_LENGTH.min}-${DESCRIPTION_LENGTH.max}.`);
    if (keyword && !mentionsPlace(brief.description, keyword)) problems.push("The meta description must contain the primary keyword word for word.");
  }
  if (brief.outline.filter((heading) => heading.level === 2).length < 3) problems.push("The outline needs at least 3 sections (H2).");
  if (!brief.ctaPath.startsWith("/") || brief.ctaPath.startsWith("//") || /\s/.test(brief.ctaPath)) problems.push("The call-to-action link must be a path on our site, such as /3d-visualization-usa.");
  if (!categories.includes(brief.category)) problems.push("Choose one of the four blog categories.");
  if (brief.ar?.seoTitle && brief.ar.seoTitle.length > 60) problems.push("The Arabic SEO title is over 60 characters.");
  if (brief.ar?.description && brief.ar.description.length > 160) problems.push("The Arabic meta description is over 160 characters.");
  return problems;
}

/** The brief, as the writer is told to follow it. The visual plan stays with the editor. */
export function briefWriterLines(brief: BlogBrief): string {
  return [
    "This article follows a brief from our SEO editor. Follow it closely:",
    `- Title: use exactly "${brief.title}".`,
    brief.seoTitle ? `- seoTitle: use exactly "${brief.seoTitle}".` : "",
    brief.description ? `- description: use exactly "${brief.description}".` : "",
    brief.secondaryKeywords.length ? `- Secondary keywords: use each naturally at least once in the body or a heading, and list them in keywords after the primary keyword: ${brief.secondaryKeywords.join("; ")}.` : "",
    `- Outline: write these sections in this order, as "## " and "### " headings. Keep each heading's meaning and most of its wording; change a heading only as much as needed to carry the primary keyword or the target place where the rules below require it. You may add the "Key takeaways" section before them and a short conclusion after them, nothing else.`,
    outlineText(brief.outline)
      .split("\n")
      .map((line) => `    ${line}`)
      .join("\n"),
    `- Call to action: link to ${brief.ctaPath} in the body (in context, not in a heading) and include it in related.`,
    brief.notes ? `- Editor's notes: ${brief.notes}` : "",
    "- A heading that promises a statistic, a case study or a regulation is only kept if the research brief supports it; otherwise reword it to what the research does support.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** The brief's sections (H2) the article dropped: none of its "## " headings is close to them. */
export function missingSections(brief: BlogBrief, headings: string[]): string[] {
  return brief.outline
    .filter((heading) => heading.level === 2)
    .map((heading) => heading.text)
    .filter((wanted) => !headings.some((heading) => titleSimilarity(heading, wanted) >= 0.34));
}
