import type { Locale } from "@/i18n/config";

type ServicesCopy = {
  title: string;
  description: string;
  keywords: string[];
  home: string;
  breadcrumbName: string;
  itemListName: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  body: string;
  workEyebrow: string;
  workHeading1: string;
  workHeading2: string;
  workBody: string;
  closingHeading1: string;
  closingHeading2: string;
  requestQuote: string;
  faqs: { question: string; answer: string }[];
};

export const servicesContent: Record<Locale, ServicesCopy> = {
  en: {
    title: "3D Rendering, Visualization & Interactive Services | Mimar",
    description:
      "Five core services: architectural design, 3D visualization, interactive AR and VR experiences, branding and real estate marketing.",
    keywords: ["3D rendering services", "architectural visualization services", "3D animation services", "VR real estate", "interactive property experiences"],
    home: "Home",
    breadcrumbName: "Services",
    itemListName: "Mimar Studios services",
    eyebrow: "/ Capabilities",
    heading1: "What We",
    heading2: "Do.",
    body: "Five core services, one studio. From the first concept sketch to the smart home a buyer controls before it is built.",
    workEyebrow: "/ Work in these disciplines",
    workHeading1: "Services, Seen",
    workHeading2: "In Built Projects",
    workBody: "Every capability above is proven on delivered work. These are recent examples across architecture, visualization and interiors.",
    closingHeading1: "Need two or three of these at once?",
    closingHeading2: "That is the normal case.",
    requestQuote: "Request a quote",
    faqs: [
      {
        question: "What does 3D architectural visualization cost in Saudi Arabia?",
        answer: "The cost depends on the number of views, scale and detail of the project, available drawings and the required turnaround. Share your plans, references and intended deliverables, and we will prepare a tailored quote for your project in Saudi Arabia.",
      },
      {
        question: "What do you need to start a 3D visualization project?",
        answer: "We typically need architectural drawings, a material direction, project references and a clear brief. If some details are still being developed, we can help identify the information needed before production begins.",
      },
      {
        question: "How long does a 3D architectural render take?",
        answer: "A typical still render takes three to seven working days after the brief and inputs are approved. Larger sets, animations and interactive experiences are scheduled around their scope and review stages.",
      },
      {
        question: "Can you provide architecture, visualization and marketing together?",
        answer: "Yes. Mimar Studios can combine architectural design, photorealistic 3D views, aerials, cinematics, interactive experiences, branding and marketing into one coordinated project scope.",
      },
      {
        question: "Do you work with clients outside Pakistan?",
        answer: "Yes. We work remotely with developers, architects and real estate teams internationally. Reviews, feedback and final artwork can be managed through a clear digital workflow.",
      },
    ],
  },
  ar: {
    title: "خدمات التصيير والتصور ثلاثي الأبعاد والخدمات التفاعلية | ميمار",
    description:
      "خمس خدمات أساسية: التصميم المعماري، والتصور ثلاثي الأبعاد، وتجارب الواقع المعزز والواقع الافتراضي التفاعلية، والهوية التجارية، والتسويق العقاري.",
    keywords: ["خدمات التصيير ثلاثي الأبعاد", "خدمات التصور المعماري", "خدمات الرسوم المتحركة ثلاثية الأبعاد", "الواقع الافتراضي العقاري", "التجارب العقارية التفاعلية"],
    home: "الرئيسية",
    breadcrumbName: "الخدمات",
    itemListName: "خدمات ميمار ستوديوز",
    eyebrow: "/ القدرات",
    heading1: "ماذا",
    heading2: "نقدّم.",
    body: "خمس خدمات أساسية، واستوديو واحد. من أول رسم تخطيطي للفكرة وحتى المنزل الذكي الذي يتحكم به المشتري قبل بنائه.",
    workEyebrow: "/ أعمال في هذه المجالات",
    workHeading1: "الخدمات",
    workHeading2: "في مشاريع مُنجزة",
    workBody: "كل خدمة من الخدمات أعلاه مُثبتة في أعمال مُنجزة فعلياً. هذه أمثلة حديثة تشمل العمارة والتصور البصري والتصميم الداخلي.",
    closingHeading1: "تحتاج اثنتين أو ثلاثاً من هذه الخدمات معاً؟",
    closingHeading2: "هذا هو المعتاد.",
    requestQuote: "اطلب عرض سعر",
    faqs: [
      {
        question: "كم تبلغ تكلفة التصور المعماري ثلاثي الأبعاد في المملكة العربية السعودية؟",
        answer: "تعتمد التكلفة على عدد المشاهد، وحجم المشروع ومستوى التفاصيل، والمخططات المتوفرة، ومدة التسليم المطلوبة. شاركنا مخططاتك ومراجعك والمخرجات المطلوبة، وسنعدّ لك عرض سعر مخصصاً لمشروعك في المملكة العربية السعودية.",
      },
      {
        question: "ما الذي تحتاجونه للبدء في مشروع تصور ثلاثي الأبعاد؟",
        answer: "نحتاج عادةً إلى المخططات المعمارية، وتوجه الخامات، ومراجع المشروع، وملخص واضح للمطلوب. وإذا كانت بعض التفاصيل لا تزال قيد التطوير، فيمكننا مساعدتك في تحديد المعلومات اللازمة قبل بدء الإنتاج.",
      },
      {
        question: "كم يستغرق إنجاز التصيير المعماري ثلاثي الأبعاد؟",
        answer: "يستغرق المشهد الثابت عادةً من ثلاثة إلى سبعة أيام عمل بعد اعتماد الملخص والمدخلات. أما المجموعات الأكبر والرسوم المتحركة والتجارب التفاعلية فتُجدول بحسب نطاقها ومراحل المراجعة.",
      },
      {
        question: "هل يمكنكم تقديم العمارة والتصور والتسويق معاً؟",
        answer: "نعم. يمكن لميمار ستوديوز الجمع بين التصميم المعماري، والمشاهد ثلاثية الأبعاد الواقعية، واللقطات الجوية، والأفلام السينمائية، والتجارب التفاعلية، والهوية التجارية، والتسويق ضمن نطاق مشروع واحد منسّق.",
      },
      {
        question: "هل تعملون مع عملاء خارج باكستان؟",
        answer: "نعم. نعمل عن بُعد مع المطورين والمعماريين وفرق العقارات حول العالم، ويمكن إدارة المراجعات والملاحظات والأعمال النهائية عبر سير عمل رقمي واضح.",
      },
    ],
  },
};
