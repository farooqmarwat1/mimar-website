import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { interactiveSubServiceSlugs, serviceDetails } from "@/lib/service-details";
import { serviceMetadata } from "@/lib/service-metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return interactiveSubServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata(slug, "ar");
}

export default async function ArabicInteractiveSubServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = serviceDetails[slug];
  if (!detail) notFound();
  return <ServiceDetailView detail={detail} lang="ar" />;
}
