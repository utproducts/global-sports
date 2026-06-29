// Director permission tiers (from the Global website tasks doc) and stature gating.
// Event statures carry a min_role; a user can create a stature only if their
// director rank meets it. Higher statures fall back to "draft pending approval".

export type DirectorTier = { key: string; label: string; rank: number; scope: string };

export const DIRECTOR_TIERS: DirectorTier[] = [
  { key: "hq_admin", label: "HQ / Global", rank: 4, scope: "Everything, worldwide" },
  { key: "region_director", label: "Territorial / Region Director", rank: 3, scope: "A region or several countries (e.g. EU + Middle East)" },
  { key: "country_director", label: "Country Director", rank: 2, scope: "One country" },
  { key: "basic_director", label: "Basic Director", rank: 1, scope: "Local area (by postal code)" },
];

// Operational (non-event-creating) roles.
export const OPERATIONAL_ROLES = [
  { key: "scorekeeper", label: "Scorekeeper", scope: "Enter live scores during events" },
  { key: "uic", label: "UIC", scope: "Umpire-in-chief / officiating" },
];

// Map any DB / metadata role string to a stature rank.
const RANK: Record<string, number> = {
  hq_admin: 4, super_admin: 4,
  region_director: 3, national_director: 3, territorial_director: 3, director: 3,
  country_director: 2,
  basic_director: 1, tournament_director: 1, organizer: 1, league: 1,
};

// A signed-in organizer with no director assignment can still run local/league events.
export function directorRank(roles: (string | null | undefined)[]): number {
  const ranks = roles.filter(Boolean).map((r) => RANK[(r as string).toLowerCase()] ?? 0);
  return Math.max(1, 0, ...ranks);
}

export function rankForRole(role: string): number {
  return RANK[role?.toLowerCase()] ?? 1;
}

export function canCreateStature(rank: number, statureMinRole: string): boolean {
  return rank >= rankForRole(statureMinRole);
}

export function tierForRank(rank: number): DirectorTier {
  return DIRECTOR_TIERS.find((t) => t.rank === rank) ?? DIRECTOR_TIERS[DIRECTOR_TIERS.length - 1];
}
