import "server-only";
import { ApiError, GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import { altTextPrompt, buildImagePrompt, cleanAltText, usableAltText, type ImagePromptInput } from "@/lib/ai/image-prompt";

/**
 * AI blog covers with Gemini's image model ("Generate image with AI" in the post editor). Uses the
 * same GEMINI_API_KEY as the drafts; GEMINI_IMAGE_MODEL picks the model. Each image costs a few
 * cents, so the route that calls this is rate limited. The image is only ever a suggestion: the
 * editor sees it, can replace it, and nothing is published without a person.
 */

const MAX_BYTES = 8 * 1024 * 1024;
const KINDS: Record<string, { ext: string; contentType: string }> = {
  "image/png": { ext: "png", contentType: "image/png" },
  "image/jpeg": { ext: "jpg", contentType: "image/jpeg" },
  "image/webp": { ext: "webp", contentType: "image/webp" },
};

export const imageGenerationConfigured = () => Boolean(process.env.GEMINI_API_KEY?.trim());

const imageModel = () => process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-3.1-flash-image";

/**
 * Alt text from a quick look at the finished image by the text model (GEMINI_MODEL). Image models
 * often return the picture alone; this costs a fraction of a cent. Null when it fails.
 */
export async function describeImage(ai: GoogleGenAI, image: { data: string; mimeType: string }, context: { keyword?: string; place?: string } = {}): Promise<string | null> {
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ inlineData: image }, { text: altTextPrompt(context) }] }],
      // Low thinking (gemini-3.8-flash refuses MINIMAL), with room to spare: a thinking model can otherwise spend the budget before it answers.
      config: { maxOutputTokens: 2000, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
    });
    return usableAltText(res.text);
  } catch (err) {
    console.error("[generate-image] alt text failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export type GeneratedImage = { bytes: Buffer; kind: { ext: string; contentType: string }; alt: string; model: string };

export async function generateCoverImage(input: ImagePromptInput): Promise<GeneratedImage> {
  if (!imageGenerationConfigured()) throw new Error("Set GEMINI_API_KEY to generate images.");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY!.trim() });
  const model = imageModel();
  const res = await ai.models.generateContent({
    model,
    contents: buildImagePrompt(input),
    config: { responseModalities: [Modality.TEXT, Modality.IMAGE], imageConfig: { aspectRatio: "16:9" } },
  });
  if (res.promptFeedback?.blockReason) throw new Error("Google's safety system declined this image. Try describing it differently.");
  const parts = res.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((part) => part.inlineData?.data && KINDS[part.inlineData.mimeType ?? ""]);
  if (!image?.inlineData?.data) throw new Error("The AI returned no image. Try again, or describe the image you want.");
  const bytes = Buffer.from(image.inlineData.data, "base64");
  if (bytes.length === 0 || bytes.length > MAX_BYTES) throw new Error("The generated image was empty or too large. Try again.");
  const text = parts
    .filter((part) => part.text && !part.thought)
    .map((part) => part.text)
    .join(" ");
  // Described from the finished picture with the article's keyword and place in mind; the image model's own sentence is the fallback.
  const place = input.geo?.split(",")[0]?.trim();
  const alt = (await describeImage(ai, { data: image.inlineData.data, mimeType: image.inlineData.mimeType! }, { keyword: input.keyword, place })) ?? usableAltText(text);
  return { bytes, kind: KINDS[image.inlineData.mimeType!], alt: cleanAltText(alt ?? undefined, input), model };
}

/** A short message for Gemini's own API errors, or null if it is not one. */
export function describeImageError(err: unknown): string | null {
  if (!(err instanceof ApiError)) return null;
  if (err.status === 400 && /API key not valid|API_KEY_INVALID/i.test(err.message)) return "Google rejected the Gemini API key. Check GEMINI_API_KEY.";
  if (err.status === 404) return `The image model "${imageModel()}" was not found. Check GEMINI_IMAGE_MODEL.`;
  if (err.status === 429) return "The Gemini image quota was reached. Try again in a few minutes, or check the project's quota and billing.";
  if (err.status === 401 || err.status === 403) return "Google refused the image request. Check that the Gemini API key may use image models and that billing is enabled.";
  return `Image service error (${err.status}). Try again.`;
}
