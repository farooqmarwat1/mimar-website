import type { Locale } from "@/i18n/config";

type Row = [string, string];

type AboutCopy = {
  title: string;
  description: string;
  keywords: string[];
  breadcrumbHome: string;
  breadcrumbName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroAriaLabel: string;
  aboutEyebrow: string;
  aboutHeading1: string;
  aboutHeading2: string;
  aboutBody: string;
  missionHeading: string;
  missionBody: string;
  visionHeading: string;
  visionBody: string;
  founderFirst: string;
  founderLast: string;
  founderQuote: string;
  founderBio: string;
  founderCta: string;
  founderAlt: string;
  studioHeading: string;
  studioNotes: Row[];
  exploreStudio: string;
  awardsHeading: string;
  awards: string[];
  participationsHeading: string;
  participations: string[];
  timelineHeading: string;
  timeline: Row[];
  testimonialsHeading: string;
  testimonials: Row[];
  openQuote: string;
  closeQuote: string;
  whatWeDoHeading: string;
  services: Row[];
};

export const aboutContent: Record<Locale, AboutCopy> = {
  en: {
    title: "Life at Mimar - About Us",
    description: "Experience the vibrant culture and dynamic environment at mimAR. Learn about our team of young professionals and our journey.",
    keywords: ["About Us", "life at Mimar", "Mimar team", "architecture studio Islamabad"],
    breadcrumbHome: "Home",
    breadcrumbName: "About",
    heroEyebrow: "About Mimar Studios",
    heroTitle: "About Us",
    heroSubtitle: "An architecture and visualization studio turning unbuilt ideas into clear, compelling experiences.",
    heroAriaLabel: "Animated aerial visualization introducing Mimar Studios",
    aboutEyebrow: "/ About us",
    aboutHeading1: "An Architecture And",
    aboutHeading2: "Visualization Studio.",
    aboutBody: "Based in Islamabad, working on residential, hospitality, corporate and public projects at an international level.",
    missionHeading: "Mission",
    missionBody: "Make unbuilt ideas clear and actionable, helping clients understand, refine, and confidently move their projects forward.",
    visionHeading: "Vision",
    visionBody: "Bring architects, visualizers, and designers together under one roof to carry every project from concept to experience.",
    founderFirst: "Naqi",
    founderLast: "Ejaz",
    founderQuote: "“We did not start a rendering shop. We started a studio that makes buildings understandable before they exist.”",
    founderBio: "Architect by training, technologist by necessity - he built the studio around one idea: a client should be able to walk a building, switch its finishes and watch its lights answer, long before the first pour.",
    founderCta: "Speak with the founder",
    founderAlt: "Naqi Ejaz, founder of Mimar Studios",
    studioHeading: "/ The studio",
    studioNotes: [
      ["Profile", "Mimar Studios was founded in 2019 at the National Incubation Center, Islamabad. The studio is formed by a multidisciplinary group of architects, visualizers and designers who share the same project - active participation of all its components, teamwork and passion for the work as the essence of the studio."],
      ["Values", "Architecture can be small in the big or big in the small, if each commission is understood as an opportunity to materialize a good project. The approach arises from a double commitment: a technical response to a specific context, and the desire to seek beauty through the built work."],
      ["Team", "Excellence in design is based on the integration of a network of professionals who agree on the pleasure of their work - architects, 3D artists, animators, brand designers and marketers, including international recruits from Turkey and Egypt."],
    ],
    exploreStudio: "Explore the studio",
    awardsHeading: "/ Awards",
    awards: [
      "National Winner in Pakistan - Uber Pitch, Karachi",
      "Qualified & represented Pakistan at 4YFN, Barcelona",
      "Runner-up, Top 100 Entrepreneurship World Cup, Riyadh",
      "Winner of the ISF Award by HEC, Islamabad",
      "Runner-up, Pakistan Startup Cup, Islamabad",
    ],
    participationsHeading: "/ Participations",
    participations: [
      "OIC Youth Scientific Congress 2022 - Kazan, Russia",
      "LEAP Expo 2022 - Riyadh, KSA",
      "Expo 2020 - Dubai, UAE",
      "Future of Construction Expo 2022 - Jeddah, KSA",
      "Proptech Convention 2022 - Karachi, Pakistan",
    ],
    timelineHeading: "/ Timeline",
    timeline: [
      ["Summer 2019", "Founded at the National Incubation Center (NIC), Islamabad"],
      ["Fall 2020", "First corporate office at National Science & Technology Park"],
      ["Spring 2021", "Team exceeded 10 people"],
      ["Spring 2022", "Team exceeded 20 people"],
      ["Spring 2022", "Welcomed international recruits from Turkey & Egypt"],
    ],
    testimonialsHeading: "/ Testimonials",
    testimonials: [
      ["Working with Mimar has been a smooth ride. My team has hardly faced any problems from their end as they keep a positive and professional attitude throughout the project.", "Ali Raza - Pakistan"],
      ["Their futuristic 3D technology really helped our team and boosted our sales to a great extent. The overall experience was wonderful.", "Umar Farooq - Pakistan"],
      ["Reasonable rates, clear communication, and top-quality VR services. They have the best talent for each service they offer.", "David Chen - USA"],
      ["The quality of the 3D renderings they delivered, and their ability to implement feedback is admirable. They take care of everything from top to bottom.", "Mohammed Al Hashmi - UAE"],
    ],
    openQuote: "“",
    closeQuote: "”",
    whatWeDoHeading: "/ What we do",
    services: [
      ["Architectural Design", "Full architectural design services spanning interior and exterior spaces, from concept through construction documentation."],
      ["3D Visualization", "Photorealistic visualization for architecture, interiors, and real estate."],
      ["Cinematics", "Cinematic walkthroughs, fly-throughs, and design animations that bring spaces to life."],
      ["VR 360 Tours", "Immersive, interactive experiences that let you explore spaces before they’re built."],
      ["Web Tours", "Browser-based 360° virtual tours, accessible on any device with no installation."],
      ["Dual Screen Navigator", "Synchronized interactive displays for sales offices, showrooms, events, and on-the-go presentations."],
      ["Interactive Prints", "AR-powered marketing collateral that brings brochures and print campaigns to life."],
      ["Property Explorer", "Interactive tools for exploring units, layouts, amenities, views, and property availability."],
      ["Virtual Smart Home", "Interactive experiences for showcasing smart-home and connected-living features."],
      ["Branding", "Strategic brand identities and visual systems that make projects recognizable across every touchpoint."],
      ["Marketing", "Integrated digital marketing and web development to amplify a project's reach."],
    ],
  },
  ar: {
    title: "الحياة في ميمار - من نحن",
    description: "اكتشف الثقافة النابضة بالحياة والبيئة الديناميكية في ميمار. تعرّف على فريقنا من المحترفين الشباب وعلى مسيرتنا.",
    keywords: ["من نحن", "الحياة في ميمار", "فريق ميمار", "استوديو عمارة في إسلام آباد"],
    breadcrumbHome: "الرئيسية",
    breadcrumbName: "من نحن",
    heroEyebrow: "عن ميمار ستوديوز",
    heroTitle: "من نحن",
    heroSubtitle: "استوديو للعمارة والتصور البصري يحوّل الأفكار غير المُنجزة إلى تجارب واضحة وجذابة.",
    heroAriaLabel: "عرض جوي متحرك يقدّم ميمار ستوديوز",
    aboutEyebrow: "/ من نحن",
    aboutHeading1: "استوديو للعمارة",
    aboutHeading2: "والتصور البصري.",
    aboutBody: "مقرّنا في إسلام آباد، ونعمل على مشاريع سكنية وضيافية وتجارية وعامة على مستوى عالمي.",
    missionHeading: "الرسالة",
    missionBody: "نجعل الأفكار غير المُنجزة واضحة وقابلة للتنفيذ، لمساعدة العملاء على فهم مشاريعهم وتطويرها والمضي بها قدماً بثقة.",
    visionHeading: "الرؤية",
    visionBody: "نجمع المعماريين وفناني التصور البصري والمصممين تحت سقف واحد لننقل كل مشروع من الفكرة إلى التجربة الكاملة.",
    founderFirst: "نقي",
    founderLast: "إجاز",
    founderQuote: "«لم نبدأ متجراً للتصيير. بل أسّسنا استوديو يجعل المباني مفهومة قبل أن توجد.»",
    founderBio: "معماري بالتدريب، وتقني بحكم الضرورة - بنى الاستوديو حول فكرة واحدة: أن يتمكن العميل من التجول داخل المبنى، وتبديل تشطيباته، ومشاهدة إضاءته تستجيب، قبل صب أول قالب خرساني بوقت طويل.",
    founderCta: "تحدث مع المؤسس",
    founderAlt: "نقي إجاز، مؤسس ميمار ستوديوز",
    studioHeading: "/ الاستوديو",
    studioNotes: [
      ["الملف التعريفي", "تأسست ميمار ستوديوز عام 2019 في المركز الوطني للحاضنات، إسلام آباد. يتكوّن الاستوديو من مجموعة متعددة التخصصات من المعماريين وفناني التصور البصري والمصممين، تجمعهم رؤية واحدة - المشاركة الفعّالة لجميع عناصر الفريق، والعمل الجماعي، والشغف بالعمل كجوهر للاستوديو."],
      ["القيم", "يمكن للعمارة أن تكون صغيرة داخل الكبير أو كبيرة داخل الصغير، إذا فُهم كل تكليف كفرصة لتجسيد مشروع جيد. ينبع هذا النهج من التزام مزدوج: استجابة تقنية لسياق محدد، ورغبة في السعي وراء الجمال من خلال العمل المُنجز."],
      ["الفريق", "يقوم التميّز في التصميم على تكامل شبكة من المحترفين الذين يجمعهم شغف العمل - معماريون وفنانو ثلاثي الأبعاد ومحرّكو رسوم ومصممو هوية ومسوّقون، بينهم كوادر دولية من تركيا ومصر."],
    ],
    exploreStudio: "استكشف الاستوديو",
    awardsHeading: "/ الجوائز",
    awards: [
      "الفائز الوطني في باكستان - مسابقة Uber Pitch، كراتشي",
      "تأهّل ومثّل باكستان في معرض 4YFN، برشلونة",
      "الوصيف في كأس العالم لأفضل 100 شركة ناشئة، الرياض",
      "الفائز بجائزة ISF من لجنة التعليم العالي (HEC)، إسلام آباد",
      "الوصيف في كأس الشركات الناشئة الباكستانية، إسلام آباد",
    ],
    participationsHeading: "/ المشاركات",
    participations: [
      "مؤتمر منظمة التعاون الإسلامي العلمي للشباب 2022 - قازان، روسيا",
      "معرض LEAP 2022 - الرياض، المملكة العربية السعودية",
      "إكسبو 2020 - دبي، الإمارات العربية المتحدة",
      "معرض مستقبل البناء 2022 - جدة، المملكة العربية السعودية",
      "مؤتمر Proptech 2022 - كراتشي، باكستان",
    ],
    timelineHeading: "/ المسيرة الزمنية",
    timeline: [
      ["صيف 2019", "التأسيس في المركز الوطني للحاضنات (NIC)، إسلام آباد"],
      ["خريف 2020", "افتتاح أول مكتب مؤسسي في المجمع الوطني للعلوم والتكنولوجيا"],
      ["ربيع 2021", "تجاوز عدد الفريق 10 أشخاص"],
      ["ربيع 2022", "تجاوز عدد الفريق 20 شخصاً"],
      ["ربيع 2022", "انضمام كوادر دولية من تركيا ومصر"],
    ],
    testimonialsHeading: "/ آراء العملاء",
    testimonials: [
      ["كان التعامل مع ميمار تجربة سلسة. لم يواجه فريقي أي مشاكل تُذكر من جانبهم، إذ حافظوا على موقف إيجابي ومهني طوال المشروع.", "Ali Raza - باكستان"],
      ["ساعدت تقنيتهم المستقبلية ثلاثية الأبعاد فريقنا بشكل كبير وعزّزت مبيعاتنا إلى حد كبير. كانت التجربة الإجمالية رائعة.", "Umar Farooq - باكستان"],
      ["أسعار معقولة، وتواصل واضح، وخدمات واقع افتراضي عالية الجودة. لديهم أفضل الكفاءات لكل خدمة يقدمونها.", "David Chen - الولايات المتحدة الأمريكية"],
      ["جودة المشاهد ثلاثية الأبعاد التي قدموها، وقدرتهم على تنفيذ الملاحظات أمر يستحق الإعجاب. يهتمون بكل التفاصيل من الألف إلى الياء.", "Mohammed Al Hashmi - الإمارات العربية المتحدة"],
    ],
    openQuote: "«",
    closeQuote: "»",
    whatWeDoHeading: "/ ماذا نقدّم",
    services: [
      ["التصميم المعماري", "خدمات تصميم معماري متكاملة تشمل المساحات الداخلية والخارجية، من الفكرة الأولى وحتى مستندات التنفيذ الإنشائي."],
      ["التصور ثلاثي الأبعاد", "تصور بصري واقعي للعمارة والتصميم الداخلي والعقارات."],
      ["الأفلام السينمائية", "جولات سينمائية متحركة ومشاهد تحليق ورسوم متحركة تصميمية تُضفي الحياة على المساحات."],
      ["جولات الواقع الافتراضي 360°", "تجارب تفاعلية غامرة تتيح لك استكشاف المساحات قبل بنائها فعلياً."],
      ["الجولات الإلكترونية", "جولات افتراضية بزاوية 360° تعمل عبر المتصفح، ويمكن الوصول إليها من أي جهاز دون الحاجة لتثبيت أي برنامج."],
      ["شاشة العرض المزدوجة التفاعلية", "شاشات عرض تفاعلية متزامنة لمكاتب المبيعات وصالات العرض والفعاليات والعروض التقديمية المتنقلة."],
      ["المطبوعات التفاعلية", "مواد تسويقية مطبوعة مدعومة بتقنية الواقع المعزز تُضفي الحياة على الكتيبات والحملات المطبوعة."],
      ["مستكشف العقارات", "أدوات تفاعلية لاستكشاف الوحدات والمخططات والمرافق والإطلالات ومدى توفر العقار."],
      ["المنزل الذكي الافتراضي", "تجارب تفاعلية لعرض ميزات المنزل الذكي وأنماط الحياة المتصلة."],
      ["الهوية التجارية", "هويات تجارية استراتيجية وأنظمة بصرية تجعل المشاريع مميزة ومعروفة عبر كل نقاط التواصل."],
      ["التسويق", "تسويق رقمي متكامل وتطوير مواقع إلكترونية لتوسيع نطاق وصول المشروع."],
    ],
  },
};
