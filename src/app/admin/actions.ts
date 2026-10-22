"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authConfigured, endSession, startSession, verifyPassword } from "@/lib/admin/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

// One message for every failure so the form never reveals whether an account exists.
const GENERIC_ERROR = "Incorrect email or password.";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "Staff sign-in is not configured in this environment." };

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: GENERIC_ERROR };
  const { email, password } = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const emailHash = createHash("sha256").update(email).digest("hex").slice(0, 32);
  const limit = await checkRateLimit([
    { key: `admin-login:ip:${ip}`, limit: 10, windowSec: 600 },
    { key: `admin-login:email:${emailHash}`, limit: 5, windowSec: 600 },
  ]);
  if (!limit.allowed) {
    return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s).` };
  }

  const idToken = await verifyPassword(email, password);
  if (!idToken) return { error: GENERIC_ERROR };

  let started = false;
  try {
    started = await startSession(idToken);
  } catch (err) {
    console.error("[admin] could not start session", err instanceof Error ? err.message : err);
    return { error: "Sign-in failed. Please try again." };
  }
  // Valid Firebase account but not staff (no role claim): same message as a wrong password.
  if (!started) return { error: GENERIC_ERROR };

  redirect("/admin");
}

export async function logoutAction() {
  await endSession();
  redirect("/admin/login");
}
