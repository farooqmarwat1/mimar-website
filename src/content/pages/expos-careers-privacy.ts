import type { Locale } from "@/i18n/config";

type Row = [string, string];

/* ------------------------------------------------------------------ Expos */

type ExposCopy = {
  title: string;
  description: string;
  keywords: string[];
  home: string;
  breadcrumbName: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  body: string;
  formats: Row[];
  closing: string;
  cta: string;
};

export const exposContent: Record<Locale, ExposCopy> = {
  en: {
    title: "Expos & Events | Mimar Studios",
    description:
      "Mimar Studios presents at real estate and architecture expos across Pakistan and the Gulf with interactive VR, AR and virtual tour experiences.",
    keywords: ["real estate expo", "architecture exhibition", "VR real estate demo"],
    home: "Home",
    breadcrumbName: "Expos",
    eyebrow: "/ Expos",
    heading1: "We show up",
    heading2: "where buyers are.",
    body: "Beyond client deliverables, Mimar Studios takes its interactive tools - VR headsets, AR prints, dual-screen navigators - to real estate and property expos across Pakistan and the Gulf, on our own stand or alongside developer partners. Get in touch if you'd like Mimar at your next launch or exhibition.",
    formats: [
      ["Live VR & AR demos", "Headset walkthroughs and interactive AR print pieces set up on the stand for attendees to try directly."],
      ["Dual-screen sales stations", "The same agent-console setup used in sales offices, running live for booth visitors."],
      ["Big-screen showreels", "Animation and rendering work looped for passing traffic, with the team on hand to talk through projects."],
    ],
    closing: "Planning a launch event or exhibition stand and want an interactive experience on it? Tell us the dates and format and we'll put a package together.",
    cta: "Get in touch",
  },
  ar: {
    title: "المعارض والفعاليات | ميمار ستوديوز",
    description:
      "تشارك ميمار ستوديوز في معارض العقارات والعمارة في باكستان ومنطقة الخليج من خلال تجارب تفاعلية بالواقع الافتراضي والمعزز والجولات الافتراضية.",
    keywords: ["معرض عقاري", "معرض عمارة", "عرض الواقع الافتراضي العقاري"],
    home: "الرئيسية",
    breadcrumbName: "المعارض",
    eyebrow: "/ المعارض",
    heading1: "نتواجد",
    heading2: "حيث يكون المشترون.",
    body: "إلى جانب أعمالنا مع العملاء، تأخذ ميمار ستوديوز أدواتها التفاعلية - نظارات الواقع الافتراضي، والمطبوعات بالواقع المعزز، وشاشات العرض المزدوجة - إلى معارض العقارات في باكستان ومنطقة الخليج، سواء على جناحنا الخاص أو إلى جانب شركاء التطوير العقاري. تواصل معنا إذا كنت ترغب بحضور ميمار في إطلاقك أو معرضك القادم.",
    formats: [
      ["عروض حيّة بالواقع الافتراضي والمعزز", "جولات بنظارات الواقع الافتراضي وقطع مطبوعة تفاعلية بالواقع المعزز مُجهّزة على الجناح ليجرّبها الحضور مباشرة."],
      ["محطات مبيعات بشاشة مزدوجة", "نفس إعداد لوحة تحكم الوكيل المستخدم في مكاتب المبيعات، تعمل بشكل مباشر لزوار الجناح."],
      ["عروض على شاشة كبيرة", "أعمال رسوم متحركة وتصيير تُعرض بشكل متكرر للمارّة، مع تواجد الفريق للحديث عن المشاريع."],
    ],
    closing: "هل تخطط لفعالية إطلاق أو جناح معرض وتريد تجربة تفاعلية فيه؟ أخبرنا بالتواريخ والصيغة المطلوبة وسنُعدّ لك باقة مناسبة.",
    cta: "تواصل معنا",
  },
};

/* ---------------------------------------------------------------- Careers */

type CareersCopy = {
  title: string;
  description: string;
  keywords: string[];
  home: string;
  breadcrumbName: string;
  eyebrow: string;
  heading1: string;
  heading2: string;
  body: string;
  values: Row[];
  openRolesHeading: string;
  /** English renders "/ 2 open roles" as separate text nodes; Arabic builds the whole phrase. */
  openRolesLabel: (count: number) => string;
  viewRole: string;
  modeLabel: Record<"onsite" | "hybrid" | "remote", string>;
  typeLabel: Record<"full-time" | "part-time" | "contract" | "internship" | "temporary", string>;
  dontSeePrefix: string;
  dontSeeSuffix: string;
  noRolesPrefix: string;
  cta: string;
};

