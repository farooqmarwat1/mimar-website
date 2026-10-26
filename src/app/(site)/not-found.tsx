import type { Metadata } from "next";
import Link from "next/link";

// Real 404s (Next sends the 404 status). Kept out of search results and without
// the homepage's title/canonical, which the root layout would otherwise inherit
// (SEO_MIGRATION.md section 2a: "the 404 page outputs the homepage title and canonical").
export const metadata: Metadata = {
  title: "Page not found | Mimar Studios",
  description: "The page you were looking for does not exist.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70svh] items-center py-24 pt-32">
      <div className="container-page">
        <p className="eyebrow mb-6 text-muted">/ 404</p>
        <h1 className="page-heading max-w-3xl">
          This page <span className="text-accent">could not be found.</span>
        </h1>
        <p className="section-body mt-8 max-w-xl">
          The link may be old or mistyped. Try the blog, our services, or get in touch and we&apos;ll point you to the right place.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="button-pill text-ink">Home</Link>
          <Link href="/blog" className="button-pill text-ink">Blog</Link>
          <Link href="/services" className="button-pill text-ink">Services</Link>
          <Link href="/contact" className="button-pill text-ink">Contact</Link>
        </div>
      </div>
    </div>
  );
}
