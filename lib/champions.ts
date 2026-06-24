// Curated honor roll. Edit this list to publish official champions.
// (Champion lists are editorial — they don't auto-derive from pool standings.)
export type Champion = {
  event: string;
  brand?: string;
  year: number;
  champion: string;
  category: string;   // Men, Women, Mixed, Coed, Seniors, Youth, Open
  level?: string;     // SuperCup, EuroCup, PremierCup, Global Games, League…
  region: string;     // market-region key
  code: string;       // country ISO-2 for the flag
};

export const CHAMPIONS: Champion[] = [
  { event: "WSC & Global Games — Barcelona", brand: "Global Games", year: 2026, champion: "USA Superior", category: "Open", level: "Global Games", region: "europe", code: "ES" },
  { event: "Austrian Slowpitch League (ASSL)", brand: "360 / ASSL", year: 2026, champion: "Los Coyotes", category: "Coed", level: "League", region: "europe", code: "AT" },
  { event: "ESSC SuperCup — Men", brand: "ESSC", year: 2025, champion: "UCE Travellers", category: "Men", level: "SuperCup", region: "europe", code: "DE" },
  { event: "ESSC SuperCup — Women", brand: "ESSC", year: 2025, champion: "Astros Women", category: "Women", level: "SuperCup", region: "europe", code: "ES" },
  { event: "ESSC EuroCup", brand: "ESSC", year: 2025, champion: "Barcelona Storm", category: "Men", level: "EuroCup", region: "europe", code: "ES" },
  { event: "ESSC PremierCup", brand: "ESSC", year: 2025, champion: "Munich Mustangs", category: "Coed", level: "PremierCup", region: "europe", code: "DE" },
  { event: "Riccione Open", year: 2025, champion: "Astros Tenerife", category: "Coed", region: "europe", code: "IT" },
  { event: "Polish Slowpitch League", brand: "360 / PSL", year: 2025, champion: "Warsaw Wolves", category: "Coed", level: "League", region: "europe", code: "PL" },
];
