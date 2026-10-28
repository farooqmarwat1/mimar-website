import "server-only";
import { topicPolicyErrors } from "./editorial-policy";
import { nextStrategy, pickKeyword, strategyInfo, type BlogTagging, type KeywordPick, type KeywordRow } from "@/lib/ai/keyword-plan";
import { titleSimilarity } from "@/lib/ai/similarity";
import { pickNextCombo } from "@/lib/ai/topic-plan";
import { topicSchema, type AiProvider, type Usage } from "@/lib/ai/types";
import { listTopics } from "@/lib/generation";
import { getBlogEntries } from "@/lib/blog-store";
import { regionList } from "@/lib/regions";
import { getKeywordRows } from "@/lib/search-console";

/**
 * Automatic topic planning for the scheduled generator.
 *
 * The rotation (topic-plan.ts) decides WHICH service and region comes next, so
 * every one of the 5 service groups x 4 regions is covered once before any
 * repeats, and keyword-plan.ts decides the blog type (quick win, question guide,
 * buyer intent), taking the three in turn.
 *
 * The keyword is a real Google search from Search Console for that type, region
 * and service (or that type and region, any service). Only when Search Console
 * has none, or is not configured, does the AI choose the keyword itself; the
 * topic is then tagged keywordSource "ai" so the performance report can tell the
 * two apart. The AI always writes the specific topic, and anything too similar
 * to an existing article or a past topic is rejected. The article is then
 * researched and written by the normal pipeline and waits for a person's
 * approval, exactly like a hand-entered topic.
 */

export type ServiceGroup = { key: string; label: string; category: string; focus: string };

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    key: "architectural-design",
    label: "Architectural Design",
    category: "architecture",
    focus: "architectural design services, interior design, urban planning and masterplanning, topographic and spatial surveys, design stages and coordination",
  },
  {
    key: "3d-visualization",
    label: "3D Visualization",
    category: "3d-visualization",
    focus: "3D architectural visualization: exterior and interior rendering, walkthrough animation and cinematics, aerial and masterplan views, VFX, rendering workflows and deliverables",
  },
  {
    key: "interactive-services",
    label: "Interactive Services",
    category: "vr-real-estate",
    focus: "interactive property experiences: VR and 360 tours, web tours, property explorers and unit selectors, dual-screen navigators, interactive prints, virtual smart homes",
  },
  {
    key: "branding",
    label: "Branding",
    category: "real-estate-tech",
    focus: "branding for real estate developers and architecture firms: brand identity, brand strategy, marketing collateral and stationery",
  },
  {
    key: "marketing",
    label: "Marketing",
    category: "real-estate-tech",
    focus: "real estate marketing: digital and social media marketing, SEO, web development, proptech, off-plan sales marketing",
  },
];

const SIMILARITY_LIMIT = 0.5;

export type PlannedTopic = {
  topic: string;
  keyword: string;
  geo: string;
  category: string;
  group: string;
  region: string;
} & BlogTagging;

const SYSTEM = `You plan the content calendar for the blog of Mimar Studios, a 3D architectural visualization, architectural design and digital property experience studio.
Propose exactly ONE new article topic for the service area and market you are given.

Rules
- Informational search intent: a question or "how/what/why/guide" subject that real buyers, developers or architects type into search engines.
- Specific, not generic. Prefer a concrete angle (a decision, a cost driver, a process, a regulation or market condition, a comparison) over a broad overview.
- It must be answerable from public information. Do not require Mimar's private data, client names, case studies or prices.
- It must not duplicate or closely resemble any article or topic in the "Already covered" list.
- At most 120 characters. Mention the place only when it is genuinely relevant to the answer.
- "keyword" is the main phrase people would search for (2-6 words), included naturally in the topic. When a required keyword is given, return it unchanged and include it word for word in the topic.
- Choose a specific buyer question with a substantive local angle. Avoid city-name swaps of existing articles. Never invent search volume or ranking guarantees.
- Never imply a named law, rating system or authority requires renders or a specific deliverable unless the supplied verified facts explicitly establish that requirement. Prefer well-supported buyer decisions about scope, briefs, process and quality over speculative compliance topics.`;

async function existingTitles(): Promise<string[]> {
  const [articles, topics] = await Promise.all([getBlogEntries(), listTopics()]);
  return [...new Set([...articles.map((article) => article.title), ...topics.map((topic) => topic.topic)])];
}

