#!/usr/bin/env node
/**
 * Creates or updates a staff account for the /admin portal.
 *
 *   node --env-file=.env.local scripts/set-admin-role.mjs <email> <admin|editor|hr> [--password <pw>]
 *   node --env-file=.env.local scripts/set-admin-role.mjs <email> none      # remove access
 *
 * - Unknown email: the account is created. Without --password a strong random
 *   one is generated and printed once; pass it to the person over a safe channel
 *   and ask them to change it (Firebase console -> Authentication, or a reset email).
 * - Existing email: only the `role` custom claim is changed (their password is untouched).
 * - Uses the same FIREBASE_* variables as the site (see .env.example).
 *
 * Roles: hr -> jobs and applications, editor -> blog and visitors, admin -> everything (including leads).
 */
import { randomBytes } from "node:crypto";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ROLES = ["admin", "editor", "hr"];

const [email, role, ...rest] = process.argv.slice(2);
const passwordFlag = rest.indexOf("--password");
const password = passwordFlag >= 0 ? rest[passwordFlag + 1] : undefined;

if (!email || !role || (role !== "none" && !ROLES.includes(role))) {
  console.error("Usage: node --env-file=.env.local scripts/set-admin-role.mjs <email> <admin|editor|hr|none> [--password <pw>]");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
if (!projectId || !clientEmail || !privateKey) {
  console.error("FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set (use --env-file=.env.local).");
  process.exit(1);
}

const auth = getAuth(initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }));

let user;
let generated;
try {
  user = await auth.getUserByEmail(email);
} catch (err) {
  if (err.code !== "auth/user-not-found") throw err;
  if (role === "none") {
    console.error(`No account for ${email}.`);
    process.exit(1);
  }
  generated = password ?? randomBytes(15).toString("base64url");
  user = await auth.createUser({ email, password: generated, emailVerified: true });
  console.log(`Created account ${email}`);
}

// Replace only the role claim; keep any other claims the project (e.g. the CRM portal) may use.
const claims = { ...(user.customClaims ?? {}) };
if (role === "none") delete claims.role;
else claims.role = role;
await auth.setCustomUserClaims(user.uid, claims);
// Force existing sessions to sign in again so the new role takes effect immediately.
await auth.revokeRefreshTokens(user.uid);

console.log(role === "none" ? `Removed staff access for ${email}.` : `${email} is now "${role}".`);
if (generated && !password) console.log(`Temporary password (shown once): ${generated}`);
