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
    body: "Your one-stop architecture and design studio. Mimar Studios brings architects, visualizers, and designers together under one roof to deliver projects from concept to experience.",
    cta: "Go to services",
  },
  teamStats: {
    eyebrow: "/ Studio",
    heading1: "A Team That Produces",
    heading2: "Shared Creativity.",
    body: "Taking care of what is in process and excited about what is to come.",
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
    ofSeparator: "of",
    previous: "Previous services",
    next: "Next services",
  },
  legacyArticle: {
    eyebrow: "/ Mimar insights",
    publishedBy: "Published by Mimar Studios",
    discussProject: "Discuss a project",
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
