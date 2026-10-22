import type { Article } from "./types";

const words = (value: string) => value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
const contains = (text: string, phrase: string) => ` ${words(text).join(" ")} `.includes(` ${words(phrase).join(" ")} `);

/** Editorial requirements, not a guarantee of search ranking or factual accuracy. */
export function topicPolicyErrors(topic: string, keyword: string): string[] {
  const errors: string[] = [];
  if (topic.length < 12 || topic.length > 120) errors.push("Topic must contain 12–120 characters.");
  if (words(keyword).length < 2 || words(keyword).length > 6) errors.push("Primary keyword must contain 2–6 words.");
  if (!contains(topic, keyword)) errors.push("The topic must naturally include the primary keyword.");
  if (/https?:|<[^>]+>|\b(best ever|guaranteed|number one|#1)\b/i.test(topic)) errors.push("Avoid URLs, markup and unsupported superlatives in topics.");
  return errors;
}

export function articlePolicyErrors(article: Article, context: { keyword?: string; geo?: string; category?: string }): string[] {
  const errors: string[] = [];
  const plain = article.body.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  const introduction = plain.split(/^## /m)[0].trim();
  const keyword = context.keyword || article.keywords[0]?.trim();
  if (!keyword) errors.push("Provide a primary keyword.");
  else {
    for (const [name, text] of [["title", article.title], ["SEO title", article.seoTitle], ["description", article.description], ["first 100 words", words(introduction).slice(0, 100).join(" ")]]) {
      if (!contains(text, keyword)) errors.push(`Include the primary keyword naturally in the ${name}.`);
    }
    if (!contains(article.keywords[0] ?? "", keyword)) errors.push("Keep the planned primary keyword first in keywords.");
  }
  if (article.seoTitle.trim().length < 50 || article.seoTitle.trim().length > 60) errors.push("SEO title must contain 50–60 characters.");
  if (article.description.trim().length < 140 || article.description.trim().length > 160) errors.push("Description must contain 140–160 characters.");
  if (article.keywords.length < 5 || article.keywords.length > 8 || new Set(article.keywords.map(k => words(k).join(" "))).size !== article.keywords.length) errors.push("Provide 5–8 distinct, relevant keyword phrases.");
  if (!introduction || words(introduction).length > 120) errors.push("Open with a direct answer or definition in at most 120 words, before the first heading.");
  if ((article.body.match(/^## /gm) ?? []).length < 3) errors.push("Provide at least three useful H2 sections.");
  if (/^#\s/m.test(article.body) || /<\/?[a-z][^>]*>/i.test(article.body)) errors.push("Use H2/H3 markdown sections without H1 or HTML.");
  if (article.faq.length < 4 || article.faq.length > 6) errors.push("Provide 4–6 self-contained FAQ answers.");
  if (new Set(article.faq.map(f => words(f.question).join(" "))).size !== article.faq.length || article.faq.some(f => words(f.answer).length < 20)) errors.push("FAQ questions must be distinct and each answer must contain at least 20 words.");
  if (context.category && article.category !== context.category) errors.push("Use the planned service category.");
  if (context.geo) {
    for (const place of context.geo.split(",").map(p => p.trim()).filter(Boolean)) {
      if (!contains(plain, place) || !article.geoTerms.some(term => contains(term, place))) errors.push(`Include the target location ${place} naturally in the article and geoTerms.`);
    }
    if (!/^## .*\b(local|regional|market|practice|considerations|dubai|islamabad|riyadh|usa|pakistan|saudi|uae|united states)\b/im.test(article.body)) errors.push("Include a substantive section on local market considerations, supported by the research.");
  }
  return errors;
}
