import "server-only";
import { createHash } from "node:crypto";
import { isTextBlock, type ArticleBlock } from "@/lib/content-blocks";
import type { FaqItem, LinkItem } from "@/lib/posts";

/** The English fields the Arabic version is derived from. */
export type TranslatableFields = {
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  geoTerms: string[];
  blocks: ArticleBlock[];
  faq: FaqItem[];
  related: LinkItem[];
  coverAlt?: string;
};

const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 24);

/**
 * Fingerprints of the English text. They are stored with the Arabic version, so
 * a later edit to the English (not to a slug, a category or a cover picture) is
 * detected and the Arabic is refreshed instead of drifting out of date.
 *
 * `meta` covers what appears in search results (title, SEO title, description,
 * keywords, places, cover description); `body` covers the article text, FAQ and
 * related-link labels. When only the meta changed, only the meta is translated
 * again and the Arabic body - which may have been reviewed - is left alone.
 */
export function translationHashes(fields: TranslatableFields): { meta: string; body: string; all: string } {
  const meta = digest({
    t: fields.title.trim(),
    s: fields.seoTitle.trim(),
    d: fields.description.trim(),
    k: fields.keywords,
    g: fields.geoTerms,
    c: fields.coverAlt?.trim() ?? "",
  });
  const body = digest({
    b: fields.blocks.filter(isTextBlock).map((block) => [block.type, block.text]),
    f: fields.faq.map((item) => [item.question, item.answer]),
    r: fields.related.map((item) => item.label),
  });
  return { meta, body, all: digest([meta, body]) };
}

export const translationHash = (fields: TranslatableFields) => translationHashes(fields).all;
