# SEO Migration Brief — for AI agents working on this repo

Read this before changing routes, redirects, metadata, page copy, `sitemap.ts`, `robots.ts` or `next.config.ts`.
It condenses the SEO team's migration plan and audits (sources listed at the bottom) into what matters for code.

Last compiled: 25 Sep 2026.

---

## 0. Scope rules (from the project owner — do not override)

1. **Do NOT implement the `/en` prefix or any Arabic/English (i18n) routing yet.** The master plan's final structure is `https://mim.archi/en/...`, but that is a later phase. For now keep every route at the root (`/services/...`, `/blog/...`). When the plan says `/en/foo`, read it as `/foo`.
2. **Preserve old content.** The SEO QA (Sheet5) says several pages had their *whole content changed* and must go back to the **old site's content exactly**, otherwise rankings drop. Redesigning layout is fine; removing or rewriting ranking copy is not.
3. Do not mark a task done because it was coded. Verify the HTTP status, final destination and rendered HTML (title, meta, canonical, H1).

## 1. Context

| Item | Value |
|---|---|
| Old site (WordPress, live) | https://mim.archi/ |
| New build (this repo, Next.js 16 + Sanity) | Vercel previews: `mimar-website-rho.vercel.app` (audit), `mimarwebsitears.vercel.app` (PDF plan) |
| Production host after cutover | `https://mim.archi` (HTTPS, non-www), same domain → no GSC Change of Address |
| Preview indexing | `next.config.ts` sends `X-Robots-Tag: noindex, nofollow` on `*.vercel.app` — keep it |
| GSC baseline (16 mo) | 2.6K clicks, 589K impressions, avg pos 34.8 |
| #1 asset | Homepage `/` — 1,814 clicks / ~200K impressions (the large majority of page-level clicks) |
| Index pollution | 3.53K indexed vs **4.41M not indexed**; 4,217 5xx; huge spam `/shop/` + `parkviewcity.mim.archi` footprint |

Primary commercial keyword cluster (must stay visible in homepage + `/services/3d-visualization` copy):
`3d rendering services`, `architectural visualization services`, `3d visualization services`, `3d architectural visualization services`, `architectural 3d rendering services`, `rendering services`, `3d rendering dubai` (→ UAE page).
Cannibalization rule: homepage = studio-wide pitch; `/services/3d-visualization` = detailed service; blog articles (e.g. `/blog/3d-rendering`) stay informational and link to the service page.

## 2. Where things live in this repo

| Concern | File |
|---|---|
| Redirects, security headers, preview noindex | `next.config.ts` |
| Sitemap | `src/app/sitemap.ts` |
| Robots | `src/app/robots.ts` |
| Site URL, seed copy, services list | `src/lib/site-config.ts` (`url: "https://mim.archi"`) |
| Metadata / JSON-LD builders | `src/lib/seo.ts` |
| Migrated legacy articles/pages (content + SEO title/description) | `src/lib/legacy-seo.ts`, rendered by `src/app/[...legacy]/page.tsx` and `src/app/blog/[category]/page.tsx` |
| Legacy content importer (WordPress XML → JSON) | `scripts/import-legacy-seo.py` |
| Service detail copy | `src/lib/service-details.ts`, `src/app/services/[slug]/page.tsx` |
| `/testing` → 410 Gone | `src/app/testing/route.ts` |

`[...legacy]` uses `dynamicParams = false`, so unknown paths 404 (good — there is no catch-all redirect). Keep it that way.

## 2a. Live check — 25 Sep 2026 (old mim.archi vs preview mimar-website-rho.vercel.app)

Every URL from the old sitemap (129) plus the GSC-only URLs was fetched on both sites. GSC on the same day: 2.58K clicks, 592K impressions (16 mo); 3.32K indexed, 4.43M not indexed (Page with redirect 1.58M, alternate canonical 1.12M, 404 1.0M, crawled-not-indexed 464K, other 4xx 263K, 5xx 4,219). Top queries are brand ("mimar" 540 clicks, "mimar studios" 259) and then "3d rendering services" (5.5K impr.), "architectural visualization services", "3d rendering dubai", "3d visualization services".

