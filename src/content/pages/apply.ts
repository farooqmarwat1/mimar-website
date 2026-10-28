import type { Locale } from "@/i18n/config";

/**
 * Copy for the careers application page (/careers/apply and /ar/careers/apply) in both languages.
 * The Arabic was written by Claude and needs a native review, like the rest of the Arabic site (ARABIC.md).
 */
export type ApplyFormCopy = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  generalRole: string;
  portfolio: string;
  portfolioHint: string;
  message: string;
  messageHint: string;
  send: string;
  sending: string;
  successTitle: string;
  successBody: string;
  back: string;
  errors: {
    required: string;
    email: string;
    url: string;
    tooMany: string;
    invalid: string;
    delivery: string;
    generic: string;
  };
};

type ApplyCopy = {
  title: string;
  description: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  subhead: string;
  projectNote: string;
  projectLink: string;
  emailLabel: string;
  form: ApplyFormCopy;
};

export const applyContent: Record<Locale, ApplyCopy> = {
  en: {
    title: "Apply | Mimar Studios Careers",
    description: "Send your application to Mimar Studios: choose a role, share a link to your CV or portfolio and tell us about yourself.",
    eyebrow: "/ Careers",
    heading1: "Send your",
    heading2: "application",
    subhead: "Choose a role, share a link to your CV or portfolio, and tell us a little about yourself. Our team reviews every application.",
    projectNote: "Looking to hire Mimar Studios for a project instead?",
    projectLink: "Send a project enquiry",
    emailLabel: "Prefer email?",
    form: {
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone (optional)",
      role: "Role you are applying for",
      generalRole: "General application / future roles",
      portfolio: "Link to your CV or portfolio",
      portfolioHint: "Google Drive, Behance, LinkedIn or your own site. Make sure anyone with the link can open it.",
      message: "About you",
      messageHint: "A few lines on your experience and why Mimar.",
      send: "Send application",
      sending: "Sending…",
      successTitle: "Application received.",
      successBody: "Thank you for applying. Our team will review it, and if there is a suitable opening we will be in touch.",
      back: "Back to careers",
      errors: {
        required: "Please fill out this field.",
        email: "Please enter a valid email address.",
        url: "Please enter a full link starting with https://",
        tooMany: "Too many requests. Please try again later.",
        invalid: "Some details are not valid. Please check the form and try again.",
        delivery: "We couldn't send your application right now. Please email it to hr@mim.archi instead.",
        generic: "Something went wrong.",
      },
    },
  },
  ar: {
    title: "قدّم طلبك | وظائف ميمار ستوديوز",
    description: "أرسل طلب التوظيف إلى ميمار ستوديوز: اختر الوظيفة وشارك رابط سيرتك الذاتية أو أعمالك وعرّفنا بنفسك.",
    eyebrow: "/ الوظائف",
    heading1: "أرسل",
    heading2: "طلبك",
    subhead: "اختر الوظيفة، وشارك رابط سيرتك الذاتية أو معرض أعمالك، وعرّفنا بنفسك باختصار. يراجع فريقنا كل طلب.",
    projectNote: "تريد التعاقد مع ميمار ستوديوز على مشروع بدلاً من ذلك؟",
    projectLink: "أرسل استفساراً عن مشروع",
    emailLabel: "تفضّل البريد الإلكتروني؟",
    form: {
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      phone: "الهاتف (اختياري)",
      role: "الوظيفة التي تتقدم لها",
      generalRole: "طلب عام / وظائف مستقبلية",
      portfolio: "رابط سيرتك الذاتية أو معرض أعمالك",
      portfolioHint: "Google Drive أو Behance أو LinkedIn أو موقعك الخاص. تأكد من أن أي شخص لديه الرابط يستطيع فتحه.",
      message: "نبذة عنك",
      messageHint: "بضعة أسطر عن خبرتك ولماذا ميمار.",
      send: "إرسال الطلب",
      sending: "جارٍ الإرسال…",
      successTitle: "تم استلام طلبك.",
      successBody: "شكراً لتقدمك. سيراجع فريقنا طلبك، وإذا توفرت فرصة مناسبة فسنتواصل معك.",
      back: "العودة إلى الوظائف",
      errors: {
        required: "يرجى تعبئة هذا الحقل.",
        email: "يرجى إدخال عنوان بريد إلكتروني صحيح.",
        url: "يرجى إدخال رابط كامل يبدأ بـ https://",
        tooMany: "عدد الطلبات كبير جداً. يرجى المحاولة مرة أخرى لاحقاً.",
        invalid: "بعض البيانات غير صالحة. يرجى مراجعة النموذج والمحاولة مرة أخرى.",
        delivery: "تعذّر إرسال طلبك الآن. يرجى إرساله إلى hr@mim.archi بدلاً من ذلك.",
        generic: "حدث خطأ ما.",
      },
    },
  },
};
