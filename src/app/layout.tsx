import type { Metadata } from "next";
// Self-hosted via @fontsource (not next/font/google) so the build never
// depends on reaching fonts.googleapis.com at build/runtime - faster, more
// private, and works in network-restricted environments.
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { buildMetadata, siteJsonLd, jsonLdScript } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  ...buildMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
    keywords: ["architecture firm", "3D rendering", "3D rendering services", "architectural visualization", "real estate marketing"],
  }),
  metadataBase: new URL(siteConfig.url),
  // No `icons` override here on purpose: Next derives the icon <link> tags from
  // the files in this directory (favicon.ico, icon.png, apple-icon.png), which
  // all carry the compass mark from public/logos/black.png. Setting `icons`
  // manually would replace that generated set with a single favicon.ico link.
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(siteJsonLd)} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1 isolate">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
