// The Global Sports access hierarchy, mapped onto the existing DB roles.
// (Authorization will later be enforced with Supabase RLS on director_roles/users.)

export type Tier = {
  key: string;
  label: string;
  scope: string;
  dbRoles: string[];
};

export const HIERARCHY: Tier[] = [
  { key: "super_admin", label: "Super Admin", scope: "Global — everything", dbRoles: ["hq_admin", "super_admin"] },
  { key: "director", label: "Director", scope: "A region or multiple countries", dbRoles: ["national_director", "tournament_director", "director"] },
  { key: "country_director", label: "Country Director", scope: "One country", dbRoles: ["country_director"] },
  { key: "coach", label: "Coach", scope: "One team", dbRoles: ["coach"] },
  { key: "player", label: "Player", scope: "Self — profile & membership", dbRoles: ["player"] },
];

export function tierForRole(dbRole?: string | null): Tier {
  const r = (dbRole || "").toLowerCase();
  return HIERARCHY.find((t) => t.dbRoles.includes(r)) ?? HIERARCHY[HIERARCHY.length - 1];
}
