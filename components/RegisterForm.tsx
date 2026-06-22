"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { VAT } from "@/lib/countries";

type Team = { id: string; name: string; city: string | null };

export default function RegisterForm({
  regionKey, countryCode, countryName, slug, eventId, eventName, fee, currency, status, teams,
}: {
  regionKey: string; countryCode: string; countryName: string; slug: string;
  eventId: string; eventName: string; fee: number; currency: string; status: string | null; teams: Team[];
}) {
  const router = useRouter();
  const [authState, setAuthState] = useState<"checking" | "in" | "out">("checking");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      setAuthState(session ? "in" : "out");
    })();
  }, []);

  const base = `/${regionKey}/${countryCode.toLowerCase()}`;
  const vat = VAT[countryCode] ?? 0;
  const vatAmt = +(fee * vat).toFixed(2);
  const total = +(fee + vatAmt).toFixed(2);
  const open = status === "registration_open";

  async function register() {
    setError("");
    if (!supabase) { setError("Backend not configured."); return; }
    if (!teamId) { setError("Please choose a team."); return; }
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthState("out"); setBusy(false); return; }
      const { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", session.user.id).maybeSingle();
      const registeredBy = (prof as { id?: string } | null)?.id ?? null;

      // already registered?
      const { data: existing } = await supabase
        .from("tournament_registrations").select("id").eq("tournament_id", eventId).eq("team_id", teamId).maybeSingle();

      if (!existing) {
        const { error: rErr } = await supabase.from("tournament_registrations").insert({
          tournament_id: eventId,
          team_id: teamId,
          registered_by: registeredBy,
          status: "registered",        // TEST: bypasses Stripe entry-fee payment
          entry_fee: fee,
          vat_amount: vatAmt,
          vat_rate: vat,
          total_charged: total,
          currency,
          paid_at: new Date().toISOString(),
        });
        if (rErr) throw rErr;
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not register.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="wrap" style={{ maxWidth: 560, padding: "60px 24px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: "8px 0" }}>Team registered</h1>
          <p style={{ color: "var(--muted)" }}>{teams.find((t) => t.id === teamId)?.name} is registered for {eventName}.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
            <Link className="btn btn-dark" href={`${base}/events/${slug}`}>Back to event</Link>
            <Link className="btn btn-primary" href="/dashboard">My dashboard</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ maxWidth: 560, padding: "48px 24px" }}>
      <Link className="back" href={`${base}/events/${slug}`} style={{ color: "var(--navy)" }}>← {eventName}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 900, margin: "10px 0 4px" }}>Register your team</h1>
      <p style={{ color: "var(--muted)", marginBottom: 22 }}>{eventName} · {countryName}</p>

      {!open && (
        <div className="auth-error" style={{ marginBottom: 18 }}>Registration is not open for this event.</div>
      )}

      {authState === "out" ? (
        <div className="card">
          <p style={{ marginBottom: 14 }}>Please log in to register a team.</p>
          <Link className="btn btn-dark" href="/login">Log in</Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#33404f", display: "block", marginBottom: 6 }}>Team</label>
            {teams.length ? (
              <select value={teamId} onChange={(e) => setTeamId(e.target.value)} style={{ width: "100%", padding: "12px 14px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, fontFamily: "inherit" }}>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}{t.city ? ` — ${t.city}` : ""}</option>)}
              </select>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>No teams found in {countryName} yet. Team creation is coming next.</p>
            )}
          </div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}><span>Entry fee</span><span>€{fee.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "var(--muted)", marginBottom: 6 }}><span>VAT ({(vat * 100).toFixed(vat * 100 % 1 ? 1 : 0)}%)</span><span>€{vatAmt.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 17, borderTop: "1px solid var(--line)", paddingTop: 8 }}><span>Total</span><span>€{total.toFixed(2)} {currency}</span></div>
          </div>

          {error && <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-primary" disabled={busy || !open || !teams.length} onClick={register} style={{ width: "100%", justifyContent: "center" }}>
            {busy ? "Registering…" : `Skip payment & register (TEST) — €${total.toFixed(2)}`}
          </button>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>🧪 Test mode: registers the team without charging the entry fee. Stripe replaces this later.</p>
        </>
      )}
    </main>
  );
}
