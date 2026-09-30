// Sub-service pages under /services/branding/{slug} and /services/marketing/{slug}.
// The old WordPress site listed these as sections of its Branding and Marketing
// pages rather than separate URLs, so the copy, FAQs and portfolio images are
// carried over from those sections (see SEO_MIGRATION.md); only the layout
// follows the new design, the same as the architectural-design sub-pages.

export type BrandingMarketingParent = "branding" | "marketing";

export type BrandingMarketingSubService = {
  parent: BrandingMarketingParent;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  title: string;
  tagline: string;
  intro: string[];
  hero: string;
  introImage: string;
  /** Portfolio images from the old page's "Project Types" gallery for this category. */
  gallery: { src: string; alt: string }[];
  process: { step: string; items: string }[];
  benefits: [string, string][];
  benefitsImage: string;
  faqs: { question: string; answer: string }[];
  /** Heading is split in two: the second part renders in the accent colour. */
  cta: { heading: [string, string]; body: string };
};

const brandingProcess = [
  { step: "Market Research", items: "We start by conducting market research to understand your audience, competitors and position in the market." },
  { step: "Brand Values & Mission", items: "We determine the brand values and mission that everything else is built on." },
  { step: "Visual Identity", items: "We create the visual identity: logo, color palette and typography." },
  { step: "Branding Kits & Collateral", items: "We develop branding kits and collateral based on the client’s custom requirements." },
];

const brandingBenefits: [string, string][] = [
  ["Tailored Branding Kits", "Our branding experts craft personalized strategies and visual elements like logos, color schemes, and typography to highlight your brand and meet business goals."],
  ["Brand Cohesion", "Our branding services create a cohesive brand image, aligning visual and verbal elements to enhance your market presence effectively."],
  ["Creative Excellence", "At mimAR, our team delivers innovative and detailed branding solutions that captivate and engage audiences, elevating your brand's presence."],
];

const brandingFaqs = {
  process: { question: "What does the branding process involve?", answer: "Our branding process typically involves conducting market research, determining brand values and missions, creating a visual identity (logo, color palette, typography), and then developing branding kits and collateral based on the client’s custom requirements." },
  timeline: { question: "How long will it take to create branding collateral?", answer: "The timeline for different branding services varies depending on the complexity of the project and the scope of branding services required. Factors such as research, strategy development, design iterations, and client feedback can influence the duration of the process." },
  services: { question: "What branding services does Mimar offer?", answer: "Mimar provides comprehensive branding services tailored to your needs, including logo design, stationery design, marketing collateral, and more." },
  custom: { question: "Can Mimar create custom branding solutions for my business?", answer: "Absolutely! Mimar takes a personalized approach to branding, ensuring that each solution is tailored to your unique brand identity and business objectives." },
  benefit: { question: "How can Mimar's branding services benefit my business?", answer: "Mimar's branding services can help elevate your brand image, increase brand recognition, and create a lasting impression on your target audience, ultimately driving business growth and success." },
};

const brandingCta: BrandingMarketingSubService["cta"] = {
  heading: ["Elevate your brand", "to new heights."],
  body: "Let us help you create a distinctive and memorable brand identity.",
};

const marketingProcess = [
  { step: "Identifying Target Audience", items: "First, we figure out who exactly we want to reach by looking at their details like age, likes, habits, and what they want. This means doing research to create clear personas of our ideal customers." },
  { step: "Content Creation", items: "Next, we make interesting content that talks directly to our audience's needs and likes. This includes everything from blog posts and social media updates to newsletters and ads." },
  { step: "Implementation & Execution", items: "Now, we put our marketing plans into action. This includes posting on social media, updating websites, and running online ads. Our marketing team uses smart strategies to make this happen." },
  { step: "Performance Analysis", items: "Finally, we check how well our marketing is working by looking at things like website visits, how people interact with our content, sales, and overall success. This helps us make better marketing plans in the future." },
];

