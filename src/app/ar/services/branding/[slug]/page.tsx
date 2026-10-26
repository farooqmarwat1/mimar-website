import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandingMarketingSubServiceView, { brandingMarketingMetadata, brandingMarketingStaticParams } from "@/components/services/BrandingMarketingSubServiceView";
import { brandingMarketingSubServices } from "@/lib/branding-marketing-sub-services";

export const dynamicParams = false;

export function generateStaticParams() {
  return brandingMarketingStaticParams("branding");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return brandingMarketingMetadata("branding", slug, "ar");
}

export default async function ArabicBrandingSubServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = brandingMarketingSubServices.branding[slug];
  if (!service) notFound();
  return <BrandingMarketingSubServiceView service={service} lang="ar" />;
}
