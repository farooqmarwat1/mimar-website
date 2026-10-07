# SEO Migration Brief — for AI agents working on this repo

Read this before changing routes, redirects, metadata, page copy, `sitemap.ts`, `robots.ts` or `next.config.ts`.
It condenses the SEO team's migration plan and audits (sources listed at the bottom) into what matters for code.

Last updated: 28 Sep 2026.

---

## 0. Scope rules (from the project owner — do not override)

1. **Do NOT implement the `/en` prefix or any Arabic/English (i18n) routing yet.** The master plan's final structure is `https://mim.archi/en/...`, but that is a later phase. For now keep every route at the root (`/services/...`, `/blog/...`). When the plan says `/en/foo`, read it as `/foo`.
2. **Preserve old content.** The SEO QA (Sheet5) says several pages had their *whole content changed* and must go back to the **old site's content exactly**, otherwise rankings drop. Redesigning layout is fine; removing or rewriting ranking copy is not.
3. Do not mark a task done because it was coded. Verify the HTTP status, final destination and rendered HTML (title, meta, canonical, H1).
4. **Owner-approved route decision (28 Sep 2026):** `/about-us` is the About page's canonical route and `/about` permanently redirects to it. `/about-us/studio` is a separate Studio page at its original URL, with its own canonical, metadata, breadcrumb, and sitemap entry. The Studio navigation points to that page; About Us remains linked from its breadcrumb and the footer.
5. **Blog structure decision (28 Sep 2026):** Keep the old `/blog` title and description, its four category paths (including `/blog/architecture`), the old article links and nine-post pagination. The Latest Blogs list is text-only in the new design. `src/lib/blog-archive.ts` records the 34 WordPress archive links plus one newer article; `src/lib/legacy-seo.ts` records category membership. This restores navigation, not every old category page's body copy.
6. **Booking route decision (28 Sep 2026):** `/booking` is a standalone meeting scheduler using the three Koalendar embeds from the old site; it must not redirect to `/contact`. Read `BOOKING_MIGRATION.md` before changing this page or any appointment-related redirects.
7. **Metaverse category decision (28 Sep 2026):** `/category/metaverse` is a dedicated, indexable page (`src/app/category/[slug]/page.tsx`, data in `src/lib/legacy-categories.ts`). It is no longer a redirect to `/blog/vr-real-estate`. It keeps the old title "Metaverse - mimAR" and the old five article links in their old order. It adds a Metaverse H1 and a meta description, which the old page lacked. It self-canonicals to `https://mim.archi/category/metaverse` and is in the sitemap. It is deliberately **not** in `blogCategories`, so it stays out of the header, footer, blog category cards/pills and other visible navigation. Do not add it there.
8. **Services structure decision (28 Sep 2026):** `/services` lists the five old main services in the old order: Architectural Design, 3D Visualization, Interactive Services, Branding and Marketing. Cinematics is presented under 3D Visualization (the old site had "Animation" there); its page moved to `/services/3d-visualization/cinematics` on 29 Sep 2026 (point 12). `/services/interactive-services` is a real 200 hub page again. It uses the old title "Best Interactive Services in Pakistan | Mimar", the old meta description, H1 "Interactive Services", and the old process steps, project types and FAQs. It links to its six sub-services as cards. The sub-services use the old nested URL structure: `/services/interactive-services/{vr-360-tours,web-tours,dual-screen-navigator,interactive-prints,property-explorer,smart-home}`. The flat `/services/{slug}` URLs permanently redirect there, and every other legacy redirect points straight at the nested URL (one hop). Build links with `servicePath()` in `src/lib/service-details.ts`, never with a hand-written `/services/${slug}`. The old hub's "Our benefits" copy was not carried over because it duplicated the Architectural Design text.
9. **Architectural Design sub-services (28-29 Sep 2026):** `/services/architectural-design/{architectural-design-services,interior-design-services,urban-planning,smart-topography-survey}` are real 200 pages again (they used to redirect to `/services/architectural-design`). Each keeps its old title and old copy: tagline, intro, design process, benefits and consultation CTA. They use the new design and the matching output tile on the parent page links to each one. The standalone legacy `/interior-design-services` URL now redirects straight to the new page instead of the parent (one hop). The old pages had no H1 and an auto-generated meta description, so each page adds an H1 and a clean description taken from its old intro. The copy lives in `src/lib/architectural-sub-services.ts` and the shared route is `src/app/services/architectural-design/[slug]/page.tsx`. `interior-design-services`, `urban-planning` and `smart-topography-survey` reuse real Mimar renders where the old page's own images did not fit the new design (interior-design-services: old living room/bedroom/dining renders from the old site's uploads; urban-planning: the existing repo aerial masterplan render plus two more old-site renders; smart-topography-survey: the same street-level and aerial renders as urban-planning, plus one more old-site render for its intro) instead of the old page's generic project slider. `smart-topography-survey`'s old "Get Details" CTA button links to its child page `sample-spatial-data`, which is now also restored (see point 10 below) - the button uses `servicePath`-style helper `architecturalSubServicePath` composed with that page's own path.
10. **Standalone legacy service pages (29 Sep 2026):** three old URLs are real 200 pages again at the exact old slugs:
    - `/services/marketing/tv-commercials-and-advertisements`
    - `/services/architectural-design/smart-topography-survey/sample-spatial-data`
    - `/services/3d-visualization-hamza/terrain-mapping`

    Each keeps the old `<title>`, the old meta description and the old body copy, and adds a self-canonical. The old site had no meta keywords tag, so keywords come from each page's own copy. `sample-spatial-data` had no H1 on the old site, so the new page adds one. Terrain Mapping adds one short "Site Findings" caption paragraph.

    Images and the terrain hero video come from the old site's uploads, converted to WebP with descriptive filenames and alt text. They live in `public/services/{architectural-design/sample-spatial-data,terrain-mapping,tv-commercials}`. The TV images are not under `/services/marketing/` because that path's redirect would catch them, since redirects run before `public/` files. The terrain page's 45 MB `03.mp4` was not carried over.

    The copy lives in `src/lib/legacy-service-pages.ts` and the shared layout in `src/components/services/LegacyServicePage.tsx`. The wildcard redirects for `/services/marketing/*`, `/services/architectural-design/smart-topography-survey/*` and `/services/3d-visualization-hamza/*` use a negative lookahead to exempt these three pages. Their parents and every other child still redirect as before.
