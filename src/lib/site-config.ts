/**
 * Central source of truth for site copy, contact info, and SEO/GEO facts.
 * Mirrors what already ranks on mim.archi so we don't lose existing SEO equity,
 * while adding structured facts optimized for AI answer engines (GEO).
 *
 * In production, page-level overrides should come from the CMS (see src/lib/cms.ts)
 * - this file is the fallback / seed data.
 */

export const siteConfig = {
  name: "Mimar Studios",
  legalName: "Mimar Studios (SMC-Pvt) Ltd.",
  url: "https://mim.archi",
  title: "Mimar: 3D Architecture Firm in Pakistan",
  description:
    "Transforming visions into breathtaking realities, Mimar Studios is a leading 3D architecture firm dedicated to designing innovative and sustainable structures.",
  foundingDate: "2019",
  foundingLocation: "National Incubation Center, Islamabad, Pakistan",
  ogImage: "/og/mimar-studios-og.jpg",
  locale: "en_US",
  themeColor: "#0e0f12",
} as const;

export const taglines = [
  "Transforming visions into breathtaking realities.",
  "Redefining spaces.",
  "Experience good. Build better.",
  "Architecture, visualized.",
] as const;

export const contact = {
  email: "info@mim.archi",
  phones: {
    pakistanHQ: "+92 51 8745047",
    pakistanMobile: "+92 300 511 2990",
    saudiArabia: "+966 59 743 9044",
    uae: "+971 54 146 5887",
    usa: "+1 786 761 9866",
  },
  address: {
    line1: "3407, National Science & Technology Park (NSTP), NUST",
    line2: "H-12, Islamabad, Pakistan (44000)",
    mapsUrl: "https://maps.app.goo.gl/vHE5K3TQy6q7ufyu6",
  },
  geo: {
    // National Science & Technology Park, NUST H-12, Islamabad
    latitude: 33.6461,
    longitude: 72.9932,
  },
} as const;

// Shown on /contact, in the footer and in llms.txt. Keep in sync with the
// ContactPoint / LocalBusiness entries in siteJsonLd (src/lib/seo.ts) -
// structured data must match what the page visibly shows.
export const contactPhones = [
  { country: "Pakistan", number: contact.phones.pakistanMobile },
  { country: "Saudi Arabia", number: contact.phones.saudiArabia },
  { country: "UAE", number: contact.phones.uae },
  { country: "USA", number: contact.phones.usa },
] as const;

export const offices = [
  {
    city: "Islamabad",
    lines: [contact.address.line1, contact.address.line2],
    phone: contact.phones.pakistanMobile,
    mapsUrl: contact.address.mapsUrl,
  },
  {
    city: "Jeddah",
    lines: ["Prince Sultan Branch Rd, Al-Mohammadiyah", "Jeddah, Saudi Arabia (23625)"],
    phone: contact.phones.saudiArabia,
    mapsUrl: "https://maps.app.goo.gl/weNLH7xskTdbXjdL7",
  },
] as const;

export const telHref = (number: string) => `tel:${number.replace(/\s/g, "")}`;

export const social = {
  facebook: "https://www.facebook.com/360mimar",
  linkedin: "https://www.linkedin.com/company/360mimar",
  instagram: "https://www.instagram.com/360mimar/",
  youtube: "https://www.youtube.com/@360mimar",
  pinterest: "https://www.pinterest.com/360mimar/",
  behance: "https://www.behance.net/mimarchi",
} as const;

export const stats = [
  { value: "250+", label: "Client projects" },
  { value: "50+", label: "Project cities" },
  { value: "10+", label: "Project countries" },
  { value: "40+", label: "Staff members" },
  { value: "5+", label: "Years in practice" },
  { value: "2", label: "Global offices" },
] as const;

