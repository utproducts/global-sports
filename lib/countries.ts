// Region + country reference data (sourced from the Europe-DC-Render Supabase project).
// Region = subdomain/tenant boundary; country = personalization (currency, VAT, theme).

export type Country = { c: string; n: string; f: string; cur: string };
export type Region = { key: string; label: string; subdomain: string; countries: Country[] };

export const REGIONS: Region[] = [
  {
    key: "europe", label: "Europe", subdomain: "europe.globalsports.com",
    countries: [
      { c: "AT", n: "Austria", f: "🇦🇹", cur: "EUR" }, { c: "BE", n: "Belgium", f: "🇧🇪", cur: "EUR" },
      { c: "BG", n: "Bulgaria", f: "🇧🇬", cur: "BGN" }, { c: "HR", n: "Croatia", f: "🇭🇷", cur: "EUR" },
      { c: "CY", n: "Cyprus", f: "🇨🇾", cur: "EUR" }, { c: "CZ", n: "Czech Republic", f: "🇨🇿", cur: "EUR" },
      { c: "DK", n: "Denmark", f: "🇩🇰", cur: "EUR" }, { c: "EE", n: "Estonia", f: "🇪🇪", cur: "EUR" },
      { c: "FI", n: "Finland", f: "🇫🇮", cur: "EUR" }, { c: "FR", n: "France", f: "🇫🇷", cur: "EUR" },
      { c: "DE", n: "Germany", f: "🇩🇪", cur: "EUR" }, { c: "GR", n: "Greece", f: "🇬🇷", cur: "EUR" },
      { c: "GG", n: "Guernsey", f: "🇬🇬", cur: "GBP" }, { c: "HU", n: "Hungary", f: "🇭🇺", cur: "HUF" },
      { c: "IE", n: "Ireland", f: "🇮🇪", cur: "EUR" }, { c: "IT", n: "Italy", f: "🇮🇹", cur: "EUR" },
      { c: "LV", n: "Latvia", f: "🇱🇻", cur: "EUR" }, { c: "LT", n: "Lithuania", f: "🇱🇹", cur: "EUR" },
      { c: "LU", n: "Luxembourg", f: "🇱🇺", cur: "EUR" }, { c: "MT", n: "Malta", f: "🇲🇹", cur: "EUR" },
      { c: "NL", n: "Netherlands", f: "🇳🇱", cur: "EUR" }, { c: "XI", n: "Northern Ireland", f: "🇬🇧", cur: "GBP" },
      { c: "NO", n: "Norway", f: "🇳🇴", cur: "NOK" }, { c: "PL", n: "Poland", f: "🇵🇱", cur: "EUR" },
      { c: "PT", n: "Portugal", f: "🇵🇹", cur: "EUR" }, { c: "RO", n: "Romania", f: "🇷🇴", cur: "RON" },
      { c: "RS", n: "Serbia", f: "🇷🇸", cur: "RSD" }, { c: "SK", n: "Slovakia", f: "🇸🇰", cur: "EUR" },
      { c: "SI", n: "Slovenia", f: "🇸🇮", cur: "EUR" }, { c: "ES", n: "Spain", f: "🇪🇸", cur: "EUR" },
      { c: "SE", n: "Sweden", f: "🇸🇪", cur: "EUR" }, { c: "CH", n: "Switzerland", f: "🇨🇭", cur: "CHF" },
      { c: "GB", n: "United Kingdom", f: "🇬🇧", cur: "EUR" },
    ],
  },
  {
    key: "middle-east", label: "Middle East", subdomain: "middleeast.globalsports.com",
    countries: [
      { c: "SA", n: "Saudi Arabia", f: "🇸🇦", cur: "SAR" }, { c: "AE", n: "United Arab Emirates", f: "🇦🇪", cur: "AED" },
    ],
  },
  {
    key: "southeast-asia", label: "Southeast Asia", subdomain: "sea.globalsports.com",
    countries: [
      { c: "ID", n: "Indonesia", f: "🇮🇩", cur: "IDR" }, { c: "TH", n: "Thailand", f: "🇹🇭", cur: "THB" },
      { c: "VN", n: "Vietnam", f: "🇻🇳", cur: "VND" }, { c: "PH", n: "Philippines", f: "🇵🇭", cur: "PHP" },
      { c: "MY", n: "Malaysia", f: "🇲🇾", cur: "MYR" }, { c: "SG", n: "Singapore", f: "🇸🇬", cur: "SGD" },
    ],
  },
  {
    key: "americas", label: "Americas", subdomain: "americas.globalsports.com",
    countries: [
      { c: "US", n: "USA", f: "🇺🇸", cur: "USD" }, { c: "CA", n: "Canada", f: "🇨🇦", cur: "CAD" },
      { c: "DO", n: "Dominican Republic", f: "🇩🇴", cur: "DOP" }, { c: "CW", n: "Curacao", f: "🇨🇼", cur: "ANG" },
    ],
  },
];