11. **3D Visualization output cards (29 Sep 2026, owner request):** on `/services/3d-visualization`, the old site never had separate "Interior rendering" / "Exterior rendering" cards - both lived as two sections on one page, `/services/3d-visualization/3d-views` ("3D Views"). The output cards now match: **3D Views** (restored as a real 200 page again, old title "Explore our Virtual Walk through Services", old meta description, and both old sections' copy, each with a small linked gallery of real Mimar projects standing in for the old page's own decorative renders - `src/lib/three-d-visualization-sub-services.ts`, route `src/app/services/3d-visualization/[slug]/page.tsx`), **Cinematics** (see point 12 below - the old site called this "Animation" but the new design already uses "Cinematics" everywhere; do not revert to "Animation"), and **Aerial & context** (unchanged). Removed the `3d-views` redirect from `next.config.ts` now that it's a real page.
12. **Cinematics moved under 3D Visualization (29 Sep 2026, owner correction):** the flat `/services/cinematics` page (a richer, invented page with no old equivalent - facts, a 4-step process, an "included" list and FAQs) was at the wrong URL: the old site's real Cinematics page lives at the nested `/services/3d-visualization/cinematics`, in the same "sections + generic Benefits + generic CTA" shape as 3D Views (point 11). It moved into `src/lib/three-d-visualization-sub-services.ts` alongside `3d-views`, with the old title "Cinematics - mimAR" and the old three sections' copy word for word: Exterior Cinematics, Interior Cinematics, VFX or CGI. The old meta description was auto-generated and cut off mid-sentence ("...realistic details that captivate, inspire, and bring your projects to life. Visualize your" - the actual `<meta>` content, not a display artifact), so the new page uses a clean description completing that sentence. The hero image and each section's slide gallery are old-site renders, extracted from the old page's own three Elementor carousels (one per section: Exterior 3, Interior 5, VFX 6 slides) via each slide's `data-bg` attribute, at `public/services/3d-visualization/cinematics/{hero.webp,exterior,interior,vfx}` (30 Sep 2026, in a two-column layout with the section's copy - not stacked with the image alone above the text and empty space beside it, per owner feedback). Each carousel slide's popup (post ID decoded from its `href`'s base64 `settings`, e.g. `.elementor-18080.elementor-location-popup`) holds one video, matched 1:1 to its thumbnail by walking the same slide list once. Of the old page's 13 distinct slide videos, only 3 still resolve - the rest (all `mimarbuketwebsites.s3.ap-south-1.amazonaws.com`) 404 with `NoSuchBucket`; that bucket is gone, on the live old site too, not just here. The 3 survivors (2 exterior, 1 interior; none of VFX's 5) were downloaded to `public/services/3d-visualization/cinematics/videos/` (the 2 exterior ones are large, 13.5 MB and 55 MB - kept at the owner's explicit go-ahead) and are wired up in `src/components/ui/MediaSlider.tsx` (30 Sep 2026, owner follow-up): a slide gallery with working prev/next arrows and a thumbnail strip for every slide, and a play button + fullscreen `<video>` lightbox only on the slides that have a real video. A slide with no video is still fully navigable, just not playable - do not fake a play button for one, and don't re-add the dead S3 URLs. The four real client showreel videos from the previous flat page (Amer Al Ghurair, Zvërnec, Faisal Town, Barari Hills) are kept as a separate "Showreels" gallery. Their poster thumbnail (`DriveVideo.tsx`, via `drive.google.com/thumbnail` which redirects to `lh3.googleusercontent.com`) was being silently blocked by the CSP's `img-src` (only `drive.google.com` was allowed) showing a blank black tile instead of the thumbnail - `next.config.ts` now also allows `https://lh3.googleusercontent.com`; its `<Image>` also lost `loading="lazy"` (now eager) since it sat far enough down the page that native lazy-loading sometimes never fired the request at all. That still wasn't the whole story (30 Sep 2026): Google's own Drive thumbnail for a given video file is generated per-request and inconsistent - the CDN edge that serves it can return the real frame or a solid black placeholder for the exact same file, observed both via curl and a fresh browser tab regardless of the CSP fix. `DriveVideo.tsx` now takes an optional `poster` prop that skips the Drive thumbnail fetch entirely; the four showreels use it with a fixed local image - the real project cover photo where the showreel matches an existing project (Amer Al Ghurair, Faisal Town II), the Cinematics hero for the two that don't (Zvërnec, Barari Hills, not in the project catalog). `serviceDetails.cinematics` was removed entirely (no more facts/process/included/FAQs/featuredMedia for it); `servicePath()` in `src/lib/service-details.ts` now nests `cinematics` under `3d-visualization` centrally, so every surface that calls it (breadcrumbs, JSON-LD, the "next service" footer, the sitemap, `llms.txt`) picks up the new URL automatically. `/services/cinematics` and `/services/animation` now redirect to the nested URL (previously the nested URL redirected to the flat one - exactly backwards). `sitemap.ts` now de-dupes by final URL, since `cinematics` is still in `site-config.ts`'s flat `services` list (kept there only for the Contact form's service dropdown) as well as in its own sub-service route list.
13. **HMR 360 tours (29 Sep 2026):** the six Pano2VR tours are live again at their old URLs:
    - `/tours/hmr/one-bedroom`, `/tours/hmr/two-bedroom`, `/tours/hmr/three-bedroom`
    - `/tours/hmr/four-bedroom`, `/tours/hmr/penthouse`, `/tours/hmr/townhouse`

    The old site's tour URLs no longer served tours: they fell through to the Deca Residences / CRM portal app. The files came from the owner's `mim-legacy-360-tours.zip` export (folders `1bed`, `2bed`, `3bed`, `4_bed`, `pent_house`, `town_house`), and the `.ggpkg` source packages were left out.

    Each tour is static under `public/tours/hmr/{unit}/`. A rewrite in `next.config.ts` serves `index.html` at the extensionless URL. Each `index.html` gained a `<base href>` so its relative files resolve without a trailing slash, plus a title, description, canonical and OG tags. The `/tours/*` redirect uses a negative lookahead to exempt these units and their files; `/tours`, `/tours/hmr` and every other tour still redirect to Web Tours. The tours are in the sitemap and are linked from a "Live 360 tours" section on `/services/interactive-services/vr-360-tours` (the `tours` field in `src/lib/service-details.ts`).

    The same zip has three unlabelled tours (`tourSource`, `tourSource_1`, `tourSource_2`, probably 360 Residences one-bed, two-bed and loft) that are not live until the owner confirms which URLs they belong to. They are superseded by item 15, which took the 360 Residences tours straight from the old site.
