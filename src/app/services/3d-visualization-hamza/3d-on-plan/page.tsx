import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.threeDOnPlan;

export const metadata = legacyServiceMetadata(page);

export default function ThreeDOnPlanPage() {
  return <LegacyServicePage page={page} />;
}