async function keywordRows(): Promise<KeywordRow[]> {
  try {
    return await getKeywordRows();
  } catch (err) {
    console.error("[auto-topic] Search Console unavailable, the AI will choose the keyword:", err instanceof Error ? err.message : err);
    return [];
  }
}

/** Two tries at a topic that passes the editorial and similarity checks. `required` fixes the keyword. */
async function suggestTopic(provider: AiProvider, usage: Usage, prompt: string, titles: string[], required?: string) {
  let feedback = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = topicSchema.parse(await provider.suggest({ system: SYSTEM, prompt: prompt + feedback }, usage));
    const topic = raw.topic.trim().replace(/\s+/g, " ");
    const keyword = required ?? raw.keyword.trim().replace(/\s+/g, " ");
    const policyErrors = topicPolicyErrors(topic, keyword);
    if (policyErrors.length) {
      feedback = "\nFix these requirements: " + policyErrors.join(" ");
      continue;
    }
    const closest = titles.map((title) => ({ title, score: titleSimilarity(topic, title) })).sort((a, b) => b.score - a.score)[0];
    if (closest && closest.score >= SIMILARITY_LIMIT) {
      feedback = `\nYour previous suggestion "${topic}" is too similar to the existing "${closest.title}". Choose a clearly different angle.`;
      continue;
    }
    return { topic, keyword };
  }
  return null;
}

function keywordContext(pick: KeywordPick, regionName: string): string {
  const { stats } = pick;
  return [
    `Required primary keyword (a real Google search; use it word for word): "${pick.keyword}"`,
    `Google Search Console, last 90 days, searchers in ${regionName}: ${stats.impressions} impressions, ${stats.clicks} clicks, average position ${stats.position}. Page Google shows for it: ${stats.page || "none"}.`,
    pick.related.length ? `Related searches people used: ${pick.related.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function planAutoTopic(provider: AiProvider, usage: Usage): Promise<PlannedTopic> {
  const [history, titles, rows, articles] = await Promise.all([listTopics(), existingTitles(), keywordRows(), getBlogEntries()]);
  const strategy = nextStrategy(history.filter((item) => item.source === "auto" && item.status !== "failed"));
  const info = strategyInfo(strategy)!;
  const combo = pickNextCombo(
    history,
    SERVICE_GROUPS.map((group) => group.key),
    regionList.map((region) => region.name),
  );
  const region = regionList.find((item) => item.name === combo.region)!;
  const today = new Date().toISOString().slice(0, 10);

  // A quick win whose ranking page is an existing article (English or Arabic) belongs in that article, not a new one.
  const trim = (path: string) => path.replace(/^\/ar(?=\/)/, "").replace(/\/$/, "");
  const articlePaths = new Set(articles.map((article) => trim(article.path)));
  const used = [...titles, ...history.map((item) => item.keyword ?? "").filter(Boolean)];
  const options = { strategy, region: region.name, used, isArticlePage: (path: string) => articlePaths.has(trim(path)) };
  // This service in this region; otherwise any service in this region.
  const pick = pickKeyword(rows, { ...options, group: combo.group }) ?? pickKeyword(rows, options);
  const group = SERVICE_GROUPS.find((item) => item.key === pick?.group) ?? SERVICE_GROUPS.find((item) => item.key === combo.group)!;

  const prompt = (keyword?: KeywordPick) => `Today is ${today}.
Service area: ${group.label} - ${group.focus}.
Market: ${region.name} (primary city: ${region.city}). Context about this market: ${region.keyFacts.slice(0, 4).join(" ")}
Blog type: ${info.label}. ${info.planner}
${keyword ? keywordContext(keyword, region.name) : ""}

Already covered (do not repeat or closely resemble):
${titles.slice(-150).map((title) => `- ${title}`).join("\n")}
`;

  const base = { geo: `${region.city}, ${region.name}`, category: group.category, group: group.key, region: region.name, strategy };
  if (pick) {
    const chosen = await suggestTopic(provider, usage, prompt(pick), titles, pick.keyword);
    if (chosen) return { ...base, ...chosen, keywordSource: "search-console", keywordStats: pick.stats, relatedQueries: pick.related };
  }
  const chosen = await suggestTopic(provider, usage, prompt(), titles);
  if (chosen) return { ...base, ...chosen, keywordSource: "ai" };
  throw new Error("Could not find a topic that is different enough from existing articles.");
}
