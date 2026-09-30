import { interactiveSubServiceSlugs, servicePath } from "@/lib/service-details";

export type ServiceCard = {
  title: string;
  slug: string;
  href: string;
  description: string;
  deliverables: string[];
  media: string;
  mediaType: "image" | "video";
};

const cards: Omit<ServiceCard, "href">[] = [
  {
    title: "Architectural Design",
    slug: "architectural-design",
    description: "Full architectural design services spanning interior and exterior spaces, from concept through construction documentation.",
    deliverables: ["Architectural design", "Interior design", "Urban planning", "Smart Topography Survey"],
    media: "/services/architectural-design/hero.jpg",
    mediaType: "image",
  },
  {
    title: "3D Visualization",
    slug: "3d-visualization",
    description: "Photorealistic visualization for architecture, interiors, and real estate.",
    deliverables: ["3D Views", "Aerials", "Cinematics & Animations"],
    media: "/services/3d-rendering-2026.webp",
    mediaType: "image",
  },
  {
    title: "Interactive Services",
    slug: "interactive-services",
    description: "Experience the future of real estate and architecture with AR and VR experiences that bring your projects to life.",
    deliverables: ["VR 360 Tours", "Web Tours", "Dual Screen Navigator", "Interactive Prints", "Property Explorer", "Virtual Smart Home"],
    media: "/services/approved/vr-experiences.webp",
    mediaType: "image",
  },
  {
    title: "VR 360 Tours",
    slug: "vr-360-tours",
    description: "Immersive, interactive experiences that let you explore spaces before they’re built.",
    deliverables: ["VR walk-throughs", "360° panoramas", "Headset builds", "Sales-suite setup"],
    media: "/services/approved/vr-experiences.webp",
    mediaType: "image",
  },
  {
    title: "Web Tours",
    slug: "web-tours",
    description: "Browser-based 360° virtual tours, accessible on any device with no installation.",
    deliverables: ["Linked 360 tours", "Hotspots & info cards", "Floor-plan navigation", "Embed code"],
    media: "/services/approved/web-360-updated.webp",
    mediaType: "image",
  },
  {
    title: "Dual Screen Navigator",
    slug: "dual-screen-navigator",
    description: "Synchronized interactive displays for sales offices, showrooms, events, and on-the-go presentations.",
    deliverables: ["Agent touch console", "Client display app", "Content CMS", "On-site install"],
    media: "/services/approved/dual-screen.webp",
    mediaType: "image",
  },
  {
    title: "Interactive Prints",
    slug: "interactive-prints",
    description: "AR-powered marketing collateral that brings brochures and print campaigns to life.",
    deliverables: ["AR brochures", "Site hoardings", "Marker design", "AR content build"],
    media: "/services/approved/interactive-prints.webp",
    mediaType: "image",
  },
  {
    title: "Property Explorer",
    slug: "property-explorer",
    description: "Interactive tools for exploring units, layouts, amenities, views, and property availability.",
    deliverables: ["Unit filter engine", "Floor-plate browser", "View simulator", "CRM lead routing"],
    media: "/services/approved/property-explorer.webp",
    mediaType: "image",
  },
  {
    title: "Virtual Smart Home",
    slug: "smart-home",
    description: "Interactive experiences for showcasing smart-home and connected-living features.",
    deliverables: ["Scene simulation", "Device demos", "Touch kiosk build", "Developer showroom setup"],
    media: "/services/approved/virtual-smart-home.webp",
    mediaType: "image",
  },
  {
    title: "Branding",
    slug: "branding",
    description: "Strategic brand identities and visual systems that make projects recognizable across every touchpoint.",
    deliverables: ["Brand Identity", "Corporate stationery", "Marketing collateral"],
    media: "/services/branding/hero.png",
    mediaType: "image",
  },
  {
    title: "Marketing",
    slug: "marketing",
    description: "Integrated digital marketing and web development to amplify a project's reach.",
    deliverables: ["Digital Marketing", "Social Media Marketing", "Web Development", "SEO & Online Visibility"],
    media: "/service-media/marketing-hero.png",
    mediaType: "image",
  },
];

const serviceCards: ServiceCard[] = cards.map((card) => ({ ...card, href: servicePath(card.slug) }));

function pick(slugs: string[]) {
  return slugs
    .map((slug) => serviceCards.find((card) => card.slug === slug))
    .filter((card): card is ServiceCard => card !== undefined);
}

// The five main services, in the old WordPress /services/ order.
export const mainServiceCards = pick(["architectural-design", "3d-visualization", "interactive-services", "branding", "marketing"]);

export const interactiveServiceCards = pick(interactiveSubServiceSlugs);

export function getServiceCards(slugs: string[]) {
  return pick(slugs);
}