// VAT rate per country (from the countries table). Used for membership pricing.
export const VAT: Record<string, number> = {
  AE: 0.05, AT: 0.20, BE: 0.21, BG: 0.20, CA: 0.13, CH: 0.077, CW: 0.06, CY: 0.19,
  CZ: 0.21, DE: 0.19, DK: 0.25, DO: 0.18, EE: 0.22, ES: 0.21, FI: 0.255, FR: 0.20,
  GB: 0.20, GG: 0.0, GR: 0.24, HR: 0.25, HU: 0.27, ID: 0.11, IE: 0.23, IT: 0.22,
  LT: 0.21, LU: 0.17, LV: 0.21, MT: 0.18, NL: 0.21, NO: 0.25, PL: 0.23, PT: 0.23,
  RO: 0.19, RS: 0.20, SA: 0.15, SE: 0.25, SI: 0.22, SK: 0.20, US: 0.0, XI: 0.20,
};

// Countries where we currently have a presence (teams / venues / events).
export const PRESENCE: Record<string, { teams: number; venues?: number; tournaments?: number }> = {
  US: { teams: 14 }, NL: { teams: 10 }, ES: { teams: 9, venues: 5, tournaments: 1 }, GB: { teams: 9 },
  DE: { teams: 7 }, FR: { teams: 5 }, IE: { teams: 4 }, IT: { teams: 4, tournaments: 1 }, BE: { teams: 3 },
  CZ: { teams: 3 }, CA: { teams: 3 }, PL: { teams: 3 }, CH: { teams: 3 }, AE: { teams: 3 }, AT: { teams: 2 },
  PT: { teams: 2 }, CW: { teams: 2 }, SE: { teams: 2 }, DO: { teams: 1 },
};

export type CountryEntry = { country: Country; region: Region; presence: typeof PRESENCE[string] | null };

export const byCode: Record<string, CountryEntry> = {};
for (const region of REGIONS) {
  for (const country of region.countries) {
    byCode[country.c] = { country, region, presence: PRESENCE[country.c] ?? null };
  }
}

export const ALL_COUNTRIES: CountryEntry[] = Object.values(byCode);

export function findCountry(code: string): CountryEntry | undefined {
  return byCode[code.toUpperCase()];
}

export function regionByKey(key: string): Region | undefined {
  return REGIONS.find((r) => r.key === key);
}

// ----- Whole-world continent navigation -----
// Global Sports market regions (emotionally resonant, not generic continents).
export type Continent = { key: string; label: string; live: boolean; codes: string[] };
export const CONTINENTS: Continent[] = [
  { key: "europe", label: "Europe", live: true, codes: ["eu", "gb", "de"] },
  { key: "americas", label: "Americas", live: false, codes: ["us", "ca", "br"] },
  { key: "middle-east", label: "Middle East", live: false, codes: ["sa", "ae", "qa"] },
  { key: "southeast-asia", label: "Southeast Asia", live: false, codes: ["id", "th", "ph"] },
  { key: "east-asia", label: "East Asia", live: false, codes: ["jp", "cn", "kr"] },
  { key: "south-asia", label: "South Asia", live: false, codes: ["in", "pk", "lk"] },
  { key: "africa", label: "Africa", live: false, codes: ["za", "ng", "ke"] },
  { key: "oceania", label: "Oceania", live: false, codes: ["au", "nz", "fj"] },
];
export const continentByKey = (k: string) => CONTINENTS.find((c) => c.key === k);

