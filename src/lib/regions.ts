import { projects, type Project } from "./site-config";

/**
 * Region landing pages (UAE, USA, KSA, Pakistan).
 *
 * These URLs were the old WordPress country pages and carry years of search
 * signals - /3d-visualization-services-uae alone holds ~108k impressions in
 * Search Console. The paths are therefore kept exactly as they were; only the
 * template behind them changes. Do not rename these routes.
 *
 * Previously they were served by the [...legacy] article route, which could
 * only render text blocks - no projects, imagery, pricing or contact. Each
 * region now renders through RegionLanding instead.
 */

export type RegionOffice = {
  city: string;
  country: string;
  /** Shown as crawlable text and used for LocalBusiness schema. */
  address: string;
  phone: string;
  geo: { latitude: number; longitude: number };
  /** The verified Google Business Profile for this location, for sameAs. */
  gbpUrl?: string;
};

export type Region = {
  /** Live path - unchanged from the old site. */
  path: string;
  /** Short key used in copy, e.g. "UAE". */
  name: string;
  /** Primary city we want to rank for. */
  city: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  h1: string;
  intro: string;
  /** Slugs from site-config projects that belong to this market. */
  projectSlugs: string[];
  /** Short market-specific positioning paragraph. */
  marketCopy: string;
  /** What we deliver in this market - label + one real sentence each. */
  services: { title: string; body: string }[];
  /** Why clients here choose us - label + one real sentence each. */
  reasons: { title: string; body: string }[];
  office: RegionOffice;
  currency: string;
  /** Local submission/compliance context - a genuine local differentiator. */
  compliance?: string[];
  faqs: { question: string; answer: string }[];
  /** Self-contained, citable facts for AI answer engines. */
  keyFacts: string[];
};

