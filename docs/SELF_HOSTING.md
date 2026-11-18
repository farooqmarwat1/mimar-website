# Self-hosting (Hostinger) - notes

Vercel is the production host (`vercel.json`, `SEO_MIGRATION.md`). This file records what changes when the
site runs somewhere else, in this case Hostinger's Node.js Web App on the Cloud Startup plan.

## Why the config is `next.config.mjs`

Hostinger's servers run an operating system with glibc 2.28. Next's native compiler
(`@next/swc-linux-x64-gnu`) needs glibc 2.29, so Next falls back to its WebAssembly compiler, and that one
cannot load a TypeScript config. The first deploy failed with `ERR_MODULE_NOT_FOUND` for
`next.config.compiled.js` for exactly this reason. So:

- The config is plain JavaScript. It keeps its own copy of `withTrailingSlash()`
  (`src/lib/trailing-slash.ts` is the original). `tests/next-config.test.cjs` checks every redirect built by the
  config against the original, so the two cannot drift.
- Vercel is unaffected: `npm run build` is still `next build` (Turbopack).
- On Hostinger set the build command to `npm run build:selfhost` (`next build --webpack`). The WebAssembly
  compiler does not support Turbopack.

If Hostinger's build still fails, the options are building elsewhere and uploading the output, a VPS (modern
OS), or Vercel Pro.

## Settings in the Hostinger Web App

- Framework Next.js, Node 22.x, branch `main` (or the branch under test), root `./`, npm.
- Build command `npm run build:selfhost`, output directory `.next`, start `npm start`.
- Environment variables are set in the Hostinger panel, never in git. Names are in `.env.example`; the ones
  Vercel has in production are: `GSC_SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `VISITOR_HASH_SECRET`,
  `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
  `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_WEB_API_KEY`, `SMTP_HOST`, `SMTP_PORT`,
  `SMTP_USER`, `SMTP_PASS`, `CRON_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `NODE_OPTIONS`.
  `NEXT_PUBLIC_*` values are baked in at build time: change one, redeploy.
- Vercel keeps secrets write-only, so they cannot be exported. Regenerate where needed (Firebase key,
  Gemini/Resend keys, mailbox password) and make new random values for `CRON_SECRET` and `VISITOR_HASH_SECRET`.

## Visitor country and address (Cloudflare)

`src/lib/geo-headers.ts` reads the visitor's country and IP. Vercel's headers (`x-vercel-ip-country`) win. The
Cloudflare ones (`CF-IPCountry`, `CF-Connecting-IP`) are used only when the server has `TRUST_CF_HEADERS=1`,
because anyone who can reach the origin directly could otherwise send them by hand. Set it only once the origin
serves Cloudflare traffic only. It drives the home-page Arabic redirect, the region cookie and the visit
records (ARABIC.md). Without a country header nothing is redirected.

## Scheduled jobs

Vercel Cron does not exist elsewhere. The four routes under `/api/cron/*` only need a request with
`Authorization: Bearer $CRON_SECRET`; `scripts/run-cron.sh <job>` sends it. Put `CRON_SECRET` (and optionally
`SITE_URL`) in `~/.mimar-cron.env` on the server (chmod 600), then add Hostinger cron jobs, times in UTC as in
`vercel.json`:

| Schedule | Command |
|---|---|
| `0 4 * * 0` | `sh /path/to/scripts/run-cron.sh collect-ideas` |
| `0 5 * * 1,4` | `sh /path/to/scripts/run-cron.sh generate-blog` |
| `0 6 1 * *` | `sh /path/to/scripts/run-cron.sh blog-report` |
| `0 7 * * *` | `sh /path/to/scripts/run-cron.sh blog-results` |

The jobs can run up to 300 s; the script waits 330 s. The server's own proxy timeout may cut the response
earlier, which does not stop the job.

## Test URL

`*.hostingersite.com` answers with `X-Robots-Tag: noindex, nofollow` (a host rule in `next.config.mjs`), so
nothing has to be switched off at cutover. Canonicals, sitemap and JSON-LD always say `https://mim.archi/`
(`siteConfig.url`).

## Cutover checklist (not done until a Hostinger build runs and the checks pass)

1. Test URL: titles, canonicals, redirects (one hop), 410 on `/?shop/...`, sitemap and robots, images, `/admin`.
2. Cloudflare: only the `mim.archi` and `www` records change (now CNAME to Vercel). Do not touch MX, SPF, DKIM,
   DMARC or verification TXT records (Google Workspace and Titan mail).
3. Keep Vercel connected until the new host has been stable for a few days; it is the way back.
4. Search Console: submit the sitemap again and watch crawl errors for a week.
