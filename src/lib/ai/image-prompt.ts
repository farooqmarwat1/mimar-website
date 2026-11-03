/**
 * The prompt for an AI-generated blog cover (generate-image.ts). Pure so it can be unit-tested.
 *
 * Covers are illustrations, never presented as Mimar projects: no text, logos, real buildings,
 * landmarks or recognisable people, so nothing can be mistaken for a real project or client.
 */

export type ImagePromptInput = {
  title: string;
  keyword?: string;
  /** "Dubai, UAE" style places the article targets. */
  geo?: string;
  /** Blog category slug. */
  category?: string;
  /** What the editor wants to see, in their own words. Replaces the subject taken from the title. */
  description?: string;
};

function scene(input: ImagePromptInput): string {
  const text = `${input.title} ${input.keyword ?? ""}`.toLowerCase();
  if (/\b(brand|branding|identity|logo|stationery|collateral)\b/.test(text)) {
    return "A styled flat-lay of unbranded property brochures, stationery and business cards in a cohesive colour palette for a fictional real estate developer, on a stone desk in soft daylight.";
  }
  // Interactive before marketing: "virtual tours for off-plan homes" is about the tour.
  if (input.category === "vr-real-estate" || /\b(vr|virtual reality|360|virtual tours?|interactive|unit selector|property explorer)\b/.test(text)) {
    return "A buyer seen from behind wearing a VR headset in a bright sales lounge, a large screen showing an interactive 3D apartment tour, clean contemporary interior.";
  }
  if (/\b(marketing|seo|social media|website|lead generation|off[- ]plan|campaign)\b/.test(text)) {
    return "A modern sales gallery for a residential development: laptop, tablet and phone screens showing abstract property marketing layouts beside a scale model, warm interior light.";
  }
  if (/\b(interior|interiors|fit[- ]?out)\b/.test(text)) {
    return "A photorealistic architectural visualization of a calm, contemporary residential interior with natural materials and soft daylight.";
  }
  return "A photorealistic architectural visualization of a contemporary building and its landscaped surroundings at golden hour, shot at eye level like a professional render.";
}

/** Local character without pretending to show a real place. */
function place(geo: string | undefined): string {
  const where = geo?.trim();
  return where
    ? `Let the architecture, landscape, materials and light suit ${where} (its climate and local building character), without showing any real, recognisable building, skyline or landmark.`
    : "Keep the setting generic: no real, recognisable building, skyline or landmark.";
}

export function buildImagePrompt(input: ImagePromptInput): string {
  const subject = input.description?.trim()
    ? `Show: ${input.description.trim().slice(0, 400)}`
    : `${scene(input)} It illustrates an article titled "${input.title.trim().slice(0, 160)}".`;
  return [
    "Create a single wide 16:9 cover image for a blog article by an architectural design and 3D visualization studio.",
    subject,
    place(input.geo),
    "Style: high-end architectural visualization, realistic lighting, clean composition with space around the subject, suitable as a website header.",
    "Strictly no text, letters, numbers, signage, logos, brand names or watermarks anywhere in the image. No recognisable faces or real people. Nothing that looks like a real company's project.",
    "After the image, reply with one plain sentence of alt text (under 125 characters) describing what the image shows. Do not start with 'Image of' or 'Picture of'.",
  ].join("\n");
}

/** The model's alt text, tidied, or null when it is missing or unusable. */
export function usableAltText(text: string | undefined): string | null {
  const sentence = (text ?? "")
    .replace(/^\s*(alt( text)?\s*:\s*)/i, "")
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  // Notes, lists or half an answer ("Let's check elements: * building type") are not a description.
  const looksLikeNotes = /[*#]|^(let's|here|sure|okay|ok)\b|:\s*$/i.test(sentence) || !/[a-z]{3,}\s+[a-z]{3,}\s+[a-z]{3,}/i.test(sentence);
  return sentence.length >= 15 && sentence.length <= 160 && !looksLikeNotes && !/^(image|picture|photo) of\b/i.test(sentence) ? sentence : null;
}

/** The model's alt text, tidied, or a fallback built from the article when it gave none. */
export function cleanAltText(text: string | undefined, input: Pick<ImagePromptInput, "title" | "keyword">): string {
  return usableAltText(text) ?? `Illustration for ${input.keyword?.trim() || input.title.trim()}`.slice(0, 160);
}

/** For a second, text-only look at the finished image when the image model gave no alt text. */
export const ALT_TEXT_PROMPT =
  "Write alt text for this website cover image: one plain sentence under 125 characters describing what it shows (building type, setting, materials, light). Do not start with 'Image of' or 'Picture of'. Reply with the sentence only.";
