import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.sampleSpatialData;

export const metadata = legacyServiceMetadata(page);

export default function SampleSpatialDataPage() {
  return <LegacyServicePage page={page} />;
}
