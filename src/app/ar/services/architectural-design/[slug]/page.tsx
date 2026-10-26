import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArchitecturalSubServiceView, { architecturalSubServiceMetadata } from "@/components/services/ArchitecturalSubServiceView";
import { architecturalSubServiceSlugs, architecturalSubServices } from "@/lib/architectural-sub-services";

export const dynamicParams = false;

export function generateStaticParams() {
  return architecturalSubServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return architecturalSubServiceMetadata(slug, "ar");
}

export default async function ArabicArchitecturalSubServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = architecturalSubServices[slug];
  if (!service) notFound();
  return <ArchitecturalSubServiceView service={service} lang="ar" />;
}
