import type { Locale } from "@/i18n/config";
import { regions, type Region } from "./regions";
import { localizeRegion } from "./ar/regions.ar";

/**
 * The verified Google Business Profile locations besides the two offices
 * (Islamabad, Jeddah): Dubai, the six US cities and Istanbul. The owner
 * confirmed all of them on 18 Nov 2026. Listed in llms.txt (not on /contact
 * yet - the owner will decide that later).
 * Dubai and the US come from the region data (src/lib/regions.ts); Istanbul
 * has no region page, so its profile details live here and must match the
 * #localbusiness-istanbul node in src/lib/seo.ts.
 */
export type ProfileLocation = {
  city: string;
  address: string;
  phone?: string;
  gbpUrl?: string;
  /** Region page that covers this location, if any. */
  path?: string;
};

export const istanbulProfile = {
  en: { city: "Istanbul", address: "Levent, Büyükdere Cd. No:193, 34394 Beşiktaş/İstanbul, Türkiye" },
  ar: { city: "إسطنبول", address: "Levent, Büyükdere Cd. No:193, 34394 Beşiktaş/İstanbul، تركيا" },
  // The profile lists no phone, so none is shown.
  gbpUrl: "https://share.google/52xpHYZjQEjnqvTFh",
} as const;

function fromRegion(region: Region, lang: Locale): ProfileLocation[] {
  const shown = lang === "ar" ? localizeRegion(region, "ar") : region;
  const sep = lang === "ar" ? "، " : ", ";
  return shown.locations.map((location) => ({
    city: location.city,
    address: [location.streetAddress, location.area, location.postalCode].filter(Boolean).join(sep),
    phone: location.phone,
    gbpUrl: location.gbpUrl,
    path: region.path,
  }));
}

export function profileLocations(lang: Locale = "en"): ProfileLocation[] {
  return [
    ...fromRegion(regions.uae, lang),
    ...fromRegion(regions.usa, lang),
    { ...istanbulProfile[lang === "ar" ? "ar" : "en"], gbpUrl: istanbulProfile.gbpUrl },
  ];
}
