import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.tvCommercials;

export const metadata = legacyServiceMetadata(page, "ar");

export default function ArabicTvCommercialsPage() {
  return <LegacyServicePage page={page} lang="ar" />;
}