14. **Cinematics VFX videos (30 Sep 2026, owner-supplied):** the VFX or CGI section's slider (point 12) now plays 6 real clips instead of images-only, from the owner's own asset drive at `T:\01_Arch + 3D\0.Content\13. VFX compilation\{02..07}.mp4` (~19 MB each, 1920x1080, silent). No system `ffmpeg` was available on the machine that did this; `pip install imageio-ffmpeg` provides a bundled static binary that works the same way. Each clip was re-encoded to a web-friendly 720p H.264 MP4 at CRF 23 (`-vf scale=1280:-2 -c:v libx264 -preset slow -crf 23 -an`, ~1 MB each, ~6.3 MB total vs. ~117 MB raw) and its own poster frame extracted 2 seconds in (past any fade-in) as the slide thumbnail, replacing the dead-video-era static images from point 12. Files live in `public/services/3d-visualization/cinematics/videos/vfx-{1..6}.mp4` and `.../vfx/thumb-{1..6}.webp`.
15. **Remaining 360 tours (30 Sep 2026):** 11 more Pano2VR tours are live again at their old URLs, copied byte-for-byte from the old site's `wp-content/uploads` (the folder each old WordPress page loaded its `pano.xml` from):

    | Old URL | Files in `public/tours/` | Source upload folder |
    |---|---|---|
    | `/tours/aurumone/2-bed-apartment` | `aurumone/2-bed-apartment` | `2023/01/2bed_ap` |
    | `/tours/aurumone/3-bed-apartment` | `aurumone/3-bed-apartment` | `2023/01/TA_3_Bed_Type_A_360s` |
    | `/tours/the360residences/one-bed` | `the360residences/one-bed` | `2021/11/1bed_g_mmmm` |
    | `/tours/the360residences/two-bed` | `the360residences/two-bed` | `2021/11/2bed_g_mm` |
    | `/tours/the360residences/loft` | `the360residences/loft` | `2021/11/3bed_g_mm` |
    | `/ud-courtyard-type-a` … `-d` | `ud-courtyard/type-a` … `type-d` | `2021/11/KOH_TypeA` … `KOH_TypeD` |
    | `/gardenialivings-onebed`, `-twobed` | `gardenialivings/onebed`, `twobed` | `2022/01/1BED`, `2022/01/2BED` |

    They work like the HMR tours: `legacyTours` in `next.config.ts` rewrites each old URL to its `index.html`, and the `/tours/*` redirect's negative lookahead exempts every served folder. The old `/ud-courtyard-type-:unit` and `/gardenialivings-*` redirects were removed. Each `index.html` got the same `<base href>`, title, description, canonical and OG tags as HMR (the originals had an empty `<title>`). The copies are the clean exports; the old site served them with Cloudflare Rocket Loader injected, and that was stripped. The URLs are in the sitemap (`legacyTourPaths` in `src/app/sitemap.ts`, keep it in sync with `legacyTours`).

    Still redirecting to Web Tours: the hubs `/tours`, `/tours/aurumone`, `/tours/the360residences`, `/tours/serenetower` and `/tours/hmr` (empty pages on the old site), and `/tours/pandamart`, `/tours/foodpanda`, `/tours/serenetower/*`, `/tours/aarkresidences/*`, `/tours/parkone/*` and `/tours/oliviaresidences/*`, which the old site already redirects away and which have no tour files left.
