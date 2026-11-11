import type { Locale } from "@/i18n/config";

/**
 * Written content for a project page, on top of the one-line summary every project has
 * (SEO scope items 7 and 12, SEO_MIGRATION.md point 26). The project pages were thin: about 76
 * words each, most of it one sentence repeated on every page with the place swapped. A story
 * gives a page its own overview (the project's keywords used naturally), what the renders show,
 * FAQs (with FAQPage markup) and links to the matching service and country pages.
 *
 * Rules for writing one:
 * - Say only what the images and the project data show. No client names, sizes, years or awards
 *   unless the team has confirmed them.
 * - Keywords from sheet D7 (Mimar.xlsx) go into the heading, the first paragraph, one FAQ and the
 *   search-result title, in normal sentences. Do not repeat them to hit a count. Leave out claims
 *   ("best project in the UAE") and misspellings from the sheet.
 * - Link the service page and the country page once each inside the first paragraph.
 * - FAQs are about this project. At most one general question per page, so 19 pages do not
 *   repeat the same block.
 * - The page H1 stays the project name. A project without a story keeps the old layout.
 */
export type ProjectStory = {
  /** Search-result title (50-60 characters) and description (120-155) for this project. */
  seo: { title: string; description: string };
  /** Replaces the "Hospitality / Residential" spec when that label does not fit the project. */
  typology?: string;
  /** H2 above the overview. Carries the project's main keyword. */
  heading: string;
  /** Overview. `[words](/english-path)` becomes an internal link (the Arabic page gets the /ar URL). */
  paragraphs: string[];
  /**
   * One entry per gallery image (the cover is the hero and has its own alt in project-alt.ts):
   * the caption shown under the image and its alt text, both written from the image itself.
   */
  views: { image: string; title: string; text: string; alt: string }[];
  /** Visible FAQs, also written to FAQPage JSON-LD. Answers must stand alone. */
  faqs: { question: string; answer: string }[];
  /** The service page this project belongs to. The country page is added from the region data. */
  service: { path: string; label: string };
  /** One line above the "Get a quote" / "Book a meeting" buttons after the FAQs. */
  cta: string;
};

type StoryLabels = { related: string; showcase: (title: string) => string; faqs: (title: string) => string };

/** Section headings on a project page with a story. The gallery and FAQ headings are H2s with the project name. */
export const projectStoryLabels: Record<Locale, StoryLabels> = {
  en: { related: "Related services", showcase: (title) => `${title} visual showcase`, faqs: (title) => `${title} FAQs` },
  ar: {
    related: "خدمات ذات صلة",
    showcase: (title) => `العرض البصري لمشروع ${title}`,
    faqs: (title) => `أسئلة شائعة عن ${title}`,
  },
};

