# Staff portal (`/admin`) — setup and operations

HR and editors manage **job postings** (live on `/careers`) and **blog posts** (live on `/blog/<slug>`) from `/admin`. Data lives in Firebase (Firestore + Storage). The browser never talks to Firebase: every read and write goes through the Firebase Admin SDK on the server, and `firestore.rules` denies all client access.

Without the Firebase env vars the site renders exactly as before (no open roles, no extra posts) and `/admin` sign-in is disabled, so local development and builds work without any setup.

## One-time setup

1. **Firebase project** (a dedicated one is recommended). Enable **Authentication → Email/Password** and create **Firestore** and **Storage**.
2. **Service account**: Project settings → Service accounts → *Generate new private key*. Put `project_id`, `client_email`, `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (see `.env.example`). Also set `FIREBASE_WEB_API_KEY` (Project settings → General → Web API key) and optionally `FIREBASE_STORAGE_BUCKET`. Set the same variables in Vercel (Production **and** Preview if you want to test there).
3. **Rules**: `firebase deploy --only firestore:rules,storage` deploys `firestore.rules` and `storage.rules` (both deny all browser access; the server uses the Admin SDK, which bypasses them). **If the Firebase project is shared with the CRM portal, do not deploy them as they are** - that would replace the portal's rules. Merge the `siteJobs`, `sitePosts`, `siteBlogTopics` and `siteGenerationJobs` rules and the Storage rule into the existing files instead. No Firestore indexes are needed (`firestore.indexes.json` is empty on purpose).
4. **Create staff accounts** (there is no public sign-up):

   ```bash
   node --env-file=.env.local scripts/set-admin-role.mjs hr@mim.archi hr
   node --env-file=.env.local scripts/set-admin-role.mjs editor@mim.archi editor
   node --env-file=.env.local scripts/set-admin-role.mjs you@mim.archi admin
   ```

   A new account gets a random temporary password, printed once. An existing Firebase user only gets the role. Remove access with `... none`.

## Roles

| Role | Jobs (`/admin/jobs`) | Blog (`/admin/blog`) |
|---|---|---|
| `hr` | yes | no |
| `editor` | no | yes |
| `admin` | yes | yes |

A Firebase account without a `role` claim cannot sign in to `/admin`, even if it is a valid user of another app in the same project (e.g. the CRM portal).

## How access is enforced

- `src/proxy.ts` only redirects visitors without a session cookie to the sign-in page (UX).
- Real checks are in every admin page and Server Action (`requireRole` / `assertAccess` in `src/lib/admin/auth.ts`). Do not rely on the proxy.
- Session = Firebase session cookie (8 h), `httpOnly`, `SameSite=Strict`, path `/admin`. Signing out revokes the user's refresh tokens.
- `/admin/*` is sent with `X-Robots-Tag: noindex` and `Cache-Control: no-store`, is disallowed in `robots.txt` for every crawler group, and is never in the sitemap.
- Sign-in is rate limited (per IP and per email) with `src/lib/rate-limit.ts`.

## Reserved paths

`/portal`, `/api/v1` and `/__/auth` belong to the CRM portal (see `next.config.ts`). Nothing in this portal uses them.

## Jobs

- Create a job in `/admin/jobs`, set it to **Publish role**; it appears on `/careers` and gets its own page `/careers/<slug>` immediately (no redeploy).
- Only **open, unexpired** roles are listed, included in `sitemap.xml` / `llms.txt`, and carry `JobPosting` structured data. Closed or expired roles keep a `noindex` "no longer open" page for people holding the link.
- The URL ending is locked once a role has been public.
- "Apply by" (optional) removes the role automatically after that date.

## Key rotation / offboarding

- Offboard: `node --env-file=.env.local scripts/set-admin-role.mjs person@mim.archi none` (revokes their sessions too).
- Rotate the service account key: create a new key in Firebase, update the three `FIREBASE_*` variables in Vercel, redeploy, then delete the old key.

## Blog (`/admin/blog`)

- Write a post in the editor (same plain-text block format as every article: `## Heading`, `- bullet`, blank line = new paragraph; inline links as `[text](/page-on-this-site)`). Fields: SEO title and meta description with live character counters, keywords, target locations, FAQ, cover image, category, related reading, sources.
- **Publish** needs: a title, SEO title (10-70 chars), meta description (50-175), at least 150 words and one `##` section, and every internal link must point at a real page of the site. Drafts can be saved incomplete.
- Posts go live at `/blog/<slug>` immediately (no redeploy), on top of the `/blog` list and in their category, and are added to `sitemap.xml` and `llms.txt`. The URL ending is locked once a post has been published. A slug can never collide with a category, a page number or an old WordPress article.
- The migrated WordPress articles are **not** editable here; they stay in the codebase (`src/content/legacy-seo.json`).
- Cover images are uploaded to Firebase Storage (JPEG/PNG/WebP, compressed in the browser to stay under the 4 MB request limit).

## AI drafts (`/admin/blog/generate`)

1. Enter a topic or keyword, optionally a location, a category and up to 3 pages to start from.
2. The generator (Gemini by default when `GEMINI_API_KEY` is set, default model `gemini-3.8-flash`; or Claude, default `claude-opus-5-5`, when only `ANTHROPIC_API_KEY` is set - force one with `AI_PROVIDER=gemini|anthropic`) **researches** the topic with web search (Grounding with Google Search for Gemini), **writes** an original article with SEO fields, FAQ, links to the right Mimar pages and a source list, and runs **quality gates**: invented links are removed, length and SEO limits are checked, and the wording is compared with the real source pages (8-word phrase overlap). Over 5% overlap triggers one automatic rewrite; if it still copies more than 15% the draft is discarded.
3. The result is saved as a **draft** marked "AI draft", with the checks' notes and the sources. A person checks every fact against the sources, adds real project images, and publishes. **Nothing is ever published automatically.**
4. A run takes 2-5 minutes. Rough cost: about $0.10-0.20 with Gemini (covered by Google Cloud credits if the key's project has them), about $0.40-0.60 with Claude; the job's progress page shows the real searches and tokens used. Limits: 5 runs per person per hour and `BLOG_GENERATION_DAILY_LIMIT` (default 10) per day for the whole site.

**Automatic drafts (twice a week).** Vercel Cron (`vercel.json`: Mondays and Thursdays, 05:00 UTC = 10:00 in Pakistan) calls `/api/cron/generate-blog`, which writes **one draft per run** and emails the reviewers to approve it. Nobody has to supply topics:
- **Topic choice:** if staff queued a topic (`topic | location | category`, one per line on the Draft with AI page) it is written first. Otherwise the planner rotates through every **service group x region** (Architectural Design, 3D Visualization, Interactive Services, Branding, Marketing x UAE, USA, Saudi Arabia, Pakistan = 20 combinations, so about 10 weeks per full cycle at 2 a week). It takes the combination covered longest ago, and the AI picks a specific, searchable topic inside it that is not too similar to any existing article or past topic.
- **Approval:** the draft waits under **Drafts waiting** (and is counted on the admin home page). One email goes **To** the approvers in `BLOG_NOTIFY_EMAIL` (default `hr@mim.archi`; add the second admin as a comma-separated list) and **CC** `BLOG_NOTIFY_CC` (default `info@mim.archi`, for information only, no account needed), with a link to the draft. Every approver needs an `admin` or `editor` account.
- **Guard:** while `BLOG_MAX_PENDING_DRAFTS` (default 6) AI drafts are unreviewed, scheduled runs skip instead of piling up more.
- **Switches:** `BLOG_AUTO_TOPICS=false` writes only queued topics. The endpoint needs `CRON_SECRET` (Vercel sends it as a bearer token) and refuses every request without it. Emails need SMTP or Resend configured; the approval link uses `ADMIN_BASE_URL` (default `https://mim.archi`). **Vercel Hobby (free) limits, checked against Vercel's docs on 22 Oct 2026:** cron may run at most once per day (our twice-weekly schedule is fine) and fires at some point within the scheduled hour (05:00-05:59 UTC) rather than the exact minute; a function may run for at most 300 seconds, which needs Fluid Compute (on by default for new projects; enable it under Settings → Functions for older ones). A draft takes about 100-115 seconds. Hobby is also restricted to non-commercial personal use by Vercel's fair-use terms.

Web pages are fetched with an SSRF-safe fetcher (https only, no private or internal addresses, size and time capped) and are treated as untrusted data: they never become instructions, and the model's output is schema-validated and link-checked.
