// Runs one scheduled job from a server cron when the site is self-hosted (Hostinger). Vercel Cron
// calls the /api/cron/* routes itself (vercel.json); a plain cron needs something to send the request.
//
//   node --env-file=<app .env> scripts/cron.mjs collect-ideas | generate-blog | blog-report | blog-results | publish-scheduled
//
// Reads CRON_SECRET (and optionally SITE_URL) from the environment: Hostinger's "Node.js" cron mode
// starts node with the app's own env file, so the secret never appears in the cron command.
// next.config.mjs (outputFileTracingIncludes) copies this file into the standalone build, where
// Hostinger's cron looks for it (hbuilds/current/nodejs/scripts/cron.mjs). Prints one line with
// the job, the HTTP status and the start of the response, and exits non-zero on failure.
// Keep in step with vercel.json (tests/cron-script.test.cjs checks it).
const JOBS = new Set(["collect-ideas", "generate-blog", "blog-report", "blog-results", "publish-scheduled"]);

export function cronRequest(job, env = process.env) {
  if (!JOBS.has(job)) throw new Error(`unknown job "${job}" (use: ${[...JOBS].join(", ")})`);
  const secret = env.CRON_SECRET?.trim();
  if (!secret) throw new Error("CRON_SECRET is not set");
  const site = (env.SITE_URL?.trim() || "https://mim.archi").replace(/\/+$/, "");
  return { url: `${site}/api/cron/${job}`, headers: { authorization: `Bearer ${secret}` } };
}

async function main() {
  const job = process.argv[2];
  const started = new Date().toISOString();
  try {
    const { url, headers } = cronRequest(job);
    // The drafting and results jobs may run up to 300 s (maxDuration in each route).
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(330_000) });
    const body = (await res.text()).replace(/\s+/g, " ").slice(0, 300);
    console.log(`${started} ${job} ${res.status} ${body}`);
    process.exitCode = res.ok ? 0 : 1;
  } catch (err) {
    console.error(`${started} ${job ?? "(no job)"} failed: ${err instanceof Error ? err.message : err}`);
    process.exitCode = 1;
  }
}

// Runs only as a script; importing it (the unit test) has no side effects.
if (/cron\.mjs$/.test(process.argv[1] ?? "")) await main();
