#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports -- a plain Node script, run outside Next.js */
/**
 * One-off (26 Nov 2026, SEO audit of 25 Nov): the article /blog/3d-animation-services/ still says
 * "2024" in its SEO title and meta description, in English and Arabic. The site's JSON copy
 * (src/content/legacy-seo.json and .ar.json) is already updated; this script makes the same change
 * to the live article, which is a Firestore document (sitePosts) shared by the live site.
 *
 * Run it only after the change is approved and the code is deployed:
 *
 *   node --env-file=.env.local scripts/update-article-year.cjs           # dry run: prints the change
 *   node --env-file=.env.local scripts/update-article-year.cjs --apply   # writes it
 *
 * It changes only `seoTitle` and `description` (English) and `ar.seoTitle` / `ar.description`,
 * swapping 2024 for 2026. If the Arabic was in step with the English before, its fingerprint
 * (`ar.sourceHash`, src/lib/post-translation.ts) is recomputed so the AI does not re-translate
 * the article over its reviewed Arabic text. Nothing else (body, dates, slug) is touched.
 * The public page picks the change up within an hour (the blog cache), or at once after a deploy.
 */
const path = require("node:path");
const { cert, initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { load } = require("../tests/load.cjs");

const ARTICLE_PATH = "/blog/3d-animation-services";
const FROM = "2024";
const TO = "2026";
const apply = process.argv.includes("--apply");

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
if (!projectId || !clientEmail || !privateKey) {
  console.error("FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set (use --env-file=.env.local).");
  process.exit(1);
}

// The same fingerprint the site computes (loaded from the TypeScript source, as the tests do).
const { translationHashes } = load(path.join("src", "lib", "post-translation.ts"));

const collection = process.env.BLOG_POSTS_COLLECTION?.trim() || "sitePosts";
// Same id rule as src/lib/blog-import.ts (docIdFor).
const docId = `legacy-${ARTICLE_PATH.slice(1).replace(/\//g, "__")}`;

const fieldsOf = (post) => ({
  title: post.title,
  seoTitle: post.seoTitle,
  description: post.description,
  keywords: post.keywords ?? [],
  geoTerms: post.geoTerms,
  blocks: post.blocks ?? [],
  faq: post.faq ?? [],
  related: post.related ?? [],
  coverAlt: post.coverImage?.alt,
});

(async () => {
  const db = getFirestore(initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId }));
  const ref = db.collection(collection).doc(docId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`No document ${collection}/${docId}. Has the legacy import run on this project?`);
    process.exit(1);
  }
  const post = snap.data();
  const swap = (text) => (typeof text === "string" ? text.split(FROM).join(TO) : text);

  const update = {};
  for (const field of ["seoTitle", "description"]) {
    if (swap(post[field]) !== post[field]) update[field] = swap(post[field]);
  }
  if (post.ar) {
    for (const field of ["seoTitle", "description"]) {
      if (swap(post.ar[field]) !== post.ar[field]) update[`ar.${field}`] = swap(post.ar[field]);
    }
  }
  if (!Object.keys(update).length) {
    console.log(`Nothing to change: no "${FROM}" in the SEO title or description.`);
    return;
  }

  const arWasCurrent = post.ar && post.ar.sourceHash === translationHashes(fieldsOf(post)).all;
  if (arWasCurrent) {
    const next = translationHashes(fieldsOf({ ...post, seoTitle: update.seoTitle ?? post.seoTitle, description: update.description ?? post.description }));
    update["ar.sourceHash"] = next.all;
    update["ar.bodyHash"] = next.body;
  }

  for (const [field, value] of Object.entries(update)) {
    if (field.endsWith("Hash")) continue;
    const before = field.startsWith("ar.") ? post.ar[field.slice(3)] : post[field];
    console.log(`${field}\n  before: ${before}\n  after:  ${value}`);
  }
  console.log(arWasCurrent ? "Arabic fingerprint: recomputed (no AI re-translation)." : "Arabic fingerprint: left as it was (the Arabic was already out of step).");

  if (!apply) {
    console.log("\nDry run. Add --apply to write the change.");
    return;
  }
  await ref.update(update);
  console.log(`\nUpdated ${collection}/${docId}.`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
