// Sub-service pages under /services/3d-visualization/{slug}, matching the old
// WordPress URLs. Copy is carried over from the old pages word for word (see
// SEO_MIGRATION.md §0.2); only the layout follows the new design.

export const threeDVisualizationSlug = "3d-visualization";

export type ThreeDVisualizationSection = {
  heading: string;
  body: string[];
  /** Project slugs from site-config shown as a small linked gallery under this section. */
  projects: string[];
  /** Optional single illustrative image shown above this section's copy. */
  image?: string;
};

export type ThreeDVisualizationSubService = {
  slug: string;
  /** Old WordPress <title>, kept for SEO continuity. */
  seoTitle: string;
  seoDescription: string;
  title: string;
  tagline: string;
  hero: string;
  sections: ThreeDVisualizationSection[];
  /** Real showreel embeds shown once, after the sections, in place of the old page's own video wall. */
  media?: { type: "drive"; src: string; title: string }[];
  benefits: [string, string][];
  benefitsImage: string;
  ctaEyebrow?: string;
  cta: {
    heading: [string, string];
    body: string;
    primaryLabel?: string;
    primaryHref?: string;
  };
};

export const threeDVisualizationSubServices: Record<string, ThreeDVisualizationSubService> = {
  "3d-views": {
    slug: "3d-views",
    seoTitle: "Explore our Virtual Walk through Services",
    seoDescription: "Experience your property like never before with our Virtual Walkthrough Services. Engage potential buyers and clients.",
    title: "3D Views",
    tagline: "Explore our immersive Virtual Walkthrough experiences",
    hero: "/services/3d-rendering/exterior.webp",
    sections: [
      {
        heading: "Exterior 3D Views",
        body: [
          "Step into the future with our exceptional 3D exterior views and renders. We harness advanced techniques to bring your architectural visions to life, providing stunning depictions of exteriors that captivate and inspire.",
          "From intricate details to breathtaking landscapes, our renders offer a realistic portrayal of your project’s exterior, allowing you to visualize every aspect with precision and clarity.",
        ],
        projects: ["lake-city", "amer-al-ghurair", "karma-trinity"],
      },
      {
        heading: "Interior 3D Views",
        body: [
          "Utilizing state-of-the-art techniques, we create immersive representations that showcase the finest details of your architectural designs.",
          "From ambient lighting to meticulous furnishings, our renders offer a true-to-life portrayal of interior spaces, allowing you to envision the atmosphere and functionality with unparalleled clarity and realism.",
        ],
        projects: ["cafe-interior", "the-garden-residences", "abuja"],
      },
    ],
    benefits: [
      ["Realistic Material and Lighting", "Our team expertly selects material and lighting to craft realistic and immersive renders for true-to-life visualisations."],
      ["Top Quality Renders", "Our 3D artists excel in producing high quality detailed renders, using the latest softwares that bring architectural designs to life."],
      ["Attention to Detail", "We are dedicated to precision and excellence, ensuring every project, big or small is perfect to the tiniest detail."],
      ["Bring Designs to Life", "Detailed representation of spaces and concepts that allow stakeholders to visualize the final outcome before the actual construction."],
    ],
    benefitsImage: "/services/3d-rendering/process.webp",
    cta: {
      heading: ["Dream Now, Build Later:", "Why wait?"],
      body: "With our Web Tours, your clients design and explore their future home before it even gets constructed.",
    },
  },
  cinematics: {
    slug: "cinematics",
    seoTitle: "Cinematics - mimAR",
    seoDescription: "Enhance listings with cinematic interior-exterior videos. Visualize your architectural projects with realistic 3D exterior and interior cinematics, plus VFX and CGI.",
    title: "Cinematics",
    tagline: "Enhance listings with cinematic interior-exterior videos",
    hero: "/services/3d-visualization/cinematics/hero.webp",
    sections: [
      {
        heading: "Exterior Cinematics",
        body: [
          "Step into the future with cinematic 3D exterior views and renders. Visualize your architectural visions with realistic details that captivate, inspire, and bring your projects to life.",
        ],
        image: "/services/3d-visualization/cinematics/exterior.webp",
        projects: [],
      },
      {
        heading: "Interior Cinematics",
        body: [
          "Experience immersive cinematic representations of your architectural designs.",
          "Our services showcase fine details, from ambient lighting to meticulous furnishings, providing true-to-life portrayals of interior spaces with unparalleled clarity and realism.",
        ],
        image: "/services/3d-visualization/cinematics/interior.webp",
        projects: [],
      },
      {
        heading: "VFX or CGI",
        body: [
          "Elevate your architectural projects with our cinematic VFX and CGI services. From stunning visual effects to lifelike renderings, we bring your designs to life with unparalleled realism and sophistication.",
        ],
        projects: [],
      },
    ],
    // Real client showreels, carried over from the previous flat /services/cinematics page.
    media: [
      { type: "drive", src: "https://drive.google.com/file/d/1D-9jWxV8BQjlg_J0-NOIy38OFhBsnAb-/preview", title: "01 - Amer Al Ghurair" },
      { type: "drive", src: "https://drive.google.com/file/d/1wfkXqTLNs-kI-BpG4uP5GQLIbEpN7YUA/preview", title: "02 - Zvërnec" },
      { type: "drive", src: "https://drive.google.com/file/d/1wiPGLLVUSZcwSJIkU78Wr5QibLL-iYDn/preview", title: "03 - Faisal Town" },
      { type: "drive", src: "https://drive.google.com/file/d/1TeozVJJjuAibo6Yg4cKhhZ3v2jPCD44P/preview", title: "04 - Barari Hills" },
    ],
    benefits: [
      ["Realistic Material and Lighting", "Our team expertly selects material and lighting to craft realistic and immersive renders for true-to-life visualisations."],
      ["Top Quality Renders", "Our 3D artists excel in producing high quality detailed renders, using the latest softwares that bring architectural designs to life."],
      ["Attention to Detail", "We are dedicated to precision and excellence, ensuring every project, big or small is perfect to the tiniest detail."],
      ["Bring Designs to Life", "Detailed representation of spaces and concepts that allow stakeholders to visualize the final outcome before the actual construction."],
    ],
    benefitsImage: "/services/3d-visualization/cinematics/hero.webp",
    cta: {
      heading: ["Dream Now, Build Later:", "Why wait?"],
      body: "With our Web Tours, your clients design and explore their future home before it even gets constructed.",
    },
  },
};

export const threeDVisualizationSubServiceSlugs = Object.keys(threeDVisualizationSubServices);

export function threeDVisualizationSubServicePath(slug: string) {
  return `/services/${threeDVisualizationSlug}/${slug}`;
}
