import type { Metadata } from "next";
import ContactView from "@/components/pages/ContactView";
import { buildMetadata } from "@/lib/seo";
import { contactContent } from "@/content/pages/contact";

export const metadata: Metadata = buildMetadata({
  title: contactContent.en.title,
  description: contactContent.en.description,
  path: "/contact",
});

export default function ContactPage() {
  return <ContactView />;
}
