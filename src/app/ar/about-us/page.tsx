import type { Metadata } from "next";
import AboutView from "@/components/pages/AboutView";
import { buildMetadata } from "@/lib/seo";
import { aboutContent } from "@/content/pages/about-us";

export const metadata: Metadata = buildMetadata({
  title: aboutContent.ar.title,
  description: aboutContent.ar.description,
  path: "/about-us",
  locale: "ar",
  keywords: aboutContent.ar.keywords,
});

export default function ArabicAboutPage() {
  return <AboutView lang="ar" />;
}
