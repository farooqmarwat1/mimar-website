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
import { buildMetadata, organizationJsonLd, websiteJsonLd, jsonLdScript } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  ...buildMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    path: "/",
    keywords: ["architecture firm", "3D rendering", "3D rendering services", "architectural visualization", "real estate marketing"],
  }),
  metadataBase: new URL(siteConfig.url),
  icons: { icon: "/favicon.ico" },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript([organizationJsonLd(), websiteJsonLd()])}
        />
        <Header />
        <main className="flex-1 isolate">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
