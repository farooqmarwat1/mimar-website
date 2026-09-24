/**
 * Reference Sanity Studio config. Copy this to `sanity.config.ts` once you've
 * run `npm create sanity@latest` (see sanity/README.md) or embedded the
 * Studio at /studio inside this Next app.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "sanity/vision";
import { schemaTypes } from "./schemaTypes";

export default defineConfig({
  name: "mimar-studios",
  title: "MimAR Studios",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
