// Sub-service pages under /services/3d-visualization/{slug}, matching the old
// WordPress URLs. Copy is carried over from the old pages word for word (see
// SEO_MIGRATION.md §0.2); only the layout follows the new design.

import type { MediaSlide } from "@/components/ui/MediaSlider";

export const threeDVisualizationSlug = "3d-visualization";

export type ThreeDVisualizationSection = {
  heading: string;
  body: string[];
  /** Project slugs from site-config shown as a small linked gallery under this section. */
  projects: string[];
  /**
   * Optional slide gallery shown beside this section's copy, in place of a
   * linked project grid. A slide plays a real video on click only when one
   * is given - most of the old site's per-slide videos were hosted on a
   * third-party bucket that no longer exists (see SEO_MIGRATION.md).
   */
  slides?: MediaSlide[];
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
  media?: { type: "drive"; src: string; title: string; poster?: string }[];
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
  // The old site listed Aerials only as a tile on the 3D Visualization page,
  // with no page or URL of its own, so this page is new and its copy is short.
  aerials: {
    slug: "aerials",
    seoTitle: "Aerials & Context | Mimar Studios",
    seoDescription: "Aerial 3D views from Mimar Studios that show your project in its real setting, from masterplans and communities to towers in their city context.",
    title: "Aerials & Context",
    tagline: "See your project in its real setting",
    hero: "/services/3d-rendering/aerial.webp",
    sections: [
      {
        heading: "Aerial 3D Views",
        body: [
          "Aerial views show a project from above, in its real surroundings: roads, landscape, neighbouring buildings and the city around it.",
          "They suit masterplans, communities and towers, where buyers and stakeholders need to understand the scale, layout and location of a development at a glance.",
        ],
        projects: ["faisal-hills", "faisal-town-ii", "hmr"],
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
        // Only 2 of the old site's 3 exterior slide videos still exist - the
        // third was hosted on a bucket that's been deleted (S3 NoSuchBucket).
        slides: [
          { image: "/services/3d-visualization/cinematics/exterior/1.webp", video: "/services/3d-visualization/cinematics/videos/exterior-1.webm" },
          { image: "/services/3d-visualization/cinematics/exterior/2.webp", video: "/services/3d-visualization/cinematics/videos/exterior-2.webm" },
          { image: "/services/3d-visualization/cinematics/exterior/3.webp" },
        ],
        projects: [],
      },
      {
        heading: "Interior Cinematics",
        body: [
          "Experience immersive cinematic representations of your architectural designs.",
          "Our services showcase fine details, from ambient lighting to meticulous furnishings, providing true-to-life portrayals of interior spaces with unparalleled clarity and realism.",
        ],
        // Only 1 of the old site's 5 interior slide videos still exists -
        // the other 4 were on the same now-deleted bucket.
        slides: [
          { image: "/services/3d-visualization/cinematics/interior/1.webp" },
          { image: "/services/3d-visualization/cinematics/interior/2.webp" },
          { image: "/services/3d-visualization/cinematics/interior/3.webp", video: "/services/3d-visualization/cinematics/videos/interior-3.mp4" },
          { image: "/services/3d-visualization/cinematics/interior/4.webp" },
          { image: "/services/3d-visualization/cinematics/interior/5.webp" },
        ],
        projects: [],
      },
      {
        heading: "VFX or CGI",
        body: [
          "Elevate your architectural projects with our cinematic VFX and CGI services. From stunning visual effects to lifelike renderings, we bring your designs to life with unparalleled realism and sophistication.",
        ],
        // None of the old site's 5 VFX slide videos still exist (same dead
        // bucket). The owner supplied 6 real VFX compilation clips instead
        // (T:\01_Arch + 3D\0.Content\13. VFX compilation\{02..07}.mp4, ~19MB
        // each); each was compressed to a web-friendly 720p MP4 (~1MB) and
        // its poster extracted as a frame 2s in.
        slides: [
          { image: "/services/3d-visualization/cinematics/vfx/thumb-1.webp", video: "/services/3d-visualization/cinematics/videos/vfx-1.mp4" },
          { image: "/services/3d-visualization/cinematics/vfx/thumb-2.webp", video: "/services/3d-visualization/cinematics/videos/vfx-2.mp4" },
          { image: "/services/3d-visualization/cinematics/vfx/thumb-3.webp", video: "/services/3d-visualization/cinematics/videos/vfx-3.mp4" },
          { image: "/services/3d-visualization/cinematics/vfx/thumb-4.webp", video: "/services/3d-visualization/cinematics/videos/vfx-4.mp4" },
          { image: "/services/3d-visualization/cinematics/vfx/thumb-5.webp", video: "/services/3d-visualization/cinematics/videos/vfx-5.mp4" },
          { image: "/services/3d-visualization/cinematics/vfx/thumb-6.webp", video: "/services/3d-visualization/cinematics/videos/vfx-6.mp4" },
        ],
        projects: [],
      },
    ],
    // Real client showreels, carried over from the previous flat /services/cinematics page.
    // Posters: real project cover photos where the showreel matches an
    // existing project (Amer Al Ghurair, Faisal Town II); the Cinematics
    // hero otherwise, since Zvërnec and Barari Hills aren't in the project
    // catalog. Google's own Drive thumbnail is not used - see the note on
    // DriveVideo's `poster` prop.
    media: [
      { type: "drive", src: "https://drive.google.com/file/d/1D-9jWxV8BQjlg_J0-NOIy38OFhBsnAb-/preview", title: "01 - Amer Al Ghurair", poster: "/projects/catalog/amer-al-ghurair/image-1.jpg" },
      { type: "drive", src: "https://drive.google.com/file/d/1wfkXqTLNs-kI-BpG4uP5GQLIbEpN7YUA/preview", title: "02 - Zvërnec", poster: "/services/3d-visualization/cinematics/hero.webp" },
      { type: "drive", src: "https://drive.google.com/file/d/1wiPGLLVUSZcwSJIkU78Wr5QibLL-iYDn/preview", title: "03 - Faisal Town", poster: "/projects/catalog/faisal-town-ii/image-1.jpg" },
      { type: "drive", src: "https://drive.google.com/file/d/1TeozVJJjuAibo6Yg4cKhhZ3v2jPCD44P/preview", title: "04 - Barari Hills", poster: "/services/3d-visualization/cinematics/hero.webp" },
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
