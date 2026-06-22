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
    key: "asia", label: "Asia", subdomain: "asia.globalsports.com",
    countries: [{ c: "ID", n: "Indonesia", f: "🇮🇩", cur: "IDR" }],
  },
  {
    key: "americas", label: "Americas", subdomain: "americas.globalsports.com",
    countries: [
      { c: "US", n: "USA", f: "🇺🇸", cur: "USD" }, { c: "CA", n: "Canada", f: "🇨🇦", cur: "CAD" },
      { c: "DO", n: "Dominican Republic", f: "🇩🇴", cur: "DOP" }, { c: "CW", n: "Curacao", f: "🇨🇼", cur: "ANG" },
    ],
  },
];

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