16. **Branding and Marketing sub-pages (30 Sep 2026, owner request):** six new sub-pages, one per sub-service the old Branding and Marketing pages listed as sections:
    - `/services/branding/branding-collateral`, `/services/branding/stationery`, `/services/branding/marketing-collateral`
    - `/services/marketing/social-media-marketing`, `/services/marketing/web-development`, `/services/marketing/seo`

    The old site had no separate URLs for these, so there is nothing to redirect. Each page carries the old section's copy word for word (one garbled old sentence on Social Media Marketing was repaired), plus the old page's benefits, "Our Process" steps (Marketing) and the FAQs relevant to that sub-service with FAQPage schema. The Branding process steps come from the old FAQ answer about the branding process. Portfolio images come from the old pages' "Project Types" gallery, filtered by that gallery's own category; they were resized to at most 1600 px WebP with descriptive filenames and alt text, under `public/service-media/{branding,marketing}/{slug}/` (not `/services/marketing/*`, which the parent redirect would catch).

    Copy and images are in `src/lib/branding-marketing-sub-services.ts`; the shared layout (same as the architectural-design sub-pages, plus a "Selected work" gallery and FAQs) is `src/components/services/BrandingMarketingSubServiceView.tsx`. The Branding and Marketing output tiles link to them via `outputLinks`, the `/services/marketing/*` redirect exempts the three marketing slugs, and all six are in the sitemap. The Marketing "Digital Marketing" tile got its own page later (item 17).

