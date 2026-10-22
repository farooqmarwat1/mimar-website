/**
 * The block format used by every article on the site (see LegacyContentBlock in
 * legacy-seo.ts) and now by job descriptions: plain text blocks, no HTML.
 *
 * Staff edit them as simple text so nobody has to learn a rich-text editor:
 *
 *   ## Heading          -> h2
 *   ### Sub-heading     -> h3
 *   - bullet            -> li   (also "* bullet")
 *   anything else      -> paragraph (blank line = new paragraph)
 *
 * Inline links `[label](/internal-path)` are allowed inside text and are only
 * rendered as links for site-relative paths (see splitInlineLinks).
 * This module is pure so the admin editor can use it in the browser too.
 */

export type ContentBlock = {
  type: "h2" | "h3" | "p" | "li";
  text: string;
};

const MAX_BLOCKS = 400;
const MAX_TEXT = 4000;

export function parseBlocks(input: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ").replace(/\s+/g, " ").trim() });
      paragraph = [];
    }
  };

  for (const rawLine of input.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flush();
      continue;
    }
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    const bullet = /^[-*•]\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ type: heading[1].length === 2 ? "h2" : "h3", text: heading[2].trim() });
    } else if (bullet) {
      flush();
      blocks.push({ type: "li", text: bullet[1].trim() });
    } else {
      paragraph.push(line);
    }
  }
  flush();

  return blocks
    .filter((block) => block.text.length > 0)
    .slice(0, MAX_BLOCKS)
    .map((block) => ({ ...block, text: block.text.slice(0, MAX_TEXT) }));
}

export function blocksToText(blocks: ContentBlock[]): string {
  const out: string[] = [];
  blocks.forEach((block, index) => {
    const prev = blocks[index - 1];
    if (block.type === "h2") out.push(`${index ? "\n" : ""}## ${block.text}`);
    else if (block.type === "h3") out.push(`${index ? "\n" : ""}### ${block.text}`);
    else if (block.type === "li") out.push(`${prev && prev.type !== "li" ? "\n" : ""}- ${block.text}`);
    else out.push(`${index ? "\n" : ""}${block.text}`);
  });
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Minimal HTML for JSON-LD `description` fields (JobPosting expects HTML). Links are flattened to their label. */
export function blocksToHtml(blocks: ContentBlock[]): string {
  const parts: string[] = [];
  let inList = false;
  for (const block of blocks) {
    const text = escapeHtml(stripInlineLinks(block.text));
    if (block.type === "li") {
      if (!inList) parts.push("<ul>");
      inList = true;
      parts.push(`<li>${text}</li>`);
      continue;
    }
    if (inList) {
      parts.push("</ul>");
      inList = false;
    }
    if (block.type === "h2") parts.push(`<h2>${text}</h2>`);
    else if (block.type === "h3") parts.push(`<h3>${text}</h3>`);
    else parts.push(`<p>${text}</p>`);
  }
  if (inList) parts.push("</ul>");
  return parts.join("");
}

export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks.map((block) => stripInlineLinks(block.text)).join("\n");
}

export function countWords(blocks: ContentBlock[]): number {
  return blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
}

const LINK_PATTERN = /\[([^\]\n]{1,120})\]\((\/[^)\s\\]{0,200})\)/g;

export function stripInlineLinks(text: string): string {
  return text.replace(LINK_PATTERN, "$1");
}

export type InlinePart = { text: string; href?: string };

/**
 * Splits text into plain and linked parts. Only `[label](/site-relative-path)`
 * becomes a link: absolute URLs, `//host` and `javascript:` are left as text,
 * so editors (or an AI draft) can never inject an external or script link.
 * Legacy article text never matches, so rendering of the 39 migrated posts is unchanged.
 */
export function splitInlineLinks(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK_PATTERN)) {
    const [whole, label, href] = match;
    if (href.startsWith("//")) continue;
    if (match.index > last) parts.push({ text: text.slice(last, match.index) });
    parts.push({ text: label, href });
    last = match.index + whole.length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts.length ? parts : [{ text }];
}
