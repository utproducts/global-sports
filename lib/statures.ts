// Event statures — drive points, who can create them (min_role), and whether IPM is required.
export type Stature = {
  id: string;
  code: string;
  name: string;
  min_role: string;
  point_multiplier: number;
  ipm_required: boolean;
  ipm_cost: number | null;
  ipm_currency: string | null;
  region_scope: string | null; // 'europe' | 'usa' | 'global' | null (any)
  global_points: number | null;
  us_points: number | null;
  display_order: number;
  is_active: boolean;
  description: string | null;
};

export const ROLE_LABEL: Record<string, string> = {
  hq_admin: "HQ / Global",
  super_admin: "HQ / Global",
  region_director: "Region / Territorial Director",
  country_director: "Country Director",
  basic_director: "Basic Director",
};
export const roleLabel = (r: string) => ROLE_LABEL[r] ?? r;