Findings the other sections don't cover:
- **Homepage has no `<h1>` on the new site** (old H1 "3d Architecture Firm"); the old page had ~1,090 words and 22 H2s, the new one ~340 words and 5 H2s.
- **Broken H1 spacing:** `/contact` "Let'stalk", `/services` "What WeDo.", `/blog` "AllInsights", `/projects` "AllProjects" (split-word animations render without a space in the HTML).
- **Two migrated articles lost most of their body:** `/3d-visualization/best-3d-modelling-software` (old ~560 words → 117) and `/blog/importance-of-architectural-design-services-in-uae` (old ~960 → 47). `/metaverse-development-a-complete-guide-for-businesses` was rewritten (title and description changed).
- **The 404 page and `/thank-you` output the homepage title/description and `canonical=/`.** The 404 page should have no canonical to home; `/thank-you` should be noindex.
- **Junk query URLs on `/` return 200 with the homepage** (`/?shop/X472359913/`, `/?cate-12-1056`). Path junk (`/shop/...`, `/shopdetail/...`) already returns 404.
- **The old site already 301s** `/tours/pandamart/`, `/tours/foodpanda/`, `/tours/serenetower/studio-apartment/`, `/events/` and `/1bed/` to its homepage, and `/tours/aarkresidences|parkone|oliviaresidences/2-bed-apartment/` to `/tours/aurumone/2-bed-apartment/`. Their GSC clicks are historical.
- **Old pages that now redirect to a page that doesn't cover their topic** (old content, word count): `/services/interactive-services/` "Best Interactive Services in Pakistan" (655), `/meta/` (423), `/interior-design-services/` (357), `/services/architectural-design/interior-design-services/` "Interior Design Services in Pakistan" (202), `/services/architectural-design/urban-planning/` (226), `/services/architectural-design/smart-topography-survey/` (314) + `sample-spatial-data/` (583), `/services/3d-visualization/3d-views/` "Virtual Walk through Services" (281), `/services/interactive-services/dual-screen-navigator/` (396 → new page has ~100), `/about-us/studio/` "Studio – CEO message – our team" (164).
- **Service pages' old titles/descriptions were replaced**, and the new body copy is much shorter (old → new words): Services 481→270, 3D Visualization 664→108, Architectural Design 690→154, Branding 578→201, Marketing 730→252, Careers 487→139, Expos 213→133. About kept its old title/description.

## 3. Page QA status (Sheet5 — the SEO team's latest review)

### Fail / content must be restored to the old site's content
| Old URL | Problem | Required action |
|---|---|---|
| `/` (Home) | Title ✔ Desc ✔, **H1 not matched**, whole content changed | Restore old homepage content exactly; fix H1 |
| `/services/` | Title ✗ Desc ✗, content changed | Restore old content, title, description |
| `/services/architectural-design/` | Title ✔ Desc ✗, content changed — **Fail** | Restore old content + description |
| `/about-us/` → `/about` | 301 ok, content changed | Restore old content |
| `/3d-visualization-services-uae/` | Title ✔ Desc ✔, content changed | Restore old content |
| `/contact/` | Title ✗ Desc ✗, H1 too short / no keyword, content changed | Restore content; better H1 |
| `/services/3d-visualization/` | Title ✗ Desc ✗, content changed | Restore old content, title, description |
| `/services/branding/` | Title ✗ Desc ✗, H1 too short, content changed | Restore content; better H1 |
| `/blog/` | Title ✗ Desc ✗ H1 ✗, content changed — **Fail** | Restore |
| `/blog/vr-real-estate/` | Title ✗ Desc ✗ H1 ✗ — **Fail** | Restore |
| `/blog/3d-visualization/` | Title ✗ Desc ✗ H1 ✗, content changed | Restore |
| `/our-portfolio/` → `/projects` | Title ✗ Desc ✗ H1 ✗, content changed | Restore old content/meta on `/projects` |
| `/metaverse/` | Title ✗ Desc ✗, content same | Keep same (old) title + description |
| `/services/marketing/` | Desc ✗ | Keep old description **and add** the old "REAL ESTATE TECHNOLOGY – Proptech" section (text in Sheet5) |

### Pages that must exist, not be redirected away
| Old URL | Current behaviour in repo | Required |
|---|---|---|
| `/services/interactive-services/` (26 clicks, 2.5K impr.) | 301 → `/services/vr-360-tours` | **Keep/create the page** (interactive-services hub) |
| `/meta/` (+ `/meta/app/*`) | 301 → `/services/vr-360-tours` | **Keep the old page** (or redirect to the new interactive-services hub per PDF) |
| `/about-us/studio/` (30 clicks) | 301 → `/about` | Sheet5 saw 404 on its preview — verify; studio content must be visible on `/about` |
| `/expos/` | Page exists in repo | Sheet5 saw 404 on its preview — verify it returns 200; add to sitemap |

