import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.terrainMapping;

export const metadata = legacyServiceMetadata(page, "ar");

export default function ArabicTerrainMappingPage() {
  return <LegacyServicePage page={page} lang="ar" />;
}
