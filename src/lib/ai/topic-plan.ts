/**
 * Automatic topic planning: which service x region combination gets the next
 * article. Pure (no server imports) so the rotation can be unit-tested.
 *
 * Every combination is covered once before any is repeated; after that the one
 * covered longest ago comes first. Both axes vary run to run (so consecutive
 * drafts are not all about one service or one country).
 */

export type Combo = { group: string; region: string };
export type HistoryItem = { group?: string; region?: string; createdAt: string };

/** All combinations in an order that varies both axes between neighbours. */
export function comboOrder(groups: string[], regions: string[]): Combo[] {
  const total = groups.length * regions.length;
  const seen = new Set<string>();
  const order: Combo[] = [];
  const add = (g: number, r: number) => {
    const key = `${g}|${r}`;
    if (seen.has(key)) return;
    seen.add(key);
    order.push({ group: groups[g], region: regions[r] });
  };
  // (k mod G, k mod R) visits every pair exactly once when G and R are coprime...
  for (let k = 0; k < total * 2 && order.length < total; k++) add(k % groups.length, k % regions.length);
  // ...and any pairs it misses (non-coprime sizes) are appended.
  for (let g = 0; g < groups.length; g++) for (let r = 0; r < regions.length; r++) add(g, r);
  return order;
}

export function pickNextCombo(history: HistoryItem[], groups: string[], regions: string[]): Combo {
  const lastCovered = new Map<string, string>();
  for (const item of history) {
    if (!item.group || !item.region) continue;
    const key = `${item.group}|${item.region}`;
    if (!lastCovered.has(key) || item.createdAt > lastCovered.get(key)!) lastCovered.set(key, item.createdAt);
  }
  return comboOrder(groups, regions)
    .map((combo, index) => ({ combo, index, at: lastCovered.get(`${combo.group}|${combo.region}`) ?? "" }))
    // never covered ("" sorts first), then oldest; ties keep the varied order above
    .sort((a, b) => a.at.localeCompare(b.at) || a.index - b.index)[0].combo;
}
