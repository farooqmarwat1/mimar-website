import "server-only";
import { randomUUID } from "node:crypto";
import { adminBucket, isFirebaseConfigured } from "@/lib/firebase/admin";

/**
 * Blog cover images live in Firebase Storage under blog/. Posts store the
 * Firebase download URL; these helpers map a URL back to its object so a cover
 * is removed when its post is deleted or the cover is replaced (otherwise every
 * edit would leave an orphaned file behind).
 *
 * Only objects in OUR bucket under `blog/` are ever recognised or deleted, so a
 * URL pasted into a form can never make the server delete something else.
 */

const COVER_PREFIX = "blog/";

/** The object path for one of our cover URLs, or null for anything else. */
export function coverObjectPath(url: string): string | null {
  if (!isFirebaseConfigured) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "firebasestorage.googleapis.com") return null;
    const match = /^\/v0\/b\/([^/]+)\/o\/([^/]+)$/.exec(parsed.pathname);
    if (!match || match[1] !== adminBucket().name) return null;
    const path = decodeURIComponent(match[2]);
    return path.startsWith(COVER_PREFIX) && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}

/**
 * Saves a cover image under blog/YYYY/ and returns its Firebase download URL (works for objects
 * that are not publicly listable). Used by uploads and by AI-generated covers.
 */
export async function saveCover(bytes: Buffer, kind: { ext: string; contentType: string }, metadata: Record<string, string>): Promise<string> {
  const bucket = adminBucket();
  const path = `${COVER_PREFIX}${new Date().getUTCFullYear()}/${randomUUID()}.${kind.ext}`;
  const token = randomUUID();
  await bucket.file(path).save(bytes, {
    resumable: false,
    metadata: {
      contentType: kind.contentType,
      cacheControl: "public, max-age=31536000, immutable",
      metadata: { firebaseStorageDownloadTokens: token, ...metadata },
    },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** Best effort: a failure here must never block saving or deleting the post. */
export async function deleteCover(url: string | undefined) {
  const path = url ? coverObjectPath(url) : null;
  if (!path) return;
  try {
    await adminBucket().file(path).delete({ ignoreNotFound: true });
  } catch (err) {
    console.error("[storage] could not delete cover:", err instanceof Error ? err.message : err);
  }
}
