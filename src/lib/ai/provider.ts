import "server-only";
import { anthropicProvider } from "@/lib/ai/providers/anthropic";
import { geminiProvider } from "@/lib/ai/providers/gemini";
import type { AiProvider } from "@/lib/ai/types";

/**
 * Which AI provider writes the blog drafts.
 *
 *   AI_PROVIDER=gemini | anthropic   explicit choice (needs that provider's key)
 *   unset                            Gemini if GEMINI_API_KEY is set (startup credits),
 *                                    otherwise Claude if ANTHROPIC_API_KEY is set
 */

export type ProviderName = AiProvider["name"];

const has = (name: string) => Boolean(process.env[name]?.trim());

export function providerName(): ProviderName | null {
  const choice = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (choice === "anthropic" || choice === "claude") return has("ANTHROPIC_API_KEY") ? "anthropic" : null;
  if (choice === "gemini" || choice === "google") return has("GEMINI_API_KEY") ? "gemini" : null;
  if (has("GEMINI_API_KEY")) return "gemini";
  if (has("ANTHROPIC_API_KEY")) return "anthropic";
  return null;
}

export const aiConfigured = () => providerName() !== null;

/** What is missing, for admin messages. */
export function aiSetupHint(): string {
  const choice = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (choice === "anthropic" || choice === "claude") return "ANTHROPIC_API_KEY is not set";
  if (choice === "gemini" || choice === "google") return "GEMINI_API_KEY is not set";
  return "No AI key is set (GEMINI_API_KEY or ANTHROPIC_API_KEY)";
}

export function getProvider(): AiProvider {
  const name = providerName();
  if (name === "gemini") return geminiProvider();
  if (name === "anthropic") return anthropicProvider();
  throw new Error(`${aiSetupHint()}.`);
}
