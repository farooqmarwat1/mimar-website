import { randomUUID } from "node:crypto";
import { AdminAuthError, assertAccess, assertSameOrigin } from "@/lib/admin/auth";
import { adminBucket, isFirebaseConfigured } from "@/lib/firebase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Cover-image upload for blog posts. Lives under /admin so the session cookie
 * (scoped to /admin) reaches it. The editor compresses to WebP in the browser
 * first, which keeps the request under Vercel's ~4.5 MB body limit.
 */

const MAX_BYTES = 4 * 1024 * 1024;

type Kind = { ext: string; contentType: string };

// Trust the file's bytes, not the filename or the declared type.
function sniff(bytes: Uint8Array): Kind | null {
  const startsWith = (...sig: number[]) => sig.every((byte, i) => bytes[i] === byte);
  if (startsWith(0xff, 0xd8, 0xff)) return { ext: "jpg", contentType: "image/jpeg" };
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return { ext: "png", contentType: "image/png" };
  if (startsWith(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return { ext: "webp", contentType: "image/webp" };
  }
  return null;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const session = await assertAccess("blog");

    if (!isFirebaseConfigured) return Response.json({ error: "Storage is not configured." }, { status: 503 });

    const limit = await checkRateLimit([{ key: `admin-upload:${session.uid}`, limit: 30, windowSec: 600 }]);
    if (!limit.allowed) return Response.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_BYTES) return Response.json({ error: "Images must be under 4 MB." }, { status: 413 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const kind = sniff(buffer);
    if (!kind) return Response.json({ error: "Upload a JPEG, PNG or WebP image." }, { status: 415 });

    const bucket = adminBucket();
    const path = `blog/${new Date().getUTCFullYear()}/${randomUUID()}.${kind.ext}`;
    const token = randomUUID();
    await bucket.file(path).save(buffer, {
      resumable: false,
      metadata: {
        contentType: kind.contentType,
        cacheControl: "public, max-age=31536000, immutable",
        metadata: { firebaseStorageDownloadTokens: token, uploadedBy: session.email },
      },
    });

    // Firebase download URL: works for objects that are not publicly listable.
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return Response.json({ url });
  } catch (err) {
    if (err instanceof AdminAuthError) return Response.json({ error: err.message }, { status: err.status });
    console.error("[admin upload]", err instanceof Error ? err.message : err);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}
