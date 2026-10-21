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

/**
 * A verified Google Business Profile location in this market.
 *
 * Every field here must match what the Business Profile itself shows - Google
 * compares them, and a mismatch is worse than no markup at all. The values
 * below were read from the live profiles on 20 Oct 2026, not from site-config,
 * which disagrees with them in several places (see NAP notes in the README of
 * this change).
 */
export type RegionLocation = {
  city: string;
  /** State or emirate code where one applies, e.g. "NY", "TX". */
  area?: string;
  streetAddress: string;
  postalCode?: string;
  /** ISO country code for PostalAddress.addressCountry. */
  countryCode: string;
  phone: string;
  geo: { latitude: number; longitude: number };
  /** Share link from the verified profile. Omitted until one exists - a
   *  location is still marked up without it, just with no sameAs. */
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
  /** Verified Google Business Profile locations, rendered and marked up. */
  locations: RegionLocation[];
  currency: string;
  /** Local submission/compliance context - a genuine local differentiator. */
  compliance?: string[];
  /** Client quotes carried over from the old WordPress page. */
  testimonials: { quote: string; name: string; city: string }[];
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
    locations: [
      {
        city: "Dubai",
        streetAddress: "WeWork, One Central, 8th & 9th Floor, The Offices 4, Dubai World Trade Centre",
        countryCode: "AE",
        phone: "+971 58 536 1858",
        geo: { latitude: 25.2246, longitude: 55.2874 },
        gbpUrl: "https://share.google/zExBKdwTHeYWP6xBc",
      },
    ],
    currency: "AED",
    compliance: [
      "Deliverables prepared in formats used for Dubai Municipality and RERA submissions",
      "Gulf Standard Time working hours with overlap into European and Asian schedules",
      "NDAs signed for unreleased developments as standard",
    ],
    // Carried over verbatim from the old WordPress page, which showed these
    // three in a slider. Real named clients are the page's only third-party
    // proof - everything else on it is us talking about ourselves.
    testimonials: [
      {
        quote:
          "Very satisfied with their work. mimAR has proved itself to be a reliable partner for architectural visualization services. We have worked with different companies from Dubai but none of them did the job quite as good as team mimAR did.",
        name: "Ghiță Eder",
        city: "Dubai",
      },
      {
        quote:
          "If you want the finest quality 3D renderings, go with mimAR because these guys really know their stuff. The deliverables were up to the mark and I was impressed with their timely response. Would strongly recommend.",
        name: "Mehmet Demir",
        city: "Sharjah",
      },
      {
        quote:
          "I hired mimAR for the 3D animation of our real estate project and what a splendid job they did. They were always available for any revisions and responded quickly with a better option. I can't forget to mention how reasonable their rates are. Keep up the good work guys.",
        name: "Maya Andreson",
        city: "Dubai",
      },
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
  usa: {
    // Path unchanged from WordPress. Renaming it to match the UAE slug would
    // cost a redirect hop for no ranking benefit - slug wording is not a
    // ranking factor.
    path: "/3d-visualization-usa",
    name: "USA",
    city: "Miami",
    seoTitle: "3D Rendering & Architectural Visualization Services USA | Mimar",
    description:
      "3D rendering and architectural visualization for developers and architects in New York, Los Angeles, San Francisco, Dallas, Houston and Miami. Photorealistic stills, animation and virtual tours.",
    // These are queries the site already ranks 1-2 for in the US while earning
    // almost no clicks - 33,251 impressions and 7 clicks in the 28 days to
    // 17 Oct 2026. The page names the cities explicitly so the listing matches
    // what was actually searched.
    keywords: [
      "3d rendering services usa",
      "architectural visualization studio usa",
      "3d rendering services new york",
      "3d rendering services los angeles",
      "architectural rendering san francisco",
      "3d rendering services dallas",
    ],
    h1: "3D Visualization Services USA",
    intro:
      "Photorealistic rendering, animation and virtual tours for developers and architects in New York, Los Angeles, San Francisco, Dallas, Houston and Miami.",
    projectSlugs: ["nomi-downtown", "the-garden-residences"],
    marketCopy:
      "American developers sell on renderings long before a foundation is poured - to lenders, to planning boards, and to buyers deciding off a brochure. Mimar Studios produces that imagery in-house for teams in New York, Los Angeles, San Francisco, Dallas, Houston and Miami: photorealistic stills, cinematic animation, 360 tours and interactive tools, delivered to US drawing standards and on US schedules.",
    services: [
      {
        title: "3D Rendering",
        body: "Photorealistic interior and exterior stills for brochures, listing sites, lender packages and planning submissions.",
      },
      {
        title: "Animation & Cinematics",
        body: "Walkthroughs and fly-throughs that carry a project across a sales centre screen, a website and a social campaign.",
      },
      {
        title: "Architectural Design",
        body: "Detailed 3D models and visualization developed alongside your architect, from massing study to final presentation set.",
      },
      {
        title: "VR 360 Tours",
        body: "Let an out-of-state buyer walk a unit before framing starts, and catch design problems while they are still cheap to fix.",
      },
      {
        title: "Web Tours",
        body: "Immersive 360-degree tours that run in any browser - no app, no install, straight from a listing page.",
      },
      {
        title: "Dual Screen Navigator",
        body: "Two-screen control of models and visualizations for sales centres, showrooms and investor presentations.",
      },
    ],
    reasons: [
      {
        title: "Built for US sales cycles",
        body: "Deliverables sized for listing platforms, brochure print, lender decks and planning boards - not just a folder of images.",
      },
      {
        title: "Time zone overlap",
        body: "Our day overlaps the US East Coast afternoon and the West Coast morning, so feedback left in the evening is usually actioned by morning.",
      },
      {
        title: "Imperial units as standard",
        body: "We model straight from drawings in feet and inches, with no unit conversion in between to introduce errors.",
      },
      {
        title: "Multiple revisions",
        body: "Feedback is reviewed at every stage - greyscale, materials, final - until the result matches what you had in mind.",
      },
      {
        title: "Cost-effective",
        body: "Studio-grade visualization at rates well below a comparable US-based studio, which is why much of this work is outsourced in the first place.",
      },
      {
        title: "One team, every output",
        body: "Stills, animation, VR and interactive tools are produced in-house, so the building looks the same across all of them.",
      },
    ],
    office: {
      city: "Miami",
      country: "United States",
      address: "Miami, Florida, United States",
      phone: "+1 786 761 9866",
      geo: { latitude: 25.7617, longitude: -80.1918 },
    },
    locations: [
      {
        city: "New York",
        area: "NY",
        streetAddress: "25 Broadway",
        postalCode: "10004",
        countryCode: "US",
        phone: "+1 415-300-2005",
        geo: { latitude: 40.7054, longitude: -74.0132 },
        gbpUrl: "https://share.google/1moaNAdc6IN5roHSm",
      },
      {
        city: "Dallas",
        area: "TX",
        streetAddress: "1601 Elm St",
        postalCode: "75201",
        countryCode: "US",
        phone: "+1 415-745-4287",
        geo: { latitude: 32.7819435, longitude: -96.7983793 },
        // The share.google short link for this profile has never resolved, so
        // this is the canonical maps CID URL for the same listing.
        gbpUrl: "https://maps.google.com/?cid=10127851720809782624",
      },
      {
        city: "San Francisco",
        area: "CA",
        streetAddress: "535 Mission St",
        postalCode: "94105",
        countryCode: "US",
        phone: "+1 415-300-2005",
        geo: { latitude: 37.7881, longitude: -122.3972 },
        gbpUrl: "https://share.google/jF9Xy8mD5BPlUy1wY",
      },
      {
        city: "Los Angeles",
        area: "CA",
        streetAddress: "360 E 2nd St, Suite 800",
        postalCode: "90012",
        countryCode: "US",
        phone: "+1 415-300-2005",
        geo: { latitude: 34.0486, longitude: -118.2389 },
        gbpUrl: "https://share.google/1DPWaFVsmxJDSZocn",
      },
      {
        city: "Houston",
        area: "TX",
        streetAddress: "609 Main St",
        postalCode: "77002",
        countryCode: "US",
        phone: "+1 415-745-4287",
        geo: { latitude: 29.7576, longitude: -95.3647 },
        gbpUrl: "https://share.google/H6hiSKKIuuuV59ZFt",
      },
      {
        city: "Austin",
        area: "TX",
        streetAddress: "600 S Congress Ave",
        postalCode: "78701",
        countryCode: "US",
        phone: "+1 415-300-2005",
        geo: { latitude: 30.2549, longitude: -97.7452 },
        gbpUrl: "https://maps.app.goo.gl/rQE1yMo767ZwhQLK8",
      },
    ],
    currency: "USD",
    compliance: [
      "Drawings read in imperial units - feet and inches - with no conversion step in between",
      "Working hours overlap the US East Coast afternoon and the West Coast morning",
      "NDAs signed for unreleased developments as standard",
    ],
    // Already published on /about-us, so this is not a new claim.
    testimonials: [
      {
        quote:
          "Reasonable rates, clear communication, and top-quality VR services. They have the best talent for each service they offer.",
        name: "David Chen",
        city: "United States",
      },
    ],
    faqs: [
      {
        question: "Do you work with developers in the United States?",
        answer:
          "Yes. We work with developers, architects and real estate marketing teams across the US, including New York, Los Angeles, San Francisco, Dallas, Houston and Miami. Delivered US projects include Nomi Downtown in Miami and The Garden Residences.",
      },
      {
        question: "How much do 3D rendering services cost in the USA?",
        answer:
          "Cost depends on the number of views, level of detail, scale of the development and turnaround required. Pricing is quoted per project in USD. Send us your drawings and a short brief and we will return an itemised quote.",
      },
      {
        question: "How quickly can you deliver a render?",
        answer:
          "A single still render is typically produced within 5-7 working days from approved inputs. Rush work can often be delivered in two to three working days once the greyscale stage is signed off.",
      },
      {
        question: "Do you work in feet and inches?",
        answer:
          "Yes. We model directly from imperial drawings, so you do not need to convert anything before sending plans and elevations.",
      },
      {
        question: "What do you need from me to start?",
        answer:
          "Plans, elevations, a material direction and any useful references. If the drawings are incomplete we can work from sketches and develop the detail with you during the greyscale stage.",
      },
      {
        question: "How does the time difference work?",
        answer:
          "Feedback sent at the end of a US working day is usually picked up overnight and answered before the next one starts.",
      },
    ],
    keyFacts: [
      "Mimar Studios provides 3D architectural rendering and visualization services to developers and architects across the United States, including New York, Los Angeles, San Francisco, Dallas, Houston and Miami.",
      "US projects delivered include Nomi Downtown, an urban mixed-use development in Miami, and The Garden Residences.",
      "A single still render is typically delivered within 5-7 working days of approved inputs.",
      "Services include photorealistic stills, cinematic animation, VR experiences, 360 web tours and interactive property tools.",
      "The studio has completed 270+ projects across 14 countries since 2019 and works from imperial drawings for US clients.",
    ],
  },
  saudiArabia: {
    // A new path - no Saudi page existed on WordPress, so there is nothing to
    // preserve and nothing to redirect. "saudi-arabia" over "ksa" because
    // that is overwhelmingly how the market is searched for.
    path: "/3d-visualization-services-saudi-arabia",
    name: "Saudi Arabia",
    city: "Riyadh",
    seoTitle: "3D Rendering & Architectural Visualization Services in Saudi Arabia | Mimar",
    description:
      "3D rendering and architectural visualization for developers and architects in Riyadh, Jeddah and across Saudi Arabia. Photorealistic stills, animation, VR and 360 tours, from our Jeddah office.",
    // Unlike the UAE and US pages, these are not queries the site already
    // ranks for. Saudi search currently reaches the site almost entirely on
    // brand terms - of 276 Saudi queries in the six months to 17 Oct 2026,
    // exactly one named a Saudi city. This page is building demand, not
    // capturing it, and should be judged on that.
    keywords: [
      "3d rendering services saudi arabia",
      "architectural visualization riyadh",
      "3d rendering company jeddah",
      "architectural rendering saudi arabia",
      "3d visualization riyadh",
    ],
    h1: "3D Visualization Services Saudi Arabia",
    intro:
      "Photorealistic rendering, animation and virtual tours for developers building in Riyadh, Jeddah and across the Kingdom.",
    projectSlugs: ["nana-222"],
    marketCopy:
      "Saudi Arabia is building faster than anywhere else in the region, and most of it is sold, approved and funded from imagery long before the site is cleared. Mimar Studios works with developers and architects in Riyadh and Jeddah from an office in Jeddah, producing renderings, cinematics, VR tours and 3D on plan in-house - in Gulf working hours, and quoted in riyals.",
    services: [
      {
        title: "3D Rendering",
        body: "Photorealistic interior and exterior stills for brochures, investor decks and municipality submissions.",
      },
      {
        title: "Animation & Cinematics",
        body: "Walkthroughs and fly-throughs that carry a development across a sales centre screen, a website and a campaign.",
      },
      {
        title: "Architectural Design",
        body: "Detailed 3D models and visualization developed alongside your architect, from massing study to final presentation set.",
      },
      {
        title: "VR 360 Tours",
        body: "Let a buyer walk a unit before it is built, and catch design problems while they are still cheap to fix.",
      },
      {
        title: "Web Tours",
        body: "Immersive 360-degree tours that run in any browser - no app, no install, straight from a listing page.",
      },
      {
        title: "Dual Screen Navigator",
        body: "Two-screen control of models and visualizations for sales centres, showrooms and investor presentations.",
      },
    ],
    reasons: [
      {
        title: "An office in the Kingdom",
        body: "We work from Jeddah, so meetings, site visits and reviews do not depend on a time zone or a visa.",
      },
      {
        title: "Gulf working week",
        body: "Our week runs Sunday to Thursday alongside yours, rather than against it.",
      },
      {
        title: "Quoted in riyals",
        body: "Pricing is set in SAR, so there is no currency conversion sitting between the quote and the invoice.",
      },
      {
        title: "Multiple revisions",
        body: "Feedback is reviewed at every stage - greyscale, materials, final - until the result matches what you had in mind.",
      },
      {
        title: "Cost-effective",
        body: "Studio-grade visualization at rates well below a comparable Western studio, with the same software and pipeline.",
      },
      {
        title: "One team, every output",
        body: "Stills, animation, VR and interactive tools are produced in-house, so the building looks the same across all of them.",
      },
    ],
    office: {
      city: "Jeddah",
      country: "Saudi Arabia",
      address: "Prince Sultan Branch Rd, Al-Mohammadiyah, Jeddah 23625, Saudi Arabia",
      phone: "+966 59 743 9044",
      geo: { latitude: 21.5810, longitude: 39.1570 },
    },
    // No verified Google Business Profile exists for Saudi Arabia yet, so this
    // location is marked up without a sameAs. Address and phone are the ones
    // the site already publishes in its footer.
    locations: [
      {
        city: "Jeddah",
        streetAddress: "Prince Sultan Branch Rd, Al-Mohammadiyah",
        postalCode: "23625",
        countryCode: "SA",
        phone: "+966 59 743 9044",
        geo: { latitude: 21.5810, longitude: 39.1570 },
      },
    ],
    currency: "SAR",
    compliance: [
      "Deliverables prepared in the formats used for Saudi municipality and master-developer submissions",
      "Sunday to Thursday working week, in Arabia Standard Time",
      "NDAs signed for unreleased developments as standard",
    ],
    // No Saudi client has given us a quote for publication yet.
    testimonials: [],
    faqs: [
      {
        question: "Do you work with developers in Riyadh and Jeddah?",
        answer:
          "Yes. We work from an office in Jeddah with developers and architects across the Kingdom. Delivered Saudi work includes NANA 222 in Riyadh.",
      },
      {
        question: "How much do 3D visualization services cost in Saudi Arabia?",
        answer:
          "Cost depends on the number of views, level of detail, scale of the development and turnaround required. Pricing is quoted per project in SAR. Send us your drawings and a short brief and we will return an itemised quote.",
      },
      {
        question: "How quickly can you deliver a render?",
        answer:
          "A single still render is typically produced within 5-7 working days from approved inputs. Rush work can often be delivered in two to three working days once the greyscale stage is signed off.",
      },
      {
        question: "Do you work the Saudi week?",
        answer:
          "Yes. Our week runs Sunday to Thursday in Arabia Standard Time, so reviews and approvals happen on your schedule rather than a day behind it.",
      },
      {
        question: "Can you produce material for off-plan sales?",
        answer:
          "That is most of what we do. Stills, cinematic animation, 360 tours and interactive tools are all produced in-house, so a development looks consistent across a sales centre, a brochure and a listing page.",
      },
      {
        question: "What do you need from me to start?",
        answer:
          "Plans, elevations, a material direction and any useful references. If the drawings are incomplete we can work from sketches and develop the detail with you during the greyscale stage.",
      },
    ],
    keyFacts: [
      "Mimar Studios provides 3D architectural rendering and visualization services to developers and architects in Riyadh, Jeddah and across Saudi Arabia, from an office in Jeddah.",
      "Saudi work delivered includes NANA 222, a contemporary development in Riyadh.",
      "A single still render is typically delivered within 5-7 working days of approved inputs.",
      "Services include photorealistic stills, cinematic animation, VR experiences, 360 web tours and interactive property tools.",
      "The studio has completed 270+ projects across 14 countries since 2019 and works the Sunday to Thursday Gulf week.",
    ],
  },
  pakistan: {
    // A new path - WordPress had no Pakistan page either.
    path: "/3d-visualization-services-pakistan",
    name: "Pakistan",
    city: "Islamabad",
    seoTitle: "3D Rendering & Architectural Visualization Services in Pakistan | Mimar",
    description:
      "Architectural visualization, 3D rendering and branding for developers and architects in Islamabad, Lahore, Karachi and Multan. The studio was founded in Islamabad in 2019.",
    // Pakistan is the opposite problem to the US. Brand terms do well -
    // "mimar" alone is 140 clicks at 33% CTR - but the non-brand local
    // queries below sit on page 2 to 6, so they need rankings, not a better
    // title. Note what actually earns impressions here: "architecture firm"
    // and "branding", more than "3d rendering".
    keywords: [
      "architecture firms in pakistan",
      "architectural design firm in pakistan",
      "3d rendering services pakistan",
      "branding companies in pakistan",
      "architectural visualization islamabad",
    ],
    h1: "3D Visualization Services Pakistan",
    intro:
      "Architectural visualization, rendering and branding for developers and architects in Islamabad, Lahore, Karachi and Multan.",
    projectSlugs: [
      "faisal-town-ii",
      "faisal-hills",
      "hmr",
      "lake-city",
      "dha-multan-highrise",
      "aurum-one",
      "360-residences",
      "cafe-interior",
    ],
    marketCopy:
      "Mimar Studios was founded in Islamabad in 2019 and still builds everything here - the studio at the National Science & Technology Park produces the renderings, animation, VR and branding that go out to clients in fourteen countries. Closer to home that means master-planned communities, high-rise residential and hospitality work across Islamabad, Lahore, Karachi and Multan, handled by the same team that delivers abroad.",
    services: [
      {
        title: "3D Rendering",
        body: "Photorealistic interior and exterior stills for brochures, hoardings, launch campaigns and approval submissions.",
      },
      {
        title: "Animation & Cinematics",
        body: "Walkthroughs and fly-throughs for launches, sales offices and the social campaigns that carry a scheme.",
      },
      {
        title: "Architectural Design",
        body: "Detailed 3D models and visualization developed alongside your architect, from masterplan to final presentation set.",
      },
      {
        title: "VR 360 Tours",
        body: "Let a buyer walk an apartment before it is built - the approach behind our HMR and Aurum One tours.",
      },
      {
        title: "Web Tours",
        body: "Immersive 360-degree tours that run in any browser - no app, no install, straight from a listing page.",
      },
      {
        title: "Branding & Marketing",
        body: "Identity, collateral and campaign work for developments, produced alongside the visualization rather than bolted on.",
      },
    ],
    reasons: [
      {
        title: "This is where we are",
        body: "The studio has been in Islamabad since 2019. Meetings, site visits and reviews happen in person, not over a time difference.",
      },
      {
        title: "Masterplan to unit",
        body: "Faisal Town II and Faisal Hills covered CBD, lake district, stadium and golf course; HMR and Aurum One came down to single apartments.",
      },
      {
        title: "Export-grade work, local rates",
        body: "The same team and pipeline that delivers to Dubai and the United States, quoted in rupees.",
      },
      {
        title: "Multiple revisions",
        body: "Feedback is reviewed at every stage - greyscale, materials, final - until the result matches what you had in mind.",
      },
      {
        title: "Branding under one roof",
        body: "Identity and campaign work sit beside the visualization team, so a launch looks consistent from render to hoarding.",
      },
      {
        title: "One team, every output",
        body: "Stills, animation, VR and interactive tools are produced in-house, so the building looks the same across all of them.",
      },
    ],
    office: {
      city: "Islamabad",
      country: "Pakistan",
      address: "1403, National Science & Technology Park (NSTP), NUST, H-12, Islamabad 44000, Pakistan",
      phone: "+92 300 511 2990",
      geo: { latitude: 33.6461, longitude: 72.9932 },
    },
    // Address and phone taken from the verified Business Profile, which says
    // suite 1403 - site-config still says 3407. The profile is what Google
    // compares against, so it wins here until the two are reconciled.
    locations: [
      {
        city: "Islamabad",
        streetAddress: "1403, National Science & Technology Park (NSTP), NUST, H-12",
        postalCode: "44000",
        countryCode: "PK",
        phone: "+92 300 511 2990",
        geo: { latitude: 33.6461, longitude: 72.9932 },
        gbpUrl: "https://share.google/9UmptDgeq3JNUfBZW",
      },
    ],
    currency: "PKR",
    compliance: [
      "Deliverables prepared in the formats used for CDA, LDA and DHA submissions",
      "Pakistan Standard Time, with the studio reachable through the working day",
      "NDAs signed for unreleased developments as standard",
    ],
    testimonials: [
      {
        quote:
          "Working with Mimar has been a smooth ride. My team has hardly faced any problems from their end as they keep a positive and professional attitude throughout the project.",
        name: "Ali Raza",
        city: "Pakistan",
      },
      {
        quote:
          "Their futuristic 3D technology really helped our team and boosted our sales to a great extent. The overall experience was wonderful.",
        name: "Umar Farooq",
        city: "Pakistan",
      },
    ],
    faqs: [
      {
        question: "Where is Mimar Studios based?",
        answer:
          "The studio was founded in Islamabad in 2019 and works from the National Science & Technology Park at NUST, H-12. We work with clients across Islamabad, Lahore, Karachi and Multan, and in fourteen countries.",
      },
      {
        question: "What Pakistani projects have you delivered?",
        answer:
          "Faisal Town II and Faisal Hills in Islamabad, HMR in Karachi, Lake City in Lahore, DHA Multan Highrise, Aurum One, 360 Residences and a cafe interior - eight developments in all, spanning masterplans down to single units.",
      },
      {
        question: "How much do 3D visualization services cost in Pakistan?",
        answer:
          "Cost depends on the number of views, level of detail, scale of the development and turnaround required. Pricing is quoted per project in PKR. Send us your drawings and a short brief and we will return an itemised quote.",
      },
      {
        question: "How quickly can you deliver a render?",
        answer:
          "A single still render is typically produced within 5-7 working days from approved inputs. Rush work can often be delivered in two to three working days once the greyscale stage is signed off.",
      },
      {
        question: "Do you do branding as well as visualization?",
        answer:
          "Yes. Identity, collateral and campaign work are produced in-house alongside the visualization, so a launch looks consistent from the render through to the hoarding.",
      },
      {
        question: "What do you need from me to start?",
        answer:
          "Plans, elevations, a material direction and any useful references. If the drawings are incomplete we can work from sketches and develop the detail with you during the greyscale stage.",
      },
    ],
    keyFacts: [
      "Mimar Studios was founded in Islamabad, Pakistan in 2019 and works from the National Science & Technology Park (NSTP) at NUST, H-12.",
      "Pakistani projects delivered include Faisal Town II and Faisal Hills in Islamabad, HMR in Karachi, Lake City in Lahore and DHA Multan Highrise.",
      "A single still render is typically delivered within 5-7 working days of approved inputs.",
      "Services include photorealistic stills, cinematic animation, VR experiences, 360 web tours, interactive property tools and branding.",
      "The studio has completed 270+ projects across 14 countries since 2019, with a team of 40+ based in Islamabad.",
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
