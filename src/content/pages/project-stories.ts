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

/** Narrower than this is a tall (portrait) render: never full width, and paired with another tall one. */
const TALL = 1.2;
/** Wider than this is a panorama: always a full row, since half the page width would make it a thin strip. */
const PANORAMA = 2.2;
/** In a row, a render may lose up to this share of its height to fit the row's box; past that it is extended. */
const MAX_CROP = 0.2;

/**
 * Rows of a captioned gallery: one full-width render, then a pair, then a full-width render, and so
 * on, in the images' own order, except that a tall render is moved up next to the following tall one
 * so portraits pair with portraits. A tall render is never full width; a panorama always is. No render
 * is left alone at the end: a lone last render joins the row before it (a full row becomes a pair, a
 * pair becomes a row of three). The page splits a row into equal widths (see galleryRowLayout).
 */
export function planGalleryRows(images: string[]): string[][] {
  const ordered = [...images];
  for (let i = 0; i < ordered.length - 1; i += 1) {
    if (ratioOf(ordered[i]) >= TALL) continue;
    if (ratioOf(ordered[i + 1]) >= TALL) {
      const j = ordered.findIndex((image, k) => k > i + 1 && ratioOf(image) < TALL);
      if (j > 0) ordered.splice(i + 1, 0, ...ordered.splice(j, 1));
    }
    i += 1; // the partner is placed; carry on after the pair
  }

  const rows: string[][] = [];
  let wantFull = true;
  for (let i = 0; i < ordered.length; ) {
    const left = ordered.length - i;
    const panorama = ratioOf(ordered[i]) >= PANORAMA;
    const fullFits = panorama || (wantFull && ratioOf(ordered[i]) >= TALL);
    if (left === 1 && !fullFits && rows.length > 0) {
      rows[rows.length - 1].push(ordered[i]);
      break;
    }
    // A pair never takes a panorama as its second render; the panorama gets the next row to itself.
    if (fullFits || left === 1 || ratioOf(ordered[i + 1]) >= PANORAMA) {
      rows.push([ordered[i]]);
      i += 1;
      wantFull = false;
    } else {
      rows.push(ordered.slice(i, i + 2));
      i += 2;
      wantFull = true;
    }
  }
  return rows;
}

export type GalleryFit = "cover" | "extend";

/**
 * How a row is drawn on wide screens: every render gets the same width (50 / 50 in a pair, thirds in
 * a row of three) and one box shape, the widest render's, so wide renders such as moodboards keep
 * their edges. A narrower render fills the box and loses a little top and bottom ("cover") when that
 * is at most MAX_CROP of its height; otherwise it is shown whole on a blurred copy of itself ("extend"),
 * which is how a portrait sits next to a landscape. On phones each render keeps its own shape.
 */
export function galleryRowLayout(row: string[]): { ratio: number; items: { image: string; fit: GalleryFit }[] } {
  const ratio = Math.max(...row.map(ratioOf));
  return {
    ratio,
    items: row.map((image) => ({ image, fit: 1 - ratioOf(image) / ratio <= MAX_CROP ? "cover" : "extend" })),
  };
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
