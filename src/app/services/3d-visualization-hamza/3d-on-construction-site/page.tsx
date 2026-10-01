import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.threeDOnConstructionSite;

export const metadata = legacyServiceMetadata(page);

export default function ThreeDOnConstructionSitePage() {
  return <LegacyServicePage page={page} />;
}
