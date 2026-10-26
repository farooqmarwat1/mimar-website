import type { Locale } from "@/i18n/config";

/* ---------------------------------------------------------------- Booking */

type BookingCopy = {
  title: string;
  description: string;
  home: string;
  breadcrumbName: string;
  eyebrow: string;
  h1Pre: string;
  h1Accent: string;
  body: string;
  chooseTime: string;
  optionsEyebrow: string;
  optionsPre: string;
  optionsAccent: string;
  meetings: { title: string; src: string; link: string }[];
  iframeTitle: (title: string) => string;
  /** Visually hidden link: pre + meeting title + post. */
  openLink: [string, string];
  lowercase: boolean;
  contactEyebrow: string;
  contactPre: string;
  contactAccent: string;
  contactBody: string;
  contactCta: string;
};

const meetingLinks = [
  { src: "https://koalendar.com/e/Mimar-QuickCall?embed=true", link: "https://koalendar.com/e/Mimar-QuickCall" },
  { src: "https://koalendar.com/e/Mimar-30Mins?embed=true", link: "https://koalendar.com/e/Mimar-30Mins" },
  { src: "https://koalendar.com/e/Mimar-1Hour?embed=true", link: "https://koalendar.com/e/Mimar-1Hour" },
];

export const bookingContent: Record<Locale, BookingCopy> = {
  en: {
    title: "Booking - mimAR",
    description: "Your Booking is just a click away!",
    home: "Home",
    breadcrumbName: "Booking",
    eyebrow: "/ Schedule a meeting",
    h1Pre: "Book your ",
    h1Accent: "meeting.",
    body: "Your Booking is just a click away!",
    chooseTime: "Choose a time",
    optionsEyebrow: "/ Booking options",
    optionsPre: "Find a time that ",
    optionsAccent: "works for you.",
    meetings: [
      { title: "Quick Call", ...meetingLinks[0] },
      { title: "30 Minutes", ...meetingLinks[1] },
      { title: "1 Hour", ...meetingLinks[2] },
    ],
    iframeTitle: (title) => `Book a ${title.toLowerCase()} with Mimar Studios`,
    openLink: ["Open ", " booking calendar"],
    lowercase: true,
    contactEyebrow: "/ Get in touch",
    contactPre: "Need another way ",
    contactAccent: "to connect?",
    contactBody: "Send us the details of your project and our team will get back to you.",
    contactCta: "Contact the studio",
  },
  ar: {
    title: "الحجز - ميمار",
    description: "موعدك على بُعد نقرة واحدة!",
    home: "الرئيسية",
    breadcrumbName: "الحجز",
    eyebrow: "/ حدّد موعد اجتماع",
    h1Pre: "احجز ",
    h1Accent: "اجتماعك.",
    body: "موعدك على بُعد نقرة واحدة!",
    chooseTime: "اختر وقتاً",
    optionsEyebrow: "/ خيارات الحجز",
    optionsPre: "اختر الوقت ",
    optionsAccent: "الذي يناسبك.",
    meetings: [
      { title: "مكالمة سريعة", ...meetingLinks[0] },
      { title: "30 دقيقة", ...meetingLinks[1] },
      { title: "ساعة واحدة", ...meetingLinks[2] },
    ],
    iframeTitle: (title) => `احجز ${title} مع ميمار ستوديوز`,
    openLink: ["افتح تقويم حجز ", ""],
    lowercase: false,
    contactEyebrow: "/ تواصل معنا",
    contactPre: "هل تحتاج إلى وسيلة أخرى ",
    contactAccent: "للتواصل؟",
    contactBody: "أرسل لنا تفاصيل مشروعك وسيعود إليك فريقنا.",
    contactCta: "تواصل مع الاستوديو",
  },
};

/* ------------------------------------------------------------ My bookings */

type MyBookingsCopy = {
  title: string;
  description: string;
  home: string;
  breadcrumbName: string;
  eyebrow: string;
  h1Pre: string;
  h1Accent: string;
  body: string;
  book: string;
  contact: string;
};

export const myBookingsContent: Record<Locale, MyBookingsCopy> = {
  en: {
    title: "My Bookings - mimAR",
    description: "Manage your meeting with Mimar Studios: use the link in your booking email, book a new meeting or contact our team.",
    home: "Home",
    breadcrumbName: "My Bookings",
    eyebrow: "/ Bookings",
    h1Pre: "My ",
    h1Accent: "Bookings.",
    body: "To reschedule or cancel a meeting, use the link in your booking confirmation email. Need a new time or help with an existing booking? Book again or contact our team.",
    book: "Book a meeting",
    contact: "Contact us",
  },
  ar: {
    title: "حجوزاتي - ميمار",
    description: "أدر اجتماعك مع ميمار ستوديوز: استخدم الرابط الوارد في بريد الحجز الإلكتروني، أو احجز اجتماعاً جديداً، أو تواصل مع فريقنا.",
    home: "الرئيسية",
    breadcrumbName: "حجوزاتي",
    eyebrow: "/ الحجوزات",
    h1Pre: "",
    h1Accent: "حجوزاتي.",
    body: "لإعادة جدولة اجتماع أو إلغائه، استخدم الرابط الوارد في رسالة تأكيد الحجز في بريدك الإلكتروني. هل تحتاج إلى موعد جديد أو مساعدة بشأن حجز قائم؟ احجز مجدداً أو تواصل مع فريقنا.",
    book: "احجز اجتماعاً",
    contact: "تواصل معنا",
  },
};

/* ------------------------------------------------- Visualization proposal */

type ProposalCopy = {
  title: string;
  description: string;
  home: string;
  breadcrumbName: string;
  eyebrow: string;
  h1Pre: string;
  h1Accent: string;
  iframeTitle: string;
  open: string;
  contact: string;
};

export const proposalContent: Record<Locale, ProposalCopy> = {
  en: {
    title: "Visualization Proposal - mimAR",
    description: "View the Mimar Studios 3D visualization proposal and get a quote for your project.",
    home: "Home",
    breadcrumbName: "Visualization Proposal",
    eyebrow: "/ Proposal",
    h1Pre: "Visualization ",
    h1Accent: "Proposal.",
    iframeTitle: "Mimar Studios visualization proposal",
    open: "Open the proposal ↗",
    contact: "Contact us",
  },
  ar: {
    title: "عرض التصور البصري - ميمار",
    description: "اطلع على عرض ميمار ستوديوز للتصور ثلاثي الأبعاد واحصل على عرض سعر لمشروعك.",
    home: "الرئيسية",
    breadcrumbName: "عرض التصور البصري",
    eyebrow: "/ العرض",
    h1Pre: "عرض ",
    h1Accent: "التصور البصري.",
    iframeTitle: "عرض ميمار ستوديوز للتصور البصري",
    open: "افتح العرض ↖",
    contact: "تواصل معنا",
  },
};
