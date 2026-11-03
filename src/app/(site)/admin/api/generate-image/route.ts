import { AdminAuthError, assertAccess, assertSameOrigin } from "@/lib/admin/auth";
import { describeImageError, generateCoverImage, imageGenerationConfigured } from "@/lib/ai/generate-image";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveCover } from "@/lib/storage";

/**
 * "Generate image with AI" in the post editor: a Gemini cover image for the article, saved to
 * Firebase Storage like an uploaded cover, with suggested alt text. Lives under /admin so the
 * session cookie (scoped to /admin) reaches it. Each image costs money, so it is capped per
 * person and per day for the whole site.
 */

export const maxDuration = 120;

const DAILY_LIMIT = Number(process.env.BLOG_IMAGE_DAILY_LIMIT) || 30;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "");

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await assertAccess("blog");
    if (!isFirebaseConfigured) return Response.json({ error: "Storage is not configured." }, { status: 503 });
    if (!imageGenerationConfigured()) return Response.json({ error: "Set GEMINI_API_KEY to generate images." }, { status: 503 });

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const title = text(body.title, 200);
    if (title.length < 5) return Response.json({ error: "Add the article title first." }, { status: 400 });

    const limit = await checkRateLimit([
      { key: `blog-image:user:${session.uid}`, limit: 10, windowSec: 3600 },
      { key: "blog-image:day", limit: DAILY_LIMIT, windowSec: 86400 },
    ]);
    if (!limit.allowed) return Response.json({ error: `Image limit reached. Try again in about ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` }, { status: 429 });

    const image = await generateCoverImage({
      title,
      keyword: text(body.keyword, 80) || undefined,
      geo: text(body.geo, 120) || undefined,
      category: text(body.category, 60) || undefined,
      description: text(body.description, 400) || undefined,
    });
    const url = await saveCover(image.bytes, image.kind, { uploadedBy: session.email, generatedBy: image.model });
    return Response.json({ url, alt: image.alt });
  } catch (err) {
    if (err instanceof AdminAuthError) return Response.json({ error: err.message }, { status: err.status });
    const message = describeImageError(err) ?? (err instanceof Error ? err.message : "Image generation failed.");
    console.error("[admin generate-image]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
