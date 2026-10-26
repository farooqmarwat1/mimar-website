import type { Metadata } from "next";
import ServiceDetailView from "@/components/services/ServiceDetailView";
import { interactiveServicesSlug, serviceDetails } from "@/lib/service-details";
import { serviceMetadata } from "@/lib/service-metadata";

export function generateMetadata(): Promise<Metadata> {
  return serviceMetadata(interactiveServicesSlug);
}

export default function InteractiveServicesPage() {
  return <ServiceDetailView detail={serviceDetails[interactiveServicesSlug]} />;
}