const marketingBenefits: [string, string][] = [
  ["Boosted Online Presence", "Our Digital Marketing Services boost your online presence with custom SEO, social media campaigns, and engaging content to attract more customers."],
  ["Insightful Analytics", "Using advanced analytics, we offer insights into audience behavior, refining strategies for better performance and ROI on marketing investments."],
  ["Unified Digital Strategy", "Our integrated marketing solutions, including email, PPC, and content marketing, ensure a cohesive online presence that boosts conversions and customer loyalty."],
];

const marketingFaqs = {
  seoSem: { question: "What is the difference between SEO and SEM?", answer: "SEO (Search Engine Optimization) and SEM (Search Engine Marketing) are both strategies to improve a website's visibility in search engine results. SEO focuses on organic, non-paid methods to increase visibility, while SEM involves paid advertising campaigns." },
  social: { question: "What is social media marketing and why it’s needed?", answer: "Social media marketing refers to the use of social media platforms to promote products, services, or brands by creating and sharing content and using targeted advertising campaigns. It helps businesses to connect with their target market and generate leads." },
  web: { question: "Do you offer custom web development?", answer: "Yes, at mimAR Studios, we offer custom web development services as well as WordPress development. No matter what kind of web development project you have, our skilled developers can provide custom web development solutions that are functional, and user-friendly." },
  ranking: { question: "Can Mimar help improve my website's search engine ranking?", answer: "Absolutely! Mimar's SEO experts can optimize your website to improve its visibility on search engines, increase organic traffic, and generate more leads for your architectural business." },
  strategy: { question: "What is the process for creating a digital marketing strategy with Mimar?", answer: "Mimar's digital marketing experts will work closely with you to understand your business goals and target audience, conduct a thorough analysis of your current online presence, and develop a customized digital marketing strategy to help you achieve your objectives." },
  integration: { question: "How does Mimar integrate digital marketing with its 3D architectural visualization services?", answer: "While Mimar specializes in 3D architectural visualization, we also provide digital marketing services tailored to the needs of architects, real estate developers, and interior designers, helping them reach their target audience effectively." },
};

const marketingCta: BrandingMarketingSubService["cta"] = {
  heading: ["Expand your customer base,", "achieve your goals."],
  body: "Our marketing strategists are dedicated to promoting your brand in the competitive market, utilizing the latest marketing trends. With a singular focus on expanding your customer base and achieving desired outcomes, you can trust us to implement cutting-edge marketing campaigns for your brand.",
};

const img = (parent: BrandingMarketingParent, slug: string, file: string) => `/service-media/${parent}/${slug}/${file}.webp`;

