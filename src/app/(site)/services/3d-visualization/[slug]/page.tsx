import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ThreeDVisualizationSubServiceView, { threeDVisualizationSubServiceMetadata } from "@/components/services/ThreeDVisualizationSubServiceView";
import { threeDVisualizationSubServiceSlugs, threeDVisualizationSubServices } from "@/lib/three-d-visualization-sub-services";

export const dynamicParams = false;

export function generateStaticParams() {
  return threeDVisualizationSubServiceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/3d-visualization/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return threeDVisualizationSubServiceMetadata(slug);
}

export default async function ThreeDVisualizationSubServicePage({ params }: PageProps<"/services/3d-visualization/[slug]">) {
  const { slug } = await params;
  const service = threeDVisualizationSubServices[slug];
  if (!service) notFound();
  return <ThreeDVisualizationSubServiceView service={service} />;
}
