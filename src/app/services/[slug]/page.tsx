import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { getServices } from "@/lib/cms";
import { interactiveServicesSlug, interactiveSubServiceSlugs, serviceDetails } from "@/lib/service-details";
import { serviceMetadata } from "@/lib/service-metadata";

// Interactive Services and its six sub-services have their own routes under
// /services/interactive-services, and Cinematics under /services/3d-visualization,
// matching the old WordPress URLs.
function isNestedService(slug: string) {
  return slug === interactiveServicesSlug || interactiveSubServiceSlugs.includes(slug) || slug === "cinematics";
}

export async function generateStaticParams() {
  const services = await getServices();
  const slugs = new Set([...services.map((service) => service.slug), ...Object.keys(serviceDetails)]);
  return Array.from(slugs, (slug) => ({ slug })).filter(({ slug }) => !isNestedService(slug));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (isNestedService(slug)) return {};
  return serviceMetadata(slug);
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const detail = serviceDetails[slug];
  if (!detail || isNestedService(slug)) notFound();
  return <ServiceDetailView detail={detail} />;
}
