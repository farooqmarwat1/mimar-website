import type { Metadata } from "next";
import CareersView from "@/components/pages/CareersView";
import { buildMetadata } from "@/lib/seo";
import { getOpenJobs } from "@/lib/jobs";
import { careersContent } from "@/content/pages/expos-careers-privacy";

// Open roles come from Firestore (managed in /admin/jobs). The admin actions
// refresh this page on every change; the hourly revalidate is only a safety net.
export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: careersContent.en.title,
  description: careersContent.en.description,
  path: "/careers",
  keywords: careersContent.en.keywords,
});

export default async function CareersPage() {
  const jobs = await getOpenJobs();
  return <CareersView jobs={jobs} />;
}
