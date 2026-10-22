import "server-only";
import { ApiError, GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { fetchPageText } from "@/lib/ai/safe-fetch";
import { MAX_SOURCES, articleJsonSchema, topicJsonSchema, type AiProvider, type Prompt, type SourceRef, type Usage } from "@/lib/ai/types";

/**
 * Gemini: Grounding with Google Search for research, JSON-schema output for the article.
 *
 * Two quirks handled here:
 * - Grounding returns each source as a Google redirect link (vertexaisearch.cloud.google.com/...),
 *   not the page's own address. They are followed with the SSRF-safe fetcher so the draft cites,
 *   and the originality check reads, the real page. A link that cannot be resolved is dropped.
 * - Research (search tool, free text) and writing (JSON schema, no tools) are separate calls, so
 *   the two features are never combined in one request.
 */

const BLOCKING_FINISH = new Set(["SAFETY", "PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "IMAGE_SAFETY", "RECITATION"]);
const GOOGLE_REDIRECT_HOST = "vertexaisearch.cloud.google.com";

function addUsage(meta: GenerateContentResponse["usageMetadata"], usage: Usage) {
  usage.inputTokens += (meta?.promptTokenCount ?? 0) + (meta?.toolUsePromptTokenCount ?? 0);
  // Thinking tokens are billed as output.
  usage.outputTokens += (meta?.candidatesTokenCount ?? 0) + (meta?.thoughtsTokenCount ?? 0);
}

function assertAnswered(res: GenerateContentResponse) {
  if (res.promptFeedback?.blockReason) throw new Error("The request was declined by Google's safety system. Try rewording the topic.");
  const candidate = res.candidates?.[0];
  if (!candidate) throw new Error("The AI returned no answer. Try again.");
  if (candidate.finishReason && BLOCKING_FINISH.has(candidate.finishReason)) {
    throw new Error("The AI declined to answer this topic. Try rewording it.");
  }
  return candidate;
}

export function geminiProvider(): AiProvider {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY?.trim() });
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";

  return {
    name: "gemini",
    model,

    async research({ system, prompt }: Prompt, usage: Usage) {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction: system, tools: [{ googleSearch: {} }], maxOutputTokens: 16000 },
      });
      addUsage(res.usageMetadata, usage);
      const candidate = assertAnswered(res);
      usage.searches += candidate.groundingMetadata?.webSearchQueries?.length ?? 0;

      // Follow the redirect links to the real pages (in parallel, capped).
      const chunks = (candidate.groundingMetadata?.groundingChunks ?? []).flatMap((chunk) => (chunk.web?.uri ? [{ uri: chunk.web.uri, title: chunk.web.title }] : []));
      const unique = [...new Map(chunks.map((chunk) => [chunk.uri, chunk])).values()].slice(0, MAX_SOURCES + 4);
      const resolved = await Promise.all(
        unique.map(async (chunk): Promise<SourceRef | null> => {
          const page = await fetchPageText(chunk.uri);
          if (!page || new URL(page.url).hostname === GOOGLE_REDIRECT_HOST) return null;
          return { title: page.title || chunk.title || page.url, url: page.url, page };
        }),
      );
      const sources: SourceRef[] = [...new Map(resolved.flatMap((s) => (s ? [[s.url, s] as const] : []))).values()].slice(0, MAX_SOURCES);

      return { brief: (res.text ?? "").trim(), sources };
    },

    async write({ system, prompt }: Prompt, usage: Usage) {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction: system, responseMimeType: "application/json", responseJsonSchema: articleJsonSchema, maxOutputTokens: 32000 },
      });
      addUsage(res.usageMetadata, usage);
      const candidate = assertAnswered(res);
      if (candidate.finishReason === "MAX_TOKENS") throw new Error("The article was cut off before it finished. Try again.");
      return JSON.parse(res.text ?? "") as unknown;
    },

    async suggest({ system, prompt }: Prompt, usage: Usage) {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { systemInstruction: system, responseMimeType: "application/json", responseJsonSchema: topicJsonSchema, maxOutputTokens: 4000 },
      });
      addUsage(res.usageMetadata, usage);
      assertAnswered(res);
      return JSON.parse(res.text ?? "") as unknown;
    },

    describeError(err: unknown) {
      if (!(err instanceof ApiError)) return null;
      const detail = err.message.replace(/\s+/g, " ").slice(0, 200);
      if (err.status === 400 && /API key not valid|API_KEY_INVALID/i.test(err.message)) return "Google rejected the Gemini API key. Check GEMINI_API_KEY.";
      if (err.status === 400) return `The AI request was rejected: ${detail}`;
      if (err.status === 401 || err.status === 403) {
        return `Google refused the request (HTTP ${err.status}). Check GEMINI_API_KEY, that the key is allowed to use the Gemini API, and that billing is enabled on its project. ${detail}`;
      }
      if (err.status === 404) return `The Gemini model "${model}" was not found. Check GEMINI_MODEL.`;
      if (err.status === 429) return "The Gemini quota or rate limit was reached. Try again in a few minutes, or check the project's quota and billing.";
      return `AI service error (${err.status}). Try again.`;
    },
  };
}
