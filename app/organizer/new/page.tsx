"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { AGE_GROUPS, CLASSES, CURRENCIES, slugify } from "@/lib/org";
import { roleLabel, type Stature } from "@/lib/statures";

type Country = { id: string; name: string; code: string };

const inp: React.CSSProperties = { width: "100%", padding: "11px 13px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", background: "#fff" };
const lab: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#33404f", marginBottom: 6 };

export default function NewTournament() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [statures, setStatures] = useState<Stature[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [f, setF] = useState({
    name: "", country_id: "", start_date: "", end_date: "",
    registration_closes_at: "", age_group: "Open", usssa_class: "AA",
    stature_id: "", max_teams: 16, reserved_slots: 0, min_teams: 4,
    team_fee: 0, currency: "EUR", ipr_required: false,
    status: "registration_open", notes: "",
  });
  const stature = statures.find((s) => s.id === f.stature_id);
  const set = (k: string, v: string | number | boolean) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    (async () => {
      if (!supabase) { setAuthReady(true); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", session.user.id).maybeSingle();
      setUid((prof as { id?: string } | null)?.id ?? null);
      const [{ data: cs }, { data: st }] = await Promise.all([
        supabase.from("countries").select("id,name,code").order("name"),
        supabase.from("event_statures").select("*").eq("is_active", true).in("region_scope", ["europe", "global"]).order("display_order"),
      ]);
      if (cs) setCountries(cs as Country[]);
      if (st) setStatures(st as Stature[]);
      setAuthReady(true);
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) { setError("Backend not configured."); return; }
    if (!f.country_id) { setError("Choose a country."); return; }
    if (!f.start_date || !f.end_date) { setError("Set start and end dates."); return; }
    if (Number(f.reserved_slots) > Number(f.max_teams)) { setError("Reserved slots can't exceed total capacity."); return; }
    setBusy(true);
    const { data, error: err } = await supabase.from("tournaments").insert({
      name: f.name,
      slug: slugify(f.name) || null,
      country_id: f.country_id,
      sport: "softball",
      age_group: f.age_group,
      usssa_class: f.usssa_class,
      stature_id: f.stature_id || null,
      start_date: f.start_date,
      end_date: f.end_date,
      registration_closes_at: f.registration_closes_at || null,
      max_teams: Number(f.max_teams),
      min_teams: Number(f.min_teams),
      reserved_slots: Number(f.reserved_slots),
      team_fee: Number(f.team_fee),
      currency: f.currency,
      ipr_required: f.ipr_required,
      status: f.status,
      notes: f.notes || null,
      created_by: uid,
      director_id: uid,
    }).select("id").maybeSingle();
    setBusy(false);
    if (err) { setError(err.message); return; }
    const id = (data as { id?: string } | null)?.id;
    router.push(id ? `/organizer/${id}` : "/organizer");
  }

  if (!authReady) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><p style={{ color: "var(--muted)" }}>Loading…</p></main><Footer /></>;

  return (
    <>
      <Header />
      <main className="wrap" style={{ maxWidth: 720, padding: "44px 24px" }}>
        <Link className="back" href="/organizer" style={{ color: "var(--navy)" }}>← Your tournaments</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "10px 0 4px" }}>Create a tournament</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>Set the basics now — you can fine-tune brackets, schedule and lineups later.</p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <label style={lab}>Tournament name</label>
            <input style={inp} value={f.name} onChange={(e) => set("name", e.target.value)} required placeholder="e.g. ESSC Regensburg 2026" />
            <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label style={lab}>Country</label>
                <select style={inp} value={f.country_id} onChange={(e) => set("country_id", e.target.value)} required>
                  <option value="">Select…</option>
                  {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <label style={lab}>Category</label>
                <select style={inp} value={f.age_group} onChange={(e) => set("age_group", e.target.value)}>
                  {AGE_GROUPS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 120px" }}>
                <label style={lab}>Class / level</label>
                <select style={inp} value={f.usssa_class} onChange={(e) => set("usssa_class", e.target.value)}>
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px" }}><label style={lab}>Start date</label><input type="date" style={inp} value={f.start_date} onChange={(e) => set("start_date", e.target.value)} required /></div>
              <div style={{ flex: "1 1 160px" }}><label style={lab}>End date</label><input type="date" style={inp} value={f.end_date} onChange={(e) => set("end_date", e.target.value)} required /></div>
              <div style={{ flex: "1 1 200px" }}><label style={lab}>Registration deadline</label><input type="datetime-local" style={inp} value={f.registration_closes_at} onChange={(e) => set("registration_closes_at", e.target.value)} /></div>
            </div>
          </div>

          <div className="card">
            <label style={lab}>Event stature</label>
            <select style={inp} value={f.stature_id} onChange={(e) => {
              const s = statures.find((x) => x.id === e.target.value);
              setF((prev) => ({ ...prev, stature_id: e.target.value, ipr_required: s ? s.ipm_required : prev.ipr_required }));
            }}>
              <option value="">Select a stature…</option>
              {statures.map((s) => <option key={s.id} value={s.id}>{s.name}{s.ipm_required ? " · IPM required" : ""}</option>)}
            </select>
            {stature && (
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                <span>Points ×{stature.point_multiplier}</span>
                <span>Min role: <strong style={{ color: "var(--navy)" }}>{roleLabel(stature.min_role)}</strong></span>
                <span>IPM: <strong style={{ color: stature.ipm_required ? "#8a6300" : "#138a45" }}>{stature.ipm_required ? `required${stature.ipm_cost ? ` · €${Number(stature.ipm_cost).toFixed(0)}` : ""}` : "not required"}</strong></span>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 120px" }}><label style={lab}>Total team slots</label><input type="number" min={2} style={inp} value={f.max_teams} onChange={(e) => set("max_teams", e.target.value)} /></div>
              <div style={{ flex: "1 1 120px" }}>
                <label style={lab}>Reserved slots</label>
                <input type="number" min={0} style={inp} value={f.reserved_slots} onChange={(e) => set("reserved_slots", e.target.value)} />
              </div>
              <div style={{ flex: "1 1 120px" }}><label style={lab}>Minimum teams</label><input type="number" min={2} style={inp} value={f.min_teams} onChange={(e) => set("min_teams", e.target.value)} /></div>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Reserved slots are held back from public registration for invited or qualified teams — you add those yourself.</p>
          </div>

          <div className="card">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "1 1 140px" }}><label style={lab}>Entry fee (per team)</label><input type="number" min={0} step="0.01" style={inp} value={f.team_fee} onChange={(e) => set("team_fee", e.target.value)} /></div>
              <div style={{ flex: "1 1 110px" }}>
                <label style={lab}>Currency</label>
                <select style={inp} value={f.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
              </div>
              <label style={{ flex: "1 1 160px", display: "flex", alignItems: "center", gap: 8, fontSize: 14, paddingBottom: 10 }}>
                <input type="checkbox" checked={f.ipr_required} onChange={(e) => set("ipr_required", e.target.checked)} /> Require player membership (IPR)
              </label>
            </div>
          </div>

          <div className="card">
            <label style={lab}>Publish status</label>
            <select style={inp} value={f.status} onChange={(e) => set("status", e.target.value)}>
              <option value="draft">Draft — not visible publicly</option>
              <option value="registration_open">Registration open</option>
            </select>
            <label style={{ ...lab, marginTop: 14 }}>Notes (optional)</label>
            <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={f.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Format, rules, contact info…" />
          </div>

          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ justifyContent: "center" }}>{busy ? "Creating…" : "Create tournament →"}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
