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
  /** Project slugs from site-config shown under "Featured projects". */
  featuredProjects: string[];
  process: { step: string; items: string[] }[];
  benefits: [string, string][];
  benefitsImage: string;
  cta: { heading: string; body: string };
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
      heading: "Dream Now, Build Later: Why wait?",
      body: "With our Web Tours, your clients design and explore their future home before it even gets constructed.",
    },
  },
};

export const architecturalSubServiceSlugs = Object.keys(architecturalSubServices);

export function architecturalSubServicePath(slug: string) {
  return `/services/${architecturalDesignSlug}/${slug}`;
}