// ISO-2 country code -> market region key (covers the world map's regions).
export const COUNTRY_CONTINENT: Record<string, string> = {
  // Europe
  AL: "europe", AD: "europe", AT: "europe", BY: "europe", BE: "europe", BA: "europe", BG: "europe", HR: "europe",
  CY: "europe", CZ: "europe", DK: "europe", EE: "europe", FI: "europe", FR: "europe", DE: "europe", GR: "europe",
  HU: "europe", IS: "europe", IE: "europe", IT: "europe", XK: "europe", LV: "europe", LI: "europe", LT: "europe",
  LU: "europe", MT: "europe", MD: "europe", MC: "europe", ME: "europe", NL: "europe", MK: "europe", NO: "europe",
  PL: "europe", PT: "europe", RO: "europe", RU: "europe", SM: "europe", RS: "europe", SK: "europe", SI: "europe",
  ES: "europe", SE: "europe", CH: "europe", UA: "europe", GB: "europe", GG: "europe", JE: "europe", IM: "europe", XI: "europe",
  // Middle East
  SA: "middle-east", AE: "middle-east", QA: "middle-east", KW: "middle-east", BH: "middle-east", OM: "middle-east",
  YE: "middle-east", IQ: "middle-east", IR: "middle-east", IL: "middle-east", JO: "middle-east", LB: "middle-east",
  SY: "middle-east", PS: "middle-east", TR: "middle-east",
  // East Asia
  CN: "east-asia", JP: "east-asia", KR: "east-asia", KP: "east-asia", MN: "east-asia", TW: "east-asia", HK: "east-asia", MO: "east-asia",
  // Southeast Asia
  MM: "southeast-asia", TH: "southeast-asia", VN: "southeast-asia", LA: "southeast-asia", KH: "southeast-asia",
  MY: "southeast-asia", SG: "southeast-asia", ID: "southeast-asia", PH: "southeast-asia", BN: "southeast-asia", TL: "southeast-asia",
  // South & Central Asia
  IN: "south-asia", PK: "south-asia", BD: "south-asia", LK: "south-asia", NP: "south-asia", BT: "south-asia", MV: "south-asia",
  AF: "south-asia", KZ: "south-asia", UZ: "south-asia", TM: "south-asia", KG: "south-asia", TJ: "south-asia",
  // Africa
  DZ: "africa", AO: "africa", BJ: "africa", BW: "africa", BF: "africa", BI: "africa", CM: "africa", CV: "africa",
  CF: "africa", TD: "africa", KM: "africa", CG: "africa", CD: "africa", CI: "africa", DJ: "africa", EG: "africa",
  GQ: "africa", ER: "africa", SZ: "africa", ET: "africa", GA: "africa", GM: "africa", GH: "africa", GN: "africa",
  GW: "africa", KE: "africa", LS: "africa", LR: "africa", LY: "africa", MG: "africa", MW: "africa", ML: "africa",
  MR: "africa", MU: "africa", MA: "africa", MZ: "africa", NA: "africa", NE: "africa", NG: "africa", RW: "africa",
  SN: "africa", SL: "africa", SO: "africa", ZA: "africa", SS: "africa", SD: "africa", TZ: "africa", TG: "africa",
  TN: "africa", UG: "africa", ZM: "africa", ZW: "africa", EH: "africa", ST: "africa", SC: "africa",
  // Oceania
  AU: "oceania", NZ: "oceania", PG: "oceania", FJ: "oceania", SB: "oceania", VU: "oceania", NC: "oceania",
  PF: "oceania", WS: "oceania", TO: "oceania", KI: "oceania", FM: "oceania", MH: "oceania", NR: "oceania",
  PW: "oceania", TV: "oceania",
  // Americas
  US: "americas", CA: "americas", MX: "americas", GT: "americas", BZ: "americas", SV: "americas", HN: "americas",
  NI: "americas", CR: "americas", PA: "americas", CU: "americas", DO: "americas", HT: "americas", JM: "americas",
  BS: "americas", BB: "americas", TT: "americas", PR: "americas", BR: "americas", AR: "americas", CL: "americas",
  CO: "americas", PE: "americas", VE: "americas", EC: "americas", BO: "americas", PY: "americas", UY: "americas",
  GY: "americas", SR: "americas", CW: "americas", AW: "americas", GL: "americas",
};
