import type { Metadata } from "next";
import Link from "next/link";
import { localeHref, localizeDigits } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

// Arabic mirror of the English 404: a real 404 status, kept out of search
// results, and without the home page's title/canonical.
export const metadata: Metadata = {
  title: "الصفحة غير موجودة | ميمار ستوديوز",
  description: "الصفحة التي كنت تبحث عنها غير موجودة.",
  robots: { index: false, follow: true },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function ArabicNotFound() {
  const dict = getDictionary("ar");
  return (
    <div className="flex min-h-[70svh] items-center py-24 pt-32">
      <div className="container-page">
        <p className="eyebrow mb-6 text-muted">/ {localizeDigits(404, "ar")}</p>
        <h1 className="page-heading max-w-3xl">
          هذه الصفحة <span className="text-accent">غير موجودة.</span>
        </h1>
        <p className="section-body mt-8 max-w-xl">
          ربما يكون الرابط قديماً أو مكتوباً بشكل خاطئ. جرّب المدونة أو خدماتنا، أو تواصل معنا وسنرشدك إلى المكان الصحيح.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={localeHref("ar", "/")} className="button-pill text-ink">{dict.common.home}</Link>
          <Link href={localeHref("ar", "/blog")} className="button-pill text-ink">{dict.nav.insights}</Link>
          <Link href={localeHref("ar", "/services")} className="button-pill text-ink">{dict.nav.services}</Link>
          <Link href={localeHref("ar", "/contact")} className="button-pill text-ink">{dict.nav.contact}</Link>
        </div>
      </div>
    </div>
  );
}
