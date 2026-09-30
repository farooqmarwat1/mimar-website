import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandingMarketingSubServiceView, { brandingMarketingMetadata, brandingMarketingStaticParams } from "@/components/services/BrandingMarketingSubServiceView";
import { brandingMarketingSubServices } from "@/lib/branding-marketing-sub-services";

export const dynamicParams = false;

export function generateStaticParams() {
  return brandingMarketingStaticParams("branding");
}

export async function generateMetadata({ params }: PageProps<"/services/branding/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return brandingMarketingMetadata("branding", slug);
}

export default async function BrandingSubServicePage({ params }: PageProps<"/services/branding/[slug]">) {
  const { slug } = await params;
  const service = brandingMarketingSubServices.branding[slug];
  if (!service) notFound();
  return <BrandingMarketingSubServiceView service={service} />;
}
