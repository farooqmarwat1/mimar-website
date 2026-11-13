import "server-only";
import deliverable6 from "@/content/briefs/deliverable-6.json";
import { briefProblems, normalizeBrief, type BlogBrief } from "@/lib/ai/blog-brief";
import { ideaStrategy, regionForText } from "@/lib/ai/idea-plan";
import { groupForQuery } from "@/lib/ai/keyword-plan";
import { titleSimilarity } from "@/lib/ai/similarity";
import { getBlogEntries } from "@/lib/blog-store";
import { addPriorityTopic, listTopics } from "@/lib/generation";
import { blogCategories } from "@/lib/legacy-seo";
import { briefRefsWithPosts } from "@/lib/posts";

/**
 * Queues SEO briefs (blog-brief.ts) ahead of the automatic topics. Each becomes a priority topic
 * tagged with the keyword-research approach, so /admin/blog/approaches compares the SEO
 * consultant's briefs with the other ways of finding topics. Drafting, the quality gates and
 * human approval are unchanged.
 */

/** Brief files that can be imported from /admin/blog/generate, by key. */
export const BRIEF_SETS: Record<string, { label: string; briefs: Record<string, unknown>[] }> = {
  "deliverable-6": { label: "Deliverable 6 (16 regional and strategy blogs, revised)", briefs: deliverable6.briefs as Record<string, unknown>[] },
};

export type QueueResult = { queued: string[]; skipped: { title: string; reason: string }[] };

export async function queueBriefs(input: Record<string, unknown>[]): Promise<QueueResult> {
  const categories = blogCategories.map((category) => category.slug);
  const [topics, articles, written] = await Promise.all([listTopics(), getBlogEntries(), briefRefsWithPosts()]);
  const live = topics.filter((topic) => topic.status !== "failed");
  const result: QueueResult = { queued: [], skipped: [] };

  for (const raw of input) {
    const brief: BlogBrief = normalizeBrief(raw);
    const label = brief.ref ? `${brief.ref} ${brief.title}` : brief.title;
    const problems = briefProblems(brief, categories);
    if (problems.length) {
      result.skipped.push({ title: label, reason: problems.join(" ") });
      continue;
    }
    if (brief.ref && written.has(brief.ref)) {
      result.skipped.push({ title: label, reason: "Already has a post (a draft, scheduled or published)." });
      continue;
    }
    if (live.some((topic) => (brief.ref && topic.brief?.ref === brief.ref) || topic.topic.toLowerCase() === brief.title.toLowerCase())) {
      result.skipped.push({ title: label, reason: "Already queued or written." });
      continue;
    }
    const similar = articles.find((article) => titleSimilarity(article.title, brief.title) >= 0.6);
    if (similar) {
      result.skipped.push({ title: label, reason: `Too close to the existing article "${similar.title}".` });
      continue;
    }
    await addPriorityTopic({
      topic: brief.title,
      keyword: brief.keyword,
      geo: brief.geo,
      category: brief.category,
      seedUrls: [],
      source: "manual",
      region: regionForText(`${brief.geo ?? ""} ${brief.title}`),
      group: groupForQuery(brief.keyword, brief.title) ?? undefined,
      brief,
      strategy: ideaStrategy({ title: brief.title, keyword: brief.keyword }),
      keywordSource: "research",
      approach: "keywords",
      ideaBrief: `SEO brief${brief.ref ? ` ${brief.ref}` : ""}: "${brief.title}"`,
    });
    live.push({ id: "", topic: brief.title, status: "queued", createdAt: "", brief });
    result.queued.push(label);
  }
  return result;
}
