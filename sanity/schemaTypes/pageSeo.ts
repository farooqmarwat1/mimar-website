import { defineField, defineType } from "sanity";

/**
 * SEO/GEO override for a specific route (home, about, contact, etc.) —
 * for pages that aren't backed by their own document type (project/service).
 */
export default defineType({
  name: "pageSeo",
  title: "Page SEO override",
  type: "document",
  fields: [
    defineField({
      name: "route",
      title: "Route",
      type: "string",
      description: 'e.g. "/", "/about", "/contact"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "seo", title: "SEO & GEO", type: "seo" }),
  ],
  preview: {
    select: { title: "route" },
  },
});
