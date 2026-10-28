# Staff portal (`/admin`) — setup and operations

Admins work **contact-form leads** in a small CRM. HR and editors manage **job postings** (live on `/careers`) and **every blog article** (the migrated WordPress ones and new posts, English with an automatic Arabic version) from `/admin`. The portal itself is English only. Data lives in Firebase (Firestore + Storage). The browser never talks to Firebase: every read and write goes through the Firebase Admin SDK on the server, and `firestore.rules` denies all client access.

Without the Firebase env vars the site renders exactly as before (no open roles, no extra posts) and `/admin` sign-in is disabled, so local development and builds work without any setup.

## One-time setup

1. **Firebase project** (a dedicated one is recommended). Enable **Authentication → Email/Password** and create **Firestore** and **Storage**.
2. **Service account**: Project settings → Service accounts → *Generate new private key*. Put `project_id`, `client_email`, `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (see `.env.example`). Also set `FIREBASE_WEB_API_KEY` (Project settings → General → Web API key) and optionally `FIREBASE_STORAGE_BUCKET`. Set the same variables in Vercel (Production **and** Preview if you want to test there).
3. **Rules**: `firebase deploy --only firestore:rules,storage` deploys `firestore.rules` and `storage.rules` (both deny all browser access; the server uses the Admin SDK, which bypasses them). **If the Firebase project is shared with the CRM portal, do not deploy them as they are** - that would replace the portal's rules. Merge the `siteJobs`, `sitePosts`, `siteBlogTopics`, `siteGenerationJobs`, `siteBlogPlanner`, `siteBlogMeta` and `siteLeads` rules and the Storage rule into the existing files instead. No Firestore indexes are needed (`firestore.indexes.json` is empty on purpose).
4. **Create staff accounts** (there is no public sign-up):

   ```bash
   node --env-file=.env.local scripts/set-admin-role.mjs hr@mim.archi hr
   node --env-file=.env.local scripts/set-admin-role.mjs editor@mim.archi editor
   node --env-file=.env.local scripts/set-admin-role.mjs you@mim.archi admin
   ```

   A new account gets a random temporary password, printed once. An existing Firebase user only gets the role. Remove access with `... none`.

## Roles

| Role | Jobs and applications (`/admin/jobs`, `/admin/applications`) | Blog (`/admin/blog`) | Visitors (`/admin/visitors`) | Leads (`/admin/leads`) |
|---|---|---|---|---|
| `hr` | yes | no | no | no |
| `editor` | no | yes | yes | no |
| `admin` | yes | yes | yes | yes |

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

## Leads (`/admin/leads`, admins only)

- Every contact-form submission (English and Arabic) is saved to the `siteLeads` collection **before** the studio email is sent, so a lead is never lost if the email lands in spam or the mailer is down. If the lead was saved but the email failed (or no mailer is configured) the visitor still sees success, and the lead shows an "email failed / not sent" note. If Firebase itself is down the form behaves as before: the email is the only copy.
- Pipeline: New → Contacted → Qualified → Proposal sent → Won / Lost. Drag cards on the **board** (or use the "Move to" menu on each card), or switch to the **list**. Filters: search, assignee, priority, source, service, language, overdue only. **Export CSV** downloads the current filter.
- Each lead has an owner (any staff account with a role), priority, tags, estimated value, a **next follow-up date** and an activity timeline (notes, logged calls / emails / meetings, plus automatic entries for status, owner and follow-up changes). Logging a call, email or meeting on a new lead moves it to Contacted. Leads past their follow-up date are marked overdue; the Leads link and the dashboard show how many are new or overdue.
- **Add lead** records enquiries that did not come through the form (phone, WhatsApp, referrals, or an email rescued from spam).
- Leads are personal data: admin only, never public, never logged. The studio's own copy of the enquiry email is unchanged.
- For a local end-to-end test set `SITE_LEADS_COLLECTION=siteLeadsTest` (dev only) so test leads stay out of the real list.

## Applications (`/admin/applications`, HR and admins)

- The careers page's button leads to its own form at `/careers/apply` (Arabic: `/ar/careers/apply`), separate from the client enquiry form, so job seekers never reach the sales pipeline or the project inbox. The contact page also lists `hr@mim.archi` for careers.
- Applicants pick an open role (or "General application"), give a link to their CV or portfolio (no files are uploaded) and write a short note. The page is `noindex` and not in the sitemap.
- Each application is **saved first** (`siteApplications` collection), then emailed to `hr@mim.archi` (set `CAREERS_TO_EMAIL` to send it elsewhere, e.g. staging), and the applicant gets a short confirmation. If the email fails or no mailer is configured the application is still saved and flagged "HR email not sent" in the list.
- `/admin/applications`: filter by status (New, Reviewing, Shortlisted, Not progressing, Hired) and search. Each application has a status and a private note. Anyone who can manage jobs (`hr`, `admin`) can use it; editors cannot.
- Protection is the same as the contact form: per-IP and per-email limits, a hidden honeypot, field caps, and the link must be http(s).
- A job can't use the address `/careers/apply` (it is reserved). Job pages that use "email" apply still show the careers address; roles saved with the old studio default show `hr@mim.archi` too.
- For a local end-to-end test set `SITE_APPLICATIONS_COLLECTION=siteApplicationsTest` (dev only).

## Visitor tracking (cookie-free) and where leads come from

- A small client component (`src/components/VisitTracker.tsx`, in both root layouts) sends page-view beacons to `/api/track`. It uses **no cookie, localStorage or sessionStorage**. The server recognises a visitor only by a hash of IP + browser, keyed with `VISITOR_HASH_SECRET` and **the current UTC day**, so nobody can be followed beyond one day. Set `VISITOR_HASH_SECRET` in Vercel (production tracking is off without it).
- One `siteVisitors` document per visitor-day holds the journey: landing page, referrer, UTM tags, channel, pages with seconds on each, device, language, time zone, screen width, country/region/city (from Vercel's edge headers, so no visitor IP goes to a third party). **The visitor's IP address is stored there too, for the same 30 days** (it is stripped from the snapshot copied onto a lead, which keeps its own). Do-Not-Track and Global Privacy Control visitors, bots and `/admin` pages are not recorded.
- **Visitors page (`/admin/visitors`, editors and admins)**: everyone who opened the site, newest first, like a live traffic log: IP, city and country, device, how they arrived, campaign tags, and every page opened with time on each. Stats for visitors today, page views and who is active now, plus where visitors come from and the most viewed pages. Search by IP, place, page or browser. Locally the IP shows as `::1` and the location is empty, because the location comes from Vercel's edge headers.
- **Turn on the 30-day cleanup once**: in the Google Cloud console (console.cloud.google.com, same project as Firebase) open Firestore -> *Time-to-live (TTL)* -> *Create policy*, collection group `siteVisitors`, timestamp field `expireAt`, **expiration offset 0** (the field already holds visit time + 30 days; an offset of 30 would keep records for 60). Or with the CLI: `gcloud firestore fields ttls update expireAt --collection-group=siteVisitors --enable-ttl --project=<project id>`. Expired records are deleted automatically, usually within a day of expiring. Without it, visit records are kept until deleted by hand.
- When the contact form is submitted, the same hash is recomputed from the request and the journey is **copied onto the lead**, so it survives the 30-day cleanup. The lead also keeps the request's IP address, approximate location, language and device even if nothing was tracked. Limits: only same-day visits link, and a visitor whose IP changes mid-visit (mobile network) will not link.
- Lead page: a **Visitor** card with location, IP, device, how they arrived and the pages viewed. The list shows country and channel, and has filters for channel, country and job seekers. The stats strip shows the job-seeker count and where leads come from.
- **Likely job seeker**: a lead is tagged `job-seeker` and flagged when its message mentions CV/resume/job/hiring/vacancy/internship/career (English or Arabic) or the visitor first landed on a careers page. It only labels the lead; status is never changed and nothing is deleted. The CSV export includes country, city, channel, landing page, referrer and UTM columns but **never the IP address**.
- The site still sets two small functional cookies in `src/proxy.ts` (region, language). "Cookie-free" describes the tracker, not the whole site. Cookie-free is not consent-free: IP and device data are personal data, so the privacy policy (English and Arabic) describes them. The Arabic text is machine-written and needs native review, and a legal check for EU, KSA and UAE visitors is advisable.
- For a local end-to-end test set `SITE_VISITORS_COLLECTION=siteVisitorsTest` (dev only).

## Key rotation / offboarding

- Offboard: `node --env-file=.env.local scripts/set-admin-role.mjs person@mim.archi none` (revokes their sessions too).
- Rotate the service account key: create a new key in Firebase, update the three `FIREBASE_*` variables in Vercel, redeploy, then delete the old key.

## Blog (`/admin/blog`)

- Write a post in the editor (same plain-text block format as every article: `## Heading`, `- bullet`, blank line = new paragraph; inline links as `[text](/page-on-this-site)`). Fields: SEO title and meta description with live character counters, keywords, target locations, FAQ, cover image, category, related reading, sources.
- **Publish** needs: a title, SEO title (10-70 chars), meta description (50-175), at least 150 words and one `##` section, and every internal link must point at a real page of the site. Drafts can be saved incomplete.
- Posts go live at `/blog/<slug>` immediately (no redeploy), on top of the `/blog` list and in their categories (a post can be in several), and are added to `sitemap.xml` and `llms.txt`. The URL ending is locked once a post has been published. A slug can never collide with a category, a page number or an old WordPress article.
- **All articles are listed in `/admin/blog`**, including the 45 migrated WordPress ones. First time only, press **Import existing articles**: it copies them into Firestore with their exact addresses, text, dates, Arabic text and archive/category order (`archiveRank`, `categoryRanks`), after which the public blog, category pages, `/category/*`, sitemap and `llms.txt` read from Firestore. Until then (or if Firestore is unreachable) the site serves the built-in copies in `src/content/legacy-seo*.json`, so it can never go blank. Running the import again changes nothing.
- Imported articles can be edited, unpublished or deleted like any post. Their address cannot change. **Unpublishing or deleting makes the address return 404** and removes it from the blog, sitemap and search, so the portal asks for confirmation. Length rules (title, description, words) are advice only for imported articles so an old article can always be corrected and saved. Images and videos inside an article are single lines in the editor, `[image: /path | description | 1920x1080]` and `[video: /path]`: move or delete the whole line.
- Search the list by title or address and filter by drafts, published, imported or AI.
- **Arabic:** nobody types Arabic in the portal. When an article is generated, and whenever a published article's English text changes, the AI writes the Arabic version (title, SEO title, description, keywords, text, FAQ) and it goes live at `/ar/blog/<slug>` (or `/ar` + the original path) with the right `hreflang`. If only the title/description/keywords changed, only those are translated again and the Arabic body is left as it was. An article's page shows "Arabic version: ready / out of date / not written yet" with **Write Arabic now / Rewrite Arabic**. Without the Arabic version an article has no `/ar` page, no `hreflang` pair and no Arabic sitemap entry.
- Cover images are uploaded to Firebase Storage (JPEG/PNG/WebP, compressed in the browser to stay under the 4 MB request limit).

