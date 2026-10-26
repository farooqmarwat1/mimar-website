import type { Locale } from "@/i18n/config";
import type { ArchitecturalSubService } from "@/lib/architectural-sub-services";
import type { BrandingMarketingSubService } from "@/lib/branding-marketing-sub-services";
import type { LegacyServicePage } from "@/lib/legacy-service-pages";
import type { ThreeDVisualizationSubService } from "@/lib/three-d-visualization-sub-services";
import { architecturalSubServicesAr } from "./architectural-sub-services.ar";
import { brandingMarketingSubServicesAr } from "./branding-marketing-sub-services.ar";
import { legacyServicePagesAr } from "./legacy-service-pages.ar";
import { applyOverlay } from "./merge";
import { threeDVisualizationSubServicesAr } from "./three-d-visualization-sub-services.ar";

/**
 * Locale-aware views of the service sub-page data. English returns the data
 * untouched; Arabic lays the matching overlay (by slug / path) over it, with
 * English as the fallback for any field the overlay leaves out.
 */

export function localizeArchitecturalSubService(service: ArchitecturalSubService, lang: Locale): ArchitecturalSubService {
  return applyOverlay(service, architecturalSubServicesAr[service.slug], lang);
}

export function localizeThreeDSubService(service: ThreeDVisualizationSubService, lang: Locale): ThreeDVisualizationSubService {
  return applyOverlay(service, threeDVisualizationSubServicesAr[service.slug], lang);
}

export function localizeBrandingMarketingSubService(service: BrandingMarketingSubService, lang: Locale): BrandingMarketingSubService {
  return applyOverlay(service, brandingMarketingSubServicesAr[service.parent]?.[service.slug], lang);
}

export function localizeLegacyServicePage(page: LegacyServicePage, lang: Locale): LegacyServicePage {
  return applyOverlay(page, legacyServicePagesAr[page.path], lang);
}
