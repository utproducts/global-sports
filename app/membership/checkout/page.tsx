"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VAT, byCode } from "@/lib/countries";
import { supabase } from "@/lib/supabase";
import { rateFor, regionKeyForCountry, type Tier, type RegionRate } from "@/lib/membership";
import { bestWaiver, type Waiver } from "@/lib/waivers";

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState("");
  const [country, setCountry] = useState("DE");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [rates, setRates] = useState<RegionRate[]>([]);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [code, setCode] = useState("");
  const [years, setYears] = useState(1);
  const [autoRenew, setAutoRenew] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"" | "confirm">("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const pl = p.get("plan"); const co = p.get("country"); const yr = Number(p.get("years"));
    if (co && byCode[co.toUpperCase()]) setCountry(co.toUpperCase());
    if (yr === 2 || yr === 3) setYears(yr);
    (async () => {
      if (!supabase) return;
      const [{ data: t }, { data: r }, { data: w }, sess] = await Promise.all([
        supabase.from("membership_tiers").select("id,label,price_eur,is_popular,sort_order,features,access,description,ipr_tier").eq("is_active", true).order("sort_order"),
        supabase.from("membership_region_rates").select("tier_id,region_key,price,active").eq("active", true),
        supabase.from("fee_waivers").select("*").eq("active", true).in("applies_to", ["membership", "both"]),
        supabase.auth.getSession(),
      ]);
      const list = (t as Tier[]) ?? [];
      setTiers(list);
      setRates((r as RegionRate[]) ?? []);
      setWaivers((w as Waiver[]) ?? []);
      setPlan(pl && list.some((x) => x.id === pl) ? pl : (list.find((x) => x.is_popular)?.id ?? list[0]?.id ?? ""));
      const session = sess.data.session;
      if (session) {
        setSignedInEmail(session.user.email ?? "");
        const md = session.user.user_metadata || {};
        if (md.first_name) setFirst(md.first_name);
        if (md.last_name) setLast(md.last_name);
      }
    })();
  }, []);

  const entry = byCode[country];
  const cur = entry?.country.cur ?? "EUR";
  const vat = VAT[country] ?? 0;
  const tier = tiers.find((t) => t.id === plan);
  const unit = tier ? rateFor(tier, country, rates) : 0;
  const base = +(unit * years).toFixed(2);

  const applied = useMemo(() => {
    if (!tier) return null;
    return bestWaiver(waivers, { applies_to: "membership", regionKey: regionKeyForCountry(country), countryCode: country, code }, base);
  }, [waivers, tier, country, code, base]);

  const discount = applied?.discount ?? 0;
  const discounted = +(base - discount).toFixed(2);
  const vatAmt = +(discounted * vat).toFixed(2);
  const total = +(discounted + vatAmt).toFixed(2);

  async function activate() {
    setError("");
    if (!supabase) { setError("Backend not configured."); return; }
    if (!tier) { setError("Select a membership."); return; }
    if (!first.trim() || !last.trim()) { setError("Please enter your name."); return; }
    setBusy(true);
    try {
      let userId: string | undefined; let hasSession = false;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { userId = session.user.id; hasSession = true; }
      else {
        if (!email.trim() || password.length < 8) { setError("Enter an email and a password (8+ chars)."); setBusy(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: first, last_name: last } } });
        if (error) throw error;
        userId = data.user?.id; hasSession = !!data.session;
      }
      if (!userId) throw new Error("Could not establish an account.");

      const { data: countryRow } = await supabase.from("countries").select("id").eq("code", country).maybeSingle();
      const cid = (countryRow as { id?: string } | null)?.id ?? null;

      const useEmail = hasSession ? (signedInEmail || email) : email;
      const { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", userId).maybeSingle();
      let playerId = (prof as { id?: string } | null)?.id;
      if (!playerId) {
        const { data: inserted, error: insErr } = await supabase
          .from("users").insert({ email: useEmail, first_name: first, last_name: last, role: "player", country_id: cid, supabase_auth_id: userId })
          .select("id").single();
        if (insErr) throw insErr;
        playerId = (inserted as { id: string }).id;
      }

      const { data: existing } = await supabase.from("ipr_memberships").select("id").eq("player_id", playerId).eq("status", "active").maybeSingle();
      if (!existing) {
        const now = new Date(); const exp = new Date(now); exp.setFullYear(exp.getFullYear() + years);
        const { error: mErr } = await supabase.from("ipr_memberships").insert({
          player_id: playerId, tier: tier.ipr_tier, status: "active",   // TEST: bypasses Stripe
          price_paid: discounted, discount_amount: discount, waiver_id: applied?.waiver.id ?? null,
          currency: cur, vat_amount: vatAmt, vat_rate: vat, country_id: cid,
          activated_at: now.toISOString(), expires_at: exp.toISOString(),
          duration_type: years > 1 ? "multi_year" : "annual", duration_years: years, auto_renew: autoRenew,
        });
        if (mErr) throw mErr;
        if (applied?.waiver) {
          await supabase.from("fee_waivers").update({ redeemed_count: applied.waiver.redeemed_count + 1 }).eq("id", applied.waiver.id);
        }
      }
      if (hasSession) router.push("/dashboard"); else setDone("confirm");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  if (done === "confirm") {
    return (<><Header /><main className="auth-wrap"><div className="auth-card">
      <h1>Membership activated 🎉</h1>
      <p className="auth-sub">Your {tier?.label} IPM is active. We&apos;ve created your account — if email confirmation is on, verify your inbox, then <Link href="/login">log in</Link>.</p>
    </div></main><Footer /></>);
  }

  const vatPct = (vat * 100).toFixed(vat * 100 % 1 ? 1 : 0);

  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 26 }}>
          <div className="wrap">
            <Link className="back" href={`/membership?country=${country}`}>← Membership</Link>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Checkout</div>
            <h1>Confirm your membership</h1>
            <p className="sub">{entry?.country.f} {entry?.country.n} · {tier?.label ?? "—"} IPM · billed in {cur}</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 560 }}>
            <div style={{ border: "1.5px solid var(--line)", borderRadius: 16, padding: 22, marginBottom: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>{tier?.label ?? "—"} IPM ({years} yr{years > 1 ? "s" : ""})</span><span>€{base.toFixed(2)}</span></div>
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#138a45", marginBottom: 6 }}>
                  <span>Waiver — {applied?.waiver.label}</span><span>−€{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--muted)", marginBottom: 6 }}><span>VAT ({vatPct}%)</span><span>€{vatAmt.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 4 }}><span>Total</span><span>€{total.toFixed(2)}{cur !== "EUR" ? ` (${cur})` : ""}</span></div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount / waiver code"
                  style={{ flex: 1, padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontFamily: "inherit", fontSize: 14 }} />
                {code && (discount > 0 ? <span style={{ color: "#138a45", fontSize: 13, fontWeight: 700 }}>Applied ✓</span> : <span style={{ color: "var(--muted)", fontSize: 13 }}>No match</span>)}
              </div>
              <label style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#33404f" }}>
                <input type="checkbox" checked={autoRenew} onChange={(e) => setAutoRenew(e.target.checked)} />
                Auto-renew my membership when it expires ({years > 1 ? `every ${years} years` : "yearly"})
              </label>
            </div>

            <div className="auth-card" style={{ boxShadow: "none", border: "1.5px solid var(--line)", maxWidth: "none", padding: 22 }}>
              <h1 style={{ fontSize: 18, textAlign: "left" }}>{signedInEmail ? "Your details" : "Create your account"}</h1>
              <form onSubmit={(e) => { e.preventDefault(); activate(); }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <label style={{ flex: 1 }}>First name<input value={first} onChange={(e) => setFirst(e.target.value)} required /></label>
                  <label style={{ flex: 1 }}>Last name<input value={last} onChange={(e) => setLast(e.target.value)} required /></label>
                </div>
                {signedInEmail ? (
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0" }}>Signed in as <strong>{signedInEmail}</strong></p>
                ) : (
                  <>
                    <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
                    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" /></label>
                  </>
                )}
                {error && <div className="auth-error">{error}</div>}
                <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
                  {busy ? "Activating…" : total === 0 ? "Activate free membership" : `Skip payment & activate (TEST) — €${total.toFixed(2)}`}
                </button>
              </form>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>🧪 Test mode: activates without charging. Stripe checkout replaces this later.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