### Pass (same content, title, description, H1) — do not regress
All 39 migrated blog/legacy articles, e.g. `/blog/architecture/stages-of-architectural-design/`, `/blog/elements-in-interior-design/`, `/blog/rendering-techniques/`, `/3d-visualization/how-to-create-realistic-architectural-rendering/`, `/3d-architectural-walkthrough-services/`, `/metaverse/buy-virtual-real-estate-in-metaverse/`, all `/vr-real-estate/*`, `/technology/*`, `/metaverse/*` articles.

> Old page content can be pulled from the live old site (https://mim.archi/...) or the WordPress export used by `scripts/import-legacy-seo.py`.

## 4. On-page metadata (sheet "2_OnPage_Migration_Audit")

The audit's recommendation is **"Keep Same Title" / "Keep Same Description"** (i.e. the old site's), "Add exact old keywords", **canonical must be the production URL**, and **add image `title` + `alt` text** on almost every page. Old values:

| Route | Old title | Old meta description (as captured, may be truncated) |
|---|---|---|
| `/` | Mimar: 3D Architecture Firm in Pakistan | Transforming visions into breathtaking realities, Mimar is a leading 3D architecture firm dedicated to designing innovative and sustainable structures. |
| `/services` | Services - mimAR | Our expertise in crating photorealistic 3D rendering that ehance the appeal of your unbuilt real estate projects |
| `/services/architectural-design` | Architectural Design Services in Pakistan | Elevate your architectural projects with our comprehensive architectural design services. We bring your vision to life |
| `/services/3d-visualization` | 3D Visualization - mimAR | Transform your architectural designs into stunning visual masterpieces with Mimar's expert 3D visualization services. Bring your projects to life with |
| `/services/branding` | Best Branding Services Provider in Pakistan | Transform your brand identity with our comprehensive branding services. Elevate your brand with our creative solutions. |
| `/services/marketing` | Top Marketing Services in Pakistan | Elevate your business with our comprehensive marketing services. From digital strategies to offline campaigns, we help you achieve your goals. |
| `/contact` | Contact - mimAR | Let's discuss how we can help you |
| `/about` | Life at Mimar - About Us | Experience the vibrant culture and dynamic environment at mimAR. Learn about our team of young professionals and our journey. |
| `/careers` | Careers : Mimar | Join the innovative team at mimAR and embark on an exciting career in architectural rendering. |
| `/expos` | Mimar at International Expos: Fastest Growing Startup | Discover how mimAR is revolutionizing the real estate industry with cutting-edge 3D rendering technology at International Expos. |
| `/blog` | Latest Blogs by Mimar | Stay updated with the latest trends and insights in architecture and 3D rendering technology. Explore the newest blogs by mimAR |
| `/3d-visualization-services-uae` | 3D Visualization Services UAE - mimAR | mimAR is an award-winning 3D Architectural Visualization firm offering a wide spectrum of visualization and rendering services in the UAE. Led by a group of |
| `/category/3d-visualization` | 3D Architectural Visualization - mimAR | (none) |
| `/meta` | meta - mimAR | Transforming ideas into captivating 3D visualizations for architectural brilliance. Unleash your vision with mimAR's immersive 3D visualization services. |

New-only service pages (no old equivalent): `/services/cinematics`, `/vr-360-tours` (title: *increase length*), `/web-tours`, `/dual-screen-navigator`, `/interactive-prints`, `/property-explorer`, `/smart-home` — keep current titles, **add keywords** where the audit says "Missing", add image titles/alt.

⚠️ **Open question — confirm with the owner before bulk-editing titles:** the PDF master plan (§8.2) proposes *new* keyword-led titles/H1s (e.g. home H1 "3D Rendering & Architectural Visualization Studio"), while the newer audit sheets say keep the *old* titles/descriptions and old content. Default to the audit sheets (old values) unless told otherwise.

Rules either way: no `<meta name="keywords">` for ranking purposes (Google ignores it); one H1 per page; primary topic in the first ~100 visible words; crawlable `<a href>` links; descriptive alt text, `alt=""` for decorative images.

