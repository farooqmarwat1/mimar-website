import type { Metadata } from "next";
import ContactView from "@/components/pages/ContactView";
import { buildMetadata } from "@/lib/seo";
import { contactContent } from "@/content/pages/contact";

export const metadata: Metadata = buildMetadata({
  title: contactContent.ar.title,
  description: contactContent.ar.description,
  path: "/contact",
  locale: "ar",
});

export default function ArabicContactPage() {
  return <ContactView lang="ar" />;
}
