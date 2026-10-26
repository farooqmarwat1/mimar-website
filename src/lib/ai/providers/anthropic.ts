import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { MAX_SOURCES, articleJsonSchema, topicJsonSchema, translationJsonSchema, type AiProvider, type Prompt, type SourceRef, type Usage } from "@/lib/ai/types";

/** Claude: server-side web search for research, structured output for the article. */
export function anthropicProvider(): AiProvider {
  const client = new Anthropic({ maxRetries: 2 });
  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-5-5";

  return {
    name: "anthropic",
    model,

    async research({ system, prompt }: Prompt, usage: Usage) {
      const messages: Anthropic.MessageParam[] = [{ role: "user", content: prompt }];
      const briefParts: string[] = [];
      const found = new Map<string, { title: string; url: string; cited: boolean }>();

      for (let turn = 0; turn < 4; turn++) {
        const message = await client.messages
          .stream({
            model,
            max_tokens: 16000,
            output_config: { effort: "medium" },
            system,
            tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 6 }],
            messages,
          })
          .finalMessage();

        usage.inputTokens += message.usage.input_tokens;
        usage.outputTokens += message.usage.output_tokens;
        usage.searches += message.usage.server_tool_use?.web_search_requests ?? 0;
        if (message.stop_reason === "refusal") throw new Error("The research request was declined by the model's safety system. Try rewording the topic.");

        for (const block of message.content) {
          if (block.type === "text") {
            briefParts.push(block.text);
            for (const citation of block.citations ?? []) {
              if ("url" in citation && citation.url) found.set(citation.url, { title: citation.title ?? citation.url, url: citation.url, cited: true });
            }
          } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
            for (const result of block.content) {
              if (!found.has(result.url)) found.set(result.url, { title: result.title || result.url, url: result.url, cited: false });
            }
          }
        }

        if (message.stop_reason !== "pause_turn") break;
        messages.push({ role: "assistant", content: message.content });
      }

      const sources: SourceRef[] = [...found.values()]
        .filter((source) => source.url.startsWith("https://"))
        .sort((a, b) => Number(b.cited) - Number(a.cited))
        .slice(0, MAX_SOURCES)
        .map(({ title, url }) => ({ title, url }));

      return { brief: briefParts.join("\n").trim(), sources };
    },

    async write({ system, prompt }: Prompt, usage: Usage) {
      const message = await client.messages
        .stream({
          model,
          max_tokens: 32000,
          output_config: { effort: "high", format: { type: "json_schema", schema: articleJsonSchema as unknown as Record<string, unknown> } },
          system,
          messages: [{ role: "user", content: prompt }],
        })
        .finalMessage();

      usage.inputTokens += message.usage.input_tokens;
      usage.outputTokens += message.usage.output_tokens;
      if (message.stop_reason === "refusal") throw new Error("The model declined to write this topic.");
      if (message.stop_reason === "max_tokens") throw new Error("The article was cut off before it finished. Try again.");

      const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
      return JSON.parse(text) as unknown;
    },

    async suggest({ system, prompt }: Prompt, usage: Usage) {
      const message = await client.messages
        .stream({
          model,
          max_tokens: 4000,
          output_config: { effort: "low", format: { type: "json_schema", schema: topicJsonSchema as unknown as Record<string, unknown> } },
          system,
          messages: [{ role: "user", content: prompt }],
        })
        .finalMessage();

      usage.inputTokens += message.usage.input_tokens;
      usage.outputTokens += message.usage.output_tokens;
      if (message.stop_reason === "refusal") throw new Error("The model declined to suggest a topic.");
      const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
      return JSON.parse(text) as unknown;
    },

    async translate({ system, prompt }: Prompt, usage: Usage) {
      const message = await client.messages
        .stream({
          model,
          max_tokens: 48000,
          output_config: { effort: "medium", format: { type: "json_schema", schema: translationJsonSchema as unknown as Record<string, unknown> } },
          system,
          messages: [{ role: "user", content: prompt }],
        })
        .finalMessage();

      usage.inputTokens += message.usage.input_tokens;
      usage.outputTokens += message.usage.output_tokens;
      if (message.stop_reason === "refusal") throw new Error("The model declined to translate this article.");
      if (message.stop_reason === "max_tokens") throw new Error("The Arabic version was cut off before it finished. Try again.");
      const text = message.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
      return JSON.parse(text) as unknown;
    },

    describeError(err: unknown) {
      if (err instanceof Anthropic.AuthenticationError) return "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.";
      if (err instanceof Anthropic.RateLimitError) return "The AI service is rate limiting requests. Try again in a few minutes.";
      if (err instanceof Anthropic.BadRequestError) return `The AI request was rejected: ${err.message}`;
      if (err instanceof Anthropic.APIConnectionError) return "Could not reach the AI service. Try again.";
      if (err instanceof Anthropic.APIError) return `AI service error (${err.status}). Try again.`;
      return null;
    },
  };
}
