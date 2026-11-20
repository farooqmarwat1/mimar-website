import { projects, type Project } from "./site-config";

/**
 * Region landing pages (UAE, USA, KSA, Pakistan) and the Middle East hub.
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
  /** Short page name for breadcrumbs, buttons and the Service schema - the H1 is a full keyword phrase. */
  label: string;
  intro: string;
  /** H2 over the market copy, from Deliverable 5's heading plan. */
  marketHeading?: string;
  /** H3 with one supporting paragraph under the market copy, from Deliverable 5's heading plan. */
  localHeading?: { heading: string; body: string };
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
  /** Keys of the country pages a hub page links down to (the Middle East links the UAE and Saudi pages). */
  relatedRegions?: string[];
  /**
   * City hub: an H2 with a short paragraph, then one H3 per city the market is
   * searched by, so a city query ("3d rendering san francisco") lands on this
   * page and not the home page. Only the USA has one (Deliverable 4).
   */
  cityHub?: {
    heading: string;
    body: string;
    cities: { city: string; heading: string; body: string }[];
  };
};

export const regions: Record<string, Region> = {
  uae: {
    path: "/3d-visualization-services-uae",
    name: "UAE",
    city: "Dubai",
    seoTitle: "3D Rendering Services in Dubai & UAE | Mimar Studios",
    // Description, H1, H2 and H3 from Deliverable 5 (19 Nov 2026, SEO_MIGRATION.md point 35).
    description:
      "Looking for top-rated 3D visualization companies in Dubai? Mimar Studios delivers photorealistic 3D rendering, animations & VR tours for UAE developers.",
    keywords: [
      "3d visualizer",
      "3d rendering dubai",
      "3d visualization companies in dubai",
      "architectural visualization services uae",
      "3d rendering services dubai",
      "3d architectural visualization dubai",
    ],
    h1: "Top 3D Visualizer & Architectural Rendering Services in the UAE",
    label: "3D Visualization Services UAE",
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
    // Deliverable 5 asked for "Glass-Facade Sunlight Simulation"; "studies" describes what a render
    // actually shows (light at a chosen time of day) without implying an engineering analysis.
    marketHeading: "Off-Plan Real Estate Marketing & Glass-Facade Sunlight Studies",
    localHeading: {
      heading: "Serving Luxury Developers Across Dubai, Abu Dhabi & Sharjah",
      body: "Aark Residences, Amer Al Ghurair, Divine Golf, Divine Residencia, H&S and Karma Trinity are all Dubai developments we visualized. Facades are rendered at the times of day buyers will see them, so glazing, reflections and shade read as they will on site.",
    },
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
    // Title, description and H1 from Deliverable 4 (19 Nov 2026, SEO_MIGRATION.md
    // point 32): the page sat at position 52.7 with 0 clicks in 12 months while
    // US city queries landed on the home page instead.
    seoTitle: "3D Architectural Rendering Services USA | Mimar Studios",
    description:
      "Premier 3D architectural rendering & visualization services across San Francisco, Dallas, NY, Miami & LA. Imperial CAD precision & NDA security. Get a quote!",
    // These are queries the site already ranks 1-2 for in the US while earning
    // almost no clicks - 33,251 impressions and 7 clicks in the 28 days to
    // 17 Oct 2026. The page names the cities explicitly so the listing matches
    // what was actually searched. The San Francisco and outsourcing queries
    // were added from Deliverable 4 (768 + 734 impressions on the home page).
    keywords: [
      "3d architectural rendering services usa",
      "3d visualization services usa",
      "real estate rendering new york",
      "3d rendering services usa",
      "architectural visualization studio usa",
      "outsource 3d rendering usa",
      "3d rendering san francisco",
      "architectural rendering san francisco",
      "3d rendering services new york",
      "3d rendering services los angeles",
      "3d rendering services dallas",
    ],
    // Deliverable 5 proposed "High-End 3D Architectural Visualization Services in the USA"; the
    // Deliverable 4 H1 stays because it carries "rendering" too. Its H2/H3 are used below.
    h1: "Photorealistic 3D Architectural Rendering & Visualization Services in the USA",
    label: "3D Architectural Rendering Services USA",
    intro:
      "Photorealistic rendering, animation and virtual tours for developers and architects in New York, Los Angeles, San Francisco, Dallas, Houston and Miami.",
    projectSlugs: ["nomi-downtown", "the-garden-residences"],
    marketCopy:
      "American developers sell on renderings long before a foundation is poured - to lenders, to planning boards, and to buyers deciding off a brochure. Mimar Studios produces that imagery in-house for teams in New York, Los Angeles, San Francisco, Dallas, Houston and Miami: photorealistic stills, cinematic animation, 360 tours and interactive tools, delivered to US drawing standards and on US schedules.",
    marketHeading: "Accelerating US Pre-Sales, Lender Decks & Municipal Zoning Approvals",
    localHeading: {
      heading: "Imperial CAD Precision & EST/PST Overlap Across NY, Miami, Dallas, LA & SF",
      body: "We model straight from AutoCAD and Revit drawings in feet and inches, answer inside your working day on both coasts, and sign an NDA before an unreleased project leaves your office.",
    },
    // Deliverable 4, step 2: the cities US searchers name, each with its own
    // subheading. The opening paragraph is the consultant's copy.
    cityHub: {
      heading: "Outsource 3D Architectural Rendering for US Developers & Architects",
      body: "Whether you are securing municipal zoning approvals in San Francisco, pitching investors in New York, or launching pre-construction sales in Dallas and Miami, Mimar Studios integrates seamlessly into your US workflow. Our team reads AutoCAD and Revit files natively in imperial units (feet and inches), works with EST/PST business hour overlap, and protects every unreleased development under strict NDA agreements.",
      cities: [
        {
          city: "San Francisco",
          heading: "3D Architectural Rendering in San Francisco",
          body: "Photorealistic exterior and street-level renders for Bay Area planning submissions, community meetings and design review, with a Mission Street location in the city.",
        },
        {
          city: "Dallas",
          heading: "3D Rendering Services in Dallas",
          body: "Pre-construction sales imagery, amenity renders and fly-throughs for Dallas-Fort Worth developers, from our location on Elm Street downtown.",
        },
        {
          city: "New York",
          heading: "3D Rendering for New York Developers",
          body: "Investor-deck and lender-package visuals for New York residential and mixed-use towers, coordinated from our location at 25 Broadway.",
        },
        {
          city: "Miami",
          heading: "3D Rendering for Miami Pre-Construction Sales",
          body: "Off-plan marketing renders, cinematics and 360 tours for South Florida launches - the work behind Nomi Downtown, a mixed-use development in Miami.",
        },
        {
          city: "Los Angeles",
          heading: "Architectural Visualization in Los Angeles",
          body: "Exterior, interior and aerial renders for Los Angeles residential and hospitality projects, with a location on East 2nd Street.",
        },
        {
          city: "Houston",
          heading: "3D Rendering Services in Houston",
          body: "Photorealistic renders and animation for Houston residential, commercial and mixed-use developments, from our Main Street location.",
        },
      ],
    },
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
        question: "How do US architects outsource 3D rendering to Mimar Studios?",
        answer:
          "Send your AutoCAD or Revit files, plans and elevations in feet and inches with a short brief, and we sign an NDA before work starts. We return an itemised quote in USD, share a greyscale model for comment, then deliver the final renders. Our hours overlap the US East Coast afternoon and West Coast morning, so feedback is usually actioned overnight.",
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
    seoTitle: "3D Rendering Services in Saudi Arabia | Mimar Studios",
    // Description, H1, H2 and H3 from Deliverable 5 (SEO_MIGRATION.md point 35).
    description:
      "Mimar Studios delivers top 3D visualization services for real estate developers in Riyadh, Jeddah & KSA mega-projects. Request a quote today.",
    // Unlike the UAE and US pages, these are not queries the site already
    // ranks for. Saudi search currently reaches the site almost entirely on
    // brand terms - of 276 Saudi queries in the six months to 17 Oct 2026,
    // exactly one named a Saudi city. This page is building demand, not
    // capturing it, and should be judged on that.
    keywords: [
      "3d visualization saudi arabia",
      "3d rendering services saudi arabia",
      "architectural rendering riyadh",
      "wafi off-plan renders",
      "architectural visualization riyadh",
      "3d rendering company jeddah",
      "architectural rendering saudi arabia",
      "3d visualization riyadh",
    ],
    h1: "3D Visualization & Architectural Rendering Services in Saudi Arabia",
    label: "3D Visualization Services Saudi Arabia",
    intro:
      "Photorealistic rendering, animation and virtual tours for developers building in Riyadh, Jeddah and across the Kingdom.",
    projectSlugs: ["nana-222"],
    marketCopy:
      "Saudi Arabia is building faster than anywhere else in the region, and most of it is sold, approved and funded from imagery long before the site is cleared. Mimar Studios works with developers and architects in Riyadh and Jeddah from an office in Jeddah, producing renderings, cinematics, VR tours and 3D on plan in-house - in Gulf working hours, and quoted in riyals.",
    // Deliverable 5 asked for "Wafi & REGA Compliant Visual Assets"; compliance is the developer's
    // licence, not something a render can have, so the copy says what we make for those submissions.
    // It also listed NEOM, where we have no project, so the H3 names the cities we work in.
    marketHeading: "Visual Assets for Wafi Off-Plan Sales & Vision 2030 Developments",
    localHeading: {
      heading: "Masterplan & Commercial Rendering Across Riyadh & Jeddah",
      body: "Off-plan projects in the Kingdom are sold through Wafi, the off-plan sales programme of the Real Estate General Authority (REGA). We produce the renders, films and tours developers market them with - NANA 222 in Riyadh among them - from our office in Jeddah, to the brief and formats your Wafi or REGA submission asks for.",
    },
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
        question: "Can you produce renders for Wafi off-plan sales?",
        answer:
          "Yes. Developers selling off-plan through Wafi, the programme of the Real Estate General Authority (REGA), market their projects with renders, cinematics and 360 tours. We produce them to the brief and formats your Wafi or REGA submission asks for; the licence and approval stay with the developer.",
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
    seoTitle: "3D Architecture & Rendering Firm in Pakistan | Mimar Studios",
    // Description, H1, H2 and H3 from Deliverable 5 (SEO_MIGRATION.md point 35), the description
    // shortened to fit 160 characters. The title stays: it already carries "Pakistan".
    description:
      "Professional 3D visualization services in Pakistan. Mimar Studios offers architectural rendering for residential & commercial projects from Islamabad.",
    // Pakistan is the opposite problem to the US. Brand terms do well -
    // "mimar" alone is 140 clicks at 33% CTR - but the non-brand local
    // queries below sit on page 2 to 6, so they need rankings, not a better
    // title. Note what actually earns impressions here: "architecture firm"
    // and "branding", more than "3d rendering".
    keywords: [
      "3d visualization services pakistan",
      "3d visualization services islamabad",
      "architecture firms in pakistan",
      "architectural design firm in pakistan",
      "3d rendering services pakistan",
      "branding companies in pakistan",
      "architectural visualization islamabad",
    ],
    h1: "3D Visualization Services in Pakistan",
    label: "3D Visualization Services Pakistan",
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
    marketHeading: "Precision Architectural Rendering for Residential & Commercial Developments",
    localHeading: {
      heading: "Local Islamabad Studio Expertise & PKR Project Consultation",
      body: "Meet the team at the studio in the National Science & Technology Park, NUST, H-12, talk the project through in person, and get an itemised quote in rupees.",
    },
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
      address: "3407, National Science & Technology Park (NSTP), NUST, H-12, Islamabad 44000, Pakistan",
      phone: "+92 300 511 2990",
      geo: { latitude: 33.6461, longitude: 72.9932 },
    },
    // Suite 3407, as in site-config: the owner confirmed 3407 on 19 Nov 2026.
    // The Business Profile still said 1403 that day and has to be corrected
    // there so the name, address and phone match everywhere Google reads them.
    locations: [
      {
        city: "Islamabad",
        streetAddress: "3407, National Science & Technology Park (NSTP), NUST, H-12",
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
  middleEast: {
    // The old WordPress "3D Visualization - Middle East" page, served by the
    // [...legacy] article route until 16 Nov 2026 (SEO_MIGRATION.md point 30).
    // Path unchanged. It had 34 impressions and no clicks in the three months
    // to 4 Nov, so its title could change. This is the hub for the Gulf: it
    // lists every UAE, Saudi and Oman project and links down to the UAE and
    // Saudi pages. Keep it last in this object: a project's country page is the
    // first region that lists it, so UAE and Saudi projects keep their own.
    path: "/3d-visualization-middle-east",
    name: "Middle East",
    city: "Dubai & Jeddah",
    seoTitle: "3D Visualization Services in the Middle East | Mimar Studios",
    // Description, H1, H2 and H3 from Deliverable 5 (SEO_MIGRATION.md point 35). Deliverable 5 marks
    // this hub "to confirm"; the owner asked for it on 16 Nov (point 30), so it stays live.
    description:
      "Discover premier 3D visualization services across the Middle East. Mimar Studios provides architectural rendering for GCC commercial & residential projects.",
    // Sheet D5 (Mimar.xlsx, "Middle East (Regional Hub)").
    keywords: [
      "3d visualization services middle east",
      "3d rendering companies in middle east",
      "architectural visualization gcc",
      "architectural rendering middle east",
      "3d rendering gcc",
    ],
    h1: "3D Visualization & Architectural Rendering Services Across the Middle East",
    label: "3D Visualization Services Middle East",
    // Sheet D5: "Link to UAE and KSA sub-pages".
    relatedRegions: ["uae", "saudiArabia"],
    intro:
      "Photorealistic rendering, animation and virtual tours for developers across the UAE, Saudi Arabia, Oman and the wider Gulf.",
    projectSlugs: [
      "karma-trinity",
      "nana-222",
      "amerat-park",
      "aark-residences",
      "amer-al-ghurair",
      "divine-golf",
      "divine-residencia",
      "h-and-s",
    ],
    marketCopy:
      "Across the Gulf, developments are sold, approved and funded from imagery long before they are built. Mimar Studios began as a 3D architectural visualization studio in Pakistan and now works with developers, architects and real estate teams in the UAE, Saudi Arabia and Oman from locations in Dubai and Jeddah, producing renderings, cinematics, VR tours, property explorers and 3D on plan in-house.",
    // Deliverable 5's H3 named Qatar, Bahrain and Kuwait, where we have no projects; it names the
    // countries we have delivered in instead.
    marketHeading: "Cross-Border GCC Visualization Solutions for Regional Developers",
    localHeading: {
      heading: "Unified Delivery Across the UAE, Saudi Arabia, Oman & the Wider GCC",
      body: "One team across Dubai, Jeddah and Islamabad handles every market, so a developer with projects in more than one Gulf country gets the same pipeline, the same look and one point of contact. The UAE and Saudi Arabia have their own pages, linked below.",
    },
    // The six services the old page listed, one real sentence each.
    services: [
      {
        title: "Renders",
        body: "Photorealistic interior and exterior stills of a development, from the hero view for a launch to the full set for brochures and portals.",
      },
      {
        title: "Cinematics",
        body: "Walkthrough and fly-through films that show an off-plan project in motion, with its setting, amenities and homes.",
      },
      {
        title: "Property Explorer",
        body: "An interactive tool that lets buyers browse a development, its buildings and its available units on screen.",
      },
      {
        title: "3D on Construction Site",
        body: "The finished building shown on its real site, so a project under construction can be marketed as it will look.",
      },
      {
        title: "VR 360 Tours",
        body: "Virtual tours that let buyers and investors walk through a unit or an amenity before it is built, on site or from abroad.",
      },
      {
        title: "3D on Plan",
        body: "Floor plans turned into furnished 3D views, so buyers can read a layout at a glance.",
      },
    ],
    // From the old page's "Why choose us" and "Our benefits", without the claims
    // nobody can check (a guaranteed result, a reply within an hour).
    reasons: [
      {
        title: "Advanced technology",
        body: "We work with the latest 3D tools and VR/AR technology. Advanced software and innovative technology are the key to our 3D visualization and rendering services.",
      },
      {
        title: "Extraordinary results",
        body: "Whether it is rendering, cinematics, 3D on plan or VR tours, our team of 3D visual artists works to deliver the finest results for your real estate project.",
      },
      {
        title: "Prompt response",
        body: "We know how valuable your time is. Contact our team any time for a free quote and we will get back to you quickly with the information you need.",
      },
      {
        title: "Professionalism",
        body: "Let the 3D specialists at Mimar Studios handle your architectural and real estate projects with professionalism and expertise.",
      },
      {
        title: "Commitment",
        body: "We make your project stand out in a competitive market by being fully committed to it and sharing progress with honesty and integrity.",
      },
      {
        title: "Affordability",
        body: "High-quality 3D visualization at rates that make sense for developers across the Gulf, quoted per project in AED or SAR.",
      },
    ],
    office: {
      city: "Dubai",
      country: "United Arab Emirates",
      address: "Dubai, United Arab Emirates",
      phone: "+971 54 146 5887",
      geo: { latitude: 25.2048, longitude: 55.2708 },
    },
    // The same verified locations as the UAE and Saudi pages.
    locations: [
      {
        city: "Dubai",
        streetAddress: "WeWork, One Central, 8th & 9th Floor, The Offices 4, Dubai World Trade Centre",
        countryCode: "AE",
        phone: "+971 58 536 1858",
        geo: { latitude: 25.2246, longitude: 55.2874 },
        gbpUrl: "https://share.google/zExBKdwTHeYWP6xBc",
      },
      {
        city: "Jeddah",
        streetAddress: "Prince Sultan Branch Rd, Al-Mohammadiyah",
        postalCode: "23625",
        countryCode: "SA",
        phone: "+966 59 743 9044",
        geo: { latitude: 21.581, longitude: 39.157 },
      },
    ],
    currency: "AED or SAR",
    compliance: [
      "Gulf working hours, with overlap into European and Asian schedules",
      "Quotes in AED or SAR, per project",
      "NDAs signed for unreleased developments as standard",
    ],
    // The Gulf clients' quotes from the old WordPress UAE page (sheet D5 asked
    // for regional testimonials here).
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
        question: "Which Middle East countries do you work in?",
        answer:
          "Our delivered projects in the region are in the UAE (Aark Residences, Amer Al Ghurair, Divine Golf, Divine Residencia, H&S and Karma Trinity in Dubai), Saudi Arabia (NANA 222 in Riyadh) and Oman (Amerat Park in Muscat). We work with developers and architects across the GCC.",
      },
      {
        question: "Do you have offices in the Middle East?",
        answer:
          "Yes. We have a location in Dubai at One Central, Dubai World Trade Centre, and an office in Jeddah, Saudi Arabia, alongside the studio in Islamabad.",
      },
      {
        question: "How much do 3D visualization services cost in the GCC?",
        answer:
          "Cost depends on the number of views, the level of detail, the scale of the development and the turnaround. Pricing is quoted per project in AED or SAR. Send us your drawings and a short brief and we will return an itemised quote.",
      },
      {
        question: "Which 3D visualization services do you offer in the Middle East?",
        answer:
          "Photorealistic renders, cinematic walkthroughs, property explorers, 3D on construction site, VR 360 tours and 3D on plan, all produced in-house for developers, architects and real estate teams in the region.",
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
      "Mimar Studios provides 3D architectural visualization, rendering, animation and virtual tours to developers and architects across the Middle East.",
      "Middle East projects delivered include six developments in Dubai, NANA 222 in Riyadh and Amerat Park in Muscat.",
      "The studio has locations in Dubai and Jeddah, and its main studio in Islamabad, Pakistan.",
      "A single still render is typically delivered within 5-7 working days of approved inputs.",
      "The studio has completed 270+ projects across 14 countries since 2019.",
    ],
  },
};

/** Projects in site-config that belong to a region, in listed order. */
/** Currency each market is quoted in (the region FAQs say "quoted per project in AED/SAR/PKR/USD"). */
export const localCurrency: Record<string, string> = { AE: "AED", SA: "SAR", PK: "PKR", US: "USD" };

export function regionProjects(region: Region): Project[] {
  return region.projectSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
}

export const regionList = Object.values(regions);
