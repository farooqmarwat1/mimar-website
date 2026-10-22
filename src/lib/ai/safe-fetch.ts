import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { decodeEntities } from "@/lib/ai/html-entities";
import { isPrivateIp } from "@/lib/ai/ip-guard";

/**
 * Fetches a public web page as plain text for the blog generator.
 *
 * URLs come from web search results or an editor's seed list, i.e. they are
 * untrusted, so this refuses anything that could reach our own network:
 * https only, standard port, every hop of a redirect re-validated, hostnames
 * resolved and rejected if any address is private / loopback / link-local /
 * metadata, HTML or text only, size and time capped. The text is used to check
 * a draft for copied wording and as reference material - it is never shown to
 * visitors, and the fetched content is treated as data, not instructions.
 *
 * (A DNS record could change between our lookup and the connection; since the
 * response is only compared for overlap and never returned to anyone, the
 * residual risk is a blind request, which we accept.)
 */

const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 8000;
const MAX_BYTES = 1_500_000;

async function assertPublicHttps(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("https only");
  if (url.port && url.port !== "443") throw new Error("non-standard port");
  if (url.username || url.password) throw new Error("credentials in URL");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) throw new Error("local host");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some((a) => isPrivateIp(a.address))) throw new Error("non-public address");
  return url;
}

export function htmlToText(html: string): { title: string; text: string } {
  const rawTitle = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "";
  // Decoded here (not left as "&amp;") because the title is shown in a post's Sources list.
  const title = decodeEntities(rawTitle).replace(/\s+/g, " ").trim().slice(0, 160);
  const text = html
    .replace(/<(script|style|noscript|svg|nav|footer|header|form|aside)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|br|tr|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (entity) => decodeEntities(entity))
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s*/g, "\n")
    .trim();
  return { title, text };
}

export type FetchedPage = { url: string; title: string; text: string };

export async function fetchPageText(rawUrl: string): Promise<FetchedPage | null> {
  try {
    let current = rawUrl;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const url = await assertPublicHttps(current);
      const res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { "User-Agent": "MimarStudiosBot/1.0 (+https://mim.archi)", Accept: "text/html,text/plain;q=0.9" },
        cache: "no-store",
      });
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        if (!location) return null;
        current = new URL(location, url).toString();
        continue;
      }
      if (!res.ok || !res.body) return null;
      const type = res.headers.get("content-type") ?? "";
      if (!/text\/(html|plain)|application\/xhtml/i.test(type)) return null;

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BYTES) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
      const body = Buffer.concat(chunks).toString("utf8");
      const { title, text } = type.includes("plain") ? { title: "", text: body } : htmlToText(body);
      return text.length > 200 ? { url: url.toString(), title, text } : null;
    }
    return null;
  } catch {
    return null;
  }
}
