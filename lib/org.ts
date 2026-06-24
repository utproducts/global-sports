// Shared helpers for the organizer toolkit.

export const CURRENCIES = ["EUR", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const SYM: Record<string, string> = { EUR: "€", USD: "$", GBP: "£" };
export const money = (n: number, cur = "EUR") => `${SYM[cur] ?? ""}${n.toFixed(2)}`;

export const AGE_GROUPS = ["Open", "Mens", "Womens", "Mixed", "Senior", "U18", "U16", "U14", "U12", "U10"] as const;
export const CLASSES = ["Open", "Major", "AAA", "AA", "A"] as const;

export const TSTATUS: Record<string, [string, string, string]> = {
  draft: ["Draft", "#5b6675", "#eef1f6"],
  registration_open: ["Registration open", "#138a45", "#e1f8ea"],
  registration_closed: ["Registration closed", "#b3261e", "#fdecec"],
  in_progress: ["Live now", "#8a6300", "#fff4e0"],
  completed: ["Completed", "#33404f", "#eef1f6"],
  cancelled: ["Cancelled", "#b3261e", "#fdecec"],
};

export const REG_STATUS: Record<string, [string, string, string]> = {
  pending_payment: ["Awaiting payment", "#8a6300", "#fff4e0"],
  registered: ["Confirmed", "#138a45", "#e1f8ea"],
  paid: ["Paid", "#138a45", "#e1f8ea"],
  invited: ["Invited", "#1a4fa0", "#e7eefb"],
  cancelled: ["Cancelled", "#b3261e", "#fdecec"],
};

export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD";

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}
