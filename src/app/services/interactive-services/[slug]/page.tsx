import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { interactiveSubServiceSlugs, serviceDetails } from "@/lib/service-details";
import { serviceMetadata } from "@/lib/service-metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return interactiveSubServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/interactive-services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata(slug);
}

export default async function InteractiveSubServicePage({ params }: PageProps<"/services/interactive-services/[slug]">) {
  const { slug } = await params;
  const detail = serviceDetails[slug];
  if (!detail) notFound();
  return <ServiceDetailView detail={detail} />;
}
