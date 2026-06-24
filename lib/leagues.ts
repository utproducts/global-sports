export type Standing = { team: string; g: number; w: number; l: number; t: number; rd: number; pct: number; pts: number };
export type League = {
  slug: string;
  name: string;
  code: string;        // country ISO-2
  country: string;
  season: string;
  desc: string;
  accent: string;
  teams: number;
  standings?: Standing[];
};

export const LEAGUES: League[] = [
  {
    slug: "polish-league",
    name: "Polish Slow-Pitch League",
    code: "PL",
    country: "Poland",
    season: "2026 Season",
    desc: "National league play across Poland — clubs battle through a full season of fixtures for the national title and ranking points.",
    accent: "#d4213d",
    teams: 6,
    standings: [
      { team: "Warsaw Wolves", g: 12, w: 10, l: 2, t: 0, rd: 78, pct: 0.833, pts: 20 },
      { team: "Kraków Kings", g: 12, w: 8, l: 4, t: 0, rd: 41, pct: 0.667, pts: 16 },
      { team: "Wrocław Warriors", g: 12, w: 7, l: 5, t: 0, rd: 12, pct: 0.583, pts: 14 },
      { team: "Poznań Pythons", g: 12, w: 5, l: 6, t: 1, rd: -8, pct: 0.458, pts: 11 },
      { team: "Gdańsk Gulls", g: 12, w: 3, l: 8, t: 1, rd: -44, pct: 0.292, pts: 7 },
      { team: "Łódź Lynx", g: 12, w: 2, l: 10, t: 0, rd: -79, pct: 0.167, pts: 4 },
    ],
  },
  {
    slug: "austrian-league",
    name: "Austrian Slow-Pitch League (ASSL)",
    code: "AT",
    country: "Austria",
    season: "2026 Season",
    desc: "Austria's club competition — round-robin rounds in Linz and Vienna building to the championship game. A qualifier path toward ESSC Regensburg.",
    accent: "#1f3a8a",
    teams: 8,
    standings: [
      { team: "Los Coyotes", g: 13, w: 11, l: 2, t: 0, rd: 90, pct: 0.846, pts: 13 },
      { team: "Warriors", g: 13, w: 6.5, l: 6, t: 1, rd: -24, pct: 0.5, pts: 10 },
      { team: "Team X", g: 13, w: 4.5, l: 7, t: 3, rd: -10, pct: 0.346, pts: 7.5 },
      { team: "Los Titanes", g: 16, w: 7, l: 9, t: 0, rd: -21, pct: 0.438, pts: 7 },
      { team: "Los Recogidos", g: 16, w: 8.5, l: 7, t: 1, rd: -1, pct: 0.531, pts: 6 },
      { team: "PGS", g: 7, w: 1.5, l: 5, t: 1, rd: -30, pct: 0.214, pts: 4.5 },
      { team: "Black Ravens", g: 17, w: 7, l: 10, t: 0, rd: -49, pct: 0.412, pts: 4 },
      { team: "X Fusion", g: 7, w: 5, l: 2, t: 0, rd: 45, pct: 0.714, pts: 0 },
    ],
  },
];

export const leagueBySlug = (slug: string) => LEAGUES.find((l) => l.slug === slug);
