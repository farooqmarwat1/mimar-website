import type { Metadata } from "next";
import CareersView from "@/components/pages/CareersView";
import { buildMetadata } from "@/lib/seo";
import { getOpenJobs } from "@/lib/jobs";
import { careersContent } from "@/content/pages/expos-careers-privacy";

// Same Firestore-backed role list as the English page (roles are English only);
// the hourly revalidate is only a safety net, the admin actions refresh /ar/careers too.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: careersContent.ar.title,
  description: careersContent.ar.description,
  path: "/careers",
  locale: "ar",
  keywords: careersContent.ar.keywords,
});

export default async function ArabicCareersPage() {
  const jobs = await getOpenJobs();
  return <CareersView jobs={jobs} lang="ar" />;
}
