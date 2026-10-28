import type { Locale } from "@/i18n/config";

/** Copy for /contact and /thank-you in both languages. English is the original page copy, unchanged. */
type ContactCopy = {
  title: string;
  description: string;
  breadcrumbHome: string;
  breadcrumbName: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  subhead: string;
  emailLabel: string;
  careersLabel: string;
  careersNote: string;
  phoneLabel: string;
  officePrefix: string;
  officeSuffix: string;
  comma: string;
  enquiry: string;
  formMessages: {
    required: string;
    email: string;
    tooMany: string;
    invalid: string;
    delivery: (email: string) => string;
    generic: string;
  };
};

export const contactContent: Record<Locale, ContactCopy> = {
  en: {
    title: "Contact Mimar Studios - Let’s Talk",
    description:
      "Tell Mimar Studios what you are building. Contact our Islamabad or Jeddah studio for architecture, visualization, VR and interactive projects.",
    breadcrumbHome: "Home",
    breadcrumbName: "Contact",
    eyebrow: "/ Contact",
    heading1: "Let's",
    heading2: "talk",
    subhead: "Tell us what you are building. We reply within one working day.",
    emailLabel: "Email",
    careersLabel: "Careers",
    careersNote: "Looking for a job or internship? Send your CV and portfolio here. This page and the form are for project enquiries only.",
    phoneLabel: "Phone",
    officePrefix: "",
    officeSuffix: " office",
    comma: ",",
    enquiry: "/ Project enquiry",
    formMessages: {
      required: "Please fill out this field.",
      email: "Please enter a valid email address.",
      tooMany: "Too many requests. Please try again later.",
      invalid: "Invalid form data.",
      delivery: (email) => `We couldn't send your message right now. Please email us at ${email} instead.`,
      generic: "Something went wrong.",
    },
  },
  ar: {
    title: "تواصل مع ميمار ستوديوز - لنتحدث",
    description:
      "أخبر ميمار ستوديوز بما تبنيه. تواصل مع استوديونا في إسلام آباد أو جدة لمشاريع العمارة والتصور البصري والواقع الافتراضي والتجارب التفاعلية.",
    breadcrumbHome: "الرئيسية",
    breadcrumbName: "تواصل معنا",
    eyebrow: "/ تواصل معنا",
    heading1: "دعنا",
    heading2: "نتحدث",
    subhead: "أخبرنا بما تبنيه. نرد خلال يوم عمل واحد.",
    emailLabel: "البريد الإلكتروني",
    careersLabel: "الوظائف",
    careersNote: "تبحث عن وظيفة أو تدريب؟ أرسل سيرتك الذاتية ومعرض أعمالك إلى هذا البريد. هذه الصفحة والنموذج مخصصان لاستفسارات المشاريع فقط.",
    phoneLabel: "الهاتف",
    officePrefix: "مكتب ",
    officeSuffix: "",
    comma: "،",
    enquiry: "/ استفسار عن مشروع",
    formMessages: {
      required: "يرجى تعبئة هذا الحقل.",
      email: "يرجى إدخال عنوان بريد إلكتروني صحيح.",
      tooMany: "عدد الطلبات كبير جداً. يرجى المحاولة مرة أخرى لاحقاً.",
      invalid: "بيانات النموذج غير صالحة. يرجى مراجعة الحقول والمحاولة مرة أخرى.",
      delivery: (email) => `تعذّر إرسال رسالتك الآن. يرجى مراسلتنا على ${email} بدلاً من ذلك.`,
      generic: "حدث خطأ ما.",
    },
  },
};

type ThankYouCopy = {
  title: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  body: string;
  back: string;
};

export const thankYouContent: Record<Locale, ThankYouCopy> = {
  en: {
    title: "Thank You | Mimar Studios",
    eyebrow: "/ Thank you",
    heading1: "We've got it.",
    heading2: "We'll be in touch shortly.",
    body: "Thanks for reaching out to Mimar Studios. A member of the team will follow up on your enquiry soon.",
    back: "Back to home",
  },
  ar: {
    title: "شكراً لك | ميمار ستوديوز",
    eyebrow: "/ شكراً لك",
    heading1: "تم الاستلام.",
    heading2: "سنتواصل معك قريباً.",
    body: "شكراً لتواصلك مع ميمار ستوديوز. سيتابع أحد أعضاء الفريق استفسارك قريباً.",
    back: "العودة إلى الرئيسية",
  },
};
