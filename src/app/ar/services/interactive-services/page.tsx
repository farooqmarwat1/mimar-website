import type { Metadata } from "next";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { interactiveServicesSlug, serviceDetails } from "@/lib/service-details";
import { serviceMetadata } from "@/lib/service-metadata";

export function generateMetadata(): Promise<Metadata> {
  return serviceMetadata(interactiveServicesSlug, "ar");
}

export default function ArabicInteractiveServicesPage() {
  return <ServiceDetailView detail={serviceDetails[interactiveServicesSlug]} lang="ar" />;
}
