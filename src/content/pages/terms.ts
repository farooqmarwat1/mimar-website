import type { Locale } from "@/i18n/config";

type Row = [string, string];

type TermsCopy = {
  title: string;
  description: string;
  home: string;
  breadcrumbName: string;
  eyebrow: string;
  heading: string;
  /** Rendered as pre + legal name + mid + site URL + post. */
  intro: [string, string, string];
  sections: Row[];
  contactHeading: string;
  /** Rendered as pre + email link + ".". */
  contactBody: string;
};

// DRAFT - added 26 Nov 2026 so the forms' "I agree to the Terms of Use and Privacy Policy" checkbox
// has a page to point to. Not reviewed by counsel, like the privacy policy: Mimar Studios must have a
// lawyer review and adapt it in both languages (especially liability and governing law) before it is
// treated as binding. The Arabic was written by Claude and needs a native review (ARABIC.md).
export const termsContent: Record<Locale, TermsCopy> = {
  en: {
    title: "Terms of Use | Mimar Studios",
    description: "The terms that apply when you use the Mimar Studios website and send us an enquiry.",
    home: "Home",
    breadcrumbName: "Terms of Use",
    eyebrow: "/ Legal",
    heading: "Terms of Use",
    intro: [
      "These terms apply when you use the website of ",
      " (\"Mimar Studios\", \"we\", \"us\") at ",
      ". By using the site or sending us an enquiry, you agree to them. Last updated 26 November 2026.",
    ],
    sections: [
      ["Using this website", "You may browse this website and share links to its pages for personal or business use. Please do not misuse it: do not try to break or overload it, send automated or bulk submissions through its forms, or use it for anything unlawful."],
      ["Our work and content", "The renders, animations, virtual tours, designs, photographs, text and logos on this website belong to Mimar Studios or to our clients, and are shown to present our work. You may not copy, download for reuse, edit or publish them elsewhere without our written permission."],
      ["Enquiries and quotes", "Sending a form, a WhatsApp message or an email does not create a contract. Any quote we send is an estimate based on the information you share and is valid only as stated in it. A project starts only when both sides agree its scope, price and schedule in writing."],
      ["Files you send us", "If you share plans, drawings or other material with us, you confirm that you have the right to do so. We use it only to answer your enquiry and prepare a quote, and we are happy to sign a non-disclosure agreement for unreleased projects."],
      ["AI agent", "The chat assistant on this website writes its answers with artificial intelligence. They are for general information only, may contain mistakes, and are not an offer, a quote or advice. Please confirm anything important with our team."],
      ["Links to other websites", "This website links to other services, such as social networks, booking and map tools. We are not responsible for their content or how they handle your information."],
      ["No guarantee", "We keep this website accurate and available, but we cannot guarantee that it is always complete, current or free of errors or interruptions. To the extent the law allows, Mimar Studios is not liable for any loss that comes from using this website or relying on its content."],
      ["Changes to these terms", "We may update these terms from time to time. The date at the top of this page shows when they last changed."],
      ["Governing law", "These terms are governed by the laws of Pakistan, and the courts of Islamabad have jurisdiction over any dispute about them, unless the law of your country gives you rights that cannot be removed by agreement."],
    ],
    contactHeading: "Questions",
    contactBody: "For any question about these terms, write to us at",
  },
  ar: {
    title: "شروط الاستخدام | استوديوهات معمار",
    description: "الشروط التي تنطبق عند استخدامك لموقع استوديوهات معمار وإرسالك استفساراً إلينا.",
    home: "الرئيسية",
    breadcrumbName: "شروط الاستخدام",
    eyebrow: "/ الشؤون القانونية",
    heading: "شروط الاستخدام",
    intro: [
      "تنطبق هذه الشروط عند استخدامك لموقع ",
      " (\"استوديوهات معمار\"، \"نحن\") على ",
      ". باستخدامك للموقع أو إرسالك استفساراً إلينا فإنك توافق عليها. آخر تحديث: 26 نوفمبر 2026.",
    ],
    sections: [
      ["استخدام هذا الموقع", "يمكنك تصفّح هذا الموقع ومشاركة روابط صفحاته للاستخدام الشخصي أو التجاري. يُرجى عدم إساءة استخدامه: فلا تحاول تعطيله أو إثقاله، ولا ترسل عبر نماذجه طلبات آلية أو جماعية، ولا تستخدمه لأي غرض غير قانوني."],
      ["أعمالنا ومحتوى الموقع", "الرندرات والرسوم المتحركة والجولات الافتراضية والتصاميم والصور والنصوص والشعارات المعروضة على هذا الموقع مملوكة لاستوديوهات معمار أو لعملائنا، وتُعرض لتقديم أعمالنا. لا يجوز نسخها أو تنزيلها لإعادة استخدامها أو تعديلها أو نشرها في مكان آخر دون إذن كتابي منا."],
      ["الاستفسارات وعروض الأسعار", "إرسال نموذج أو رسالة واتساب أو بريد إلكتروني لا يُنشئ عقداً. أي عرض سعر نرسله هو تقدير مبني على المعلومات التي تشاركها، ويسري فقط وفق ما هو مذكور فيه. لا يبدأ أي مشروع إلا بعد اتفاق الطرفين كتابياً على نطاقه وسعره وجدوله الزمني."],
      ["الملفات التي ترسلها إلينا", "إذا شاركت معنا مخططات أو رسومات أو مواد أخرى، فإنك تؤكد أن لديك الحق في ذلك. نستخدمها فقط للرد على استفسارك وإعداد عرض السعر، ويسعدنا توقيع اتفاقية عدم إفصاح للمشاريع غير المُعلنة."],
      ["الوكيل الذكي", "يكتب مساعد المحادثة على هذا الموقع إجاباته باستخدام الذكاء الاصطناعي. وهي للمعلومات العامة فقط، وقد تحتوي على أخطاء، ولا تُعد عرضاً أو عرض سعر أو استشارة. يُرجى التأكد من أي أمر مهم مع فريقنا."],
      ["روابط مواقع أخرى", "يحتوي هذا الموقع على روابط لخدمات أخرى، مثل الشبكات الاجتماعية وأدوات الحجز والخرائط. ولسنا مسؤولين عن محتواها أو عن طريقة تعاملها مع معلوماتك."],
      ["إخلاء المسؤولية", "نحرص على دقة هذا الموقع وتوفّره، لكننا لا نضمن أن يكون دائماً كاملاً أو محدّثاً أو خالياً من الأخطاء أو الانقطاعات. وفي الحدود التي يسمح بها القانون، لا تتحمل استوديوهات معمار المسؤولية عن أي خسارة تنتج عن استخدام هذا الموقع أو الاعتماد على محتواه."],
      ["تعديل هذه الشروط", "قد نُحدّث هذه الشروط من وقت لآخر. ويوضح التاريخ في أعلى هذه الصفحة موعد آخر تعديل."],
      ["القانون الواجب التطبيق", "تخضع هذه الشروط لقوانين باكستان، وتختص محاكم إسلام آباد بأي نزاع يتعلق بها، ما لم يمنحك قانون بلدك حقوقاً لا يجوز التنازل عنها بالاتفاق."],
    ],
    contactHeading: "أسئلة",
    contactBody: "لأي سؤال حول هذه الشروط، راسلنا على",
  },
};
