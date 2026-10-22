/**
 * Reads the Firebase service-account credentials from environment variables,
 * forgiving the ways they are commonly pasted into hosting dashboards:
 *
 *   FIREBASE_PRIVATE_KEY may be
 *     - the PEM with real line breaks,
 *     - the PEM on one line with literal "\n" sequences (what the JSON file contains),
 *     - either of those wrapped in single or double quotes (a dashboard keeps the quotes),
 *     - or the ENTIRE downloaded service-account JSON file.
 *   When the JSON file is pasted, client_email and project_id are taken from it too,
 *   unless FIREBASE_CLIENT_EMAIL / FIREBASE_PROJECT_ID are set explicitly.
 *
 * Pure (no server imports) so it can be unit-tested. A key that still is not a valid
 * PEM returns an error message instead of crashing later with "Failed to parse private
 * key" at the first sign-in - the staff portal reports it as "not configured".
 */

export type ServiceCredentials = { projectId: string; clientEmail: string; privateKey: string };

export type CredentialResult =
  | { ok: true; credentials: ServiceCredentials }
  | { ok: false; reason: "missing" | "invalid"; message: string };

const PEM_BEGIN = "-----BEGIN PRIVATE KEY-----";
const PEM_END = "-----END PRIVATE KEY-----";

function unquote(value: string): string {
  const v = value.trim();
  const first = v[0];
  if ((first === '"' || first === "'") && v.endsWith(first) && v.length >= 2) return v.slice(1, -1).trim();
  return v;
}

export function resolveCredentials(env: { projectId?: string; clientEmail?: string; privateKey?: string }): CredentialResult {
  let projectId = unquote(env.projectId ?? "");
  let clientEmail = unquote(env.clientEmail ?? "");
  let privateKey = unquote(env.privateKey ?? "");

  // The whole service-account JSON file was pasted into the key variable.
  if (privateKey.startsWith("{")) {
    try {
      const json = JSON.parse(privateKey) as { private_key?: unknown; client_email?: unknown; project_id?: unknown };
      if (typeof json.private_key === "string") privateKey = json.private_key;
      if (!clientEmail && typeof json.client_email === "string") clientEmail = json.client_email;
      if (!projectId && typeof json.project_id === "string") projectId = json.project_id;
    } catch {
      return { ok: false, reason: "invalid", message: "FIREBASE_PRIVATE_KEY starts with { but is not valid JSON." };
    }
  }

  // Literal "\n" sequences (and a stray quote left inside) become real line breaks.
  privateKey = unquote(privateKey.replace(/\\n/g, "\n"));

  if (!projectId || !clientEmail || !privateKey) {
    return { ok: false, reason: "missing", message: "FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must all be set." };
  }
  if (!privateKey.startsWith(PEM_BEGIN) || !privateKey.endsWith(PEM_END)) {
    return {
      ok: false,
      reason: "invalid",
      message: `FIREBASE_PRIVATE_KEY is not a PEM private key (it should start with "${PEM_BEGIN}"). Paste the "private_key" value from the service-account JSON.`,
    };
  }
  return { ok: true, credentials: { projectId, clientEmail, privateKey } };
}