const stories: Record<string, Partial<Record<Locale, ProjectStory>>> = {
  "aark-residences": {
    en: {
      seo: {
        title: "Aark Residences Dubai | 3D Rendering Project | Mimar Studios",
        description:
          "3D architectural renders of Aark Residences in Dubai: terraced tower exteriors, balcony detail and a rooftop pool terrace by Mimar Studios.",
      },
      typology: "Residential tower",
      heading: "Aark Residences 3D rendering in Dubai",
      paragraphs: [
        "Aark Residences is a residential development in [Dubai, UAE](/3d-visualization-services-uae), visualized by Mimar Studios as a set of [photorealistic 3D architectural renders](/services/3d-visualization). The set shows the building the way a buyer meets it: the terraced tower from the street at dusk, the balconies and façade up close, and the rooftop pool terrace with the Dubai skyline beyond. Renders like these let a developer market off-plan apartments with images of the finished building long before construction is complete.",
        "Each view answers a different question a buyer asks. The façade views show the proportions of the stepped balconies and the vertical timber fins against the sky. The night view shows how the tower sits in its street and how the lit terraces read from a distance. The terrace view sells the lifestyle: shade, planting, soft seating and the pool edge, with the city as a backdrop. Modern residential rendering works when it feels like a place, not a diagram, and that is how these images were composed.",
      ],
      views: [
        {
          image: "/projects/catalog/aark-residences/image-1.jpg",
          title: "Tower exterior in daylight",
          text: "A low view up the tower: stepped balconies, vertical timber fins and the glass-sided rooftop pool against the sky.",
          alt: "Aark Residences, Dubai: low-angle daylight view of the tower with stepped balconies, timber fins and a glass rooftop pool, 3D architectural visualization",
        },
        {
          image: "/projects/catalog/aark-residences/image-2.jpg",
          title: "Street view at dusk",
          text: "The tower in its street, with lit terraces and the light trails of passing traffic.",
          alt: "Aark Residences, Dubai: the residential tower at dusk with lit terraces and light trails in the street, 3D exterior rendering",
        },
        {
          image: "/projects/catalog/aark-residences/image-3.jpg",
          title: "Façade and balcony detail",
          text: "Glass balustrades, planted terraces and a glimpse of a lit living room through the glazing.",
          alt: "Aark Residences, Dubai: close view of balconies with glass balustrades, planters and a lit living room behind the glazing, 3D architectural visualization",
        },
      ],
      faqs: [
        {
          question: "What did Mimar Studios deliver for Aark Residences?",
          answer:
            "A set of photorealistic 3D architectural renders of the Aark Residences development in Dubai: exterior views in daylight and at dusk, a view of the façade and balcony detail, and a view of the rooftop pool terrace.",
        },
        {
          question: "Why use 3D rendering for a residential development in the UAE?",
          answer:
            "Renders let buyers and investors see the finished building, its terraces and its amenities before construction ends, so a residential development can be marketed early with consistent images for brochures, websites and sales galleries.",
        },
        {
          question: "How do renders like the Aark Residences set help sell off-plan apartments?",
          answer:
            "Off-plan buyers cannot visit the finished building, so the renders show it to them: the daylight and dusk exteriors show the tower and its street, the balcony view shows the quality of the homes, and the rooftop terrace shows the amenities. One consistent set works on property portals, in brochures and in the sales gallery.",
        },
      ],
      service: { path: "/services/3d-visualization", label: "3D visualization services" },
      cta: "Launching an off-plan residential project in the UAE? Tell us about it and we will plan the renders with you.",
    },
    ar: {
      seo: {
        title: "آرك ريزيدنسز دبي | تصور ثلاثي الأبعاد | استوديوهات معمار",
        description:
          "تصورات معمارية ثلاثية الأبعاد لمشروع آرك ريزيدنسز في دبي: واجهات البرج المتدرّج وتفاصيل الشرفات وتراس مسبح السطح من استوديوهات معمار.",
      },
      typology: "برج سكني",
      heading: "تصور ثلاثي الأبعاد لمشروع آرك ريزيدنسز في دبي",
      paragraphs: [
        "آرك ريزيدنسز مشروع سكني في [دبي بالإمارات العربية المتحدة](/3d-visualization-services-uae)، صوّرته استوديوهات معمار في مجموعة من [التصورات المعمارية ثلاثية الأبعاد الواقعية](/services/3d-visualization). تعرض المجموعة المبنى كما سيراه المشتري: البرج المتدرّج من الشارع عند الغسق، وتفاصيل الواجهة والشرفات عن قرب، وتراس المسبح على السطح وخلفه أفق مدينة دبي. وتتيح تصورات كهذه للمطوّر تسويق الشقق على الخارطة بصور للمبنى في شكله النهائي قبل وقت طويل من اكتمال البناء.",
        "صُمّم كل مشهد ليجيب عن سؤال مختلف يطرحه المشتري. تُظهر مشاهد الواجهة نِسَب الشرفات المتدرّجة والزعانف الخشبية العمودية على خلفية السماء. ويُظهر المشهد الليلي كيف يقف البرج في شارعه وكيف تبدو التراسات المضاءة من بعيد. أما مشهد التراس فيعرض نمط الحياة: الظل والنباتات والمقاعد الوثيرة وحافة المسبح، والمدينة في الخلفية. ويكون التصور المعماري السكني الحديث ناجحاً حين يبدو مكاناً حقيقياً لا مجرد مخطط، وبهذا الأسلوب رُكّبت هذه الصور.",
      ],
      views: [
        {
          image: "/projects/catalog/aark-residences/image-1.jpg",
          title: "واجهة البرج في ضوء النهار",
          text: "منظر من الأسفل نحو البرج: الشرفات المتدرّجة والزعانف الخشبية العمودية ومسبح السطح ذو الجوانب الزجاجية على خلفية السماء.",
          alt: "آرك ريزيدنسز، دبي: منظر نهاري من الأسفل للبرج مع الشرفات المتدرّجة والزعانف الخشبية ومسبح السطح الزجاجي، تصور معماري ثلاثي الأبعاد",
        },
        {
          image: "/projects/catalog/aark-residences/image-2.jpg",
          title: "منظر الشارع عند الغسق",
          text: "البرج في شارعه مع تراسات مضاءة وخطوط أضواء السيارات العابرة.",
          alt: "آرك ريزيدنسز، دبي: البرج السكني عند الغسق مع تراسات مضاءة وأضواء السيارات في الشارع، تصور خارجي ثلاثي الأبعاد",
        },
        {
          image: "/projects/catalog/aark-residences/image-3.jpg",
          title: "تفاصيل الواجهة والشرفات",
          text: "حواجز زجاجية وتراسات مزروعة ولمحة عن غرفة معيشة مضاءة من خلف الزجاج.",
          alt: "آرك ريزيدنسز، دبي: لقطة قريبة للشرفات بحواجزها الزجاجية ونباتاتها وغرفة معيشة مضاءة خلف الزجاج، تصور معماري ثلاثي الأبعاد",
        },
      ],
      faqs: [
        {
          question: "ماذا قدّمت استوديوهات معمار لمشروع آرك ريزيدنسز؟",
          answer:
            "قدّمت مجموعة من التصورات المعمارية ثلاثية الأبعاد الواقعية لمشروع آرك ريزيدنسز في دبي: مشاهد خارجية في النهار وعند الغسق، ومشهداً لتفاصيل الواجهة والشرفات، ومشهداً لتراس مسبح السطح.",
        },
        {
          question: "لماذا يُستخدم التصور ثلاثي الأبعاد للمشاريع السكنية في الإمارات؟",
          answer:
            "يتيح التصور للمشترين والمستثمرين رؤية المبنى النهائي وتراساته ومرافقه قبل اكتمال البناء، فيمكن تسويق المشروع السكني مبكراً بصور متسقة للكتيبات والمواقع الإلكترونية وصالات المبيعات.",
        },
        {
          question: "كيف تساعد تصورات مثل مجموعة آرك ريزيدنسز في بيع الشقق على الخارطة؟",
          answer:
            "لا يستطيع مشتري العقار على الخارطة زيارة المبنى المكتمل، فتعرضه التصورات بدلاً منه: المشاهد الخارجية في النهار وعند الغسق تُظهر البرج وشارعه، ومشهد الشرفات يُظهر جودة الوحدات، وتراس السطح يُظهر المرافق. وتصلح مجموعة واحدة متسقة لمنصات العقارات والكتيبات وصالة المبيعات.",
        },
      ],
      service: { path: "/services/3d-visualization", label: "خدمات التصور ثلاثي الأبعاد" },
      cta: "تطلق مشروعاً سكنياً على الخارطة في الإمارات؟ أخبرنا عنه وسنخطط معك للتصورات المطلوبة.",
    },
  },
};

export function getProjectStory(slug: string, lang: Locale): ProjectStory | undefined {
  return stories[slug]?.[lang === "ar" ? "ar" : "en"];
}