export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  cover: string;
  featured: boolean;
  year: number;
  gallery: string[];
  /** City, Country - shown on the projects index and used for local/GEO structured data. */
  location: string;
  /** 7 or 5 (of 12 grid columns) - mirrors the alternating Figma home-page layout. */
  span: 7 | 5;
};

export const portfolioIntro =
  "Explore residential, hospitality and corporate work with photorealistic renders, animation and interactive tours. Precision in light, material and detail - before a single wall is built.";

export const projectsIntro =
  "A selection of residential, hospitality, corporate and public work - designed and visualized in-house.";

const projectGallery = (slug: string, count: number) =>
  Array.from({ length: count }, (_, index) => `/projects/catalog/${slug}/image-${index + 1}.jpg`);

export const projects: Project[] = [
  {
    slug: "aark-residences",
    title: "Aark Residences",
    category: "3D Visualization",
    summary: "A contemporary residential development presented through exterior, terrace and amenity visualizations.",
    cover: "/projects/catalog/aark-residences/image-4.jpg",
    featured: true,
    year: 2025,
    location: "Dubai, UAE",
    span: 7,
    gallery: projectGallery("aark-residences", 4),
  },
  {
    slug: "amer-al-ghurair",
    title: "Amer Al Ghurair",
    category: "3D Visualization",
    summary: "A refined architectural visualization study focused on material, light and arrival experience.",
    cover: "/projects/catalog/amer-al-ghurair/image-1.jpg",
    featured: false,
    year: 2025,
    location: "Dubai, UAE",
    span: 5,
    gallery: projectGallery("amer-al-ghurair", 6),
  },
  {
    slug: "amerat-park",
    title: "Amerat Park",
    category: "Architectural Design",
    summary: "A public landscape and leisure destination visualized from boulevard to amphitheatre and aerial scale.",
    cover: "/projects/catalog/amerat-park/image-3.jpg",
    featured: true,
    year: 2025,
    location: "Muscat, Oman",
    span: 5,
    gallery: projectGallery("amerat-park", 4),
  },
  {
    slug: "divine-golf",
    title: "Divine Golf",
    category: "3D Visualization",
    summary: "A residential golf community communicated through a sequence of expansive architectural views.",
    cover: "/projects/catalog/divine-golf/image-1.jpg",
    featured: false,
    year: 2025,
    location: "Dubai, UAE",
    span: 7,
    gallery: projectGallery("divine-golf", 4),
  },
  {
    slug: "divine-residencia",
    title: "Divine Residencia",
    category: "3D Visualization",
    summary: "Residential architecture rendered with an emphasis on proportion, landscaping and street presence.",
    cover: "/projects/catalog/divine-residencia/image-1.jpg",
    featured: false,
    year: 2025,
    location: "Dubai, UAE",
    span: 7,
    gallery: projectGallery("divine-residencia", 4),
  },
  {
    slug: "h-and-s",
    title: "H&S",
    category: "3D Visualization",
    summary: "A compact architectural visualization set exploring the project across complementary exterior viewpoints.",
    cover: "/projects/catalog/h-and-s/image-2.jpg",
    featured: false,
    year: 2025,
    location: "Dubai, UAE",
    span: 5,
    gallery: projectGallery("h-and-s", 4),
  },
  {
    slug: "karma-trinity",
    title: "Karma Trinity",
    category: "3D Visualization",
    summary: "A complete residential marketing set spanning architecture, lobby and podium amenities.",
    cover: "/projects/catalog/karma-trinity/image-5.jpg",
    featured: false,
    year: 2025,
    location: "Dubai, UAE",
    span: 7,
    gallery: projectGallery("karma-trinity", 9),
  },
  {
    slug: "nana-222",
    title: "NANA 222",
    category: "3D Visualization",
    summary: "A bold contemporary development visualized as a concise architectural campaign.",
    cover: "/projects/catalog/nana-222/image-1.jpg",
    featured: true,
    year: 2025,
    location: "Riyadh, Saudi Arabia",
    span: 5,
    gallery: projectGallery("nana-222", 8),
  },
  {
    slug: "nomi-downtown",
    title: "Nomi Downtown",
    category: "3D Visualization",
    summary: "An urban mixed-use project shown from aerial, pool, street and commercial perspectives.",
    cover: "/projects/catalog/nomi-downtown/image-1.jpg",
    featured: true,
    year: 2025,
    location: "Miami, USA",
    span: 7,
    gallery: projectGallery("nomi-downtown", 4),
  },
  {
    slug: "the-garden-residences",
    title: "The Garden Residences",
    category: "Interior Design",
    summary: "A calm residential interior collection balancing warm materials, daylight and everyday comfort.",
    cover: "/projects/catalog/the-garden-residences/image-1.jpg",
    featured: false,
    year: 2025,
    location: "United States",
    span: 5,
    gallery: projectGallery("the-garden-residences", 4),
  },
  {
    slug: "360-residences", title: "360 Residences", category: "3D Visualization",
    summary: "A residential project visualized across a focused series of exterior views.",
    cover: "/projects/catalog/360-residences/image-1.jpg", featured: false, year: 2025,
    location: "Pakistan", span: 7, gallery: projectGallery("360-residences", 5),
  },
  {
    slug: "aurum-one", title: "Aurum One", category: "3D Visualization",
    summary: "A premium development presented through a cinematic architectural visualization set.",
    cover: "/projects/catalog/aurum-one/image-1.jpg", featured: false, year: 2025,
    location: "Pakistan", span: 5, gallery: projectGallery("aurum-one", 3),
  },
  {
    slug: "cafe-interior", title: "Café Interior", category: "Interior Design",
    summary: "A contemporary café interior developed through atmospheric visualization, planning and material studies.",
    cover: "/projects/catalog/cafe-interior/image-1.jpg", featured: false, year: 2026,
    location: "Pakistan", span: 7, gallery: projectGallery("cafe-interior", 5),
  },
  {
    slug: "dha-multan-highrise", title: "DHA Multan Highrise", category: "3D Visualization",
    summary: "A high-rise residential concept visualized for a clear and compelling market presence.",
    cover: "/projects/catalog/dha-multan-highrise/image-1.jpg", featured: false, year: 2025,
    location: "Multan, Pakistan", span: 7, gallery: projectGallery("dha-multan-highrise", 3),
  },
  {
    slug: "faisal-hills", title: "Faisal Hills", category: "Architectural Design",
    summary: "A large-scale masterplan visualized from civic centre and boulevard to park and golf course.",
    cover: "/projects/catalog/faisal-hills/image-5.jpg", featured: false, year: 2025,
    location: "Islamabad, Pakistan", span: 5, gallery: projectGallery("faisal-hills", 5),
  },
  {
    slug: "faisal-town-ii", title: "Faisal Town II", category: "Architectural Design",
    summary: "A wide-ranging urban development study covering its CBD, lake district and stadium.",
    cover: "/projects/catalog/faisal-town-ii/image-1.jpg", featured: true, year: 2025,
    location: "Islamabad, Pakistan", span: 7, gallery: projectGallery("faisal-town-ii", 6),
  },
  {
    slug: "hmr", title: "HMR", category: "3D Visualization",
    summary: "A waterfront real-estate project developed through polished architectural marketing imagery.",
    cover: "/projects/catalog/hmr/image-1.jpg", featured: false, year: 2025,
    location: "Karachi, Pakistan", span: 5, gallery: projectGallery("hmr", 4),
  },
  {
    slug: "lake-city", title: "Lake City", category: "3D Visualization",
    summary: "A contemporary residential environment communicated through crisp exterior visualization.",
    cover: "/projects/catalog/lake-city/image-1.jpg", featured: false, year: 2025,
    location: "Lahore, Pakistan", span: 7, gallery: projectGallery("lake-city", 3),
  },
  {
    slug: "abuja", title: "Abuja", category: "Interior Design",
    summary: "A sophisticated residential project spanning its arrival, atrium and private living spaces.",
    cover: "/projects/catalog/abuja/image-4.jpg", featured: true, year: 2025,
    location: "Abuja, Nigeria", span: 5, gallery: projectGallery("abuja", 7),
  },
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
};