17. **Remaining missing pages (1 Oct 2026, owner request, from `MimAR_Missing_Pages_Simple.xlsx`):** seven more pages are live. Five keep their old URLs and old `<title>`/description, and their redirects were removed or exempted:
    - Row 19 `/services/3d-visualization-hamza/3d-on-plan` and row 39 `/services/3d-visualization-hamza/3d-on-construction-site`: old copy word for word, plus the old background and section videos (re-encoded to 720p H.264 MP4 without audio, with a poster frame each) under `public/services/{3d-on-plan,3d-on-construction-site}/`. Data: `legacyServicePages` in `src/lib/legacy-service-pages.ts`, where `LegacyServiceImage` now takes an optional `video`. The `/services/3d-visualization-hamza/*` redirect exempts both slugs.
    - Row 37 `/meta/app/edtech`: the old photo, LinkedIn link, the two web AR experiences and the lab logo. Images are in `public/edtech/`, not `public/meta/`, because the `/meta/*` redirect would catch them. The experience cards open the MyWebAR projects directly; `/magnetic-field-of-solenoid` and `/galvanic-cell` (rows 32 and 35, which only embedded those projects) still redirect.
    - Row 38 `/my-bookings`: the old page was an empty BookingPress shortcode. It is now a short page that points to `/booking` and `/contact`.
    - Row 55 `/visualization-proposal`: the old page only embedded a Canva deck; the new page embeds the same deck (`https://www.canva.com` added to the CSP `frame-src`).

    Two pages are new URLs, because the old site only had output tiles for them, with no page or URL. They are linked from those tiles:
    - `/services/marketing/digital-marketing`: copy, benefits, process and FAQs from the old Marketing page's "Digital Marketing Services" section (`src/lib/branding-marketing-sub-services.ts`).
    - `/services/3d-visualization/aerials` ("Aerials & Context"): there was no old copy to keep, so it has a short new intro, three masterplan projects, and the same benefits and CTA as 3D Views (`src/lib/three-d-visualization-sub-services.ts`).

    All seven are in the sitemap.
