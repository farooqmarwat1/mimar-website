import type { Metadata } from "next";
import ServicesView from "@/components/pages/ServicesView";
import { buildMetadata } from "@/lib/seo";
import { servicesContent } from "@/content/pages/services";

export const metadata: Metadata = buildMetadata({
  title: servicesContent.ar.title,
  description: servicesContent.ar.description,
  path: "/services",
  locale: "ar",
  keywords: servicesContent.ar.keywords,
});

export default function ArabicServicesPage() {
  return <ServicesView lang="ar" />;
}
