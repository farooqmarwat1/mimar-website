import LegacyServicePage, { legacyServiceMetadata } from "@/components/services/LegacyServicePage";
import { legacyServicePages } from "@/lib/legacy-service-pages";

const page = legacyServicePages.terrainMapping;

export const metadata = legacyServiceMetadata(page);

export default function TerrainMappingPage() {
  return <LegacyServicePage page={page} />;
}
