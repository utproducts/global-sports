// Config-driven IPM tiers + per-region rate resolution.
import { byCode } from "@/lib/countries";

export type Tier = {
  id: string;
  label: string;
  price_eur: number;
  is_popular: boolean;
  sort_order: number;
  features: string[];
  access: string[];
  description: string | null;
  ipr_tier: string;
};

export type RegionRate = { tier_id: string; region_key: string; price: number; active: boolean };

export function regionKeyForCountry(code: string): string | null {
  return byCode[code]?.region.key ?? null;
}

// Resolve the IPM price for a tier in a country's region, falling back to the base price.
export function rateFor(tier: Tier, countryCode: string, rates: RegionRate[]): number {
  const region = regionKeyForCountry(countryCode);
  if (region) {
    const r = rates.find((x) => x.tier_id === tier.id && x.region_key === region && x.active);
    if (r) return Number(r.price);
  }
  return Number(tier.price_eur);
}
