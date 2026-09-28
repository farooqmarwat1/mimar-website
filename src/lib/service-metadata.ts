import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getServiceBySlug } from "@/lib/cms";
import { serviceDetails, servicePath } from "@/lib/service-details";

const serviceSeo: Record<string, { title: string; description: string; keywords: string[] }> = {
  "3d-visualization": {
    title: "3D Visualization Services | Architectural Rendering | Mimar",
    description: "Photorealistic 3D visualization and architectural rendering services for interiors, exteriors, real estate and design teams worldwide.",
    keywords: ["3D visualization services", "architectural visualization services", "3D rendering services", "interior rendering services", "architectural rendering"],
  },
  cinematics: {
    title: "Cinematics & Architectural Walkthroughs | Mimar",
    description: "Cinematic 3D animation, architectural walkthrough and fly-through services for property launches, design presentations and real estate marketing.",
    keywords: ["3D animation services", "architectural walkthrough", "architectural animation", "cinematics", "3D flythrough"],
  },
  // Old WordPress title and meta description, kept for SEO continuity.
  "interactive-services": {
    title: "Best Interactive Services in Pakistan | Mimar",
    description: "Explore architecture like never before with our cutting-edge interactive services.",
    keywords: ["interactive services", "VR tours", "web tours", "augmented reality real estate", "virtual reality architecture"],
  },
  "vr-360-tours": {
    title: "VR 360 Tours for Real Estate | Mimar",
    description: "Immersive VR experiences and 360 virtual tours that help buyers, developers and design teams explore property before it is built.",
    keywords: ["VR 360 tours", "VR real estate", "360 virtual tour", "virtual reality architecture", "interactive services"],
  },
  "web-tours": {
    title: "Web Tours - 360 Virtual Tours for Real Estate | Mimar Studios",
    description: "Browser-based web tours with hotspots, floor-plan navigation and device-friendly property exploration.",
    keywords: ["web tours", "Web 360", "real estate virtual tour", "360 property tour", "virtual apartment tour"],
  },
  "property-explorer": {
    title: "Interactive Property Explorer for Real Estate | Mimar",
    description: "Interactive property explorer tools for browsing units, floor plans, amenities, views and availability in real time.",
    keywords: ["property explorer", "interactive real estate", "unit selector", "real estate sales tool"],
  },
  branding: {
    title: "Real Estate Branding & Brand Identity Services | Mimar",
    description: "Brand strategy, visual identity, guidelines and property collateral for architecture and real estate projects.",
    keywords: ["real estate branding", "property branding", "brand identity services", "real estate brand strategy"],
  },
};

export async function serviceMetadata(slug: string): Promise<Metadata> {
  const service = await getServiceBySlug(slug);
  const detail = serviceDetails[slug];
  if (!service && !detail) return {};
  const seo = serviceSeo[slug];
  return buildMetadata({
    title: seo?.title ?? `${detail?.title ?? service?.title} - Mimar Studios`,
    description: seo?.description ?? detail?.intro ?? service?.description ?? "",
    path: servicePath(slug),
    keywords: seo?.keywords,
  });
}
