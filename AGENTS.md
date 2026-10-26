<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SEO migration

This site is replacing the live WordPress site at mim.archi. Before touching routes, redirects, metadata, page copy, `sitemap.ts`, `robots.ts` or `next.config.ts`, read [SEO_MIGRATION.md](SEO_MIGRATION.md). English stays at the root with no `/en` prefix; the Arabic version lives under `/ar` and is documented in [ARABIC.md](ARABIC.md) (read it before touching any page, component or data file, since every public page now has an Arabic twin). The only locale redirect is the narrow geo rule on the home page described in ARABIC.md.