18. **Contact form rate limiting live, Cloudflare bot check disabled (7 Oct 2026, owner request):** `/api/contact` (`src/app/api/contact/route.ts`) is rate limited by `src/lib/rate-limit.ts`: 3 per minute and 10 per hour per IP, and 3 per hour per email address (hashed; this stops one inbox being flooded with our confirmation emails). Blocked requests get 429 with `Retry-After`. Counters live in Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, so the limits hold across serverless instances; otherwise they are in memory per instance, which only slows a simple flood. With the bot check off, the per-email limit counts every valid submission, so someone can use up a stranger's 3 per hour. The honeypot field is now accepted by the Zod schema and answered with a quiet 200 (it used to get a 422 that named the field). **The Cloudflare Turnstile "I'm human" checkbox is built but switched off** because the studio has no Cloudflare access yet: the code is commented out, not deleted, and every place is tagged `TURNSTILE-DISABLED` (search the repo for it): `route.ts` (import, schema field, the verification block), `src/components/ContactForm.tsx` (widget, token state, Send lock), `next.config.ts` (the CSP additions), `.env.example`, and the unused `src/lib/turnstile.ts` and `src/components/TurnstileWidget.tsx`. While it is off, the CSP does not allow `https://challenges.cloudflare.com`. To switch it back on: uncomment all of those, create a Turnstile widget (mode Managed) with every hostname the form runs on including Vercel preview domains, and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (inlined at build time) and `TURNSTILE_SECRET_KEY` in Vercel before deploying. Once on, it fails closed (no secret in production, or Cloudflare unreachable, refuses the submission) and the per-email limit should run after it so only verified humans count.

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
- **Old pages that now redirect to a page that doesn't cover their topic** (old content, word count): `/services/interactive-services/` "Best Interactive Services in Pakistan" (655), `/interior-design-services/` (357), `/services/architectural-design/interior-design-services/` "Interior Design Services in Pakistan" (202), `/services/architectural-design/urban-planning/` (226), `/services/architectural-design/smart-topography-survey/` (314) + `sample-spatial-data/` (583), `/services/3d-visualization/3d-views/` "Virtual Walk through Services" (281), `/services/interactive-services/dual-screen-navigator/` (396 → new page has ~100). `/meta/` has since been restored as a standalone XR services hub; `/meta/app/*` still requires an individual content decision. `/about-us/studio/` has since been restored as a standalone page with its CEO message and studio sections; the old employee roster was omitted at the owner's request.
- **Service pages' old titles/descriptions were replaced**, and the new body copy is much shorter (old → new words): Services 481→270, 3D Visualization 664→108, Architectural Design 690→154, Branding 578→201, Marketing 730→252, Careers 487→139, Expos 213→133. About kept its old title/description.

## 3. Page QA status (Sheet5 — the SEO team's latest review)

### Fail / content must be restored to the old site's content
| Old URL | Problem | Required action |
|---|---|---|
| `/` (Home) | Title ✔ Desc ✔, **H1 not matched**, whole content changed | Restore old homepage content exactly; fix H1 |
| `/services/` | Title ✗ Desc ✗, content changed | Restore old content, title, description |
| `/services/architectural-design/` | Title ✔ Desc ✗, content changed — **Fail** | Restore old content + description |
| `/about-us/` | Slug restored on 28 Sep; content still changed | Restore old content |
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
| `/services/interactive-services/` (26 clicks, 2.5K impr.) | Done 28 Sep: 200 hub page (see §0.8) | Keep 200 and self-canonical |
| `/meta/` | Standalone page at `/meta` | Verify 200 HTML, old title/description, self-canonical and sitemap; old hero, services and Why Us content are restored. |
| `/meta/app/*` | Redirect to `/services/vr-360-tours` | Audit exact old URLs and content before replacing this redirect. |
| `/booking/` | Standalone page at `/booking` | Verify 200 HTML, old title/description, self-canonical, three working Koalendar calendars, and sitemap. See `BOOKING_MIGRATION.md`. |
| `/about-us/studio/` (30 clicks) | Standalone page at `/about-us/studio` | Verify 200 HTML, title `Studio - mimAR`, description `award winning emerging company`, self-canonical, H1 `Studio` and sitemap. Keep the original CEO message and film, team sections (including Development and Creative), and Life at Mimar culture copy. The owner removed the old workspace photo from the hero and gallery; do not re-add it. Employee names and job titles are intentionally omitted until the owner supplies an approved roster. |
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
| `/about-us` | Life at Mimar - About Us | Experience the vibrant culture and dynamic environment at mimAR. Learn about our team of young professionals and our journey. |
| `/careers` | Careers : Mimar | Join the innovative team at mimAR and embark on an exciting career in architectural rendering. |
| `/expos` | Mimar at International Expos: Fastest Growing Startup | Discover how mimAR is revolutionizing the real estate industry with cutting-edge 3D rendering technology at International Expos. |
| `/blog` | Latest Blogs by Mimar | Stay updated with the latest trends and insights in architecture and 3D rendering technology. Explore the newest blogs by mimAR |
| `/3d-visualization-services-uae` | 3D Visualization Services UAE - mimAR | mimAR is an award-winning 3D Architectural Visualization firm offering a wide spectrum of visualization and rendering services in the UAE. Led by a group of |
| `/category/3d-visualization` | 3D Architectural Visualization - mimAR | (none) |
| `/meta` | meta - mimAR | Transforming ideas into captivating 3D visualizations for architectural brilliance. Unleash your vision with mimAR's immersive 3D visualization services. |

