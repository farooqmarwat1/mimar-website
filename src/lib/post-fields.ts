/**
 * Text <-> structured conversions for the post editor's simple fields. Pure
 * (no server-only imports) so the editor and the server actions share them.
 *
 *   FAQ      "Q: question" then "A: answer" (an answer may span several lines)
 *   Links    "Label | /site-path"
 *   Sources  "Title | https://example.com/page"
 *   Lists    comma or newline separated
 */

export type Faq = { question: string; answer: string };
export type Link = { label: string; path: string };
export type Source = { title: string; url: string };

export function parseList(text: string, max = 20, maxLen = 80): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[,\n]/)) {
    const item = raw.trim().slice(0, maxLen);
    const key = item.toLowerCase();
    if (item && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out.slice(0, max);
}

export const listToText = (items: string[]) => items.join(", ");

export function parseFaq(text: string, max = 12): Faq[] {
  const faq: Faq[] = [];
  let current: { question: string; answer: string[] } | null = null;
  let inAnswer = false;
  const push = () => {
    if (current && current.question && current.answer.join(" ").trim()) {
      faq.push({ question: current.question.slice(0, 250), answer: current.answer.join(" ").replace(/\s+/g, " ").trim().slice(0, 1500) });
    }
  };
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const q = /^Q\s*[:.)-]\s*(.+)$/i.exec(line);
    const a = /^A\s*[:.)-]\s*(.*)$/i.exec(line);
    if (q) {
      push();
      current = { question: q[1].trim(), answer: [] };
      inAnswer = false;
    } else if (a && current) {
      inAnswer = true;
      if (a[1]) current.answer.push(a[1].trim());
    } else if (line && current && inAnswer) {
      current.answer.push(line);
    }
  }
  push();
  return faq.slice(0, max);
}

export const faqToText = (faq: Faq[]) => faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");

function parsePairs(text: string, max: number): [string, string][] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 2 && parts[0] && parts[1])
    .map((parts) => [parts[0].slice(0, 160), parts.slice(1).join("|").trim()] as [string, string])
    .slice(0, max);
}

export const parseLinks = (text: string, max = 8): Link[] => parsePairs(text, max).map(([label, path]) => ({ label, path }));
export const linksToText = (links: Link[]) => links.map((link) => `${link.label} | ${link.path}`).join("\n");

export const parseSources = (text: string, max = 20): Source[] => parsePairs(text, max).map(([title, url]) => ({ title, url }));
export const sourcesToText = (sources: Source[]) => sources.map((source) => `${source.title} | ${source.url}`).join("\n");
