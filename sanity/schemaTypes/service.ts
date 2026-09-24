import { defineField, defineType } from "sanity";

export default defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "short", title: "Short description", type: "string" }),
    defineField({ name: "description", title: "Full description", type: "text", rows: 4 }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }, { type: "image" }] }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
    defineField({ name: "seo", title: "SEO & GEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "short" },
  },
});
