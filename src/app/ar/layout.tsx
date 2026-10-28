import type { Metadata } from "next";
// Arabic root layout: <html lang="ar" dir="rtl"> must be server-rendered, so
// Arabic lives in its own root layout rather than sharing the English one.
// Fonts are self-hosted via @fontsource like the English site; Tajawal is only
// loaded here, so English pages never download it.
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitTracker from "@/components/VisitTracker";
import { buildMetadata, siteJsonLdAr, jsonLdScript } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { localizedSiteMeta } from "@/lib/localized-site";
import { getDictionary } from "@/i18n/dictionaries";

const dict = getDictionary("ar");
const meta = localizedSiteMeta("ar");

export const metadata: Metadata = {
  ...buildMetadata({
    title: meta.title,
    description: meta.description,
    path: "/",
    locale: "ar",
    hreflang: false,
    keywords: meta.keywords,
  }),
  metadataBase: new URL(siteConfig.url),
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: siteConfig.themeColor,
};

export default function ArabicRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(siteJsonLdAr)} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <VisitTracker />
        <Header lang="ar" dict={dict} />
        <main className="flex-1 isolate">{children}</main>
        <Footer lang="ar" dict={dict} />
      </body>
    </html>
  );
}