New-only service pages (no old equivalent): `/services/cinematics`, and under `/services/interactive-services/`: `vr-360-tours` (title: *increase length*), `web-tours`, `dual-screen-navigator`, `interactive-prints`, `property-explorer`, `smart-home` (VR, web tours and dual screen also existed at these nested URLs on the old site) — keep current titles, **add keywords** where the audit says "Missing", add image titles/alt.

⚠️ **Open question — confirm with the owner before bulk-editing titles:** the PDF master plan (§8.2) proposes *new* keyword-led titles/H1s (e.g. home H1 "3D Rendering & Architectural Visualization Studio"), while the newer audit sheets say keep the *old* titles/descriptions and old content. Default to the audit sheets (old values) unless told otherwise.

Rules either way: no `<meta name="keywords">` for ranking purposes (Google ignores it); one H1 per page; primary topic in the first ~100 visible words; crawlable `<a href>` links; descriptive alt text, `alt=""` for decorative images.

## 5. Redirect map — fixes needed vs current `next.config.ts`

Current redirects already cover most legacy paths. These are the mismatches the audits flagged (targets shown without `/en`, per §0):

| Legacy source | Current target | Should be |
|---|---|---|
| `/services/interactive-services` | Redirect removed 28 Sep; hub page restored | Keep; sub-services live under it (see §0.8) |
| `/meta` | Standalone XR hub restored | Keep 200 and self-canonical |
| `/meta/:path+` | `/services/vr-360-tours` | Audit nested old URLs individually |
| `/category/3d-visualization` (39 clicks) | `/blog/3d-visualization` (fixed 28 Sep) | Keep |
| `/category/blog` | `/blog` (fixed 28 Sep) | Keep |
| `/category/vr-real-estate` | Redirect removed 29 Sep; dedicated page | Keep 200 and self-canonical, out of visible navigation. Same setup as `/category/metaverse` (see §0.7): old title "VR Real Estate - mimAR" and the old archive's five article links in their old order. This list differs from the `/blog/vr-real-estate` page's list. |
| `/category/metaverse` | Redirect removed 28 Sep; dedicated page | Keep 200 and self-canonical, out of visible navigation (see §0.7) |
| `/category/technology`, `/category/blog/real-estate-tech` | `/blog/real-estate-tech` (fixed 28 Sep) | Keep |
| `/blog/architecture` | Category page restored 28 Sep | Keep its old article links |
| `/tours/pandamart` (24 clicks) | `/services/web-tours` | Create/retain a Pandamart page; fallback web-tours |
| `/tours/aurumone/*` | `/services/web-tours` | `/projects/aurum-one` |
| `/tours/aarkresidences/*` | `/services/web-tours` | `/projects/aark-residences` |
| `/tours/the360residences/*` | `/services/web-tours` | `/projects/360-residences` |
| `/tours/hmr/*` | `/services/web-tours` | `/projects/hmr` |
| `/tours/serenetower/*`, `/tours/oliviaresidences/*`, `/tours/parkone/*`, `/tours/foodpanda` | `/services/web-tours` | Map individually to a matching project if one exists, else web-tours |
| `/events` | none (404) | `/expos` |
| `/storage/2021/11/mimAR-Studios-Company-Profile.pdf` | Done 29 Sep: 200, file in `public/storage/...` (the owner's 2026 company profile, 4.8 MB) | Keep. The old 100 MB copy was git-ignored and never deployed; it was moved out of the repo |
| `/wp-content/uploads/2021/11/mimAR-Studios-Company-Profile.pdf` | Rewrite to the `/storage/...` file (200 locally) | **Owner action:** Vercel's firewall still answers `/wp-content/*` with 403 (`X-Vercel-Mitigated: deny`) before the app runs. Allow this exact path in the Vercel project's Firewall settings |
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
