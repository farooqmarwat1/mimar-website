import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BrandingMarketingSubServiceView, { brandingMarketingMetadata, brandingMarketingStaticParams } from "@/components/services/BrandingMarketingSubServiceView";
import { brandingMarketingSubServices } from "@/lib/branding-marketing-sub-services";

// tv-commercials-and-advertisements has its own static route next to this one.
export const dynamicParams = false;

export function generateStaticParams() {
  return brandingMarketingStaticParams("marketing");
}

export async function generateMetadata({ params }: PageProps<"/services/marketing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return brandingMarketingMetadata("marketing", slug);
}

export default async function MarketingSubServicePage({ params }: PageProps<"/services/marketing/[slug]">) {
  const { slug } = await params;
  const service = brandingMarketingSubServices.marketing[slug];
  if (!service) notFound();
  return <BrandingMarketingSubServiceView service={service} />;
}
