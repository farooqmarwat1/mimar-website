import "server-only";
import { isAdminRole } from "@/lib/admin/auth";
import { adminAuth, isFirebaseConfigured } from "@/lib/firebase/admin";

/**
 * Emails of everyone who can sign in to /admin (accounts carrying a staff
 * `role` claim), for the lead "assigned to" dropdown. The CRM portal may share
 * the Firebase project, so users without the claim are left out. Never throws.
 */
export async function listStaffEmails(): Promise<string[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const { users } = await adminAuth().listUsers(1000);
    return users
      .filter((user) => user.email && !user.disabled && isAdminRole(user.customClaims?.role))
      .map((user) => user.email!.toLowerCase())
      .sort();
  } catch (err) {
    console.error("[staff] could not list staff accounts:", err instanceof Error ? err.message : err);
    return [];
  }
}
