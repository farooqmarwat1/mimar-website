import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.threeDOnPlan;

export const metadata = legacyServiceMetadata(page, "ar");

export default function ArabicThreeDOnPlanPage() {
  return <LegacyServicePage page={page} lang="ar" />;
}
