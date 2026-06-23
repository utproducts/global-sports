export type League = {
  slug: string;
  name: string;
  code: string;        // country ISO-2
  country: string;
  season: string;
  desc: string;
  accent: string;
  teams: number;
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
    teams: 8,
  },
  {
    slug: "austrian-league",
    name: "Austrian Slow-Pitch League",
    code: "AT",
    country: "Austria",
    season: "2026 Season",
    desc: "Austria's club competition — weekly fixtures and regional rounds building to the championship finals.",
    accent: "#1f3a8a",
    teams: 6,
  },
];

export const leagueBySlug = (slug: string) => LEAGUES.find((l) => l.slug === slug);
