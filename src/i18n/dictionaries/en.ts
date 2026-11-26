/**
 * English dictionary - shared site chrome and reusable-section copy only.
 * Page-unique long-form content (About, Careers, Expos, Privacy Policy,
 * Services index, ...) lives inline in each page as a small bilingual
 * object next to the JSX that renders it, since that copy is never reused
 * elsewhere. See src/i18n/dictionaries.ts for how this is loaded.
 */
const en = {
  nav: {
    projects: "Projects",
    services: "Services",
    aboutUs: "About Us",
    xr: "XR Digital",
    studio: "Studio",
    contact: "Contact",
    booking: "Book a Meeting",
    insights: "Insights",
    careers: "Careers",
    expos: "Expos",
  },
  header: {
    getQuote: "Get a quote",
    menu: "Menu",
    close: "Close",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    homeLabel: "Mimar Studios home",
  },
  footer: {
    officesHeading: "Offices",
    studioHeading: "Studio",
    contactHeading: "Contact",
    indexHeading: "Index",
    followHeading: "Follow",
    rightsReserved: "Mimar Studios © All rights reserved",
    privacyPolicy: "Privacy Policy",
    /** Country labels used in the phone list; keyed by the English name in contactPhones. */
    countries: { Pakistan: "Pakistan", "Saudi Arabia": "Saudi Arabia", UAE: "UAE", USA: "USA" } as Record<string, string>,
  },
  languageSwitcher: {
    label: "Language",
    en: "English",
    ar: "العربية",
  },
  common: {
    home: "Home",
    requestQuote: "Request a quote",
    getInTouch: "Get in touch",
    backToHome: "Back to home",
    openLiveDemo: "Open live demo",
    nextProject: "Next project",
    nextService: "Next service",
    backToAllProjects: "Back to all projects",
    gallery: "Gallery",
    keySpecs: "Key specs",
    questions: "Questions",
    alsoIncluded: "Also included",
    provenOn: "Proven on",
    outputs: "Outputs",
    featuredMedia: "Featured media",
    /** {service} is replaced with the lowercased service title at the call site. */
    selectedWork: "Selected {service} work",
    videoPlaceholder: "Video placeholder",
    openProject: "Open project",
    client: "Client",
    location: "Location",
    typology: "Typology",
    area: "Area",
    nonDisclosed: "Non-disclosed",
    projectSpecific: "Project specific",
    hospitalityResidential: "Hospitality / Residential",
    hospitalityInterior: "Hospitality / Interior",
  },
  studioIntro: {
    eyebrow: "/ Studio",
    heading1: "Design. Visualize.",
    heading2: "Experience.",
    body: "Mimar Studios is a 3D architecture firm and architectural rendering studio. Architects, visualizers and designers work under one roof, so developers can outsource 3D architectural rendering, animation and [interactive tours](/services/interactive-services) to one team, from concept to sales launch.",
    cta: "Go to services",
  },
  // Home page only (SEO_MIGRATION.md point 42): the two new sections and the home closing call to
  // action. `[words](/path)` becomes an internal link (linkedText), in the page language.
  homeProcess: {
    eyebrow: "/ Our process",
    heading1: "How we work.",
    heading2: "From drawings to delivery.",
    lead: "",
    intro: "When you bring your 3D architectural rendering or design project to Mimar Studios, here's how it progresses from the initial brief to final delivery.",
    steps: [
      ["Send the brief", "Share drawings (plans or CAD files), material references and your deadline through our contact form or a [booked call](/booking)."],
      ["Scope and quotation", "We review your needs, define the scope and send a detailed quotation with deliverables and timeline."],
      ["Review and refine", "You review an initial preview of the design or 3D model. We then refine materials and light into photorealistic 3D visualization."],
      ["Final delivery", "Receive exterior and interior renders, 3D walkthroughs, virtual tours and project files, ready to market or build."],
    ] as [string, string][],
    imageAlt: "Photorealistic 3D render of a hotel lobby and reception desk by Mimar Studios",
    cta: "Request a quote",
  },
  homeWhy: {
    eyebrow: "/ Our strengths",
    heading1: "Why Mimar?",
    heading2: "Built for developers.",
    intro: "Mimar Studios is a 3D architecture firm and architectural rendering studio with everything your project needs under one roof, from design and visualization to marketing.",
    reasons: [
      ["One studio, concept to launch", "Our architects, visualizers, animators and brand designers work together to keep your design, visuals, tours and marketing aligned from concept to launch."],
      ["Starting with your vision", "From initial ideas and project briefs to existing drawings or CAD files, we adapt to your needs, and we work in imperial units for US projects."],
      ["Handled with discretion", "Your drawings, designs and project information are handled confidentially, with NDAs available on request."],
      ["Changes early, not late", "You review the camera angles and composition before final materials and lighting, making revisions easier and more cost-effective."],
      ["Proven across markets", "We've worked on projects across Pakistan, the UAE, Saudi Arabia, Oman, Nigeria and the United States."],
      ["Made for real estate", "3D rendering for real estate, interactive experiences and campaigns designed for [off-plan launches](/blog/dubai-off-plan-real-estate-rendering-drives-pre-construction-sales), sales galleries and property marketing."],
    ] as [string, string][],
  },
  homeContactCta: {
    heading1: "Tell us about the project.",
    heading2: "We will take it from there.",
    body: "Send your drawings and a short brief, and one of our architects will reply within one working day with questions and a quote. Working with a 3D architecture firm should be the easy part of your launch.",
  },
  teamStats: {
    eyebrow: "/ Team",
    heading1: "A Team That Produces",
    heading2: "Shared Creativity.",
    body: "Architects, 3D visualization artists, animators and interactive developers work as one team, so the design, the renders and the tours come from the same people.",
    cta: "Explore the studio",
  },
  faqSection: {
    eyebrow: "/ FAQ",
    heading: "Common questions",
  },
  contactCta: {
    eyebrow: "/ Get in touch",
    heading1: "Tell us about the project.",
    heading2: "We will take it from there.",
    body: "Share a few details and one of our architects will get back to you within a day.",
    cta: "Start a conversation",
  },
  servicesList: {
    eyebrow: "/ Services",
    heading1: "Everything",
    heading2: "under one roof",
  },
  portfolioGrid: {
    cta: "Go to all projects",
  },
  projectShowcase: {
    eyebrow: "/ Portfolio",
    heading1: "Selected Works of",
    heading2: "Our Architecture Studio",
  },
  servicesPreview: {
    eyebrowPrefix: "/ Services",
    heading: "Architecture, 3D Visualization & Interactive Services",
    ofSeparator: "of",
    previous: "Previous services",
    next: "Next services",
  },
  legacyArticle: {
    eyebrow: "/ Mimar insights",
    publishedBy: "Published by Mimar Studios",
    discussProject: "Discuss a project",
    // One line above the button on every article: a keyword link back to the home page.
    studioLine: "Mimar Studios is a [3D architecture firm](/) working with developers in the USA, the Gulf and Pakistan.",
  },
  contactForm: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    pickService: "Pick a service",
    whereFindUs: "Where'd you find us?",
    message: "Message",
    select: "Select",
    send: "Send",
    sending: "Sending…",
    successMessage: "Thanks - we'll be in touch shortly.",
    genericError: "Something went wrong.",
    sourceOptions: ["LinkedIn", "Instagram", "Facebook", "Google", "Other"],
  },
  blogCategories: {
    "3d-visualization": {
      label: "3D Visualization",
      description: "Rendering, animation and architectural visualization technique guides.",
    },
    "vr-real-estate": {
      label: "VR & Real Estate",
      description: "Virtual reality, augmented reality and the metaverse in real estate.",
    },
    "real-estate-tech": {
      label: "Real Estate Tech",
      description: "Proptech and technology trends shaping how real estate is sold.",
    },
  },
};

export default en;
export type Dictionary = typeof en;