## AI drafts (`/admin/blog/generate`)

1. Open Draft with AI. The planner selects a service, region, topic and primary keyword and automatically queues the next topic. Click Choose topic & write a draft to generate it immediately; no topic entry is needed.
2. The generator (Gemini by default when `GEMINI_API_KEY` is set, default model `gemini-3.8-flash`; or Claude, default `claude-opus-5-5`, when only `ANTHROPIC_API_KEY` is set - force one with `AI_PROVIDER=gemini|anthropic`) **researches** the topic with web search (Grounding with Google Search for Gemini), **writes** an original article with SEO fields, FAQ, links to the right Mimar pages and a source list, and runs **quality gates**: invented links are removed, length and SEO limits are checked, and the wording is compared with the real source pages (8-word phrase overlap). Over 5% overlap triggers one automatic rewrite. If the draft still copies a source (over 15%) it is discarded; any other check still failing after the rewrite is saved as a visible "Still needs attention" note on the draft, so a reviewer can fix it (publishing still enforces the hard rules). The planned keyword is carried into generation, not chosen again by the writer.
3. The English article is then translated to Arabic by the same AI (blocks, links and FAQ must survive a structural check, or it retries once). The result is saved as a **draft** marked "AI draft", with the checks' notes and the sources; a failed Arabic translation never loses the English draft. A person checks every fact against the sources, adds real project images, and publishes. **Nothing is ever published automatically.**
4. A run takes 2-5 minutes. Rough cost: about $0.10-0.20 with Gemini (covered by Google Cloud credits if the key's project has them), about $0.40-0.60 with Claude; the job's progress page shows the real searches and tokens used. Limits: 5 runs per person per hour and `BLOG_GENERATION_DAILY_LIMIT` (default 10) per day for the whole site.

**Automatic drafts (twice a week).** Vercel Cron (`vercel.json`: Mondays and Thursdays, 05:00 UTC = 10:00 in Pakistan) calls `/api/cron/generate-blog`, which writes **one draft per run** and emails the reviewers to approve it. Nobody has to supply topics:
- **Topic choice:** the next queued topic is written first. The queue is filled automatically after each completed draft (opening the page never calls the AI; **Choose the next topic now** does it on demand). If empty at the scheduled run, the planner chooses a topic directly. It rotates through every **service group x region** (Architectural Design, 3D Visualization, Interactive Services, Branding, Marketing x UAE, USA, Saudi Arabia, Pakistan = 20 combinations, so about 10 weeks per full cycle at 2 a week). It takes the combination covered longest ago, and the AI picks a specific, searchable topic inside it that is not too similar to any existing article or past topic.
- **Approval:** the draft waits under **Drafts waiting** (and is counted on the admin home page). One email goes **To** the approvers in `BLOG_NOTIFY_EMAIL` (default `muhammad.farooq@mim.archi,rabia.zaman@mim.archi`, the two editors) and **CC** `BLOG_NOTIFY_CC` (default `info@mim.archi`, the mailbox the owner reads; no account needed), with a link to the draft. Every approver needs an `admin` or `editor` account.
- **Guard:** while `BLOG_MAX_PENDING_DRAFTS` (default 6) AI drafts are unreviewed, scheduled runs skip instead of piling up more.
- **Switches:** `BLOG_AUTO_TOPICS=false` writes only queued topics. The endpoint needs `CRON_SECRET` (Vercel sends it as a bearer token) and refuses every request without it. Emails need SMTP or Resend configured; the approval link uses `ADMIN_BASE_URL` (default `https://mim.archi`). **Vercel Hobby (free) limits, checked against Vercel's docs on 22 Oct 2026:** cron may run at most once per day (our twice-weekly schedule is fine) and fires at some point within the scheduled hour (05:00-05:59 UTC) rather than the exact minute; a function may run for at most 300 seconds, which needs Fluid Compute (on by default for new projects; enable it under Settings → Functions for older ones). A draft takes about 100-115 seconds. Hobby is also restricted to non-commercial personal use by Vercel's fair-use terms.

Web pages are fetched with an SSRF-safe fetcher (https only, no private or internal addresses, size and time capped) and are treated as untrusted data: they never become instructions, and the model's output is schema-validated and link-checked.

## Mandatory AI SEO and location checks

These are editorial standards, not ranking guarantees. Topics need a 2–6 word primary keyword present naturally in a 12–120 character topic, and must differ from past topics and existing article titles. Drafts require 1,000–1,800 body words, a 50–60 character SEO title, a 140–160 character description, the primary keyword in the title/SEO title/description/opening, 5–8 distinct keyword phrases, at least three H2 sections and 4–6 distinct self-contained FAQs. Local drafts must include their planned city and country in the body and geoTerms, plus a substantive local considerations section. Require three research sources across two domains, with at least two readable source pages; 3–6 valid internal links to at least three distinct pages, including a service and the target region page; and 2–4 related links. Unsupported statistics, local claims and regulations are prohibited by the research/writing prompts but still require human verification.

The scheduler records its last request, result and failures in `siteBlogPlanner/schedule`, shown in the admin generator. A lease prevents overlapping runs, and a successful draft prevents a second scheduled draft on the same UTC day. A manual authenticated test exercises the endpoint but does not prove Vercel cron registration. Confirm the job in the Vercel project Cron Jobs dashboard and inspect its invocation logs.

Validation: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. For a manual end-to-end test without touching the live articles, set `BLOG_POSTS_COLLECTION=sitePostsTest` (dev only; never in production): posts, the import and the import marker then use that collection.

## Automatic images and source editing

AI drafts automatically select a relevant cover from the existing Mimar service image library. Alt text describes the actual image without inventing its location or claiming that it depicts the article's project. Older AI drafts without a cover receive the same fallback when opened in the editor or displayed publicly. Editors can use **Use matching library image**, replace the cover with an upload, and edit its alt text. Only exact library URLs or uploads in our Firebase bucket are accepted. Deleting/replacing a library cover never deletes the shared asset.

Published managed posts use article Open Graph metadata, large Twitter cards, image alt text and real dimensions where known. BlogPosting JSON-LD includes an absolute ImageObject URL, caption, publication/modification dates, word count and research citations. Existing canonical URLs, visible FAQ/breadcrumb structured data and legacy article metadata remain in place. These measures support accessible, descriptive pages; they do not guarantee search rankings or rich results.

Source titles may contain publisher pipes: `Article title | Publisher | https://example.com/article` is parsed at the URL separator and round-trips safely. Invalid source lines are retained for validation, never silently removed. Each source must have a title and a syntactically valid HTTPS URL.
