import type { Metadata } from "next";
import ServicesView from "@/components/pages/ServicesView";
import { buildMetadata } from "@/lib/seo";
import { servicesContent } from "@/content/pages/services";

export const metadata: Metadata = buildMetadata({
  title: servicesContent.en.title,
  description: servicesContent.en.description,
  path: "/services",
  keywords: servicesContent.en.keywords,
});

export default function ServicesPage() {
  return <ServicesView />;
}
