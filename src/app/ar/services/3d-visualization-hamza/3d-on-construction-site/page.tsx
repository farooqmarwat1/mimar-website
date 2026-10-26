import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.threeDOnConstructionSite;

export const metadata = legacyServiceMetadata(page, "ar");

export default function ArabicThreeDOnConstructionSitePage() {
  return <LegacyServicePage page={page} lang="ar" />;
}
