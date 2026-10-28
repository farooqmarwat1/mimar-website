import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";

/**
 * Authentication and authorization for /admin.
 *
 * Staff sign in with a Firebase email + password. The password check is the
 * Identity Toolkit REST endpoint (no client SDK, so the strict CSP stays
 * as is); on success the ID token is exchanged for a Firebase *session cookie*
 * that is httpOnly, SameSite=Strict and scoped to /admin.
 *
 * A signed-in Firebase user is NOT automatically staff: the account must carry
 * a `role` custom claim (set with scripts/set-admin-role.mjs). The CRM portal
 * may share a Firebase project, so its users have no claim and are rejected.
 *
 * proxy.ts only does an optimistic cookie-presence redirect. Every page and
 * every server action must call requireRole()/assertAccess() itself - Server
 * Actions are plain POSTs and are not covered by a proxy matcher.
 */

export type AdminRole = "admin" | "editor" | "hr";
export type AdminArea = "jobs" | "blog" | "visitors" | "leads";
export type AdminSession = { uid: string; email: string; role: AdminRole };

export const SESSION_COOKIE = "mimar_admin_session";
const SESSION_MS = 8 * 60 * 60 * 1000;

const AREA_ROLES: Record<AdminArea, AdminRole[]> = {
  jobs: ["hr", "admin"],
  blog: ["editor", "admin"],
  // Visitors shows live traffic with IP addresses: the two editors (the blog team) and the admins.
  visitors: ["editor", "admin"],
  leads: ["admin"],
};

const ROLES: AdminRole[] = ["admin", "editor", "hr"];

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

export function canAccess(role: AdminRole, area: AdminArea) {
  return AREA_ROLES[area].includes(role);
}

export class AdminAuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
  }
}

export const authConfigured = () => isFirebaseConfigured && Boolean(process.env.FIREBASE_WEB_API_KEY?.trim());

/** Checks the password with Firebase. Returns an ID token, or null for any failure (callers show one generic error). */
export async function verifyPassword(email: string, password: string): Promise<string | null> {
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { idToken?: string };
    return data.idToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Exchanges a fresh ID token for the session cookie. Returns false when the
 * account has no staff role (a valid Firebase user that is not admin staff).
 * Must be called from a Server Action or Route Handler (it sets a cookie).
 */
export async function startSession(idToken: string): Promise<boolean> {
  const auth = adminAuth();
  const decoded = await auth.verifyIdToken(idToken, true);
  if (!isAdminRole(decoded.role)) return false;
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn: SESSION_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: SESSION_MS / 1000,
  });
  return true;
}

export async function endSession() {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  store.delete({ name: SESSION_COOKIE, path: "/admin" });
  if (value && isFirebaseConfigured) {
    try {
      const decoded = await adminAuth().verifySessionCookie(value);
      await adminAuth().revokeRefreshTokens(decoded.uid);
    } catch {
      // Already expired or invalid - nothing to revoke.
    }
  }
}

/** The signed-in staff member for this request, or null. Deduplicated per render. */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  if (!isFirebaseConfigured) return null;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(value, true);
    if (!isAdminRole(decoded.role) || !decoded.email) return null;
    return { uid: decoded.uid, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
});

/** For pages and layouts: redirects instead of throwing. */
export async function requireRole(area?: AdminArea): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (area && !canAccess(session.role, area)) redirect("/admin?forbidden=1");
  return session;
}

/** For Server Actions and Route Handlers: throws AdminAuthError (401 / 403). */
export async function assertAccess(area?: AdminArea): Promise<AdminSession> {
  const session = await getSession();
  if (!session) throw new AdminAuthError(401, "Your session has expired. Please sign in again.");
  if (area && !canAccess(session.role, area)) throw new AdminAuthError(403, "You do not have permission to do that.");
  return session;
}

/** Route Handlers are not covered by the Server Action origin check; call this for state-changing ones. */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) throw new AdminAuthError(403, "Cross-origin request blocked.");
}