const subServices: BrandingMarketingSubService[] = [
  {
    parent: "branding",
    slug: "branding-collateral",
    seoTitle: "Branding Collateral Design Services | Mimar Studios",
    seoDescription: "Branding collateral from Mimar Studios: logo design, color palettes, catalogs and other digital and physical assets crafted to enhance your brand identity.",
    title: "Branding Collateral",
    tagline: "Visually captivating assets that represent your brand",
    intro: [
      "Branding collateral includes a range of visually captivating digital and physical assets that represent a brand.",
      "This can include logo designing, color palettes, catalogs, and more, all crafted to enhance your brand identity.",
    ],
    hero: img("branding", "branding-collateral", "bahria-town-brand-identity"),
    introImage: img("branding", "branding-collateral", "olivia-residences-brand-book"),
    gallery: [
      { src: img("branding", "branding-collateral", "serene-tower-brand-identity"), alt: "Serene Tower brand identity by Mimar Studios" },
      { src: img("branding", "branding-collateral", "olivia-residences-brand-identity"), alt: "Olivia Residences brand identity by Mimar Studios" },
      { src: img("branding", "branding-collateral", "aark-developers-brand-identity"), alt: "AARK Developers brand identity by Mimar Studios" },
      { src: img("branding", "branding-collateral", "olivia-residences-brand-book"), alt: "Olivia Residences brand book by Mimar Studios" },
      { src: img("branding", "branding-collateral", "bahria-town-brand-identity"), alt: "Bahria Town branding mockup by Mimar Studios" },
    ],
    process: brandingProcess,
    benefits: brandingBenefits,
    benefitsImage: img("branding", "branding-collateral", "olivia-residences-brand-identity"),
    faqs: [brandingFaqs.process, brandingFaqs.services, brandingFaqs.timeline, brandingFaqs.custom],
    cta: brandingCta,
  },
  {
    parent: "branding",
    slug: "stationery",
    seoTitle: "Stationery Design Services | Mimar Studios",
    seoDescription: "Branded stationery design from Mimar Studios: business cards, letterheads, notepads, envelopes and other everyday items that reflect your brand identity.",
    title: "Stationery",
    tagline: "Personalized, branded materials for daily business use",
    intro: [
      "Stationery design involves creating personalized and branded materials for daily business use.",
      "This includes business card making, letterheads, notepads, envelopes, and other essential stationery items that reflect your brand identity.",
    ],
    hero: img("branding", "stationery", "serene-tower-stationery"),
    introImage: img("branding", "stationery", "gardenia-living-stationery"),
    gallery: [
      { src: img("branding", "stationery", "gardenia-living-stationery"), alt: "Gardenia Living stationery design by Mimar Studios" },
      { src: img("branding", "stationery", "serene-tower-stationery"), alt: "Serene Tower stationery design by Mimar Studios" },
    ],
    process: brandingProcess,
    benefits: brandingBenefits,
    benefitsImage: img("branding", "stationery", "serene-tower-stationery"),
    faqs: [brandingFaqs.services, brandingFaqs.process, brandingFaqs.custom, brandingFaqs.benefit],
    cta: brandingCta,
  },
  {
    parent: "branding",
    slug: "marketing-collateral",
    seoTitle: "Marketing Collateral Design Services | Mimar Studios",
    seoDescription: "Marketing collateral from Mimar Studios: brochures, flyers, billboards and other digital and physical materials that communicate your brand to your audience.",
    title: "Marketing Collateral",
    tagline: "Materials that promote your brand effectively",
    intro: [
      "Marketing collateral is crucial for promoting your brand effectively.",
      "It involves creating both digital and physical materials like brochures, flyers, and billboards as part of the branding process. These materials help communicate your brand identity and values to your target audience.",
    ],
    hero: img("branding", "marketing-collateral", "olivia-residences-brochure"),
    introImage: img("branding", "marketing-collateral", "serene-tower-marketing-collateral"),
    gallery: [
      { src: img("branding", "marketing-collateral", "serene-tower-marketing-collateral"), alt: "Serene Tower marketing collateral by Mimar Studios" },
      { src: img("branding", "marketing-collateral", "olivia-residences-marketing-collateral"), alt: "Olivia Residences marketing collateral by Mimar Studios" },
      { src: img("branding", "marketing-collateral", "olivia-residences-brochure"), alt: "Olivia Residences brochure spread by Mimar Studios" },
      { src: img("branding", "marketing-collateral", "aurum-one-marketing-collateral"), alt: "Aurum One marketing collateral by Mimar Studios" },
      { src: img("branding", "marketing-collateral", "beverly-hills-marketing-collateral"), alt: "Beverly Hills marketing collateral by Mimar Studios" },
    ],
    process: brandingProcess,
    benefits: brandingBenefits,
    benefitsImage: img("branding", "marketing-collateral", "aurum-one-marketing-collateral"),
    faqs: [brandingFaqs.services, brandingFaqs.timeline, brandingFaqs.benefit, brandingFaqs.custom],
    cta: brandingCta,
  },
  {
    parent: "marketing",
    slug: "social-media-marketing",
    seoTitle: "Social Media Marketing Services | Mimar Studios",
    seoDescription: "Social media marketing from Mimar Studios: content and targeted ad campaigns on platforms like Facebook and YouTube that engage customers and generate leads.",
    title: "Social Media Marketing",
    tagline: "Engage potential customers where they already spend their time",
    intro: [
      "This type of marketing uses platforms like YouTube and Facebook to engage potential customers and promote the products or services of a brand.",
      "Social media marketing refers to the use of social media platforms to promote products, services, or brands by creating and sharing content and using targeted advertising campaigns. It helps businesses to connect with their target market and generate leads.",
    ],
    hero: img("marketing", "social-media-marketing", "social-media-ad-1"),
    introImage: "/service-media/marketing-social.png",
    gallery: [
      { src: img("marketing", "social-media-marketing", "social-media-ad-1"), alt: "Park One social media posts by Mimar Studios" },
      { src: img("marketing", "social-media-marketing", "social-media-ad-2"), alt: "Real estate social media ad by Mimar Studios" },
    ],
    process: marketingProcess,
    benefits: marketingBenefits,
    benefitsImage: img("marketing", "social-media-marketing", "social-media-ad-2"),
    faqs: [marketingFaqs.social, marketingFaqs.strategy, marketingFaqs.integration],
    cta: marketingCta,
  },
  {
    parent: "marketing",
    slug: "web-development",
    seoTitle: "Web Development Services | Mimar Studios",
    seoDescription: "Custom and WordPress web development from Mimar Studios: functional, user-friendly websites that improve your brand presence for customers.",
    title: "Web Development",
    tagline: "Websites that improve your brand presence",
    intro: [
      "Web development is the process of designing and developing websites by the use of programming languages to help businesses improve their brand presence for customers.",
      "At mimAR Studios, we offer custom web development services as well as WordPress development. No matter what kind of web development project you have, our skilled developers can provide custom web development solutions that are functional, and user-friendly.",
    ],
    hero: img("marketing", "web-development", "serene-tower-website"),
    introImage: "/service-media/marketing-web.png",
    gallery: [
      { src: img("marketing", "web-development", "serene-tower-website"), alt: "Serene Tower website designed and developed by Mimar Studios" },
      { src: img("marketing", "web-development", "real-estate-website-2"), alt: "Real estate website developed by Mimar Studios" },
      { src: img("marketing", "web-development", "real-estate-website-3"), alt: "Real estate website developed by Mimar Studios" },
      { src: img("marketing", "web-development", "real-estate-website-4"), alt: "Real estate website developed by Mimar Studios" },
    ],
    process: marketingProcess,
    benefits: marketingBenefits,
    benefitsImage: img("marketing", "web-development", "real-estate-website-3"),
    faqs: [marketingFaqs.web, marketingFaqs.strategy, marketingFaqs.ranking],
    cta: marketingCta,
  },
  {
    parent: "marketing",
    slug: "seo",
    seoTitle: "SEO Services | Mimar Studios",
    seoDescription: "SEO services from Mimar Studios: optimize your website to improve its visibility on search engines, increase organic traffic and generate more leads.",
    title: "SEO Services",
    tagline: "Visibility and ranking in search engine results",
    intro: [
      "Search Engine Optimization (SEO) is an essential practice used for optimizing websites to enhance their visibility and ranking in search engine results by using organic content.",
      "Mimar's SEO experts can optimize your website to improve its visibility on search engines, increase organic traffic, and generate more leads for your architectural business.",
    ],
    hero: "/service-media/marketing-seo.png",
    introImage: img("marketing", "seo", "seo-keyword-research"),
    gallery: [{ src: img("marketing", "seo", "seo-keyword-research"), alt: "SEO keyword research dashboard" }],
    process: marketingProcess,
    benefits: marketingBenefits,
    benefitsImage: "/service-media/marketing-seo.png",
    faqs: [marketingFaqs.seoSem, marketingFaqs.ranking, marketingFaqs.strategy],
    cta: marketingCta,
  },
];

export const brandingMarketingSubServices: Record<BrandingMarketingParent, Record<string, BrandingMarketingSubService>> = {
  branding: Object.fromEntries(subServices.filter((s) => s.parent === "branding").map((s) => [s.slug, s])),
  marketing: Object.fromEntries(subServices.filter((s) => s.parent === "marketing").map((s) => [s.slug, s])),
};

export function brandingMarketingSubServicePath(parent: BrandingMarketingParent, slug: string) {
  return `/services/${parent}/${slug}`;
}

export const brandingMarketingSubServicePaths = subServices.map((s) => brandingMarketingSubServicePath(s.parent, s.slug));
