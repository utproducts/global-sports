"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { REGIONS } from "@/lib/countries";
import type { Waiver } from "@/lib/waivers";

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 9, fontSize: 14, fontFamily: "inherit", background: "#fff" };
const lab: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#33404f", marginBottom: 5 };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

export default function WaiversAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    label: "", applies_to: "membership", scope_type: "global", scope_value: "",
    discount_type: "percent", amount: 100, code: "", starts_at: "", ends_at: "", max_redemptions: "",
  });
  const set = (k: string, v: string | number) => setF((s) => ({ ...s, [k]: v }));
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const { data } = await supabase.from("fee_waivers").select("*").order("created_at", { ascending: false });
    setWaivers((data as Waiver[]) ?? []);
    setLoading(false);
  }, [router]);
  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!f.label.trim()) { flash("Add a label."); return; }
    setBusy(true);
    const row: Record<string, unknown> = {
      label: f.label.trim(), applies_to: f.applies_to, scope_type: f.scope_type,
      scope_value: f.scope_type === "global" ? null : (f.scope_value || null),
      discount_type: f.discount_type, amount: f.discount_type === "full" ? 0 : Number(f.amount),
      code: f.code.trim() || null,
      starts_at: f.starts_at || null, ends_at: f.ends_at || null,
      max_redemptions: f.max_redemptions ? Number(f.max_redemptions) : null,
    };
    const { error } = await supabase.from("fee_waivers").insert(row);
    setBusy(false);
    if (error) { flash(error.message); return; }
    setF({ label: "", applies_to: "membership", scope_type: "global", scope_value: "", discount_type: "percent", amount: 100, code: "", starts_at: "", ends_at: "", max_redemptions: "" });
    await load(); flash("Waiver created.");
  }
  async function toggle(w: Waiver) {
    if (!supabase) return;
    await supabase.from("fee_waivers").update({ active: !w.active }).eq("id", w.id);
    await load();
  }
  async function remove(w: Waiver) {
    if (!supabase) return;
    await supabase.from("fee_waivers").delete().eq("id", w.id);
    await load(); flash("Waiver deleted.");
  }

  const describe = (w: Waiver) => {
    const amt = w.discount_type === "full" ? "100% (full)" : w.discount_type === "percent" ? `${w.amount}%` : `€${w.amount}`;
    const scope = w.scope_type === "global" ? "everywhere" : `${w.scope_type}: ${w.scope_value}`;
    return `${amt} off ${w.applies_to} · ${scope}${w.code ? ` · code ${w.code}` : " · auto"}`;
  };

  return (
    <>
      <Header />
      <main className="wrap" style={{ padding: "40px 24px 64px", minHeight: "60vh" }}>
        <Link className="back" href="/organizer" style={{ color: "var(--navy)" }}>← Organizer</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>Fee waivers &amp; discounts</h1>
        <p style={{ color: "var(--muted)" }}>Waive or discount membership / tournament fees for a region, country or event — full or partial, auto-applied or behind a code.</p>
        {msg && <div style={{ marginTop: 14, background: "#e1f8ea", color: "#138a45", padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>{msg}</div>}

        <form onSubmit={create} className="card" style={{ marginTop: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}><label style={lab}>Label</label><input style={inp} value={f.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Austria launch — free IPM" /></div>
            <div><label style={lab}>Applies to</label><select style={inp} value={f.applies_to} onChange={(e) => set("applies_to", e.target.value)}><option value="membership">Membership (IPM)</option><option value="tournament">Tournament entry</option><option value="both">Both</option></select></div>
            <div><label style={lab}>Scope</label><select style={inp} value={f.scope_type} onChange={(e) => { set("scope_type", e.target.value); set("scope_value", ""); }}><option value="global">Global</option><option value="region">Region</option><option value="country">Country</option><option value="tournament">Tournament</option></select></div>
            <div>
              <label style={lab}>Scope value</label>
              {f.scope_type === "global" ? <input style={{ ...inp, background: "#f4f6fa" }} disabled value="—" />
                : f.scope_type === "region" ? (
                  <select style={inp} value={f.scope_value} onChange={(e) => set("scope_value", e.target.value)}><option value="">Select…</option>{REGIONS.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
                ) : f.scope_type === "country" ? (
                  <select style={inp} value={f.scope_value} onChange={(e) => set("scope_value", e.target.value)}>
                    <option value="">Select…</option>
                    {REGIONS.map((r) => <optgroup key={r.key} label={r.label}>{[...r.countries].sort((a, b) => a.n.localeCompare(b.n)).map((c) => <option key={c.c} value={c.c}>{c.n}</option>)}</optgroup>)}
                  </select>
                ) : <input style={inp} value={f.scope_value} onChange={(e) => set("scope_value", e.target.value)} placeholder="Tournament ID" />}
            </div>
            <div><label style={lab}>Discount type</label><select style={inp} value={f.discount_type} onChange={(e) => set("discount_type", e.target.value)}><option value="percent">Percent %</option><option value="fixed">Fixed €</option><option value="full">Full (100%)</option></select></div>
            {f.discount_type !== "full" && <div><label style={lab}>Amount {f.discount_type === "percent" ? "(%)" : "(€)"}</label><input type="number" min={0} style={inp} value={f.amount} onChange={(e) => set("amount", e.target.value)} /></div>}
            <div><label style={lab}>Code (optional)</label><input style={inp} value={f.code} onChange={(e) => set("code", e.target.value)} placeholder="blank = auto-applies" /></div>
            <div><label style={lab}>Starts</label><input type="date" style={inp} value={f.starts_at} onChange={(e) => set("starts_at", e.target.value)} /></div>
            <div><label style={lab}>Ends</label><input type="date" style={inp} value={f.ends_at} onChange={(e) => set("ends_at", e.target.value)} /></div>
            <div><label style={lab}>Max redemptions</label><input type="number" min={0} style={inp} value={f.max_redemptions} onChange={(e) => set("max_redemptions", e.target.value)} placeholder="unlimited" /></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ marginTop: 14 }}>{busy ? "Creating…" : "Create waiver"}</button>
        </form>

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "30px 0 12px" }}>Active &amp; past waivers</h2>
        {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : waivers.length === 0 ? <p style={{ color: "var(--muted)" }}>No waivers yet.</p> : (
          <div className="ev-list">
            {waivers.map((w) => (
              <div key={w.id} className="ev-card">
                <div className="ev-card-main"><div>
                  <h3 style={{ marginBottom: 2 }}>{w.label} {!w.active && <span style={{ fontSize: 12, color: "#b3261e", fontWeight: 800 }}>· OFF</span>}</h3>
                  <p style={{ fontSize: 13 }}>{describe(w)}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)" }}>{fmt(w.starts_at)} → {fmt(w.ends_at)}{w.max_redemptions != null ? ` · ${w.redeemed_count}/${w.max_redemptions} used` : ` · ${w.redeemed_count} used`}</p>
                </div></div>
                <div className="ev-card-side">
                  <button className="btn btn-ghost" onClick={() => toggle(w)} style={{ padding: "8px 14px" }}>{w.active ? "Disable" : "Enable"}</button>
                  <button className="btn btn-ghost" onClick={() => remove(w)} style={{ padding: "8px 12px", color: "#b3261e" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
