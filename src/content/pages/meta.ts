import type { Locale } from "@/i18n/config";

type Capability = { title: string; description: string; href?: string; linkLabel?: string };

type MetaCopy = {
  title: string;
  description: string;
  home: string;
  breadcrumbName: string;
  heroAlt: string;
  heroEyebrow: string;
  heroLines: [string, string];
  heroAccent: string;
  heroBody: string;
  heroCta: string;
  capEyebrow: string;
  capPre: string;
  capAccent: string;
  capBody: string;
  capabilities: Capability[];
  portfolioEyebrow: string;
  portfolioPre: string;
  portfolioAccent: string;
  portfolioBody: string;
  portfolioAreasLabel: string;
  portfolioAreas: string[];
  portfolioCta: string;
  whyEyebrow: string;
  whyPre: string;
  whyAccent: string;
  reasons: { title: string; description: string }[];
};

export const metaContent: Record<Locale, MetaCopy> = {
  en: {
    title: "meta - mimAR",
    description: "Transforming ideas into captivating 3D visualizations for architectural brilliance. Unleash your vision with mimAR's immersive 3D visualization services.",
    home: "Home",
    breadcrumbName: "XR Digital Services",
    heroAlt: "Person wearing a virtual reality headset",
    heroEyebrow: "/ XR Digital Services",
    heroLines: ["Explore", "Limitless"],
    heroAccent: "Realms",
    heroBody: "Transforming ideas into captivating 3D visualizations for architectural brilliance. Unleash your vision with mimAR’s immersive 3D visualization services.",
    heroCta: "Explore our services",
    capEyebrow: "/ Services",
    capPre: "Immersive ideas, ",
    capAccent: "built to work.",
    capBody: "From augmented and virtual reality to interactive applications, the same team carries a digital experience from concept to delivery.",
    capabilities: [
      {
        title: "Augmented Reality",
        description: "Unlock limitless possibilities with our MataVerse development service, crafting dynamic and engaging virtual experiences for your audience.",
        href: "/services/interactive-services/interactive-prints",
        linkLabel: "Explore augmented reality work",
      },
      {
        title: "Virtual Reality",
        description: "Unlock limitless possibilities with our MataVerse development service, crafting dynamic and engaging virtual experiences for your audience.",
        href: "/services/interactive-services/vr-360-tours",
        linkLabel: "Explore virtual reality work",
      },
      {
        title: "Web 3.0",
        description: "Experience the future of the web with our Web 3.0 as a service, revolutionizing connectivity, decentralization, and user-centric experiences.",
      },
      {
        title: "Virtual Orient",
        description: "There's nothing in the world of Architectural Visualization that we don't offer!",
        href: "/services/interactive-services/web-tours",
        linkLabel: "Explore virtual tours",
      },
      {
        title: "Game Development",
        description: "Level up your vision with our Game Development as a Service, where we turn ideas into captivating interactive experiences for players worldwide.",
      },
      {
        title: "App Development",
        description: "Turn your app dreams into reality with our comprehensive App Development as a Service, delivering tailored solutions for seamless user experiences",
      },
    ],
    portfolioEyebrow: "/ Portfolio",
    portfolioPre: "Work across ",
    portfolioAccent: "digital worlds.",
    portfolioBody: "Explore the areas represented in Mimar's immersive portfolio, from virtual orientation and Web 3.0 to augmented and virtual reality.",
    portfolioAreasLabel: "Portfolio areas",
    portfolioAreas: ["Metaverse Development", "Virtual Orientation", "Web 3.0", "Virtual Reality", "Augmented Reality"],
    portfolioCta: "View projects",
    whyEyebrow: "/ Why us",
    whyPre: "Made to connect ",
    whyAccent: "every dimension.",
    reasons: [
      {
        title: "Seamless integration",
        description: "Mimar Studio is your hub for seamless integration of VR, AR, Web 3.0, and app development, ensuring smooth, cross-platform functionality that keeps pace with technological advancements.",
      },
      {
        title: "Scalable Solutions",
        description: "We specialize in scalable and sustainable solutions at Mimar Studio, providing innovative and adaptable VR and AR experiences designed to grow with your enterprise.",
      },
      {
        title: "Cutting-Edge Technologies",
        description: "Our expertise in the latest metaverse and immersive technologies positions us at the forefront of the industry, offering our clients the most advanced and innovative solutions.",
      },
      {
        title: "Immersive Experiences",
        description: "Mimar Studio is dedicated to creating immersive and interactive virtual worlds, offering tailored AR, VR, and metaverse services that push the envelope of digital innovation.",
      },
    ],
  },
  ar: {
    title: "ميتا - ميمار",
    description: "نحوّل الأفكار إلى تصورات ثلاثية الأبعاد آسرة للتميز المعماري. أطلق العنان لرؤيتك مع خدمات ميمار الغامرة للتصور ثلاثي الأبعاد.",
    home: "الرئيسية",
    breadcrumbName: "خدمات الواقع الممتد XR",
    heroAlt: "شخص يرتدي نظارة واقع افتراضي",
    heroEyebrow: "/ خدمات الواقع الممتد XR",
    heroLines: ["استكشف", "عوالم"],
    heroAccent: "بلا حدود",
    heroBody: "نحوّل الأفكار إلى تصورات ثلاثية الأبعاد آسرة للتميز المعماري. أطلق العنان لرؤيتك مع خدمات ميمار الغامرة للتصور ثلاثي الأبعاد.",
    heroCta: "استكشف خدماتنا",
    capEyebrow: "/ الخدمات",
    capPre: "أفكار غامرة، ",
    capAccent: "مصمَّمة لتعمل.",
    capBody: "من الواقع المعزز والافتراضي إلى التطبيقات التفاعلية، ينقل الفريق نفسه التجربة الرقمية من الفكرة إلى التسليم.",
    capabilities: [
      {
        title: "الواقع المعزز",
        description: "اكتشف إمكانات لا حدود لها مع خدمة تطوير الميتافيرس لدينا، حيث نصمم تجارب افتراضية ديناميكية وجذابة لجمهورك.",
        href: "/services/interactive-services/interactive-prints",
        linkLabel: "استكشف أعمال الواقع المعزز",
      },
      {
        title: "الواقع الافتراضي",
        description: "اكتشف إمكانات لا حدود لها مع خدمة تطوير الميتافيرس لدينا، حيث نصمم تجارب افتراضية ديناميكية وجذابة لجمهورك.",
        href: "/services/interactive-services/vr-360-tours",
        linkLabel: "استكشف أعمال الواقع الافتراضي",
      },
      {
        title: "ويب 3.0",
        description: "جرّب مستقبل الويب مع خدمة ويب 3.0 لدينا، التي تُحدث ثورة في الاتصال واللامركزية والتجارب المتمحورة حول المستخدم.",
      },
      {
        title: "التوجيه الافتراضي",
        description: "لا يوجد في عالم التصور المعماري ما لا نقدمه!",
        href: "/services/interactive-services/web-tours",
        linkLabel: "استكشف الجولات الافتراضية",
      },
      {
        title: "تطوير الألعاب",
        description: "ارتقِ برؤيتك مع خدمة تطوير الألعاب لدينا، حيث نحوّل الأفكار إلى تجارب تفاعلية آسرة للاعبين حول العالم.",
      },
      {
        title: "تطوير التطبيقات",
        description: "حوّل أحلام تطبيقك إلى واقع مع خدمة تطوير التطبيقات الشاملة لدينا، التي تقدم حلولاً مخصصة لتجارب مستخدم سلسة.",
      },
    ],
    portfolioEyebrow: "/ الأعمال",
    portfolioPre: "أعمال عبر ",
    portfolioAccent: "العوالم الرقمية.",
    portfolioBody: "استكشف المجالات التي يضمها معرض أعمال ميمار الغامر، من التوجيه الافتراضي وويب 3.0 إلى الواقع المعزز والواقع الافتراضي.",
    portfolioAreasLabel: "مجالات الأعمال",
    portfolioAreas: ["تطوير الميتافيرس", "التوجيه الافتراضي", "ويب 3.0", "الواقع الافتراضي", "الواقع المعزز"],
    portfolioCta: "عرض المشاريع",
    whyEyebrow: "/ لماذا ميمار",
    whyPre: "صُمّم ليربط ",
    whyAccent: "كل الأبعاد.",
    reasons: [
      {
        title: "تكامل سلس",
        description: "ميمار ستوديوز هو مركزك للتكامل السلس بين الواقع الافتراضي والواقع المعزز وويب 3.0 وتطوير التطبيقات، بما يضمن أداءً سلساً عبر المنصات يواكب التطورات التقنية.",
      },
      {
        title: "حلول قابلة للتوسع",
        description: "نتخصص في الحلول القابلة للتوسع والمستدامة، ونقدم تجارب واقع افتراضي ومعزز مبتكرة وقابلة للتكيف صُممت لتنمو مع مؤسستك.",
      },
      {
        title: "أحدث التقنيات",
        description: "تضعنا خبرتنا في أحدث تقنيات الميتافيرس والتقنيات الغامرة في طليعة القطاع، لنقدم لعملائنا أكثر الحلول تقدماً وابتكاراً.",
      },
      {
        title: "تجارب غامرة",
        description: "يكرّس ميمار ستوديوز جهوده لابتكار عوالم افتراضية غامرة وتفاعلية، مقدماً خدمات واقع معزز وافتراضي وميتافيرس مخصصة تتجاوز حدود الابتكار الرقمي.",
      },
    ],
  },
};

