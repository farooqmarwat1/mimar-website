import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { getServices } from "@/lib/cms";
import { interactiveServicesSlug, interactiveSubServiceSlugs, serviceDetails } from "@/lib/service-details";
import { serviceMetadata } from "@/lib/service-metadata";

// Mirrors src/app/(site)/services/[slug]/page.tsx. Interactive Services and its
// sub-services live under /ar/services/interactive-services, Cinematics under
// 3d-visualization. The English-only /services/cinematics redirect is not
// mirrored, so /ar/services/cinematics is a 404.
function isNestedService(slug: string) {
  return slug === interactiveServicesSlug || interactiveSubServiceSlugs.includes(slug) || slug === "cinematics";
}

export async function generateStaticParams() {
  const services = await getServices();
  const slugs = new Set([...services.map((service) => service.slug), ...Object.keys(serviceDetails)]);
  return Array.from(slugs, (slug) => ({ slug })).filter(({ slug }) => !isNestedService(slug));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (isNestedService(slug)) return {};
  return serviceMetadata(slug, "ar");
}

export default async function ArabicServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = serviceDetails[slug];
  if (!detail || isNestedService(slug)) notFound();
  return <ServiceDetailView detail={detail} lang="ar" />;
}
