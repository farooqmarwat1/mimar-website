import type { Metadata } from "next";

import RegionPageAr from "@/components/regions/RegionPageAr";
import { regions } from "@/lib/regions";
import { localizeRegion } from "@/lib/ar/regions.ar";
import { buildMetadata } from "@/lib/seo";

const english = regions.uae;
const region = localizeRegion(english, "ar");

export const metadata: Metadata = buildMetadata({
  title: region.seoTitle,
  description: region.description,
  path: english.path,
  keywords: region.keywords,
  locale: "ar",
});

export default function ArabicUaeRegionPage() {
  return <RegionPageAr regionKey="uae" />;
}
