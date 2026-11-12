import type { Locale } from "@/i18n/config";
import { enStories } from "./project-stories-en";
import { arStories } from "./project-stories-ar";

/**
 * Written content for a project page, on top of the one-line summary every project has
 * (SEO scope items 7 and 12, SEO_MIGRATION.md point 26). The project pages were thin: about 76
 * words each, most of it one sentence repeated on every page with the place swapped. A story
 * gives a page its own overview (the project's keywords used naturally), what the renders show,
 * FAQs (with FAQPage markup) and links to the matching service and country pages.
 *
 * Rules for writing one:
 * - Say only what the images and the project data show. No client names, sizes, years or awards
 *   unless the team has confirmed them.
 * - Keywords from sheet D7 (Mimar.xlsx) go into the heading, the first paragraph, one FAQ and the
 *   search-result title, in normal sentences. Do not repeat them to hit a count. Leave out claims
 *   ("best project in the UAE") and misspellings from the sheet.
 * - Link the service page and the country page once each inside the first paragraph.
 * - FAQs are about this project. At most one general question per page, so 19 pages do not
 *   repeat the same block.
 * - The page H1 stays the project name. A project without a story keeps the old layout.
 *
 * The stories themselves live in project-stories-en.ts and project-stories-ar.ts (one per project and language).
 */
export type ProjectStory = {
  /** Search-result title (50-60 characters) and description (120-155) for this project. */
  seo: { title: string; description: string };
  /** Replaces the "Hospitality / Residential" spec when that label does not fit the project. */
  typology?: string;
  /** H2 above the overview. Carries the project's main keyword. */
  heading: string;
  /** Overview. `[words](/english-path)` becomes an internal link (the Arabic page gets the /ar URL). */
  paragraphs: string[];
  /**
   * One entry per gallery image (the cover is the hero and has its own alt in project-alt.ts):
   * the caption shown under the image and its alt text, both written from the image itself.
   */
  views: { image: string; title: string; text: string; alt: string }[];
  /** Visible FAQs, also written to FAQPage JSON-LD. Answers must stand alone. */
  faqs: { question: string; answer: string }[];
  /** The service page this project belongs to. The country page is added from the region data. */
  service: { path: string; label: string };
  /**
   * The "Get in touch" block at the end (same design as the home page, ContactCta): a two-part
   * heading (the second part in the accent colour) and one sentence. Eyebrow and button stay shared.
   */
  cta: { heading1: string; heading2: string; body: string };
};

/**
 * Width/height of the gallery renders that are not 16:9 (most are). A captioned image gets a box of
 * its own shape, so the caption sits right under the picture with no letterbox space around it.
 * tests/project-stories.test.cjs reads the real files and fails if a ratio here is wrong or missing.
 */
const galleryRatios: Record<string, string> = {
  "/projects/catalog/h-and-s/image-1.jpg": "1500 / 2000",
  "/projects/catalog/h-and-s/image-4.jpg": "1412 / 2000",
  "/projects/catalog/karma-trinity/image-7.jpg": "2000 / 988",
  "/projects/catalog/nana-222/image-2.jpg": "2000 / 1680",
  "/projects/catalog/nana-222/image-3.jpg": "2000 / 1682",
  "/projects/catalog/nana-222/image-5.jpg": "1536 / 1086",
  "/projects/catalog/nana-222/image-8.jpg": "1536 / 1141",
  "/projects/catalog/360-residences/image-2.jpg": "1600 / 2000",
  "/projects/catalog/aurum-one/image-3.jpg": "2000 / 785",
  "/projects/catalog/cafe-interior/image-3.jpg": "2048 / 1365",
  "/projects/catalog/dha-multan-highrise/image-2.jpg": "2000 / 1143",
  "/projects/catalog/dha-multan-highrise/image-3.jpg": "2000 / 1143",
};

/** CSS aspect-ratio of a gallery render ("16 / 9" unless listed above). */
export function galleryRatio(image: string): string {
  return galleryRatios[image] ?? "16 / 9";
}

const ratioOf = (image: string) => {
  const [w, h] = galleryRatio(image).split("/").map(Number);
  return w / h;
};

/** Width/height of a gallery render as a number (sizes the renders of a row to one height). */
export function galleryRatioValue(image: string): number {
  return ratioOf(image);
}

/**
 * Rows of a captioned gallery, in the images' own order: one full-width render, then a pair, then a
 * full-width render, and so on. A tall render (narrower than 1.2:1) is never full width; it joins a
 * pair. No render is left alone at the end: a lone last render joins the row before it (a full row
 * becomes a pair, a pair becomes a row of three). The page gives every render in a row the same height.
 */
export function planGalleryRows(images: string[]): string[][] {
  const rows: string[][] = [];
  let wantFull = true;
  for (let i = 0; i < images.length; ) {
    const left = images.length - i;
    const fullFits = wantFull && ratioOf(images[i]) >= 1.2;
    if (left === 1 && !fullFits && rows.length > 0) {
      rows[rows.length - 1].push(images[i]);
      break;
    }
    if (fullFits || left === 1) {
      rows.push([images[i]]);
      i += 1;
      wantFull = false;
    } else {
      rows.push(images.slice(i, i + 2));
      i += 2;
      wantFull = true;
    }
  }
  return rows;
}

type StoryLabels = { related: string; showcase: (title: string) => string; faqs: (title: string) => string };

/** Section headings on a project page with a story. The gallery and FAQ headings are H2s with the project name. */
export const projectStoryLabels: Record<Locale, StoryLabels> = {
  en: { related: "Related services", showcase: (title) => `${title} visual showcase`, faqs: (title) => `${title} FAQs` },
  ar: {
    related: "خدمات ذات صلة",
    showcase: (title) => `العرض البصري لمشروع ${title}`,
    faqs: (title) => `أسئلة شائعة عن ${title}`,
  },
};

const stories: Record<Locale, Record<string, ProjectStory>> = { en: enStories, ar: arStories };

export function getProjectStory(slug: string, lang: Locale): ProjectStory | undefined {
  return stories[lang === "ar" ? "ar" : "en"][slug];
}
