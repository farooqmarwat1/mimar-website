import type { Metadata } from "next";
import AboutView from "@/components/pages/AboutView";
import { buildMetadata } from "@/lib/seo";
import { aboutContent } from "@/content/pages/about-us";

export const metadata: Metadata = buildMetadata({
  title: aboutContent.en.title,
  description: aboutContent.en.description,
  path: "/about-us",
  keywords: aboutContent.en.keywords,
});

export default function AboutPage() {
  return <AboutView />;
}
