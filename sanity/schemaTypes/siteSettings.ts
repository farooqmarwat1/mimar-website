import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Site name", type: "string" }),
    defineField({ name: "defaultTitle", title: "Default meta title", type: "string" }),
    defineField({ name: "defaultDescription", title: "Default meta description", type: "text", rows: 3 }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "ogImage", title: "Default social share image", type: "image" }),
    defineField({ name: "email", title: "Contact email", type: "string" }),
    defineField({ name: "phone", title: "Contact phone", type: "string" }),
    defineField({ name: "address", title: "Address", type: "text", rows: 2 }),
    defineField({ name: "latitude", title: "Latitude", type: "number" }),
    defineField({ name: "longitude", title: "Longitude", type: "number" }),
    defineField({
      name: "social",
      title: "Social links",
      type: "object",
      fields: [
        { name: "facebook", type: "url" },
        { name: "linkedin", type: "url" },
        { name: "instagram", type: "url" },
        { name: "youtube", type: "url" },
        { name: "pinterest", type: "url" },
        { name: "behance", type: "url" },
      ],
    }),
  ],
});