export const services: Service[] = [
  {
    slug: "architectural-design",
    title: "Architectural Design",
    short: "Interior & exterior design",
    description:
      "Full architectural design services spanning interior and exterior spaces, from concept through construction documentation.",
  },
  {
    slug: "3d-visualization",
    title: "3D Visualization",
    short: "Photorealistic visualization",
    description:
      "Photorealistic visualization for architecture, interiors, and real estate.",
  },
  {
    slug: "cinematics",
    title: "Cinematics",
    short: "Architectural walkthroughs",
    description:
      "Cinematic walkthroughs, fly-throughs, and design animations that bring spaces to life.",
  },
  {
    slug: "vr-360-tours",
    title: "VR 360 Tours",
    short: "Immersive virtual reality",
    description:
      "Immersive, interactive experiences that let clients explore spaces before they are built.",
  },
  {
    slug: "web-tours",
    title: "Web Tours",
    short: "Browser-based virtual tours",
    description: "Browser-based 360° virtual tours, accessible on any device with no installation.",
  },
  {
    slug: "dual-screen-navigator",
    title: "Dual Screen Navigator",
    short: "Interactive showroom displays",
    description: "Synchronized interactive displays for sales offices, showrooms, events, and on-the-go presentations.",
  },
  {
    slug: "interactive-prints",
    title: "Interactive Prints",
    short: "AR-enabled print collateral",
    description: "AR-powered marketing collateral that brings brochures and print campaigns to life.",
  },
  {
    slug: "property-explorer",
    title: "Property Explorer",
    short: "Interactive unit finder",
    description: "Interactive tools for exploring units, layouts, amenities, views, and property availability.",
  },
  {
    slug: "smart-home",
    title: "Virtual Smart Home",
    short: "Connected home visualization",
    description: "Interactive experiences for showcasing smart-home and connected-living features.",
  },
  {
    slug: "branding",
    title: "Branding",
    short: "Brand identity & strategy",
    description: "Strategic brand identities, visual systems, and property collateral built to make projects recognizable and consistent.",
  },
  {
    slug: "marketing",
    title: "Marketing",
    short: "Real estate marketing",
    description: "Integrated digital marketing and web development to amplify a project's reach.",
  },
];

export const faqs = [
  {
    question: "What industries does Mimar Studios cater to with its 3D rendering services?",
    answer:
      "Mimar Studios' 3D rendering services primarily serve architecture, interior design, and real estate, along with product design and marketing use cases.",
  },
  {
    question: "What is photorealistic 3D rendering?",
    answer:
      "Photorealistic 3D rendering is the process of creating computer-generated images that closely resemble photographs of real-life scenes, using advanced techniques to simulate lighting, materials, textures, and shadows accurately.",
  },
  {
    question: "How does Mimar's architectural animation service differ from 3D rendering?",
    answer:
      "3D rendering produces static images, while architectural animation brings a design to life through movement - camera pans, fly-throughs, and object animation - so clients can experience a project as if it were already built.",
  },
  {
    question: "What real estate marketing services does Mimar Studios offer?",
    answer:
      "Mimar Studios offers real estate marketing services including digital marketing, advertising, web development, and strategic planning tailored to each client's project.",
  },
  {
    question: "Where is Mimar Studios based?",
    answer:
      "Mimar Studios is headquartered at the National Science & Technology Park (NSTP), NUST, H-12, Islamabad, Pakistan, with clients served across 14+ countries.",
  },
] as const;

export const navigation = [
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Studio", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
