import "server-only";
import { aiConfigured } from "@/lib/ai/generate-post";
import { getProvider } from "@/lib/ai/provider";
import type { Usage } from "@/lib/ai/types";
import { getBlogEntries } from "@/lib/blog-store";
import { listTopics } from "@/lib/generation";
import type { Collector, CollectorResult } from "@/lib/ideas/ai";
import { autocompleteCollector } from "@/lib/ideas/collectors/autocomplete";
import { competitorsCollector } from "@/lib/ideas/collectors/competitors";
import { customersCollector } from "@/lib/ideas/collectors/customers";
import { instagramCollector } from "@/lib/ideas/collectors/instagram";
import { keywordResearchCollector } from "@/lib/ideas/collectors/keyword-research";
import { newsCollector } from "@/lib/ideas/collectors/news";
import { redditCollector } from "@/lib/ideas/collectors/reddit";
import { acquireIdeasLease, deleteExpiredIdeas, finishIdeasRun, saveNewIdeas, type SourceRun } from "@/lib/ideas/store";

/**
 * One collection run (weekly from /api/cron/collect-ideas, or "Collect now" on /admin/blog/ideas):
 * every collector runs side by side, a failing one never stops the others, new ideas are saved
 * without repeating stored ideas or covered articles, and expired ideas are cleared.
 */

export const COLLECTORS: Collector[] = [autocompleteCollector, competitorsCollector, redditCollector, instagramCollector, customersCollector, newsCollector, keywordResearchCollector];

/** Longer than the route's maxDuration, so a crashed run's lease always expires on its own. */
const LEASE_MS = 330_000;

async function coveredTitles(): Promise<string[]> {
  const [articles, topics] = await Promise.all([getBlogEntries(), listTopics()]);
  return [...new Set([...articles.map((article) => article.title), ...topics.flatMap((topic) => [topic.topic, topic.keyword ?? ""]).filter(Boolean)])];
}

export type CollectResult = { ok: true; added: number; sources: Record<string, SourceRun>; usage: Usage } | { ok: false; skipped: string };

export async function collectIdeas(now = new Date()): Promise<CollectResult> {
  if (!(await acquireIdeasLease(LEASE_MS))) return { ok: false, skipped: "A collection run is already in progress." };
  const sources: Record<string, SourceRun> = {};
  try {
    const provider = aiConfigured() ? getProvider() : null;
    const usage: Usage = { inputTokens: 0, outputTokens: 0, searches: 0 };
    const covered = await coveredTitles();

    const results = await Promise.all(
      COLLECTORS.map(async (collector): Promise<CollectorResult> => {
        try {
          return await collector.collect({ provider, usage, covered, now });
        } catch (err) {
          const message = (provider?.describeError(err) ?? (err instanceof Error ? err.message : "Failed.")).slice(0, 300);
          console.error(`[ideas] ${collector.key} failed:`, message);
          return { state: "error", ideas: [], message };
        }
      }),
    );

    let added = 0;
    for (const [index, collector] of COLLECTORS.entries()) {
      const result = results[index];
      const saved = await saveNewIdeas(result.ideas, covered, now);
      covered.push(...result.ideas.map((idea) => idea.title));
      added += saved;
      sources[collector.key] = { state: result.state, found: result.ideas.length, added: saved, message: result.message, at: now.toISOString() };
    }
    await deleteExpiredIdeas(now);
    await finishIdeasRun({ sources });
    return { ok: true, added, sources, usage };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Collecting ideas failed.";
    await finishIdeasRun({ sources, error }).catch(() => undefined);
    throw err;
  }
}
