export type Flagship = {
  slug: string;
  name: string;
  brand?: string;
  tagline: string;
  blurb: string;
  location: string;
  code: string;          // country ISO-2
  dates: string;
  accent: string;
  imgSeed: string;       // stock photo seed (picsum) — swap for real shoots later
  categories: string[];
  levels?: string[];
  championships?: { name: string; desc: string }[];
  registerHref: string;
  status: "open" | "soon" | "closed";
};

export const FLAGSHIPS: Flagship[] = [
  {
    slug: "world-slowpitch-championship",
    name: "World Slowpitch Championship",
    brand: "Worlds",
    tagline: "The World Cup of slow-pitch.",
    blurb: "The pinnacle of the sport. National and club champions from every continent converge to crown a true world champion. The Worlds is where legacies are made.",
    location: "Global",
    code: "eu",
    dates: "2026 · dates TBA",
    accent: "#f5c518",
    imgSeed: "worlds-stadium",
    categories: ["Men", "Women", "Mixed", "Coed", "Seniors"],
    registerHref: "/signup",
    status: "soon",
  },
  {
    slug: "global-games-barcelona",
    name: "360 Global Games — Barcelona",
    brand: "360 Global Games",
    tagline: "Elite multi-nation showcase.",
    blurb: "The Global Games bring the world's teams to Barcelona for the flagship Global Sports spectacle — top-level competition, culture and the full event experience.",
    location: "Barcelona, Spain",
    code: "ES",
    dates: "20–22 Mar 2026",
    accent: "#2ea36b",
    imgSeed: "barcelona-games",
    categories: ["Open", "Men", "Women", "Coed"],
    registerHref: "/europe/es/events/wsc-global-games-barcelona-2026/register",
    status: "closed",
  },
  {
    slug: "essc-regensburg",
    name: "ESSC Regensburg",
    brand: "ESSC — European Slowpitch Championship",
    tagline: "Europe's #1 championship.",
    blurb: "The most prestigious championship in Europe and the main tournament on the calendar. ESSC Regensburg runs six championships across men's and women's divisions, with qualifying paths from leagues and tournaments across the continent.",
    location: "Regensburg, Germany",
    code: "DE",
    dates: "Summer 2026",
    accent: "#c8102e",
    imgSeed: "regensburg-essc",
    categories: ["Men", "Women"],
    levels: ["SuperCup", "EuroCup", "PremierCup"],
    championships: [
      { name: "ESSC SuperCup", desc: "The #1 level in Europe — the continent's best compete for the top crown." },
      { name: "ESSC EuroCup", desc: "The championship tier below the SuperCup for established competitive teams." },
      { name: "ESSC PremierCup", desc: "Premier competition opening the championship to more clubs." },
    ],
    registerHref: "/signup",
    status: "soon",
  },
  {
    slug: "riccione",
    name: "Riccione Open",
    tagline: "Slow-pitch on the Adriatic.",
    blurb: "A flagship stop on the Italian coast — competitive ball in a festival atmosphere on the Riviera.",
    location: "Riccione, Italy",
    code: "IT",
    dates: "2026 · dates TBA",
    accent: "#1f3a8a",
    imgSeed: "riccione-coast",
    categories: ["Coed", "Men", "Women"],
    registerHref: "/signup",
    status: "soon",
  },
  {
    slug: "tenerife",
    name: "Tenerife Classic",
    tagline: "Island championship ball.",
    blurb: "Sun, sand and slow-pitch — a flagship Canary Islands event drawing teams from across Europe.",
    location: "Tenerife, Spain",
    code: "ES",
    dates: "2026 · dates TBA",
    accent: "#8a6a00",
    imgSeed: "tenerife-island",
    categories: ["Coed", "Open"],
    registerHref: "/signup",
    status: "soon",
  },
  {
    slug: "bonn",
    name: "Bonn Mixed & Recreational",
    tagline: "Where everyone plays.",
    blurb: "A flagship mixed and recreational event — the welcoming side of the sport, built for community and fun across Levels 1 and 2.",
    location: "Bonn, Germany",
    code: "DE",
    dates: "2026 · dates TBA",
    accent: "#2ea36b",
    imgSeed: "bonn-rec",
    categories: ["Mixed", "Coed", "Recreational"],
    levels: ["Recreational L1", "Recreational L2"],
    registerHref: "/signup",
    status: "soon",
  },
  {
    slug: "hluboka",
    name: "Hluboká Open",
    tagline: "Czech slow-pitch flagship.",
    blurb: "A flagship Central European event in the shadow of Hluboká castle — fast-growing and fiercely competitive.",
    location: "Hluboká, Czech Republic",
    code: "CZ",
    dates: "2026 · dates TBA",
    accent: "#7a1020",
    imgSeed: "hluboka-castle",
    categories: ["Coed", "Men", "Women"],
    registerHref: "/signup",
    status: "soon",
  },
];

export const flagshipBySlug = (slug: string) => FLAGSHIPS.find((f) => f.slug === slug);
