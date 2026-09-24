# MimAR Studios — website

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4. Interactive hero
built with GSAP ScrollTrigger, Framer Motion, and React Three Fiber. Content
is CMS-ready (Sanity) with graceful fallback to seed data. SEO and GEO
(Generative Engine Optimization) are wired in from the start.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Motion | GSAP + ScrollTrigger, Framer Motion |
| 3D | React Three Fiber / three.js (hero atmosphere layer) |
| CMS | Sanity (headless, optional — see `sanity/README.md`) |
| Hosting | Vercel |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The site runs fully with placeholder/seed
content — no environment variables are required to develop or deploy.

## Project structure

```
src/
  app/                 routes (App Router)
    api/contact/       contact form submission endpoint
    projects/[slug]/   project detail pages
    services/[slug]/   service detail pages
    sitemap.ts          /sitemap.xml
    robots.ts           /robots.txt
    llms.txt/route.ts   /llms.txt (GEO)
  components/
    hero/              interactive hero (scroll push-in, taglines, R3F atmosphere)
    layout/            Header, Footer
    sections/          homepage sections
    ui/                shared primitives (Reveal, etc.)
  data/hero-frames.ts  hero image/tagline sequence — edit here to swap imagery
  lib/
    site-config.ts     seed content, contact info, stats, FAQs
    cms.ts             Sanity client + fetchers (falls back to site-config)
    seo.ts              metadata + JSON-LD builders (SEO + GEO)
sanity/                 portable schema for the headless CMS (see sanity/README.md)
```

## Swapping in real photography

1. **Hero sequence** — replace the placeholder in `public/hero/` and edit
   `src/data/hero-frames.ts`. For the strongest "push into the building"
   effect, use 3–5 photos of the *same* building at increasing depth
   (exterior → entrance → hallway → interior room); the crossfade+zoom is
   already wired to however many frames you provide.
2. **Projects** — replace files in `public/projects/` and update
   `src/lib/site-config.ts` (or migrate to Sanity, see below).
3. **Figma** — the file this site was built from is at
   `figma.com/design/LyR1itMNc3RI3xB87nyhAf`. The home page hero section
   (node `16:3616`) was pulled 1:1; several later sections (about, services
   detail pages) were rebuilt from the same design language after hitting
   the Figma API's Starter-plan rate limit — re-run the Figma MCP pull on
   those nodes for pixel-exact parity once the limit resets or the plan is
   upgraded.

## SEO

- Per-page `generateMetadata`/`Metadata` via `buildMetadata()` in `src/lib/seo.ts`
  — canonical URLs, Open Graph, Twitter cards, robots directives.
- `Organization` + `LocalBusiness` + `WebSite` JSON-LD sitewide (`layout.tsx`).
- `CreativeWork` JSON-LD per project, `BreadcrumbList` on every inner page.
- `/sitemap.xml` and `/robots.txt` generated from live content.
- The existing WordPress site's title/meta-description conventions were
  preserved in `site-config.ts` to protect current rankings — carry over
  each page's real copy verbatim when migrating (see `sanity/README.md`).

## GEO (Generative Engine Optimization)

- `FAQPage` JSON-LD (`FaqSection` component) — the single highest-leverage
  block for AI answer engines; answers are written to stand alone as
  citable facts.
- `/llms.txt` — a structured, plain-text summary of the site for AI
  assistants (see llmstxt.org).
- `robots.txt` explicitly allows `GPTBot`, `PerplexityBot`, `ClaudeBot`, and
  `Google-Extended`.
- CMS `seo.keyFacts` field — short, self-contained, citable sentences per
  page/project/service, written the way you'd want an AI to quote you.

## Local SEO

- `LocalBusiness` JSON-LD with real address + `GeoCoordinates`
  (`src/lib/site-config.ts` → `contact.geo`).
- NAP (name/address/phone) consistent across footer, contact page, and
  structured data — keep it that way if you also maintain a Google
  Business Profile.

## Security

- `next.config.ts` sets CSP, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, and HSTS on every response.
- Contact form: server-side Zod validation, honeypot field, basic in-memory
  rate limiting (swap for Upstash Redis in production — see comment in
  `src/app/api/contact/route.ts`).
- `remotePatterns` restricts `next/image` to known hosts (Sanity's CDN).

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in Vercel → it auto-detects Next.js, no config needed.
3. If/when Sanity is connected, add the env vars from `.env.example` in
   Vercel's Project Settings → Environment Variables.
4. Set a custom domain (e.g. `www.mim.archi`) and add a redirect from the
   apex domain in Vercel's Domains settings.

No `vercel.json` is required — headers, redirects, and the sitemap are all
defined in Next.js itself so they work identically in `next dev`.

## Content & CMS

See `sanity/README.md` for connecting Sanity Studio. Until then, all copy
lives in `src/lib/site-config.ts`.
