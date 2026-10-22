import { z } from "zod";
import type { FetchedPage } from "@/lib/ai/safe-fetch";

/**
 * What every AI provider (Gemini, Claude) has to offer the blog generator.
 * The pipeline in generate-post.ts owns the prompts, the quality gates and the
 * saving; a provider only runs two model calls:
 *
 *   research - web search -> a private brief + the pages it used
 *   write    - structured JSON article from the brief
 */

export type Usage = { inputTokens: number; outputTokens: number; searches: number };

export type Prompt = { system: string; prompt: string };

/** A page the research used. `page` is set when the provider already downloaded it. */
export type SourceRef = { title: string; url: string; page?: FetchedPage };

export interface AiProvider {
  readonly name: "gemini" | "anthropic";
  readonly model: string;
  research(prompt: Prompt, usage: Usage): Promise<{ brief: string; sources: SourceRef[] }>;
  /** Returns the parsed JSON object; the pipeline validates it against articleSchema. */
  write(prompt: Prompt, usage: Usage): Promise<unknown>;
  /** Proposes one article topic (no web search). Returns parsed JSON; validated against topicSchema. */
  suggest(prompt: Prompt, usage: Usage): Promise<unknown>;
  /** A short, user-facing message for this provider's own API errors, or null if it is not one. */
  describeError(err: unknown): string | null;
}

export const MAX_SOURCES = 8;

// ---- The article the writer must return ----------------------------------

export const articleSchema = z.object({
  title: z.string(),
  seoTitle: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  geoTerms: z.array(z.string()),
  category: z.string(),
  body: z.string(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  related: z.array(z.object({ label: z.string(), path: z.string() })),
});
export type Article = z.infer<typeof articleSchema>;

// ---- A suggested topic (automatic planning) ------------------------------

export const topicSchema = z.object({
  /** The article's working title / question, specific and searchable. */
  topic: z.string(),
  /** The main phrase people would search for. */
  keyword: z.string(),
});
export type TopicSuggestion = z.infer<typeof topicSchema>;

export const topicJsonSchema = {
  type: "object",
  properties: { topic: { type: "string" }, keyword: { type: "string" } },
  required: ["topic", "keyword"],
  additionalProperties: false,
} as const;

export const articleJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    seoTitle: { type: "string" },
    description: { type: "string" },
    keywords: { type: "array", items: { type: "string" } },
    geoTerms: { type: "array", items: { type: "string" } },
    category: { type: "string" },
    body: { type: "string" },
    faq: {
      type: "array",
      items: {
        type: "object",
        properties: { question: { type: "string" }, answer: { type: "string" } },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
    related: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, path: { type: "string" } },
        required: ["label", "path"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "seoTitle", "description", "keywords", "geoTerms", "category", "body", "faq", "related"],
  additionalProperties: false,
} as const;
