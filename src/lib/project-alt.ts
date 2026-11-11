import type { Locale } from "@/i18n/config";

/**
 * Image alt text for the portfolio (SEO scope item 12, 5 Nov 2026). The old text was the same
 * pattern on every image ("<title> by Mimar Studios"). Each cover below says what the render
 * shows plus the project name, place and kind of work, so Google Images and screen readers get a
 * real description. Written from the cover images themselves: the consultant's draft (Mimar.xlsx,
 * D7) described several wrongly (Abuja is a mall atrium, Divine Golf is apartment blocks, not
 * villas), so do not paste its text back in. A project that is not listed (a new one from the
 * CMS) falls back to a name + type + place sentence.
 */
type Alt = { en: string; ar: string };

const coverAlt: Record<string, Alt> = {
  "aark-residences": {
    en: "Aark Residences, Dubai: rooftop pool terrace with lounge seating and the Dubai skyline, 3D architectural visualization",
    ar: "آرك ريزيدنسز في دبي: تراس مسبح على السطح مع مقاعد استرخاء وأفق مدينة دبي، تصور معماري ثلاثي الأبعاد",
  },
  "amer-al-ghurair": {
    en: "Amer Al Ghurair, Dubai: residential towers around a landscaped swimming pool, 3D architectural visualization",
    ar: "عامر الغرير في دبي: أبراج سكنية حول مسبح محاط بالمساحات الخضراء، تصور معماري ثلاثي الأبعاد",
  },
  "amerat-park": {
    en: "Amerat Park, Muscat: aerial view of the park master plan with roads, a plaza and a water feature, architectural design render",
    ar: "حديقة العامرات في مسقط: منظر جوي للمخطط العام للحديقة مع الطرق وساحة ونافورة مياه، تصميم معماري ثلاثي الأبعاد",
  },
  "divine-golf": {
    en: "Divine Golf, Dubai: low-rise apartment buildings beside a golf course, 3D architectural visualization",
    ar: "ديفاين جولف في دبي: مبانٍ سكنية منخفضة الارتفاع بجوار ملعب غولف، تصور معماري ثلاثي الأبعاد",
  },
  "divine-residencia": {
    en: "Divine Residencia, Dubai: low-rise apartment building with balconies and a landscaped garden, 3D architectural visualization",
    ar: "ديفاين ريزيدنسيا في دبي: مبنى سكني منخفض الارتفاع بشرفات وحديقة، تصور معماري ثلاثي الأبعاد",
  },
  "h-and-s": {
    en: "H&S, Dubai: curved building with an illuminated facade on a street at night, 3D architectural visualization",
    ar: "إتش أند إس في دبي: مبنى منحني بواجهة مضاءة على شارع ليلاً، تصور معماري ثلاثي الأبعاد",
  },
  "karma-trinity": {
    en: "Karma Trinity, Dubai: aerial view of a terraced residential tower with a pool deck in a new neighbourhood, 3D architectural visualization",
    ar: "كارما ترينيتي في دبي: منظر جوي لبرج سكني مدرّج مع منطقة مسبح داخل حي جديد، تصور معماري ثلاثي الأبعاد",
  },
  "nana-222": {
    en: "NANA 222, Riyadh: terraced tower with planted balconies and curved glass, 3D architectural visualization",
    ar: "نانا 222 في الرياض: برج مدرّج بشرفات مزروعة وزجاج منحنٍ، تصور معماري ثلاثي الأبعاد",
  },
  "nomi-downtown": {
    en: "Nomi Downtown, Miami: aerial view of a city-block development with courtyards and green space, 3D architectural visualization",
    ar: "نومي داون تاون في ميامي: منظر جوي لمجمع من المباني الحضرية مع أفنية ومساحات خضراء، تصور معماري ثلاثي الأبعاد",
  },
  "the-garden-residences": {
    en: "The Garden Residences, USA: modern living room with a sofa, wall-mounted TV and floor-to-ceiling curtains, interior design visualization",
    ar: "مساكن الحديقة في الولايات المتحدة: غرفة معيشة عصرية بأريكة وتلفاز جداري وستائر بطول الجدار، تصور للتصميم الداخلي",
  },
  "360-residences": {
    en: "360 Residences, Pakistan: high-rise residential towers above a street-level retail plaza, 3D architectural visualization",
    ar: "360 ريزيدنسز في باكستان: أبراج سكنية شاهقة فوق ساحة تجارية على مستوى الشارع، تصور معماري ثلاثي الأبعاد",
  },
  "aurum-one": {
    en: "Aurum One, Pakistan: glass-facade tower rising through low cloud, 3D architectural visualization",
    ar: "أوروم وان في باكستان: برج بواجهة زجاجية يرتفع وسط الغيوم المنخفضة، تصور معماري ثلاثي الأبعاد",
  },
  "cafe-interior": {
    en: "Café interior in Pakistan: wooden counter with a pastry display, bar stools and lounge seating, interior design visualization",
    ar: "التصميم الداخلي لمقهى في باكستان: كاونتر خشبي مع واجهة للمعجنات ومقاعد بار وجلسات استرخاء، تصور للتصميم الداخلي",
  },
  "dha-multan-highrise": {
    en: "DHA Multan Highrise, Multan: residential tower with curved balconies at dusk, 3D architectural visualization",
    ar: "دي إتش إيه ملتان - برج سكني في ملتان: برج سكني بشرفات منحنية عند الغسق، تصور معماري ثلاثي الأبعاد",
  },
  "faisal-hills": {
    en: "Faisal Hills, Islamabad: aerial master plan of a housing community with a golf course, lakes and tree-lined streets, architectural design render",
    ar: "تلال فيصل في إسلام آباد: مخطط عام جوي لمجمع سكني مع ملعب غولف وبحيرات وشوارع محاطة بالأشجار، تصميم معماري ثلاثي الأبعاد",
  },
  "faisal-town-ii": {
    en: "Faisal Town II, Islamabad: aerial master plan of a large planned residential community with green corridors and water channels, architectural design render",
    ar: "فيصل تاون 2 في إسلام آباد: مخطط عام جوي لمجمع سكني كبير مخطط له مع ممرات خضراء وقنوات مائية، تصميم معماري ثلاثي الأبعاد",
  },
  hmr: {
    en: "HMR, Karachi: two glass high-rise towers rising above the clouds, 3D architectural visualization",
    ar: "إتش إم آر في كراتشي: برجان زجاجيان شاهقان يعلوان الغيوم، تصور معماري ثلاثي الأبعاد",
  },
  "lake-city": {
    en: "Lake City, Lahore: lakeside apartment buildings lit at night, 3D architectural visualization",
    ar: "ليك سيتي في لاهور: مبانٍ سكنية مضاءة ليلاً على ضفة بحيرة، تصور معماري ثلاثي الأبعاد",
  },
  abuja: {
    en: "Abuja, Nigeria: shopping mall atrium with palm trees and shop frontages under a glazed roof, interior design visualization",
    ar: "أبوجا في نيجيريا: ردهة مركز تسوق بأشجار النخيل وواجهات المتاجر تحت سقف زجاجي، تصور للتصميم الداخلي",
  },
};

type AltProject = { slug: string; title: string; category: string; location: string };

/** Alt text for a project's cover image, in the page language. */
export function projectCoverAlt(project: AltProject, lang: Locale): string {
  const known = coverAlt[project.slug];
  if (known) return known[lang === "ar" ? "ar" : "en"];
  return lang === "ar"
    ? `${project.title} - ${project.category} من استوديوهات معمار في ${project.location}`
    : `${project.title} - ${project.category} by Mimar Studios in ${project.location}`;
}

/**
 * Alt text for a gallery image of a project. The gallery shots differ from the cover (interiors,
 * plans, close-ups), so this names the project, the kind of work and the place, and numbers the
 * view, without claiming a subject the image may not show.
 */
export function projectGalleryAlt(project: AltProject, lang: Locale, index: number): string {
  return lang === "ar"
    ? `${project.title} - ${project.category} في ${project.location} - منظر ${index}`
    : `${project.title} - ${project.category} in ${project.location} - view ${index}`;
}
