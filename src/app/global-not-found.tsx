import type { Metadata } from "next";
import Link from "next/link";
// Rendered for URLs that match no route (and for the two catch-alls' unknown paths). It bypasses both
// root layouts, so fonts, styles and the site chrome are imported here.
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getDictionary } from "@/i18n/dictionaries";

// Real 404 status, kept out of search results, no homepage title/canonical (SEO_MIGRATION.md section 2a).
export const metadata: Metadata = {
  title: "Page not found | Mimar Studios",
  description: "The page you were looking for does not exist.",
  robots: { index: false, follow: true },
};

const dict = getDictionary("en");

export default function GlobalNotFound() {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Header dict={dict} />
        <main className="flex-1 isolate">
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
              {/* The same URL space holds the Arabic site, so offer it too. */}
              <p lang="ar" dir="rtl" className="section-body mt-12 max-w-xl">
                الصفحة غير موجودة. <Link href="/ar" className="text-accent underline underline-offset-4">تصفّح الموقع بالعربية</Link>
              </p>
            </div>
          </div>
        </main>
        <Footer dict={dict} />
      </body>
    </html>
  );
}