type EdTechCopy = {
  title: string;
  description: string;
  home: string;
  xrName: string;
  breadcrumbName: string;
  eyebrowXr: string;
  eyebrowApp: string;
  h1Pre: string;
  h1Accent: string;
  body: string;
  cta: string;
  photoAlt: string;
  linkedin: string;
  experiencesEyebrow: string;
  experienceLabel: string;
  experiences: string[];
  logoAlt: string;
};

export const edtechContent: Record<Locale, EdTechCopy> = {
  en: {
    title: "EdTech - mimAR",
    description: "Click to Scan",
    home: "Home",
    xrName: "XR Digital Services",
    breadcrumbName: "EdTech",
    eyebrowXr: "/ XR Digital Services",
    eyebrowApp: " / App",
    h1Pre: "Ed",
    h1Accent: "Tech",
    body: "Science lessons in augmented reality. Scan an experience with your phone and explore it in 3D.",
    cta: "Click to Scan",
    photoAlt: "Naqi Ejaz, Mimar Studios",
    linkedin: "Naqi Ejaz on LinkedIn",
    experiencesEyebrow: "/ Experiences",
    experienceLabel: "Experience # ",
    experiences: ["Magnetic Field of Solenoid", "Galvanic Cell"],
    logoAlt: "Mimar Studios lab logo",
  },
  ar: {
    title: "التقنيات التعليمية EdTech - ميمار",
    description: "انقر للمسح",
    home: "الرئيسية",
    xrName: "خدمات الواقع الممتد XR",
    breadcrumbName: "التقنيات التعليمية EdTech",
    eyebrowXr: "/ خدمات الواقع الممتد XR",
    eyebrowApp: " / التطبيقات",
    h1Pre: "التقنيات ",
    h1Accent: "التعليمية",
    body: "دروس علمية بالواقع المعزز. امسح التجربة بهاتفك واستكشفها بالأبعاد الثلاثية.",
    cta: "انقر للمسح",
    photoAlt: "نقي إجاز، ميمار ستوديوز",
    linkedin: "نقي إجاز على لينكدإن",
    experiencesEyebrow: "/ التجارب",
    experienceLabel: "التجربة رقم ",
    experiences: ["المجال المغناطيسي للملف اللولبي", "الخلية الجلفانية"],
    logoAlt: "شعار مختبر ميمار ستوديوز",
  },
};
