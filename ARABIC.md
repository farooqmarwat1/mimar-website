# Arabic (RTL) version

Added 22 Oct 2026 (owner request). English stays at the root; Arabic lives under `/ar`. Read this before touching either language. It overrides the "no Arabic routing yet" rule that used to be in `AGENTS.md` and `SEO_MIGRATION.md` §0.1.

## URL structure
- English: `/services/branding` (unchanged, no `/en`). Arabic: `/ar/services/branding`. Same slugs, same nesting, English slugs only.
- Language is switched with the link next to the Menu button in the header (it also stores the choice in the `mimar_lang` cookie). There is **no** redirect on `Accept-Language` and none on deep links, so the legacy redirect map and the one-hop rule never see a locale hop.
- **One geo rule (owner request, 26 Oct 2026):** `src/proxy.ts` sends a first-time visitor on the home page `/` to `/ar` (307, `Cache-Control: private, no-store`) when Vercel's `x-vercel-ip-country` is an Arabic-speaking country **other than the UAE** (list in `src/i18n/geo.ts`). The UAE and every other country, and any request without the header, stay on English. Never redirected: bots/link previews (`BOT_PATTERN`), anyone with the `mimar_lang` cookie, anyone arriving from another page of the site, and every deep link. Test locally with `curl -H "x-vercel-ip-country: SA" -A "Mozilla/5.0" localhost:3000/`. The proxy still also gates `/admin`.
- `next.config.ts` redirects, rewrites and CSP are English-root only. Static files (`/tours/*`, PDFs, images) are language-neutral; Arabic pages link to the same files.

## Two root layouts
- `src/app/(site)/` is the English tree (a route group, so URLs are unchanged). Its `layout.tsx` is the English `<html lang="en">`.
- `src/app/ar/` is the Arabic tree. `src/app/ar/layout.tsx` is its own root layout: `<html lang="ar" dir="rtl">`, loads Tajawal, renders `Header`/`Footer` with `lang="ar"`.
- `api/`, `sitemap.ts`, `robots.ts`, `llms.txt/`, `testing/`, icons and `globals.css` stay at `src/app/`.
- Arabic pages are thin: they build metadata and render the same view components the English page uses, with `lang="ar"`.

## i18n helpers (`src/i18n/`)
- `config.ts`: `Locale`, `localeHref(lang, "/path")` (English unchanged, Arabic prefixed with `/ar`; external, `mailto:`, `tel:` and `#` links pass through), `localizeDigits` / `localizeDigitsDeep` (Western digits to Eastern Arabic-Indic, skipping digits touching Latin letters), `comma(lang)`, `pick(lang, en, ar)`, `isRtl`, `stripLocale`, `localeFromPathname`.
- `Num.tsx`: a standalone number token (`<Num value="01" locale={lang} />`), forced `dir="ltr"`.
- `dictionaries/{en,ar}.ts` + `getDictionary(lang)`: shared chrome and reusable-section copy only (nav, header, footer, contact form, section headings, blog categories). Page-specific copy does **not** go here.

## Content: overlays, not rewrites
English data files (`site-config.ts`, `service-details.ts`, `*-sub-services.ts`, `regions.ts`, `legacy-*.ts`, `legacy-seo.json`) are **not changed** and are never converted to a bilingual shape (they carry SEO-exact legacy copy). Arabic is a parallel module:
- `src/lib/ar/*.ar.ts`: same keys/ordering as the English module, Arabic strings. `src/lib/localized-site.ts` merges the site-config overlay over the English seed data (`localizeProjects`, `localizeServices`, `localizedFaqs`, `localizedStats`, `localizedOffices`, `localizedSiteMeta`, ...); anything missing falls back to English.
- `src/content/legacy-seo.ar.json`: the 45 legacy articles, same `path`, same block structure, Arabic text.
- Pages with inline copy keep their markup in a shared view (`XxxView({ lang })`) fed by a `{ en, ar }` content object, so the English page renders byte-for-byte what it did before.
- Slugs, image paths, URLs, years and brand/product names are never translated.

## Rules for any Arabic page
1. Metadata through `buildMetadata({ ..., locale: "ar" })`. `path` is always the **English** path; it produces the canonical `/ar/...` and the `en`/`ar`/`x-default` hreflang set. Pass `hreflang: false` for a page that only exists in one language.
2. Every internal `<Link href>` goes through `localeHref(lang, href)`. Build service URLs with `servicePath()` first, then wrap.
3. Digits shown to users go through `localizeDigits`/`Num`. Phone numbers, emails, URLs and Latin brand names are `dir="ltr"`.
4. Use logical CSS (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`, `text-start`) or `rtl:` variants instead of `ml-`/`pl-`/`left-`/`text-left`. These render identically in English. Mirror directional arrows (`←`/`→`, `↗`) with `isRtl(lang)`.
5. No `tracking-*` reliance in Arabic: `globals.css` resets `letter-spacing` under `[dir=rtl]`. Latin tight leading (`leading-[.8]`) clips Arabic; `.page-heading`/`.section-heading` already get more line height in RTL.
6. Structured data (`serviceJsonLd`, `articleJsonLd`, `creativeWorkJsonLd`) takes a `locale`; `inLanguage` is `ar`. Breadcrumb names are Arabic, URLs `/ar/...`.
7. Sitemap lists every `/ar` URL with `alternates.languages`.

## Regional home tab title (owner request, 26 Oct 2026)
Home page only (`/` and `/ar`), browser-tab title only: the hero and every visible element are unchanged. Titles are in `src/lib/region.ts`; edit them there.
- **Server output never depends on country.** `<title>`, meta, canonical, hreflang, Open Graph, JSON-LD and the H1 alt are identical for every visitor and bot.
- `src/proxy.ts` writes a `mimar_region` cookie (`sa`, `ae`, `gulf`, `pk`, `us`, `arab`) from Vercel's `x-vercel-ip-country`, for human requests only (never bots, so Googlebot keeps the default), and rewrites it on every request so it cannot be spoofed in production. In development, with no country header, a hand-set cookie is left alone: run `document.cookie = "mimar_region=ae; path=/"` in the browser console, then reload.
- `RegionalTitle` (client, renders nothing) sets `document.title` after hydration, in the format "Mimar: 3D Architecture & Rendering Firm in <region>". Inner pages keep their SEO-exact titles.

## Not translated (by design)
- Staff portal `/admin`, `/api/*`, AI blog generation.
- Firestore jobs and admin-written posts: `/careers/<slug>` and `/blog/<slug>` for those are English only (no hreflang). `/ar/careers` shows Arabic page copy and links open roles to the English role pages.
- The Pano2VR tour files under `/tours/*`.

## Review needed
All Arabic here was written by Claude (ported from the finalised `mimarwebsitear` build where a page existed there). A native speaker should review it, in particular the privacy policy, FAQs and the 45 translated articles.
