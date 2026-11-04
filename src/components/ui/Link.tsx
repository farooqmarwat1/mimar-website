import NextLink from "next/link";
import type { ComponentProps } from "react";
import { withTrailingSlash } from "@/lib/trailing-slash";

/**
 * next/link for the public site: internal page hrefs get the trailing slash the old site used
 * ("/about-us" -> "/about-us/"), so crawled links point at the final URL, not a redirect.
 * next.config.ts sets skipTrailingSlashRedirect, which stops Next adding it itself
 * (SEO_MIGRATION.md §0.23). Use this instead of next/link everywhere outside /admin.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  return <NextLink href={typeof href === "string" ? withTrailingSlash(href) : href} {...props} />;
}