## 5. Redirect map — fixes needed vs current `next.config.ts`

Current redirects already cover most legacy paths. These are the mismatches the audits flagged (targets shown without `/en`, per §0):

| Legacy source | Current target | Should be |
|---|---|---|
| `/services/interactive-services` | `/services/vr-360-tours` | Keep/create an interactive-services page (see §3) |
| `/meta`, `/meta/:path*` | `/services/vr-360-tours` | Keep old page, or → interactive-services hub |
| `/category/3d-visualization` (39 clicks) | `/services/3d-visualization` | `/blog/3d-visualization` |
| `/category/blog` | `/services` | `/blog` |
| `/category/vr-real-estate` | `/services/vr-360-tours` | `/blog/vr-real-estate` |
| `/category/metaverse` | `/services/vr-360-tours` | `/blog/vr-real-estate` (closest) or `/metaverse` |
| `/category/technology`, `/category/blog/real-estate-tech` | `/services/property-explorer` | `/blog/real-estate-tech` |
| `/tours/pandamart` (24 clicks) | `/services/web-tours` | Create/retain a Pandamart page; fallback web-tours |
| `/tours/aurumone/*` | `/services/web-tours` | `/projects/aurum-one` |
| `/tours/aarkresidences/*` | `/services/web-tours` | `/projects/aark-residences` |
| `/tours/the360residences/*` | `/services/web-tours` | `/projects/360-residences` |
| `/tours/hmr/*` | `/services/web-tours` | `/projects/hmr` |
| `/tours/serenetower/*`, `/tours/oliviaresidences/*`, `/tours/parkone/*`, `/tours/foodpanda` | `/services/web-tours` | Map individually to a matching project if one exists, else web-tours |
| `/events` | none (404) | `/expos` |
| `/storage/2021/11/mimAR-Studios-Company-Profile.pdf` | 404 on preview | Serve the PDF at a stable URL (e.g. in `public/`) or 301 to it — backlinked asset |
| `/wp-content/uploads/2021/11/mimAR-Studios-Company-Profile.pdf` | 403 on preview | Same PDF |
| `/1bed` | 404 | Decide: map to a tour/project or leave 404 |

Redirect rules:
- Permanent only (Next `permanent: true` = 308, fine). No 302/307 on mapped URLs.
- **One hop.** Old URLs have trailing slashes (`/about-us/`); verify with curl that Next's trailing-slash normalization + the redirect don't create a 2-hop chain.
- `www` → apex is already handled; keep http/www/path normalization combined where possible.
- **Never** add a global `/:path*` → home (or `/en`) redirect. Unknown or junk URLs must return a real 404/410.
- Every destination must return 200 before the redirect ships.

## 6. Spam / index pollution (P0)

Tabs "Spam URLS 1/2/3" hold ~3,000 examples. Patterns:
- `/shop/<id>/`, `/shop/pg/<id>`, `/shopdetail/<id>/` — ~2,300 examples
- Query spam on the root: `/?shop/<id>/`, `/?cate-<n>-<n>` (on apex and `www`)
- `/pcmypage?callback=/product/...`, `/safe_search/*`, `/product/*`, `/cgi-bin/`, `/?page_id=N`, `/2022/03/`, `/3d-products/`
- `parkviewcity.mim.archi/?x=<random>` and `saiga.php` — a **subdomain / DNS / old-hosting** issue, not something this Next.js app serves; flag it to the owner, don't try to fix it in code.

Required behaviour: these return **404 or 410**, never redirect to home or a commercial page, and never render a 200. Root-with-junk-query (`/?shop/...`) currently renders the homepage with a 200 — needs a handler (check `node_modules/next/dist/docs/` for the Next 16 way to do request-time handling before writing it).

⚠️ "Spam URLS 1" also contains **legitimate** URLs (e.g. `/about-us`, `/contact`, `/blog/rendering-techniques`, `/tours/pandamart/`, `http://www.mim.archi/`). Those are in GSC's "Page with redirect" bucket for normal reasons. **Do not bulk-410 that list** — only the junk patterns above.

## 7. Technical SEO checklist (P0 unless noted)

