/**
 * Countries whose first-time visitors land on the Arabic site (src/proxy.ts).
 * Arabic-speaking countries, EXCEPT the UAE: owner decision, UAE visitors get
 * English. Everyone else, and every request without a country header, stays on
 * English.
 *
 * The country comes from the hosting platform's edge geo lookup (Vercel sets
 * `x-vercel-ip-country`). On a host that does not set it nothing is redirected.
 */
export const arabicLandingCountries: ReadonlySet<string> = new Set([
  "SA", // Saudi Arabia
  "EG", // Egypt
  "QA", // Qatar
  "KW", // Kuwait
  "BH", // Bahrain
  "OM", // Oman
  "JO", // Jordan
  "LB", // Lebanon
  "IQ", // Iraq
  "SY", // Syria
  "YE", // Yemen
  "PS", // Palestine
  "MA", // Morocco
  "DZ", // Algeria
  "TN", // Tunisia
  "LY", // Libya
  "SD", // Sudan
  "MR", // Mauritania
  "SO", // Somalia
  "DJ", // Djibouti
  "KM", // Comoros
  "TD", // Chad (Arabic co-official)
  "EH", // Western Sahara
]);
