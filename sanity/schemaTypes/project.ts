import { defineField, defineType } from "sanity";

export default defineType({
  name: "project",
  title: "Project",
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
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "Architectural Design",
          "3D Visualization",
          "Interior Design",
          "Branding",
          "Animation",
          "VR & 360",
        ],
      },
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 2 }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }, { type: "image" }] }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "gallery", title: "Gallery", type: "array", of: [{ type: "image", options: { hotspot: true } }] }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({ name: "year", title: "Year", type: "number" }),
    defineField({ name: "client", title: "Client", type: "string", description: "Optional, only if client approves public credit." }),
    defineField({ name: "featured", title: "Featured on homepage", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Sort order", type: "number" }),
    defineField({ name: "seo", title: "SEO & GEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "cover" },
  },
});
