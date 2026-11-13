import "server-only";
import { REGION_TO_GL, parseAutocomplete, usefulSuggestion, type NewIdea } from "@/lib/ai/idea-plan";
import { groupForQuery } from "@/lib/ai/keyword-plan";
import { regionList } from "@/lib/regions";
import { inBatches, off, type Collector } from "@/lib/ideas/ai";

/**
 * Search approach: the questions and buying searches Google's autocomplete suggests for our
 * services, per country - a free stand-in for "People also ask". Google's suggest endpoint is
 * not an official API, so this is best effort: a small, rotating slice of queries each week,
 * and the run simply reports an error if Google stops answering.
 */

const SEEDS = [
  "architectural design",
  "villa design",
  "interior design company",
  "3d rendering",
  "architectural visualization",
  "3d walkthrough",
  "3d animation real estate",
  "virtual tour real estate",
  "360 virtual tour",
  "real estate branding",
  "real estate marketing",
  "off plan marketing",
];

const TEMPLATES: ((seed: string, city: string) => string)[] = [
  (seed) => `how ${seed}`,
  (seed) => `what is ${seed}`,
  (seed) => `${seed} cost`,
  (seed) => `best ${seed}`,
  (seed) => `${seed} vs`,
  (seed) => `${seed} for`,
  (seed, city) => `${seed} ${city.toLowerCase()}`,
];

/** Queries per weekly run, so we never hammer the endpoint. */
const PER_RUN = 60;

/** Google autocomplete suggestions for a query in a country (`gl`). Also used by the keyword-research approach. */
export async function suggestions(query: string, gl: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=${gl}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { "User-Agent": "MimarStudiosBot/1.0 (+https://mim.archi)" }, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseAutocomplete(JSON.parse(await res.text()));
}

export const autocompleteCollector: Collector = {
  key: "autocomplete",
  label: "Google autocomplete",
  approach: "search",
  async collect({ now }) {
    if (["false", "0", "off", "no"].includes((process.env.BLOG_AUTOCOMPLETE ?? "").trim().toLowerCase())) return off("Switched off with BLOG_AUTOCOMPLETE.");

    const all = regionList.flatMap((region) => SEEDS.flatMap((seed) => TEMPLATES.map((template) => ({ query: template(seed, region.city), region: region.name }))));
    // A different slice each week, so every combination comes round in time.
    const week = Math.floor(now.getTime() / (7 * 86_400_000));
    const start = (week * PER_RUN) % all.length;
    const slice = [...all.slice(start), ...all.slice(0, start)].slice(0, PER_RUN);

    let failures = 0;
    const seen = new Map<string, { region: string; count: number }>();
    await inBatches(slice, 4, async ({ query, region }) => {
      try {
        for (const suggestion of await suggestions(query, REGION_TO_GL[region] ?? "us")) {
          const key = suggestion.toLowerCase();
          if (key === query.toLowerCase() || !usefulSuggestion(key)) continue;
          const entry = seen.get(key) ?? { region, count: 0 };
          entry.count++;
          seen.set(key, entry);
        }
      } catch {
        failures++;
      }
    });
    if (failures === slice.length) return { state: "error", ideas: [], message: "Google autocomplete did not answer any request this week." };

    const ideas: NewIdea[] = [...seen.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 40)
      .map(([suggestion, { region, count }]) => ({
        approach: "search",
        source: "autocomplete",
        title: suggestion,
        keyword: suggestion,
        region,
        group: groupForQuery(suggestion) ?? undefined,
        evidence: { count, note: `Suggested by Google autocomplete in ${region}` },
        seedUrls: [],
      }));
    return { state: "ok", ideas, message: `${slice.length - failures} of ${slice.length} searches answered${failures ? `, ${failures} failed` : ""}.` };
  },
};
