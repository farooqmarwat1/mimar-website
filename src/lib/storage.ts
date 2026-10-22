import "server-only";
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