- [ ] Canonical: every indexable page has one self-referencing canonical on `https://mim.archi/...` — never a `vercel.app` URL.
- [ ] Preview/staging stays noindex (already done via header; keep).
- [ ] `robots.txt` allows production and points to `https://mim.archi/sitemap.xml` (done in `robots.ts`); don't use robots to hide already-indexed junk.
- [ ] Sitemap contains only final 200 canonical URLs — no redirects, 404/410 or query variants. Currently **missing**: `/careers`, `/expos` (and `/privacy-policy` if it should be indexed).
- [ ] No global catch-all redirect; junk → 404/410 (see §6).
- [ ] Open Graph + Twitter: unique `og:title`, `og:description`, `og:url`, `og:image` with absolute production URLs.
- [ ] JSON-LD: Organization + WebSite site-wide, Service on services, Article/BlogPosting + BreadcrumbList on articles, FAQPage only where the Q&A is visible, JobPosting only for real open roles.
- [ ] Title, meta, canonical and H1 present in server-rendered HTML (not client-only).
- [ ] Human-friendly 404 page that returns a real 404 status.
- [ ] Core Web Vitals: LCP ≤ 2.5s, INP < 200ms, CLS < 0.1; AVIF/WebP, explicit width/height, lazy-load below the fold, descriptive filenames.
- [ ] GA4/GTM kept (same property), form success + contact clicks + quote CTA tracked (P0 before launch; not in this repo yet as far as the audit shows).
- [ ] No console errors, failed image requests or mixed content.

## 8. How to verify (run against the preview or local dev)

```bash
# legacy URL -> expect 301/308 with Location pointing straight at the final URL
curl -sI https://<host>/services/3d-visualization/ | grep -iE "^HTTP|^location"
# status + single-hop destination
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://<host>/about-us/
# junk -> must be 404/410, not 200/301 to home
curl -s -o /dev/null -w "%{http_code}\n" "https://<host>/shopdetail/123456/"
curl -s -o /dev/null -w "%{http_code}\n" "https://<host>/?shop/X472359913/"
```

Also check rendered HTML for exactly one canonical, one H1, the intended title/description, and no `vercel.app` strings.

## 9. Internal linking targets (from the plan §10)

- Home → 3D Visualization, Architectural Design, Cinematics, Projects, UAE page.
- 3D Visualization → Projects, UAE page, realistic-rendering guide, rendering-techniques guide.
- Architectural Design → Projects, stages-of-architectural-design, About, Contact.
- VR 360 / Web Tours → apartment-3d-virtual-tour, benefits-of-virtual-tours, relevant projects.
- Cinematics → 3d-architectural-walkthrough-services guide + projects.
- Branding → brand-vs-company + branded projects.
- Blog articles → one relevant service + 1–3 related articles.
- All nav/footer/CTA links point at final URLs directly (no reliance on redirects).

## 10. Out of scope for code (owner/SEO team tasks)

Old-server security audit and DNS cleanup (`parkviewcity`, `3d`, `autonav`, `stage`, `dev` subdomains), GSC sitemap submission and monitoring, backlink/profile updates (chapals.com, hajvairydevelopers.com, Behance, LinkedIn…), disavow decisions, launch-day runbook.

---

## Sources

- `MimAR_Final_SEO_Migration_Implementation_Report_2026-09-20.pdf` — master plan (24 pages): baseline, redirect map §6, junk rules §6.1, technical §7, on-page §8, content parity §9, linking §10, schema §11, CWV §12, analytics §13, off-page §14, QA/launch §15–18.
- `On Page Checklist 301 - Sheet5.pdf` = Google Sheet `1gLO1FaHTYRytrrA8si9HfAs7pZDExfPau3MMOfhqH48`, tab **Sheet5** — per-page QA pass/fail (section 3 above).
- Same sheet, tabs **2_OnPage_Migration_Audit** (old vs new title/desc/keywords), **3_Technical_PreLaunch_Checks** (all Pending), **Spam URLS 1**, **Spam URL 2**, **Spam URls 3**.
- Google Sheet `14i5RrJmq46CmBu9-mPLm0E92Uk2FrW786yEgI5GUgzg` — URL & search audit (24 Sep 2026): **Overview**, **Old Pages** (86), **Blogs** (39), **Categories** (9), **Old vs New - Missing** (140 URLs: 62 same-path, 15 slug changed, 8 consolidated, 49 no matching page despite redirect, 5 unavailable), **GSC-Only URLs** (11), **GSC Raw 1000**, **New Site** (86 sitemap URLs).
