import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { resolveCredentials } from "@/lib/firebase/credentials";

/**
 * Server-only Firebase Admin access (Firestore, Auth, Storage).
 *
 * The browser never talks to Firebase: every read and write goes through the
 * Admin SDK on the server, and Firestore security rules deny all client access
 * (see firestore.rules). Like src/lib/cms.ts, nothing here throws at import
 * time when the env vars are missing - `isFirebaseConfigured` lets callers fall
 * back to today's static content, so local dev and builds work without Firebase.
 *
 * Env (see .env.example): FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL,
 * FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET.
 */

const APP_NAME = "mimar-site-admin";

function credentials() {
  const result = resolveCredentials({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  });
  if (result.ok) return result.credentials;
  // Say so in the logs when something IS set but unusable, instead of failing later at first sign-in.
  if (result.reason === "invalid") console.error(`[firebase] ${result.message}`);
  return null;
}

export const isFirebaseConfigured = credentials() !== null;

function getApp(): App {
  const existing = getApps().find((app) => app.name === APP_NAME);
  if (existing) return existing;
  const creds = credentials();
  if (!creds) throw new Error("Firebase is not configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY).");
  return initializeApp(
    {
      credential: cert(creds),
      projectId: creds.projectId,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim() || `${creds.projectId}.firebasestorage.app`,
    },
    APP_NAME,
  );
}

export function adminDb(): Firestore {
  return getFirestore(getApp());
}

export function adminAuth(): Auth {
  return getAuth(getApp());
}

export function adminBucket() {
  return getStorage(getApp()).bucket();
}
