import type { Locale } from "@/i18n/config";

type StudioCopy = {
  title: string;
  description: string;
  home: string;
  aboutName: string;
  studioName: string;
  eyebrowAbout: string;
  eyebrowStudio: string;
  heroTag: string;
  heroTitle: string;
  heroBody: string;
  heroCta: string;
  ceoEyebrow: string;
  ceoHeading1: string;
  ceoHeading2: string;
  ceoQuote1: string;
  ceoQuote2: string;
  videoTitle: string;
  videoCaption: string;
  peopleEyebrow: string;
  peopleHeading1: string;
  peopleHeading2: string;
  peopleBody: string;
  disciplines: { number: string; title: string; detail: string }[];
  cultureEyebrow: string;
  cultureHeading1: string;
  cultureHeading2: string;
  cultureBody1: string;
  cultureBody2: string;
  photos: { src: string; alt: string; caption: string }[];
};

export const studioContent: Record<Locale, StudioCopy> = {
  en: {
    title: "Studio - mimAR",
    description: "award winning emerging company",
    home: "Home",
    aboutName: "About Us",
    studioName: "Studio",
    eyebrowAbout: "/ About Us",
    eyebrowStudio: " / Studio",
    heroTag: "Award winning emerging company",
    heroTitle: "Studio",
    heroBody: "The people and environment behind Mimar Studios. Meet the thinking, collaboration, and creative energy that shape our work.",
    heroCta: "Explore the studio",
    ceoEyebrow: "/ 01 — CEO message",
    ceoHeading1: "A note from ",
    ceoHeading2: "our founder.",
    ceoQuote1: "“The constraint of being solo founder of a prop-tech bootstrapping startup in a tech reluctant construction industry is the challenging ingredient in itself that energizes me to take consequential risks!",
    ceoQuote2: "Our strength is our free minded talented youth. We risk ourselves into goals bigger than our capacity: then test ourselves beyond our limits, eventually being forced to go out of the box to achieve the goal. The failures we face, to us are the stepping stones!”",
    videoTitle: "MimAR — From An Architect to a Businessman",
    videoCaption: "The original studio film / NIC Islamabad",
    peopleEyebrow: "/ The people",
    peopleHeading1: "A multidisciplinary ",
    peopleHeading2: "studio.",
    peopleBody: "Design, visualization, technology, and communication come together in one studio. Every perspective helps move an idea from first sketch to a memorable experience.",
    disciplines: [
      { number: "02", title: "Our Team", detail: "A studio built around people with different skills and one shared purpose: making ideas possible." },
      { number: "03", title: "Marketing Team", detail: "The people who help projects find their voice, connect with audiences, and reach the market." },
      { number: "04", title: "Architects Team", detail: "Architects, visual artists, and technologists working together from first concept to final experience." },
      { number: "05", title: "Development Team", detail: "Developers turn visual ideas into interactive experiences, digital products, and tools people can explore." },
      { number: "06", title: "Creative Team", detail: "Designers and storytellers shape how every project looks, moves, and communicates." },
    ],
    cultureEyebrow: "/ 07 — Culture & environment",
    cultureHeading1: "Life at ",
    cultureHeading2: "Mimar.",
    cultureBody1: "At mimAR, it’s our amazing team that shapes our unique culture. We’re all about creating a workplace where everyone feels valued and supported.",
    cultureBody2: "We want our employees to grow both personally and professionally while connecting with each other. Our goal is to foster a supportive environment where our employees can thrive and contribute to our overarching mission.",
    photos: [
      { src: "/about/studio/studio-lounge.jpg", alt: "A moment in the Mimar studio lounge", caption: "Studio life" },
      { src: "/about/studio/team-moment.jpg", alt: "Mimar team members at a studio gathering", caption: "Working together" },
    ],
  },
  ar: {
    title: "الاستوديو - ميمار",
    description: "شركة ناشئة حائزة على جوائز",
    home: "الرئيسية",
    aboutName: "من نحن",
    studioName: "الاستوديو",
    eyebrowAbout: "/ من نحن",
    eyebrowStudio: " / الاستوديو",
    heroTag: "شركة ناشئة حائزة على جوائز",
    heroTitle: "الاستوديو",
    heroBody: "الأشخاص والبيئة التي تقف خلف ميمار ستوديوز. تعرّف على التفكير والتعاون والطاقة الإبداعية التي تُشكّل أعمالنا.",
    heroCta: "استكشف الاستوديو",
    ceoEyebrow: "/ 01 — رسالة الرئيس التنفيذي",
    ceoHeading1: "كلمة من ",
    ceoHeading2: "مؤسسنا.",
    ceoQuote1: "«إن كوني المؤسس الوحيد لشركة ناشئة ذاتية التمويل في مجال التقنية العقارية، ضمن قطاع إنشاءات متحفّظ تجاه التقنية، هو بحد ذاته العنصر الصعب الذي يمنحني الطاقة لخوض مخاطر مؤثرة!",
    ceoQuote2: "قوتنا في شبابنا الموهوب حرّ التفكير. نخاطر بأنفسنا نحو أهداف تفوق قدراتنا، ثم نختبر أنفسنا إلى ما بعد حدودنا، فنضطر في النهاية إلى التفكير خارج الصندوق لتحقيق الهدف. وما نواجهه من إخفاقات هو بالنسبة لنا درجات نصعد بها!»",
    videoTitle: "MimAR — From An Architect to a Businessman",
    videoCaption: "فيلم الاستوديو الأصلي / المركز الوطني للحاضنات، إسلام آباد",
    peopleEyebrow: "/ الفريق",
    peopleHeading1: "استوديو ",
    peopleHeading2: "متعدد التخصصات.",
    peopleBody: "يلتقي التصميم والتصور البصري والتقنية والتواصل في استوديو واحد. ويساهم كل منظور في نقل الفكرة من أول رسم تخطيطي إلى تجربة لا تُنسى.",
    disciplines: [
      { number: "02", title: "فريقنا", detail: "استوديو قائم على أشخاص بمهارات مختلفة وهدف واحد مشترك: جعل الأفكار ممكنة." },
      { number: "03", title: "فريق التسويق", detail: "الأشخاص الذين يساعدون المشاريع على إيجاد صوتها والتواصل مع جمهورها والوصول إلى السوق." },
      { number: "04", title: "فريق المعماريين", detail: "معماريون وفنانو تصور بصري وتقنيون يعملون معاً من الفكرة الأولى وحتى التجربة النهائية." },
      { number: "05", title: "فريق التطوير", detail: "يحوّل المطورون الأفكار البصرية إلى تجارب تفاعلية ومنتجات رقمية وأدوات يمكن للناس استكشافها." },
      { number: "06", title: "الفريق الإبداعي", detail: "يُشكّل المصممون وصنّاع القصص مظهر كل مشروع وحركته وطريقة تواصله." },
    ],
    cultureEyebrow: "/ 07 — الثقافة وبيئة العمل",
    cultureHeading1: "الحياة في ",
    cultureHeading2: "ميمار.",
    cultureBody1: "في ميمار، فريقنا المذهل هو من يصنع ثقافتنا الفريدة. نحرص على بناء مكان عمل يشعر فيه الجميع بالتقدير والدعم.",
    cultureBody2: "نريد لموظفينا أن ينموا شخصياً ومهنياً وأن يتواصلوا مع بعضهم. هدفنا تعزيز بيئة داعمة يزدهر فيها موظفونا ويساهمون في رسالتنا الكبرى.",
    photos: [
      { src: "/about/studio/studio-lounge.jpg", alt: "لحظة في صالة استوديو ميمار", caption: "الحياة في الاستوديو" },
      { src: "/about/studio/team-moment.jpg", alt: "أعضاء فريق ميمار في لقاء بالاستوديو", caption: "نعمل معاً" },
    ],
  },
};
