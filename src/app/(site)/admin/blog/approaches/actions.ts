"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { AdminAuthError, assertAccess } from "@/lib/admin/auth";
import { takeDueSnapshots } from "@/lib/blog-results";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { checkRateLimit } from "@/lib/rate-limit";

export type ResultsState = { error?: string; message?: string };

/** "Check now": takes any due day-30/90 snapshots in the background (the daily cron does the same). */
export async function checkResultsNowAction(): Promise<ResultsState> {
  try {
    await assertAccess("blog");
  } catch (err) {
    if (err instanceof AdminAuthError) return { error: err.message };
    throw err;
  }
  if (!isFirebaseConfigured) return { error: "Firebase is not configured." };
  const limit = await checkRateLimit([{ key: "blog-results:check", limit: 6, windowSec: 86400 }]);
  if (!limit.allowed) return { error: `Checked several times today already. Try again in about ${Math.ceil(limit.retryAfterSec / 3600)} hour(s).` };
  after(async () => {
    try {
      await takeDueSnapshots();
    } catch (err) {
      console.error("[blog-results] manual check failed", err);
    }
    revalidatePath("/admin/blog/approaches");
  });
  return { message: "Checking the articles that are due. Refresh in a minute to see the results." };
}
