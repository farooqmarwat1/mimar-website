import { defineField, defineType } from "sanity";

/**
 * Reusable SEO + GEO object, embedded in every content document.
 *
 * - metaTitle / metaDescription / ogImage / canonicalUrl: classic SEO.
 * - keyFacts: short, self-contained statements (e.g. "MimAR Studios has
 *   delivered 3D visualization projects in 14+ countries since 2019.").
 *   These are written to be lifted verbatim by AI answer engines — this is
 *   the core GEO lever, distinct from keyword-oriented SEO copy.
 * - faqs: optional page-specific FAQ pairs, merged with site-wide FAQs into
 *   FAQPage JSON-LD (see src/lib/seo.ts).
 */
export default defineType({
  name: "seo",
  title: "SEO & GEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description: "50–60 characters. Falls back to the document title if left blank.",
      validation: (Rule) => Rule.max(70).warning("Titles over ~60 characters get truncated in search results."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      description: "150–160 characters. Also used as the default Open Graph / Twitter description.",
      validation: (Rule) => Rule.max(200).warning("Descriptions over ~160 characters get truncated in search results."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "1200×630px recommended.",
      options: { hotspot: true },
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL override",
      type: "url",
      description: "Only set this if this content is a duplicate of another page.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "keyFacts",
      title: "Key facts (for AI / GEO)",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Short, self-contained, citable sentences about this page's subject — written the way you'd want an AI assistant to quote you. E.g. \"Beverly Hills is a 6,000 sq ft villa visualized by MimAR Studios in 2023.\"",
    }),
    defineField({
      name: "faqs",
      title: "Page-specific FAQs",
      type: "array",
      of: [
        {
          type: "object",
          name: "faqItem",
          fields: [
            { name: "question", type: "string", title: "Question" },
            { name: "answer", type: "text", rows: 3, title: "Answer" },
          ],
        },
      ],
    }),
  ],
});
