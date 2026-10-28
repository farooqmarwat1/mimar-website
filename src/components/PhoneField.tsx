"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { isRtl, pick, type Locale } from "@/i18n/config";
import { REGION_COOKIE } from "@/lib/region";

/** ISO 3166-1 alpha-2 code -> international dialling code (digits only, no "+"). */
const DIAL_CODES: Record<string, string> = {
  AF: "93", AL: "355", DZ: "213", AD: "376", AO: "244", AR: "54", AM: "374", AU: "61", AT: "43", AZ: "994",
  BH: "973", BD: "880", BY: "375", BE: "32", BZ: "501", BJ: "229", BT: "975", BO: "591", BA: "387", BW: "267",
  BR: "55", BN: "673", BG: "359", BF: "226", BI: "257", KH: "855", CM: "237", CA: "1", CV: "238", TD: "235",
  CL: "56", CN: "86", CO: "57", KM: "269", CG: "242", CD: "243", CR: "506", CI: "225", HR: "385", CU: "53",
  CY: "357", CZ: "420", DK: "45", DJ: "253", DO: "1", EC: "593", EG: "20", SV: "503", GQ: "240", ER: "291",
  EE: "372", SZ: "268", ET: "251", FJ: "679", FI: "358", FR: "33", GA: "241", GM: "220", GE: "995", DE: "49",
  GH: "233", GR: "30", GT: "502", GN: "224", GY: "592", HT: "509", HN: "504", HK: "852", HU: "36", IS: "354",
  IN: "91", ID: "62", IR: "98", IQ: "964", IE: "353", IT: "39", JM: "1", JP: "81", JO: "962", KZ: "7",
  KE: "254", KW: "965", KG: "996", LA: "856", LV: "371", LB: "961", LS: "266", LR: "231", LY: "218", LT: "370",
  LU: "352", MO: "853", MG: "261", MW: "265", MY: "60", MV: "960", ML: "223", MT: "356", MR: "222", MU: "230",
  MX: "52", MD: "373", MC: "377", MN: "976", ME: "382", MA: "212", MZ: "258", MM: "95", NA: "264", NP: "977",
  NL: "31", NZ: "64", NI: "505", NE: "227", NG: "234", MK: "389", NO: "47", OM: "968", PK: "92", PS: "970",
  PA: "507", PG: "675", PY: "595", PE: "51", PH: "63", PL: "48", PT: "351", PR: "1", QA: "974", RO: "40",
  RU: "7", RW: "250", SA: "966", SN: "221", RS: "381", SC: "248", SL: "232", SG: "65", SK: "421", SI: "386",
  SO: "252", ZA: "27", KR: "82", SS: "211", ES: "34", LK: "94", SD: "249", SR: "597", SE: "46", CH: "41",
  SY: "963", TW: "886", TJ: "992", TZ: "255", TH: "66", TG: "228", TT: "1", TN: "216", TR: "90", TM: "993",
  UG: "256", UA: "380", AE: "971", GB: "44", US: "1", UY: "598", UZ: "998", VE: "58", VN: "84", YE: "967",
  ZM: "260", ZW: "263",
};

/** The studio's own markets and the biggest source countries come first in the list. */
const PRIORITY = ["PK", "SA", "AE", "US", "GB", "CA", "QA", "KW", "BH", "OM", "EG", "IN"];

/** Region cookie written by src/proxy.ts (human requests only) -> country. */
const REGION_COUNTRY: Record<string, string> = { sa: "SA", ae: "AE", pk: "PK", us: "US" };

const FALLBACK_COUNTRY = "US";

/** National numbers are written with a leading trunk 0 almost everywhere; Italy is the exception where the 0 is part of the number. */
const KEEPS_LEADING_ZERO = new Set(["IT"]);

type Country = { code: string; name: string; dial: string };

function buildCountries(lang: Locale): Country[] {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([lang], { type: "region" });
  } catch {
    names = null;
  }
  const all = Object.entries(DIAL_CODES).map(([code, dial]) => ({ code, dial, name: names?.of(code) ?? code }));
  const priority = PRIORITY.map((code) => all.find((c) => c.code === code)).filter((c): c is Country => !!c);
  const rest = all.filter((c) => !PRIORITY.includes(c.code)).sort((a, b) => a.name.localeCompare(b.name, lang));
  return [...priority, ...rest];
}

const subscribeNever = () => () => {};

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Best guess of the visitor's country: the geo cookie, then the browser's locale region, else the fallback. */
function guessCountry(): string {
  const fromCookie = REGION_COUNTRY[readCookie(REGION_COOKIE) ?? ""];
  if (fromCookie) return fromCookie;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const region = tag.split("-")[1]?.toUpperCase();
    if (region && DIAL_CODES[region]) return region;
  }
  return FALLBACK_COUNTRY;
}

/**
 * Phone input with a country-code dropdown. The visible controls have no `name`; a hidden
 * `phone` input carries the combined international number ("+92 3325983077"), so the forms'
 * existing FormData / API code is unchanged. Empty number -> empty `phone` (the field is optional).
 */
export default function PhoneField({
  lang = "en",
  label,
  required,
}: {
  lang?: Locale;
  label: string;
  required?: boolean;
}) {
  const rtl = isRtl(lang);
  // Localized country names and the visitor's country are browser-side values, so the server
  // render (and hydration) uses the fallback and the real list appears right after mount.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const countries = useMemo(() => (mounted ? buildCountries(lang) : null), [mounted, lang]);
  const [picked, setPicked] = useState<string | null>(null);
  const [number, setNumber] = useState("");
  const country = picked ?? (mounted ? guessCountry() : FALLBACK_COUNTRY);

  const dial = DIAL_CODES[country];
  const digits = number.trim();
  let combined = "";
  if (digits) {
    if (digits.startsWith("+") || digits.startsWith("00")) combined = digits;
    else {
      const national = KEEPS_LEADING_ZERO.has(country) ? digits : digits.replace(/^0+/, "");
      combined = `+${dial} ${national}`;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="phone-number" className="eyebrow text-muted">
        {label}
      </label>
      <div dir="ltr" className="flex items-end gap-3">
        <div className="relative shrink-0 border-b border-line transition-colors focus-within:border-ink">
          <span aria-hidden className="flex min-h-11 items-center gap-1.5 py-2 pe-5 text-base">
            <span className="text-xs text-muted">{country}</span>
            <span>+{dial}</span>
            <svg className="absolute end-0 top-1/2 size-3 -translate-y-1/2 text-muted" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4.5 6 8.5 10 4.5" />
            </svg>
          </span>
          <select
            aria-label={pick(lang, "Country code", "رمز الدولة")}
            value={country}
            onChange={(e) => {
              setPicked(e.target.value);
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            {(countries ?? [{ code: country, dial, name: country }]).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} (+{c.dial})
              </option>
            ))}
          </select>
        </div>
        <input
          id="phone-number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          maxLength={30}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className={`min-h-11 w-full min-w-0 border-b border-line bg-transparent py-2 text-base outline-none transition-colors focus:border-ink${rtl ? " text-end" : ""}`}
        />
      </div>
      <input type="hidden" name="phone" value={combined} />
    </div>
  );
}