export const careersContent: Record<Locale, CareersCopy> = {
  en: {
    title: "Careers | Mimar Studios",
    description:
      "Join Mimar Studios - a multidisciplinary team of architects, visualizers and designers working on projects across 14+ countries.",
    keywords: ["Mimar Studios careers", "architecture jobs Islamabad", "3D visualization jobs"],
    home: "Home",
    breadcrumbName: "Careers",
    eyebrow: "/ Careers",
    heading1: "Build the studio",
    heading2: "alongside us.",
    body: "Mimar Studios is a multidisciplinary team of architects, 3D artists, animators and designers based in Islamabad, working with clients across 14+ countries. We hire in waves as project load demands rather than keeping a running list open - the fastest way to be considered is to send your application with a link to your portfolio.",
    values: [
      ["Craft first", "Every render, animation and drawing carries the studio's name. We'd rather do fewer projects well than many projects fast."],
      ["Learn on real work", "Team members from Pakistan, Turkey and Egypt work side by side on live client projects, not internal exercises."],
      ["Ownership", "Small project teams mean your work is visible - from first concept to what the client actually sees."],
    ],
    openRolesHeading: "Open roles",
    openRolesLabel: (count) => `/ ${count} open ${count === 1 ? "role" : "roles"}`,
    viewRole: "View role →",
    modeLabel: { onsite: "On-site", hybrid: "Hybrid", remote: "Remote" },
    typeLabel: { "full-time": "Full-time", "part-time": "Part-time", contract: "Contract", internship: "Internship", temporary: "Temporary" },
    dontSeePrefix: "Don't see the right role? Send your portfolio and CV to",
    dontSeeSuffix: " and we'll keep it on file.",
    noRolesPrefix: "No open roles are posted here right now. If you'd like to be considered when a position opens, send your portfolio and CV to ",
    cta: "Send your application",
  },
  ar: {
    title: "الوظائف | ميمار ستوديوز",
    description:
      "انضم إلى ميمار ستوديوز - فريق متعدد التخصصات من المعماريين وفناني التصور البصري والمصممين يعملون على مشاريع في أكثر من 14 دولة.",
    keywords: ["وظائف ميمار ستوديوز", "وظائف عمارة في إسلام آباد", "وظائف التصور ثلاثي الأبعاد"],
    home: "الرئيسية",
    breadcrumbName: "الوظائف",
    eyebrow: "/ الوظائف",
    heading1: "ابنِ الاستوديو",
    heading2: "معنا.",
    body: "ميمار ستوديوز فريق متعدد التخصصات من المعماريين وفناني ثلاثي الأبعاد ومحرّكي الرسوم والمصممين، مقرّه إسلام آباد، ويعمل مع عملاء في أكثر من 14 دولة. نوظّف على دفعات حسب حجم المشاريع بدلاً من إبقاء قائمة توظيف مفتوحة باستمرار - وأسرع طريقة للنظر في طلبك هي إرسال طلبك مع رابط أعمالك السابقة.",
    values: [
      ["الحرفية أولاً", "كل مشهد ورسم متحرك ومخطط يحمل اسم الاستوديو. نفضّل إنجاز عدد أقل من المشاريع بإتقان على إنجاز الكثير منها بسرعة."],
      ["التعلّم من العمل الحقيقي", "يعمل أعضاء الفريق من باكستان وتركيا ومصر جنباً إلى جنب على مشاريع عملاء حقيقية، وليس تمارين داخلية."],
      ["الملكية", "فرق المشاريع الصغيرة تعني أن عملك مرئي - من الفكرة الأولى إلى ما يراه العميل فعلياً."],
    ],
    openRolesHeading: "الوظائف الشاغرة",
    openRolesLabel: (count) => {
      if (count === 1) return "/ وظيفة شاغرة واحدة";
      if (count === 2) return "/ وظيفتان شاغرتان";
      return `/ ${count} ${count <= 10 ? "وظائف شاغرة" : "وظيفة شاغرة"}`;
    },
    viewRole: "عرض الوظيفة ←",
    modeLabel: { onsite: "في المقر", hybrid: "هجين", remote: "عن بُعد" },
    typeLabel: { "full-time": "دوام كامل", "part-time": "دوام جزئي", contract: "عقد", internship: "تدريب", temporary: "مؤقت" },
    dontSeePrefix: "لا تجد الوظيفة المناسبة؟ أرسل أعمالك السابقة وسيرتك الذاتية إلى",
    dontSeeSuffix: " وسنحتفظ بها في ملفاتنا.",
    noRolesPrefix: "لا توجد وظائف شاغرة معلَنة هنا حالياً. إذا كنت ترغب في أن يُنظر في طلبك عند فتح وظيفة، أرسل أعمالك السابقة وسيرتك الذاتية إلى ",
    cta: "أرسل طلبك",
  },
};

