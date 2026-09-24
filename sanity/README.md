# Connecting the CMS

The site runs today with zero CMS — `src/lib/site-config.ts` is the seed
content and `src/lib/cms.ts` falls back to it automatically. Connect Sanity
whenever you're ready; no frontend code changes are required.

## Option A — Embedded Studio (recommended)

1. `npm install sanity @sanity/vision`
2. Create `src/app/studio/[[...tool]]/page.tsx`:

   ```tsx
   "use client";
   import { NextStudio } from "next-sanity/studio";
   import config from "../../../../sanity/sanity.config.example"; // rename to sanity.config.ts
   export default function StudioPage() {
     return <NextStudio config={config} />;
   }
   ```

3. `npx sanity@latest init` — choose "create new project", schema path
   `sanity/schemaTypes`.
4. Copy the generated Project ID into `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
   NEXT_PUBLIC_SANITY_DATASET=production
   ```
5. Visit `/studio` on your deployed (or local) site to start editing.

## Option B — Standalone Studio

Run the Studio as its own app/deploy target:

```bash
npm create sanity@latest -- --template clean --create-project "MimAR Studios" --dataset production
```

Then copy everything in `sanity/schemaTypes` into the new project's
`schemaTypes` folder and reference it from its `sanity.config.ts`.

## Schema overview

- **project** — portfolio entries (title, category, cover, gallery, SEO/GEO).
- **service** — the 11 services (title, description, SEO/GEO).
- **siteSettings** — singleton for contact info, social links, default SEO.
- **pageSeo** — per-route SEO/GEO override for pages without their own
  document type (home, about, contact).
- **seo** (object, embedded everywhere) — meta title/description/OG image,
  plus `keyFacts` and `faqs` written specifically for AI answer engines
  (GEO). See `src/lib/seo.ts` for how these become JSON-LD.

## Migrating existing WordPress content

To preserve the current site's SEO equity, when migrating each page/post:

1. Copy the existing meta title & description verbatim into `seo.metaTitle`
   / `seo.metaDescription` — don't rewrite them, they're already ranking.
2. Set up 301 redirects from old WordPress URLs to new Next.js routes
   (`next.config.ts` → `redirects()`) for any path that changes.
3. Re-upload the same images with the same `alt` text where possible.