export const regions: Record<string, Region> = {
  uae: {
    path: "/3d-visualization-services-uae",
    name: "UAE",
    city: "Dubai",
    seoTitle: "3D Rendering & Architectural Visualization Services in Dubai & UAE | Mimar",
    description:
      "3D rendering and architectural visualization services for developers and architects in Dubai, Abu Dhabi and across the UAE. Photorealistic stills, animation, VR and 360 tours.",
    keywords: [
      "3d rendering dubai",
      "3d visualization companies in dubai",
      "architectural visualization services uae",
      "3d rendering services dubai",
      "3d architectural visualization dubai",
    ],
    h1: "3D Visualization Services UAE",
    // Keep this to roughly two lines - the hero uses max-w-xl, matching the
    // short, punchy subheads on the service pages.
    intro:
      "Photorealistic rendering, animation and virtual tours for developers building in Dubai, Abu Dhabi and across the Emirates.",
    projectSlugs: [
      "aark-residences",
      "amer-al-ghurair",
      "divine-golf",
      "divine-residencia",
      "h-and-s",
      "karma-trinity",
    ],
    marketCopy:
      "Making a mark in Dubai's skyline is not an easy feat. Mimar Studios works with developers, architects and real estate teams across Dubai, Abu Dhabi, Sharjah and the wider UAE - producing renderings, cinematics, VR tours and 3D on plan in-house. Architectural visualization makes a development more appealing and interactive for buyers, and helps it sell faster, which matters in a market where most units are sold off-plan.",
    services: [
      {
        title: "3D Rendering",
        body: "We bring your designs to life with 3D modeling and rendering, creating realistic and detailed interior and exterior visualizations for UAE developments.",
      },
      {
        title: "Animation & Cinematics",
        body: "The key to selling an under-construction site is visual advertising. Cinematic walkthroughs and fly-throughs take an off-plan project to the next level.",
      },
      {
        title: "Architectural Design",
        body: "Expert architectural services delivering detailed 3D models and stunning visualizations, bringing UAE projects to life with precision.",
      },
      {
        title: "VR 360 Tours",
        body: "With 3D VR tours on a construction site you can make a site look complete before it is, and identify design and architectural flaws early.",
      },
      {
        title: "Web Tours",
        body: "Immersive 360-degree virtual tours that bring your designs to life online - no installation, viewable on any device.",
      },
      {
        title: "Dual Screen Navigator",
        body: "Control and view your 3D models and visualizations across two screens for enhanced precision in sales centres and showrooms.",
      },
    ],
    reasons: [
      {
        title: "Attention to detail",
        body: "Well-organized and meticulous results that make architectural and real estate projects more prominent in the market.",
      },
      {
        title: "Competent team",
        body: "A smart, accomplished and professional team - what makes us a trustworthy name for 3D visualization services in Dubai, Sharjah and other cities of the UAE.",
      },
      {
        title: "3D expertise",
        body: "We work with the latest 3D tools, software and technology. Visualizers and architectural experts work together on every project.",
      },
      {
        title: "Multiple revisions",
        body: "We take feedback seriously and review the work at every stage until you are satisfied with the final result.",
      },
      {
        title: "Cost-effective",
        body: "Exceptional-quality visualization at rates that make us the first choice for clients across the United Arab Emirates.",
      },
      {
        title: "Commitment to excellence",
        body: "Every project gets our full attention and technical expertise from the first brief through to final delivery.",
      },
    ],
    office: {
      city: "Dubai",
      country: "United Arab Emirates",
      address: "Dubai, United Arab Emirates",
      phone: "+971 54 146 5887",
      geo: { latitude: 25.2048, longitude: 55.2708 },
    },
    currency: "AED",
    compliance: [
      "Deliverables prepared in formats used for Dubai Municipality and RERA submissions",
      "Gulf Standard Time working hours with overlap into European and Asian schedules",
      "NDAs signed for unreleased developments as standard",
    ],
    faqs: [
      {
        question: "What is 3D rendering in real estate?",
        answer:
          "In real estate, 3D rendering is the process of creating high-resolution images of a property with intricate detail - materials, lighting, landscaping and context - before the building exists. Developers use these renders for off-plan sales, marketing campaigns and investor presentations.",
      },
      {
        question: "What are the benefits of virtual tours?",
        answer:
          "360 panoramic tours of a real estate or construction site give an in-depth view of the property, interiors and surroundings without a site visit. For UAE developers selling to overseas investors, a web tour lets a buyer explore a unit from another country before it is built.",
      },
      {
        question: "How much do architectural 3D visualization services cost in the UAE?",
        answer:
          "Cost depends on the number of views, level of detail, scale of the development and turnaround required. Pricing is quoted per project in AED. Contact our team with your drawings and a short brief and we will return an itemised quote.",
      },
      {
        question: "Do you work with developers in Dubai and Abu Dhabi?",
        answer:
          "Yes. We have delivered visualization for developments across Dubai including Aark Residences, Amer Al Ghurair, Divine Golf, Divine Residencia, H&S and Karma Trinity, and we work with developers and architects throughout the UAE.",
      },
      {
        question: "How quickly can you deliver a render?",
        answer:
          "A single still render is typically produced within 5-7 working days from approved inputs. Rush work can often be delivered in two to three working days once the greyscale stage is signed off.",
      },
      {
        question: "What do you need from me to start?",
        answer:
          "Plans, elevations, a material direction and any useful references. If drawings are incomplete we can work from sketches and develop the detail with you during the greyscale stage.",
      },
    ],
    keyFacts: [
      "Mimar Studios provides 3D architectural rendering and visualization services to developers and architects in Dubai, Abu Dhabi and across the United Arab Emirates.",
      "UAE projects delivered include Aark Residences, Amer Al Ghurair, Divine Golf, Divine Residencia, H&S and Karma Trinity, all in Dubai.",
      "A single still render is typically delivered within 5-7 working days of approved inputs.",
      "Services include photorealistic stills, cinematic animation, VR experiences, 360 web tours and interactive property tools.",
      "The studio has completed 270+ projects across 14 countries since 2019, with offices in Islamabad, Jeddah, Dubai and the United States.",
    ],
  },
};

/** Projects in site-config that belong to a region, in listed order. */
export function regionProjects(region: Region): Project[] {
  return region.projectSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
}

export const regionList = Object.values(regions);