/* ---------------------------------------------------------------- Privacy */

type PrivacyCopy = {
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
  /** Rendered as pre + email link + mid + " " + address + ".". */
  contactBody: [string, string];
};

// GENERIC STARTER - not reviewed by counsel. Drafted to fill a gap flagged
// in the pre-launch SEO migration audit (old /privacy-policy/ had no
// equivalent on the new site). Mimar Studios must have a lawyer review and
// adapt this in both languages - especially the data-processor list and any
// jurisdiction-specific rights (e.g. GDPR/CCPA) - before it is treated as
// the real, binding policy.
export const privacyContent: Record<Locale, PrivacyCopy> = {
  en: {
    title: "Privacy Policy | Mimar Studios",
    description: "How Mimar Studios collects, uses and protects information submitted through this website.",
    home: "Home",
    breadcrumbName: "Privacy Policy",
    eyebrow: "/ Legal",
    heading: "Privacy Policy",
    intro: [
      "This policy explains how ",
      " (\"Mimar Studios\", \"we\", \"us\") collects, uses and protects information submitted through ",
      ". Last updated 28 October 2026.",
    ],
    sections: [
      ["Information we collect", "When you use this website, we may collect information you provide directly - such as your name, email address, phone number and project details submitted through our contact form - and information collected automatically when you visit, such as the pages you view and for how long, the website that referred you, your browser and device type, your preferred language, and your approximate location (city and country) worked out from your IP address. If you send us an enquiry, we also keep your IP address with it."],
      ["How we use information", "We use the information we collect to respond to enquiries, provide quotes, deliver services you request, improve this website, and - where you have not opted out - send occasional updates about our work. We do not sell personal information to third parties."],
      ["Cookies & analytics", "We do not use advertising or tracking cookies, and we do not store identifiers on your device to follow you between visits. Our visit statistics are recorded on our own server: a one-way hash of your IP address and browser, which changes every day, groups the pages you view within a single day. Your IP address is kept with those visit records for 30 days and then deleted. The site sets only two small functional cookies: one remembers the language you choose and one adjusts some wording to your country. We honour Do Not Track and Global Privacy Control signals by not recording your visit. You can block cookies in your browser settings and the site will still work."],
      ["Third-party services", "We use third-party providers to operate this website and our business - for example, hosting, content management, database and email delivery providers. These providers process data on our behalf and are expected to protect it, but we do not control their systems directly."],
      ["Data retention", "Visit statistics are deleted automatically after 30 days. Enquiry details, including the visit summary and IP address saved with an enquiry, are kept for as long as needed to respond to your enquiry, deliver a service, or meet legal and accounting obligations, after which they are deleted or anonymized."],
      ["Your rights", "Depending on where you are located, you may have rights to access, correct, or request deletion of your personal information, or to object to certain processing. To exercise any of these rights, contact us using the details below."],
      ["Children's privacy", "This website is intended for business use and is not directed at children. We do not knowingly collect personal information from children."],
      ["Changes to this policy", "We may update this policy from time to time. Material changes will be reflected by an updated date on this page."],
    ],
    contactHeading: "Contact us",
    contactBody: ["For any privacy questions or to exercise your rights, contact us at", " or"],
  },
  ar: {
    title: "سياسة الخصوصية | ميمار ستوديوز",
    description: "كيف تجمع ميمار ستوديوز المعلومات المُقدَّمة عبر هذا الموقع وتستخدمها وتحميها.",
    home: "الرئيسية",
    breadcrumbName: "سياسة الخصوصية",
    eyebrow: "/ الشؤون القانونية",
    heading: "سياسة الخصوصية",
    intro: [
      "توضح هذه السياسة كيف تقوم ",
      " (\"ميمار ستوديوز\"، \"نحن\") بجمع المعلومات المُقدَّمة عبر ",
      " واستخدامها وحمايتها. آخر تحديث: 28 أكتوبر 2026.",
    ],
    sections: [
      ["المعلومات التي نجمعها", "عند استخدامك لهذا الموقع، قد نجمع معلومات تقدّمها مباشرة - مثل اسمك وبريدك الإلكتروني ورقم هاتفك وتفاصيل مشروعك المُقدَّمة عبر نموذج التواصل - بالإضافة إلى معلومات تُجمع تلقائياً عند زيارتك، مثل الصفحات التي تتصفحها ومدة تصفحها والموقع الذي أحالك إلينا ونوع المتصفح والجهاز ولغتك المفضلة وموقعك التقريبي (المدينة والدولة) المستنتج من عنوان IP الخاص بك. وإذا أرسلت إلينا استفساراً فإننا نحتفظ أيضاً بعنوان IP الخاص بك مع الاستفسار."],
      ["كيف نستخدم المعلومات", "نستخدم المعلومات التي نجمعها للرد على الاستفسارات، وتقديم عروض الأسعار، وتنفيذ الخدمات التي تطلبها، وتحسين هذا الموقع، وفي حال عدم اعتراضك، إرسال تحديثات دورية عن أعمالنا. نحن لا نبيع المعلومات الشخصية لأطراف ثالثة."],
      ["ملفات تعريف الارتباط والتحليلات", "لا نستخدم ملفات تعريف الارتباط الإعلانية أو التتبعية، ولا نخزّن على جهازك معرّفات لتتبعك بين الزيارات. تُسجَّل إحصاءات الزيارات على خادمنا الخاص: نستخدم بصمة أحادية الاتجاه لعنوان IP والمتصفح تتغير كل يوم لتجميع الصفحات التي تتصفحها خلال يوم واحد. ويُحفظ عنوان IP الخاص بك مع سجلات الزيارة هذه لمدة 30 يوماً ثم يُحذف. يضع الموقع ملفَّي تعريف ارتباط وظيفيَّين صغيرين فقط: أحدهما يتذكّر اللغة التي تختارها والآخر يكيّف بعض النصوص بحسب بلدك. نحترم إشارتَي «عدم التتبع» (Do Not Track) و«التحكم العالمي في الخصوصية» (Global Privacy Control) فلا نسجّل زيارتك عند إرسالهما. يمكنك حظر ملفات تعريف الارتباط من إعدادات المتصفح ويظل الموقع يعمل."],
      ["خدمات الأطراف الثالثة", "نستخدم مزوّدي خدمات من أطراف ثالثة لتشغيل هذا الموقع وأعمالنا - مثل مزوّدي الاستضافة وإدارة المحتوى وقواعد البيانات وتسليم البريد الإلكتروني. تقوم هذه الجهات بمعالجة البيانات نيابةً عنا ويُتوقع منها حمايتها، إلا أننا لا نتحكم في أنظمتها بشكل مباشر."],
      ["الاحتفاظ بالبيانات", "تُحذف إحصاءات الزيارات تلقائياً بعد 30 يوماً. أما تفاصيل الاستفسار، بما في ذلك ملخص الزيارة وعنوان IP المحفوظان مع الاستفسار، فنحتفظ بها للمدة اللازمة للرد على استفسارك أو تقديم الخدمة أو الوفاء بالالتزامات القانونية والمحاسبية، وبعد ذلك يتم حذفها أو إخفاء هويتها."],
      ["حقوقك", "بحسب موقعك، قد يكون لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو طلب حذفها، أو الاعتراض على بعض عمليات معالجتها. لممارسة أي من هذه الحقوق، تواصل معنا عبر التفاصيل أدناه."],
      ["خصوصية الأطفال", "هذا الموقع مخصص للاستخدام التجاري وغير موجّه للأطفال. نحن لا نجمع عن قصد معلومات شخصية من الأطفال."],
      ["تعديلات على هذه السياسة", "قد نقوم بتحديث هذه السياسة من وقت لآخر. ستنعكس التغييرات الجوهرية من خلال تاريخ تحديث جديد في هذه الصفحة."],
    ],
    contactHeading: "تواصل معنا",
    contactBody: ["لأي استفسارات متعلقة بالخصوصية أو لممارسة حقوقك، تواصل معنا عبر", " أو"],
  },
};
