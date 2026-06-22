"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VAT, byCode } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

const TIER_ENUM: Record<string, string> = { standard: "standard", select: "premier", elite: "elite" };
const TIER_LABEL: Record<string, string> = { standard: "Standard", select: "Select", elite: "Elite" };
const PRICE: Record<string, number> = { standard: 30, select: 45, elite: 75 };

export default function CheckoutPage() {
  const router = useRouter();
  const [plan, setPlan] = useState("select");
  const [country, setCountry] = useState("DE");
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<"" | "active" | "confirm">("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const pl = p.get("plan"); const co = p.get("country");
    if (pl && PRICE[pl]) setPlan(pl);
    if (co && byCode[co.toUpperCase()]) setCountry(co.toUpperCase());
    (async () => {
      const { data: { session } } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
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
  const base = PRICE[plan];
  const vatAmt = +(base * vat).toFixed(2);
  const total = +(base + vatAmt).toFixed(2);

  async function activate() {
    setError("");
    if (!supabase) { setError("Backend not configured."); return; }
    if (!first.trim() || !last.trim()) { setError("Please enter your name."); return; }
    setBusy(true);
    try {
      // 1) Ensure an authenticated user
      let userId: string | undefined;
      let hasSession = false;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { userId = session.user.id; hasSession = true; }
      else {
        if (!email.trim() || password.length < 8) { setError("Enter an email and a password (8+ chars)."); setBusy(false); return; }
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { first_name: first, last_name: last } } });
        if (error) throw error;
        userId = data.user?.id; hasSession = !!data.session;
      }
      if (!userId) throw new Error("Could not establish an account.");

      // 2) Country id
      const { data: countryRow } = await supabase.from("countries").select("id").eq("code", country).maybeSingle();
      const cid = (countryRow as { id?: string } | null)?.id ?? null;

      // 3) Find or create the player profile
      const useEmail = hasSession ? (signedInEmail || email) : email;
      let { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", userId).maybeSingle();
      let playerId = (prof as { id?: string } | null)?.id;
      if (!playerId) {
        const { data: inserted, error: insErr } = await supabase
          .from("users")
          .insert({ email: useEmail, first_name: first, last_name: last, role: "player", country_id: cid, supabase_auth_id: userId })
          .select("id").single();
        if (insErr) throw insErr;
        playerId = (inserted as { id: string }).id;
      }

      // 4) Skip if already has an active membership
      const { data: existing } = await supabase
        .from("ipr_memberships").select("id").eq("player_id", playerId).eq("status", "active").maybeSingle();

      if (!existing) {
        const now = new Date();
        const exp = new Date(now); exp.setFullYear(exp.getFullYear() + 1);
        const { error: mErr } = await supabase.from("ipr_memberships").insert({
          player_id: playerId,
          tier: TIER_ENUM[plan],
          status: "active",                 // TEST: bypasses Stripe payment
          price_paid: base,
          currency: cur,
          vat_amount: vatAmt,
          vat_rate: vat,
          country_id: cid,
          activated_at: now.toISOString(),
          expires_at: exp.toISOString(),
          duration_type: "annual",
          duration_years: 1,
        });
        if (mErr) throw mErr;
      }

      if (hasSession) { router.push("/dashboard"); }
      else { setDone("confirm"); }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done === "confirm") {
    return (
      <><Header /><main className="auth-wrap"><div className="auth-card">
        <h1>Membership activated 🎉</h1>
        <p className="auth-sub">Your {TIER_LABEL[plan]} membership is active. We&apos;ve created your account — if email confirmation is on, verify your inbox, then <Link href="/login">log in</Link> to see your dashboard.</p>
      </div></main><Footer /></>
    );
  }

  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 26 }}>
          <div className="wrap">
            <Link className="back" href={`/membership?country=${country}`}>← Membership</Link>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Checkout</div>
            <h1>Confirm your membership</h1>
            <p className="sub">{entry?.country.f} {entry?.country.n} · {TIER_LABEL[plan]} · billed in {cur}</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 560 }}>
            {/* Order summary */}
            <div style={{ border: "1.5px solid var(--line)", borderRadius: 16, padding: 22, marginBottom: 26 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>{TIER_LABEL[plan]} membership (1 yr)</span><span>€{base.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--muted)", marginBottom: 6 }}><span>VAT ({(vat * 100).toFixed(vat * 100 % 1 ? 1 : 0)}%)</span><span>€{vatAmt.toFixed(2)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 18, borderTop: "1px solid var(--line)", paddingTop: 8, marginTop: 4 }}><span>Total</span><span>€{total.toFixed(2)}{cur !== "EUR" ? ` (${cur})` : ""}</span></div>
            </div>

            {/* Account */}
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
                  {busy ? "Activating…" : `Skip payment & activate (TEST) — €${total.toFixed(2)}`}
                </button>
              </form>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
                🧪 Test mode: this activates the membership without charging. Stripe checkout replaces this button later.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
