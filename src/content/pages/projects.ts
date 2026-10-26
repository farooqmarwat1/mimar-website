import type { Locale } from "@/i18n/config";

type ProjectsCopy = {
  title: string;
  description: string;
  keywords: string[];
  home: string;
  breadcrumbName: string;
  itemListName: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
};

export const projectsContent: Record<Locale, ProjectsCopy> = {
  en: {
    title: "Architecture & 3D Visualization Projects | Mimar Studios",
    description:
      "Explore Mimar Studios' portfolio of residential, hospitality, corporate, and public projects delivered for clients in 14+ countries.",
    keywords: ["architecture projects", "3D visualization portfolio", "architectural rendering portfolio", "interior visualization"],
    home: "Home",
    breadcrumbName: "Projects",
    itemListName: "Mimar Studios projects",
    eyebrow: "/ Index",
    heading1: "All",
    heading2: "Projects",
  },
  ar: {
    title: "مشاريع العمارة والتصور ثلاثي الأبعاد | ميمار ستوديوز",
    description:
      "استكشف أعمال ميمار ستوديوز من المشاريع السكنية والضيافية والتجارية والعامة المُنجزة لعملاء في أكثر من 14 دولة.",
    keywords: ["مشاريع العمارة", "معرض أعمال التصور ثلاثي الأبعاد", "معرض أعمال التصيير المعماري", "التصور الداخلي"],
    home: "الرئيسية",
    breadcrumbName: "المشاريع",
    itemListName: "مشاريع ميمار ستوديوز",
    eyebrow: "/ الفهرس",
    heading1: "كل",
    heading2: "المشاريع",
  },
};

type ProjectDetailCopy = {
  titleSuffix: string;
  narrative: (location: string) => string;
  imageAlt: (title: string) => string;
  galleryAlt: (title: string, index: number) => string;
};

export const projectDetailContent: Record<Locale, ProjectDetailCopy> = {
  en: {
    titleSuffix: " | Mimar Studios",
    narrative: (location) =>
      `The project was developed as a focused design study, balancing the character of ${location} with a clear material and spatial direction. Every view was composed to communicate the design before delivery.`,
    imageAlt: (title) => `${title} by Mimar Studios`,
    galleryAlt: (title, index) => `${title} project view ${index}`,
  },
  ar: {
    titleSuffix: " | ميمار ستوديوز",
    narrative: (location) =>
      `طُوِّر المشروع كدراسة تصميمية مركّزة، توازن بين طابع ${location} وتوجه واضح للخامات والمساحات. صُمِّم كل مشهد لنقل فكرة التصميم قبل التسليم.`,
    imageAlt: (title) => `${title} من ميمار ستوديوز`,
    galleryAlt: (title, index) => `${title} - منظر ${index} للمشروع`,
  },
};
