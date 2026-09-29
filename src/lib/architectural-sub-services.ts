// Sub-service pages under /services/architectural-design/{slug}, matching the
// old WordPress URLs. Copy is carried over from the old pages word for word
// (see SEO_MIGRATION.md §0.2); only the layout follows the new design.

export const architecturalDesignSlug = "architectural-design";

export type ArchitecturalSubService = {
  slug: string;
  /** Old WordPress <title>, kept for SEO continuity. */
  seoTitle: string;
  seoDescription: string;
  title: string;
  tagline: string;
  intro: string[];
  hero: string;
  introImage: string;
  /** Project slugs from site-config shown under "Featured projects". Omit the section when empty. */
  featuredProjects?: string[];
  /** A step's detail is either a short bullet list or one descriptive sentence. */
  process: { step: string; items: string[] | string }[];
  benefits: [string, string][];
  benefitsImage: string;
  /** Defaults to "Get a free consultation"; smart-topography-survey uses its own copy. */
  ctaEyebrow?: string;
  /** Heading is split in two: the second part renders in the accent colour. */
  cta: {
    heading: [string, string];
    body: string;
    /** Defaults to "Get a free consultation" / "/booking". */
    primaryLabel?: string;
    primaryHref?: string;
  };
};

export const architecturalSubServices: Record<string, ArchitecturalSubService> = {
  "architectural-design-services": {
    slug: "architectural-design-services",
    seoTitle: "ARCHITECTURAL DESIGN SERVICES - mimAR",
    seoDescription:
      "As leaders in architectural design, we are committed to creating inspiring, sustainable, and innovative spaces, from residential homes to commercial complexes.",
    title: "Architectural Design Services",
    tagline: "Transforming Spaces, Shaping Futures",
    intro: [
      "As leaders in architectural design, we are committed to creating inspiring, sustainable, and innovative spaces.",
      "From residential homes to commercial complexes, our expertise spans a broad spectrum of projects, each tailored to the unique needs and aspirations of our clients.",
    ],
    hero: "/services/architectural-design/architectural-design.jpg",
    introImage: "/services/architectural-design/hero.jpg",
    featuredProjects: ["amerat-park", "faisal-hills", "faisal-town-ii", "nana-222", "amer-al-ghurair", "dha-multan-highrise"],
    process: [
      { step: "Planning", items: ["Initial consultation", "Site analysis", "Feasibility studies"] },
      { step: "Conceptualization", items: ["Creating initial Design concepts", "Client feedback"] },
      { step: "Development", items: ["Detailed design", "Construction documents", "Project management"] },
    ],
    benefits: [
      ["Realistic Material and Lighting", "Our team expertly selects material and lighting to craft realistic and immersive renders for true-to-life visualisations."],
      ["Top Quality Renders", "Our 3D artists excel in producing high quality detailed renders, using the latest softwares that bring architectural designs to life."],
      ["Attention to Detail", "We are dedicated to precision and excellence, ensuring every project, big or small is perfect to the tiniest detail."],
      ["Bring Designs to Life", "Detailed representation of spaces and concepts that allow stakeholders to visualize the final outcome before the actual construction."],
    ],
    benefitsImage: "/services/architectural-design/process.png",
    cta: {
      heading: ["Dream Now, Build Later:", "Why wait?"],
      body: "With our Web Tours, your clients design and explore their future home before it even gets constructed.",
    },
  },
  "interior-design-services": {
    slug: "interior-design-services",
    seoTitle: "Interior Design Services in Pakistan - mimAR",
    seoDescription: "Transform your space with our expert interior design services in Pakistan. We create beautiful, functional spaces tailored to your style and needs.",
    title: "Interior Design Services",
    tagline: "Creativity and Innovation",
    intro: [
      "At mimAR, our interior design services are dedicated to creating spaces that are both aesthetically pleasing and functional.",
      "Our approach combines creativity with practicality to deliver interiors that reflect your personal style and meet your unique needs.",
    ],
    hero: "/services/architectural-design/interior-design-services/living-room.webp",
    introImage: "/services/architectural-design/interior-design-services/bedroom.webp",
    featuredProjects: ["cafe-interior", "the-garden-residences", "abuja"],
    process: [
      { step: "Planning", items: ["Initial consultation", "Site analysis", "Feasibility studies"] },
      { step: "Conceptualization", items: ["Creating initial Design concepts", "Client feedback"] },
      { step: "Development", items: ["Detailed design", "Construction documents", "Project management"] },
    ],
    benefits: [
      ["Realistic Material and Lighting", "Our team expertly selects material and lighting to craft realistic and immersive renders for true-to-life visualisations."],
      ["Top Quality Renders", "Our 3D artists excel in producing high quality detailed renders, using the latest softwares that bring architectural designs to life."],
      ["Attention to Detail", "We are dedicated to precision and excellence, ensuring every project, big or small is perfect to the tiniest detail."],
      ["Bring Designs to Life", "Detailed representation of spaces and concepts that allow stakeholders to visualize the final outcome before the actual construction."],
    ],
    benefitsImage: "/services/architectural-design/interior-design-services/dining.webp",
    cta: {
      heading: ["Dream Now, Build Later:", "Why wait?"],
      body: "With our Web Tours, your clients design and explore their future home before it even gets constructed.",
    },
  },
  "urban-planning": {
    slug: "urban-planning",
    seoTitle: "Urban Planning - mimAR",
    seoDescription: "At mimAR, our urban planning services are dedicated to creating well-organized, sustainable, and livable communities that balance growth with environmental responsibility.",
    title: "Urban Planning",
    tagline: "Shaping Sustainable and Livable Communities",
    intro: [
      "At mimAR, our urban planning services are dedicated to creating well-organized, sustainable, and livable communities. We focus on designing urban spaces that balance growth with environmental responsibility, enhancing the quality of life for residents and fostering economic development.",
    ],
    hero: "/services/architectural-design/urban-planning.jpg",
    introImage: "/services/architectural-design/urban-planning/street.webp",
    process: [
      { step: "Planning", items: "Developing long-term plans that outline the vision for community growth and development." },
      { step: "Land Use Planning", items: "Strategically planning land use to balance residential, commercial, industrial, and recreational needs." },
      { step: "Zoning and Regulation", items: "Crafting zoning regulations that promote orderly development and protect community interests." },
      { step: "Transportation Planning", items: "Designing efficient transportation networks that connect people and places." },
    ],
    benefits: [
      ["Realistic Material and Lighting", "Our team expertly selects material and lighting to craft realistic and immersive renders for true-to-life visualisations."],
      ["Top Quality Renders", "Our 3D artists excel in producing high quality detailed renders, using the latest softwares that bring architectural designs to life."],
      ["Attention to Detail", "We are dedicated to precision and excellence, ensuring every project, big or small is perfect to the tiniest detail."],
      ["Bring Designs to Life", "Detailed representation of spaces and concepts that allow stakeholders to visualize the final outcome before the actual construction."],
    ],
    benefitsImage: "/services/architectural-design/urban-planning/aerial.webp",
    cta: {
      heading: ["Dream Now, Build Later:", "Why wait?"],
      body: "With our Web Tours, your clients design and explore their future home before it even gets constructed.",
    },
  },
  "smart-topography-survey": {
    slug: "smart-topography-survey",
    seoTitle: "Smart Topography Survey - mimAR",
    seoDescription: "Precision from the ground up. Leveraging advanced drone technology and LiDAR systems to provide high-fidelity terrain data for informed architectural and urban planning decisions.",
    title: "Smart Topography Survey",
    tagline: "Shaping Designs with Topographic Precision",
    intro: [
      "At mimAR, our Smart Topography Survey services are the foundation of every successful project. We utilize cutting-edge LiDAR and drone technology to capture high-resolution, real-time terrain data. By bridging the gap between physical land and digital design, we provide the clarity needed to optimize site layouts, manage environmental impact, and ensure structural integrity from day one.",
    ],
    // Reuses the same old-site renders already downloaded for the Urban Planning page.
    hero: "/services/architectural-design/urban-planning/street.webp",
    // Not nested under smart-topography-survey/ - that path is shadowed by
    // next.config.ts's redirect for the not-yet-restored sample-spatial-data page.
    introImage: "/services/architectural-design/topography-survey/intro.webp",
    process: [
      { step: "Site Reconnaissance", items: "Defining project boundaries and establishing high-precision ground control points (GCPs) to ensure absolute geodetic accuracy across the entire site." },
      { step: "Aerial Data Acquisition", items: "Deploying advanced UAVs (drones) equipped with LiDAR and photogrammetric sensors to capture millions of data points and high-resolution imagery." },
      { step: "Terrain Analysis & Modeling", items: "Processing raw point clouds into detailed 3D mesh models, contour maps, and digital elevation models (DEM) for a comprehensive understanding of the site." },
      { step: "BIM & CAD Integration", items: "Delivering actionable data in industry-standard formats, allowing architects and engineers to begin design work with perfect spatial awareness." },
    ],
    benefits: [
      ["Centimeter-Level Accuracy", "Our advanced sensors eliminate the margins of error common in manual surveying, providing a “digital twin” of your land with pinpoint precision."],
      ["Rapid Data Turnaround", "What used to take weeks of ground-prowling now takes hours. We deliver comprehensive site data faster, keeping your project timeline ahead of schedule."],
      ["Vegetation Penetration", "Using LiDAR technology, we can map the true ground surface even through dense forest or heavy brush, revealing hidden terrain features."],
      ["Cost Risk Mitigation", "Identify drainage issues, soil movements, and slope challenges early. Precise data prevents expensive design changes and construction delays."],
    ],
    benefitsImage: "/services/architectural-design/urban-planning/aerial.webp",
    ctaEyebrow: "Get a detailed site analysis",
    cta: {
      heading: ["Precision Now, Excellence Later:", "Why guess?"],
      body: "With our Smart Topography Surveys, your project begins with total site clarity, ensuring a seamless transition from digital planning to physical construction.",
      // The old "Get Details" button links to /sample-spatial-data, a nested
      // page not yet restored (still redirects to the parent - see
      // SEO_MIGRATION.md §0.9). Point at /booking (distinct from the
      // "Contact us" button below) until that page exists.
      primaryLabel: "Get details",
      primaryHref: "/booking",
    },
  },
};

export const architecturalSubServiceSlugs = Object.keys(architecturalSubServices);

export function architecturalSubServicePath(slug: string) {
  return `/services/${architecturalDesignSlug}/${slug}`;
}
