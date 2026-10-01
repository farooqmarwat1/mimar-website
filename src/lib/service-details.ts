import { architecturalSubServicePath } from "./architectural-sub-services";
import { brandingMarketingSubServicePath } from "./branding-marketing-sub-services";
import { threeDVisualizationSubServicePath } from "./three-d-visualization-sub-services";

export type ServiceDetail = {
  slug: string;
  title: string;
  eyebrow: string;
  intro: string;
  hero: string;
  includedImage: string;
  heroType?: "image" | "video";
  outputs: string[];
  outputImages: string[];
  /** Optional link per output tile, by index, for outputs that have their own page. */
  outputLinks?: (string | undefined)[];
  processImage?: string;
  portfolio?: { title: string; category: string; url: string }[];
  featuredMedia?: Array<
    | { type: "video"; src: string; title: string; poster?: string }
    | { type: "youtube" | "drive"; src: string; title: string }
    | { type: "placeholder"; title: string; note: string }
  >;
  demoUrl?: string;
  /** Live 360 tours (static pages under public/tours) linked from the service page. */
  tours?: { project: string; title: string; href: string; image: string }[];
  showFacts?: boolean;
  showProcessImage?: boolean;
  showProjects?: boolean;
  facts?: [string, string][];
  process: [string, string][];
  included: string[];
  includedLabel?: string;
  /** Child services shown as cards in place of the outputs grid (hub pages). */
  subServices?: string[];
  projects: string[];
  faqs: [string, string][];
  next: string;
};

// Same nesting as the old WordPress site: these live under
// /services/interactive-services/{slug}, every other service at /services/{slug}.
export const interactiveServicesSlug = "interactive-services";
export const interactiveSubServiceSlugs = [
  "vr-360-tours",
  "web-tours",
  "dual-screen-navigator",
  "interactive-prints",
  "property-explorer",
  "smart-home",
];

export function servicePath(slug: string) {
  if (interactiveSubServiceSlugs.includes(slug)) return `/services/${interactiveServicesSlug}/${slug}`;
  // Cinematics moved under 3D Visualization to match the old site's nested URL.
  if (slug === "cinematics") return threeDVisualizationSubServicePath(slug);
  return `/services/${slug}`;
}

// HMR Pano2VR tours restored at their old mim.archi URLs (public/tours/hmr/{unit}).
const hmrTours = [
  ["one-bedroom", "One Bedroom Apartment"],
  ["two-bedroom", "Two Bedroom Apartment"],
  ["three-bedroom", "Three Bedroom Apartment"],
  ["four-bedroom", "Four Bedroom Apartment"],
  ["penthouse", "Penthouse"],
  ["townhouse", "Townhouse"],
].map(([unit, title]) => ({
  project: "HMR",
  title,
  href: `/tours/hmr/${unit}`,
  // The penthouse export's preview.jpg is a blank wall; its card uses a lounge view stitched from the tour tiles.
  image: unit === "penthouse" ? "/tours/hmr/penthouse/penthouse-lounge.jpg" : `/tours/hmr/${unit}/preview.jpg`,
}));

