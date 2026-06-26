// Fee-waiver engine: waive or discount fees by area/event, full or partial,
// optionally behind a code, with a validity window and redemption cap.

export type Waiver = {
  id: string;
  label: string;
  applies_to: "membership" | "tournament" | "both";
  scope_type: "global" | "region" | "country" | "tournament";
  scope_value: string | null;
  discount_type: "percent" | "fixed" | "full";
  amount: number;
  code: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_redemptions: number | null;
  redeemed_count: number;
};

export type WaiverContext = {
  applies_to: "membership" | "tournament";
  regionKey?: string | null;
  countryCode?: string | null;
  tournamentId?: string | null;
  code?: string | null;
};

export function isLive(w: Waiver, now = Date.now()): boolean {
  if (!w.active) return false;
  if (w.starts_at && new Date(w.starts_at).getTime() > now) return false;
  if (w.ends_at && new Date(w.ends_at).getTime() < now) return false;
  if (w.max_redemptions != null && w.redeemed_count >= w.max_redemptions) return false;
  return true;
}

function scopeMatches(w: Waiver, ctx: WaiverContext): boolean {
  if (w.applies_to !== "both" && w.applies_to !== ctx.applies_to) return false;
  switch (w.scope_type) {
    case "global": return true;
    case "region": return !!ctx.regionKey && w.scope_value === ctx.regionKey;
    case "country": return !!ctx.countryCode && w.scope_value === ctx.countryCode;
    case "tournament": return !!ctx.tournamentId && w.scope_value === ctx.tournamentId;
    default: return false;
  }
}

function codeMatches(w: Waiver, ctx: WaiverContext): boolean {
  if (!w.code) return true; // auto-applies, no code required
  return !!ctx.code && ctx.code.trim().toUpperCase() === w.code.trim().toUpperCase();
}

export function eligibleWaivers(all: Waiver[], ctx: WaiverContext, now = Date.now()): Waiver[] {
  return all.filter((w) => isLive(w, now) && scopeMatches(w, ctx) && codeMatches(w, ctx));
}

// Discount amount (in the same units as base), clamped to [0, base].
export function computeDiscount(base: number, w: Waiver): number {
  let d = 0;
  if (w.discount_type === "full") d = base;
  else if (w.discount_type === "percent") d = base * (w.amount / 100);
  else if (w.discount_type === "fixed") d = w.amount;
  return Math.max(0, Math.min(base, +d.toFixed(2)));
}

export function bestWaiver(all: Waiver[], ctx: WaiverContext, base: number, now = Date.now()):
  { waiver: Waiver; discount: number } | null {
  let best: { waiver: Waiver; discount: number } | null = null;
  for (const w of eligibleWaivers(all, ctx, now)) {
    const discount = computeDiscount(base, w);
    if (discount > 0 && (!best || discount > best.discount)) best = { waiver: w, discount };
  }
  return best;
}
