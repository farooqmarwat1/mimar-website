export type RateRule = {
  /** Unique counter name, e.g. "contact:ip-burst:1.2.3.4". */
  key: string;
  limit: number;
  windowSec: number;
};

export type RateResult = { allowed: true } | { allowed: false; retryAfterSec: number };

/**
 * Checks every rule and reports the first one that is over its limit.
 *
 * Two backends:
 * - Upstash Redis (REST) when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 *   are set. The counters are shared by every serverless instance, so the
 *   limit actually holds on Vercel. Fixed windows: INCR + EXPIRE per rule.
 * - Otherwise an in-memory sliding window. On serverless each warm instance
 *   keeps its own map and it resets on cold starts, so this only slows down a
 *   simple flood; it is the fallback, not the real protection.
 *
 * A Redis outage falls back to the in-memory check instead of blocking leads.
 * Blocked attempts still count, so hammering the form extends the block.
 */
export async function checkRateLimit(rules: RateRule[]): Promise<RateResult> {
  const redis = redisConfig();
  if (redis) {
    try {
      return await checkRedis(redis, rules);
    } catch (err) {
      console.error("[rate-limit] Redis unavailable, using in-memory limits", err instanceof Error ? err.message : err);
    }
  } else if (process.env.NODE_ENV === "production" && !warnedNoRedis) {
    warnedNoRedis = true;
    console.warn("[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN not set - limits are per serverless instance only");
  }
  return checkMemory(rules);
}

let warnedNoRedis = false;

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function checkRedis({ url, token }: { url: string; token: string }, rules: RateRule[]): Promise<RateResult> {
  const nowSec = Math.floor(Date.now() / 1000);
  // One round trip for all rules: [INCR, EXPIRE NX] per rule, each in its own time window.
  const commands = rules.flatMap((rule) => {
    const windowKey = `${rule.key}:${Math.floor(nowSec / rule.windowSec)}`;
    return [
      ["INCR", windowKey],
      ["EXPIRE", windowKey, String(rule.windowSec), "NX"],
    ];
  });

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error(`Upstash responded ${res.status}`);
  const results = (await res.json()) as { result?: number; error?: string }[];

  for (const [i, rule] of rules.entries()) {
    const incr = results[i * 2];
    if (incr?.error || typeof incr?.result !== "number") throw new Error(incr?.error ?? "Unexpected Upstash response");
    if (incr.result > rule.limit) {
      return { allowed: false, retryAfterSec: rule.windowSec - (nowSec % rule.windowSec) };
    }
  }
  return { allowed: true };
}

const memory = new Map<string, number[]>();
const MAX_KEYS = 5000;

function checkMemory(rules: RateRule[]): RateResult {
  const now = Date.now();
  let blocked: RateResult = { allowed: true };

  for (const rule of rules) {
    const windowMs = rule.windowSec * 1000;
    const recent = (memory.get(rule.key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    memory.set(rule.key, recent);
    if (recent.length > rule.limit && blocked.allowed) {
      blocked = { allowed: false, retryAfterSec: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
    }
  }

  // Keep the map from growing forever on a long-lived instance.
  if (memory.size > MAX_KEYS) {
    const longest = Math.max(...rules.map((r) => r.windowSec)) * 1000;
    for (const [key, times] of memory) {
      if (now - times[times.length - 1] > Math.max(longest, 3_600_000)) memory.delete(key);
    }
  }
  return blocked;
}