export const serviceDetails: Record<string, ServiceDetail> = {
  "architectural-design": {
    slug: "architectural-design", title: "Architectural Design", eyebrow: "Service 01 / 05",
    intro: "A building is a sequence of decisions before it is a structure. We carry each one from first sketch to a set a contractor can build from.",
    hero: "/services/architectural-design/hero.jpg",
    includedImage: "/services/architectural-design/architectural-design.jpg",
    outputs: ["Architectural design", "Interior design", "Urban planning", "Smart Topography Survey"],
    outputImages: ["/services/architectural-design/architectural-design.jpg", "/services/architectural-design/interior-design.png", "/services/architectural-design/urban-planning.jpg", "/services/architectural-design/smart-topography.png"],
    outputLinks: [
      architecturalSubServicePath("architectural-design-services"),
      architecturalSubServicePath("interior-design-services"),
      architecturalSubServicePath("urban-planning"),
      architecturalSubServicePath("smart-topography-survey"),
    ],
    processImage: "/services/architectural-design/process.png",
    showFacts: false,
    facts: [["7+ years practising", "Studio"], ["120+ B2B clients", "Track record"], ["Residential to civic scale", "Typologies"], ["Concept to CD set", "Scope"]],
    process: [["Discovery", "Site conditions, client requirements, project objectives and constraints are established."], ["Design", "Spatial concepts, planning strategies and design solutions are developed and refined."], ["Development", "Plans, models, materials, site information and technical elements are coordinated."], ["Documentation", "Detailed drawings, models and project information are prepared for implementation and approval."]],
    included: ["Interior layouts", "Facade Design", "Landscape design", "Material specification", "Coordination drawings"],
    projects: ["nana-222", "amer-al-ghurair", "dha-multan-highrise"],
    faqs: [["Do you design both interiors and exteriors?", "Yes. Full architectural design covers interior and exterior spaces as one coordinated package."], ["Can you take a project from concept through to documentation?", "Yes. We carry a design from first concept through to a construction-ready drawing set."], ["Do you work at masterplan scale?", "Yes. We have designed at everything from a single residence to civic-scale masterplans."],],
    next: "3d-visualization",
  },
  "3d-visualization": {
    slug: "3d-visualization", title: "3D Visualization", eyebrow: "Service 02 / 05",
    intro: "Correct light, honest materials, a camera that behaves like a real lens. Judged, sold and built before it exists.",
    hero: "/services/3D_rendering.webp",
    includedImage: "/services/section-media/rendering-included.webp",
    // 3D Views encompasses both interior and exterior still renders.
    outputs: ["3D Views", "Aerials & Context", "Cinematics & Animations"],
    outputImages: ["/services/3d-rendering/exterior.webp", "/services/3d-rendering/aerial.webp", "/services/3d-visualization/cinematics/hero.webp"],
    outputLinks: [threeDVisualizationSubServicePath("3d-views"), threeDVisualizationSubServicePath("aerials"), threeDVisualizationSubServicePath("cinematics")],
    processImage: "/services/3d-rendering/process.webp",
    showFacts: false,
    facts: [["3 to 7 days per view", "Turnaround"], ["Up to 6000 px, 300 dpi", "Output"], ["Unlimited within scope", "Revisions"], ["JPG / TIFF / PNG", "Formats"]],
    process: [["Inputs", "Drawings, references and a short brief."], ["Greyscale", "Composition and light are approved."], ["Draft", "Full materials and lighting for markup."], ["Final", "Production-ready high-resolution artwork."]],
    included: ["Interior stills", "Exterior stills", "Aerials", "Day / dusk sets"],
    projects: ["cafe-interior", "nana-222", "abuja"],
    faqs: [["What do you need to start?", "Plans, elevations, a material direction and any useful references."], ["How fast can a rush job be done?", "A rush still can often be delivered in two to three working days after inputs are approved."], ["Do you charge per revision?", "Revisions within the agreed visual scope are included."],],
    // Cinematics is now a real sub-page at /services/3d-visualization/cinematics
    // (src/lib/three-d-visualization-sub-services.ts), matching the old site's
    // nested URL - not a main-chain "next service" any more.
    next: "interactive-services",
  },
  "interactive-services": {
    slug: "interactive-services", title: "Interactive Services", eyebrow: "Service 03 / 05",
    intro: "Experience the future of real estate and architecture with our interactive services. Utilizing cutting-edge AR and VR technologies, we bring your projects to life and help captivate potential buyers and set you apart from the competition.",
    hero: "/services/approved/vr-experiences.webp",
    includedImage: "/services/section-media/vr-included.webp",
    outputs: ["VR 360 Tours", "Web Tours", "Dual Screen Navigator", "Interactive Prints", "Property Explorer", "Virtual Smart Home"],
    outputImages: [],
    subServices: interactiveSubServiceSlugs,
    showFacts: false,
    processImage: "/services/approved/dual-screen.webp",
    process: [
      ["Concept and Planning", "We start by understanding the interactive idea and its purpose, and then we plan the next steps. We also get to know the audience and what they need, making sure our service meets their expectations."],
      ["Design and Development", "Next, we focus on designing and building the project, making it look good and work well. This stage covers the look (UI), how it feels to use (UX), how it works, and its technical setup."],
      ["Testing and Deployment", "We test everything to make sure it's high-quality, easy to use, and enjoyable. Based on feedback from users, we make any changes needed to enhance their experience."],
      ["Maintenance and Updates", "We keep the project running smoothly, fixing any problems and adding new content or features as needed. Regular updates help keep the service engaging and working well over time."],
    ],
    included: ["Metaverse Development", "Virtual Orientation", "Dual Screen Nav", "Virtual Reality", "Augmented Reality"],
    includedLabel: "Project types",
    projects: ["hmr", "karma-trinity", "the-garden-residences"],
    faqs: [
      ["What’s the difference between AR and VR?", "The simplest difference is that AR enhances reality, while VR creates a virtual world. Augmented reality (AR) allows users to see and interact with virtual elements in their physical surroundings. Whereas, virtual reality (VR) creates a completely immersive environment."],
      ["What is a web tour?", "A web tour is a digital environment that lets the users explore and navigate through a website or web-based application and interact with the visual elements like table chairs etc. Web tours are designed to showcase key features & highlight important information about a project."],
      ["Are immersive services compatible with mobile devices?", "Yes, all of the immersive services that we offer at mimAR Studios are compatible with mobile devices. Our VR tours, web tours, augmented reality experiences and other interactive services can be accessed through VR headsets, mobile apps on smartphones and web browsers."],
    ],
    next: "branding",
  },
  "vr-360-tours": {
    slug: "vr-360-tours", title: "VR 360 Tours", eyebrow: "Interactive Services 01 / 06",
    intro: "One-to-one scale settles arguments a drawing cannot. Standing in the room is the fastest approval you will get.",
    hero: "/services/approved/vr-experiences.webp",
    includedImage: "/services/section-media/vr-included.webp",
    outputs: ["Headset builds", "360° stills", "Design review", "On-site kit"],
    outputImages: ["/projects/catalog/nomi-downtown/image-2.jpg", "/projects/catalog/the-garden-residences/image-1.jpg", "/projects/catalog/faisal-town-ii/image-1.jpg", "/projects/catalog/karma-trinity/image-9.jpg"],
    featuredMedia: [{ type: "youtube", src: "https://www.youtube.com/embed/FpS1b3TqV6k", title: "Virtual Model Apartments | VR 360° Walk-through" }],
    tours: hmrTours,
    showFacts: false,
    showProcessImage: false,
    process: [["Scope", "Rooms, routes and required interactions are agreed."], ["Build", "The real-time environment is optimized for immersive use."], ["Interactive review", "Material changes and custom interactions are configured and tested."], ["Handover", "The experience is installed and the team is trained."]],
    included: ["VR walk-throughs", "Interactive material changes", "Headset builds", "Sales-suite setup"],
    projects: ["karma-trinity", "the-garden-residences"],
    showProjects: false,
    faqs: [["Do we need to buy headsets?", "Headsets can be supplied or configured on demand, and we can also work with existing compatible hardware."], ["Is VR worth it for a small scheme?", "A focused set of key spaces can be more useful than a full building."], ["Can several people join at once?", "Multi-user review sessions are available where the brief needs them."],],
    next: "web-tours",
  },
  "web-tours": {
    slug: "web-tours", title: "Web Tours", eyebrow: "Interactive Services 02 / 06",
    intro: "A link is the lowest-friction sales tool. High-end 3D opens on a phone in three seconds and never needs installing.",
    hero: "/services/approved/web-360-updated.webp",
    includedImage: "/services/section-media/web360-included.webp",
    outputs: ["Linked panoramas", "Hotspots", "Finish switching", "Analytics"],
    outputImages: ["/projects/catalog/the-garden-residences/image-1.jpg", "/projects/catalog/karma-trinity/image-7.jpg", "/projects/catalog/abuja/image-4.jpg", "/projects/catalog/faisal-town-ii/image-1.jpg"],
    featuredMedia: [
      { type: "youtube", src: "https://www.youtube.com/embed/Q5_UBsqCKFE?start=2", title: "Web 360 experience" },
      { type: "youtube", src: "https://www.youtube.com/embed/xKdkrUyydYo", title: "Web 360 walkthrough" },
    ],
    demoUrl: "https://la-mirada.netlify.app/",
    showFacts: false,
    showProcessImage: false,
    process: [["Layout & 3D model", "The client provides the layout and references; we create the 3D model as the first step."], ["Render", "Panoramas are produced from the approved model."], ["Assemble", "Navigation, hotspots and interface styling are built into the experience."], ["Publish", "The tour is hosted and embedded with analytics."]],
    included: ["Linked 360 tours", "Hotspots & info cards", "Interactive material changes", "Sound changes"],
    projects: ["the-garden-residences", "abuja"],
    showProjects: false,
    faqs: [["Can it be embedded in our CMS?", "Yes. It embeds like a video and works with common CMS platforms."], ["Does it work on older phones?", "It progressively adapts image quality to the device and connection."], ["Can we update it later?", "Yes. The experience can be updated after launch."],],
    next: "dual-screen-navigator",
  },
  "dual-screen-navigator": {
    slug: "dual-screen-navigator", title: "Dual Screen Navigator", eyebrow: "Interactive Services 03 / 06",
    intro: "The agent drives, the buyer watches. One interface for control, one for spectacle - never the same screen.",
    hero: "/services/approved/dual-screen.webp",
    includedImage: "/services/section-media/dual-included.webp",
    outputs: ["Agent console", "Client wall", "Live inventory", "Presentation mode"],
    outputImages: ["/projects/catalog/aark-residences/image-2.jpg", "/projects/catalog/aark-residences/image-4.jpg", "/projects/catalog/nomi-downtown/image-1.jpg", "/projects/catalog/faisal-hills/image-1.jpg"],
    featuredMedia: [{ type: "youtube", src: "https://www.youtube.com/embed/ZoKw9NMGW5U", title: "Dual Screen Navigator: Revolutionizing Pre-Sales through 3D Tours" }],
    showFacts: false,
    showProcessImage: false,
    process: [["Touch-screen setup", "The experience works on any compatible touch-panel device."], ["Prototype", "A clickable prototype is prepared for testing and approval."], ["Build", "The application, CMS and inventory sync are developed."], ["Install", "Hardware is calibrated and the team is trained."]],
    included: ["Client display app", "Content CMS", "On-site install"],
    projects: ["aark-residences", "faisal-town-ii"],
    showProjects: false,
    faqs: [["Do you supply the hardware?", "Hardware can be supplied directly or specified for a local integrator."], ["Do we need two screens?", "No. The experience can also work with one touch screen."],],
    next: "interactive-prints",
  },
  "interactive-prints": {
    slug: "interactive-prints", title: "Interactive Prints", eyebrow: "Interactive Services 04 / 06",
    intro: "Paper still gets carried home. Make it open a model of the building when the buyer gets there.",
    hero: "/services/approved/interactive-prints.webp",
    includedImage: "/services/section-media/prints-included.webp",
    outputs: ["AR brochures", "Hoardings & boards", "Marker design", "WebAR delivery"],
    outputImages: ["/projects/catalog/abuja/image-4.jpg", "/projects/catalog/aurum-one/image-2.jpg", "/projects/catalog/amerat-park/image-3.jpg", "/projects/catalog/nana-222/image-1.jpg"],
    featuredMedia: [{ type: "youtube", src: "https://www.youtube.com/embed/AyBk7gLrLkQ", title: "Interactive Brochure | mimAR" }],
    showFacts: false,
    showProcessImage: false,
    process: [["Custom collateral", "We create custom marketing collateral around the campaign and user journey."], ["Experience design", "Print and interaction flows are designed to match the brand."], ["AR build", "3D content and interactions are optimized to load quickly."], ["Print & test", "The physical piece and digital experience are tested together."]],
    included: ["Brochure design", "Physical prints", "Custom app", "AR content build"],
    projects: ["aurum-one", "nana-222"],
    showProjects: false,
    faqs: [["Do you provide a custom app?", "Yes. We provide custom apps according to the project requirements."], ["Can we add other interactive AR features?", "Yes. Videos and other AR features can be added as required."], ["Can both exterior and interior spaces be included?", "Yes. Both can be included, including interiors across multiple floors."],],
    next: "property-explorer",
  },
  "property-explorer": {
    slug: "property-explorer", title: "Property Explorer", eyebrow: "Interactive Services 05 / 06",
    intro: "Buyers do not shop by unit number. They shop by floor, view and light - so the tool should let them.",
    hero: "/services/approved/property-explorer.webp",
    includedImage: "/services/section-media/property-included.webp",
    outputs: ["Filter by what matters", "View simulator", "Floor-plates", "Shortlist & lead"],
    outputImages: ["/projects/catalog/nomi-downtown/image-1.jpg", "/projects/catalog/aark-residences/image-4.jpg", "/projects/catalog/hmr/image-3.jpg", "/projects/catalog/faisal-town-ii/image-1.jpg"],
    featuredMedia: [{ type: "drive", src: "https://drive.google.com/file/d/1FzKVH3FZuCcJ8VsMYOmZlSVJStkBQRTq/preview", title: "Property Explorer | Mimar Studios" }],
    showFacts: false,
    showProcessImage: false,
    process: [["Inventory model", "Both the interior and exterior are modeled from the supplied project information."], ["Filters", "Price, availability, size, amenities, and day or night views are structured for exploration."], ["Build", "A custom executable or cloud deployment is created with CMS hookup."], ["Launch", "The experience is deployed for web and on-site use."]],
    included: ["Unit filter engine", "Floor-plate viewer", "Day & night views", "CRM linkage"],
    projects: ["nomi-downtown", "faisal-hills"],
    showProjects: false,
    faqs: [["Can it show sold units?", "Yes. Availability can sync from a sheet, CRM or API."], ["Which CRMs do you support?", "We connect to standard property CRMs and documented APIs."], ["Can agents use it in the gallery?", "Yes, when the experience is web-based. It works on compatible touchscreens and tablets."],],
    next: "smart-home",
  },
  "smart-home": {
    slug: "smart-home", title: "Virtual Smart Home", eyebrow: "Interactive Services 06 / 06",
    intro: "Automation is invisible in a brochure. Let the buyer dim the room, close the blinds and watch the house answer.",
    hero: "/services/approved/virtual-smart-home.webp",
    includedImage: "/services/section-media/smart-included.webp",
    outputs: ["Scene control", "Device demos", "Day cycle", "Showroom kiosk"],
    outputImages: ["/projects/catalog/the-garden-residences/image-1.jpg", "/projects/catalog/abuja/image-6.jpg", "/projects/catalog/faisal-town-ii/image-1.jpg", "/projects/catalog/karma-trinity/image-7.jpg"],
    featuredMedia: [{ type: "drive", src: "https://drive.google.com/file/d/1D-eNw-eAgOUzw9qPD3uWkqYrenz8FVac/preview", title: "Virtual Smart Home | Mimar Studios" }],
    showFacts: false,
    showProcessImage: false,
    process: [["Real-time build", "The interior and smart-home systems are recreated in an interactive engine."], ["Scene design", "Lighting, climate, blinds and device scenes are configured around realistic use cases."], ["Interactions", "Touch, voice control, panels and other custom smart-home interactions are added as required."], ["Deploy", "The kiosk or tablet build is installed and tested on the target system."]],
    included: ["Scene simulation", "Device demos", "Custom control panels", "Developer showroom setup"],
    projects: ["the-garden-residences", "360-residences"],
    showProjects: false,
    faqs: [["What equipment do we need?", "We provide recommendations; normally the setup uses compatible headsets and computer systems."], ["Can it match our automation brand?", "Yes. Controls and terminology can match the specified ecosystem."], ["Can we add custom interactions and panels?", "Yes. Interactions and control panels can be customized according to the requirement."],],
    next: "branding",
  },
  branding: {
    slug: "branding", title: "Branding", eyebrow: "Service 04 / 05",
    intro: "A strong project needs more than a logo. We build a clear identity system that holds together from the first presentation to the final campaign.",
    hero: "/services/branding/hero.png",
    includedImage: "/services/branding/hero.png",
    outputs: ["Brand Identity", "Corporate stationery", "Marketing collateral"],
    outputImages: ["/service-media/branding-identity.png", "/services/branding/corporate-stationery.jpg", "/services/branding/marketing-collateral.jpg"],
    outputLinks: [
      brandingMarketingSubServicePath("branding", "branding-collateral"),
      brandingMarketingSubServicePath("branding", "stationery"),
      brandingMarketingSubServicePath("branding", "marketing-collateral"),
    ],
    showFacts: false,
    processImage: "/services/branding/process.png",
    portfolio: [
      { title: "Olivia Residences", category: "Brand Manual", url: "https://online.fliphtml5.com/lutjp/rcen/" },
      { title: "Deca Properties", category: "Brand Manual", url: "https://online.fliphtml5.com/lutjp/dbnp/" },
      { title: "Aark Residences", category: "Brand Manual", url: "https://online.fliphtml5.com/lutjp/zphp/" },
      { title: "Trinity Residences", category: "Real Estate Project Brochure", url: "https://online.fliphtml5.com/lutjp/ucky/" },
      { title: "Aurum One", category: "Real Estate Project Brochure", url: "https://online.fliphtml5.com/lutjp/biyq/" },
      { title: "Serene Towers", category: "Real Estate Project Brochure", url: "https://online.fliphtml5.com/lutjp/nkfm/" },
      { title: "Beverly Hills Resorts", category: "Real Estate Project Brochure", url: "https://online.fliphtml5.com/lutjp/knih/" },
      { title: "Oak Square", category: "Real Estate Project Brochure", url: "https://online.fliphtml5.com/lutjp/seox/" },
      { title: "PIPE '22", category: "Real Estate Project Brochure", url: "https://online.fliphtml5.com/lutjp/amay/" },
    ],
    showProjects: false,
    process: [["Identity", "Logo, visual language, typography and colour systems are developed into a cohesive brand identity."], ["Application", "Brand identity is translated across stationery, business cards, packaging and branded merchandise."], ["Collateral", "Brochures, pamphlets, billboards, standees, invitations and promotional materials are designed for consistent communication."]],
    included: ["Logo system", "Typography & colour", "Brand guidelines", "Sales collateral"],
    projects: [],
    faqs: [["Can you create a complete identity from scratch?", "Yes. We can develop the strategy, naming direction, visual identity and complete guideline system."], ["Can you refresh an existing property brand?", "Yes. We can retain recognizable equity while improving the identity and how it works across digital and printed applications."], ["Do you design launch collateral too?", "Yes. Brochures, presentations, social templates, signage and other launch materials can be included in the scope."], ["Can you arrange printing as well?", "Yes. We can manage printing and production for approved stationery, brochures, packaging and other brand collateral for our clients."]],
    next: "marketing",
  },
  marketing: {
    slug: "marketing", title: "Marketing", eyebrow: "Service 05 / 05",
    intro: "Renders and animations only sell a project if the right people see them. We plan the campaign around the same visual assets we produce.",
    hero: "/service-media/marketing-hero.png",
    includedImage: "/service-media/marketing-hero.png",
    outputs: ["Digital Marketing", "Social Media Marketing", "Web Development", "SEO & Online Visibility"],
    outputImages: ["/service-media/marketing-digital.png", "/service-media/marketing-social.png", "/service-media/marketing-web.png", "/service-media/marketing-seo.png"],
    outputLinks: [
      brandingMarketingSubServicePath("marketing", "digital-marketing"),
      brandingMarketingSubServicePath("marketing", "social-media-marketing"),
      brandingMarketingSubServicePath("marketing", "web-development"),
      brandingMarketingSubServicePath("marketing", "seo"),
    ],
    processImage: "/service-media/marketing-process.png",
    showFacts: false,
    facts: [["14+ countries served", "Reach"], ["120+ B2B clients", "Track record"], ["Renders to launch", "Scope"], ["SEO, paid & social", "Channels"]],
    process: [["Strategy", "Goals, target audiences and digital channels are defined to establish a focused marketing direction."], ["Content", "Social media, campaigns and digital content are developed to communicate the brand and engage its audience."], ["Digital Presence", "Websites and online platforms are designed and developed to create a strong, accessible digital presence."], ["Growth", "SEO and digital optimization improve visibility, reach and long-term online performance."]],
    included: ["Social Media Content", "Website & Landing Pages", "SEO & Search Optimization"],
    projects: [],
    portfolio: [
      { title: "Faisal Town", category: "Website", url: "https://faisaltowngroup.com/" },
      { title: "Faisal Heights", category: "Website", url: "https://faisalheights.com/" },
      { title: "Union Tower", category: "Website", url: "https://uniontower.mimar.live/" },
      { title: "Al Ashraf", category: "Website", url: "https://al-ashraf.mimar.live/" },
      { title: "Park One", category: "Website", url: "https://parkone.com.pk/" },
      { title: "Serene Towers", category: "Website", url: "https://serenetower.com/" },
      { title: "Orchard Lake Farmhouses", category: "Website", url: "https://olfislamabad.mimar.live/" },
      { title: "Sunset Oasis", category: "Website", url: "https://sunset-oasis-resort.online/" },
      { title: "Azure", category: "Website", url: "https://azure-retreat.online/" },
      { title: "Garden Residences", category: "Website", url: "https://garden.mimar.live/" },
      { title: "Aurum One", category: "Website", url: "https://aurumone.com.pk/" },
      { title: "Deca Properties", category: "Website", url: "https://deca-properties.online/" },
      { title: "Faisal Jewels", category: "Website", url: "https://faisaljewel.mimar.live/" },
      { title: "360 Residences", category: "Website", url: "https://hajvairydevelopers.com/" },
      { title: "Digital Marketing Services", category: "Services Presentation", url: "https://docs.google.com/presentation/d/1z758oMhEgGaUf_Z__rUhyeg3OH_wFFDZ5gvfS8tx9tY/edit" },
    ],
    showProjects: false,
    faqs: [["Do you design the brand as well as run the campaign?", "Yes. Brand identity, collateral and campaign strategy are handled as one integrated service."], ["Can you build a project microsite or landing page?", "Yes. Web development is part of the service, often built around the same renders and tours we produce."], ["Do you handle paid and organic together?", "Yes. SEO, content, paid social and search are planned as one channel mix, not separately."],],
    next: "architectural-design",
  },
};
