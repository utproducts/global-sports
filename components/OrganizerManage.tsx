"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { VAT } from "@/lib/countries";
import { REG_STATUS, TSTATUS, fmtDate, money } from "@/lib/org";

type Tournament = {
  id: string; name: string; slug: string | null; status: string | null;
  start_date: string | null; end_date: string | null;
  max_teams: number | null; reserved_slots: number | null;
  team_fee: number | null; currency: string | null; country_id: string;
  countries: { code: string; name: string } | null;
};
type Reg = {
  id: string; team_id: string; status: string | null; is_reserved: boolean;
  payment_method: string | null; total_charged: number | null; entry_fee: number | null;
  currency: string | null; invoice_number: string | null; paid_at: string | null;
  teams: { name: string; city: string | null } | null;
};
type Team = { id: string; name: string; city: string | null };

const PUBLISH = ["draft", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"];
const PM = ["online", "cash", "bank_transfer"];
const pmLabel = (m: string | null) => (m === "bank_transfer" ? "Bank transfer" : m === "cash" ? "Cash" : "Online");

export default function OrganizerManage({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [t, setT] = useState<Tournament | null>(null);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [addTeam, setAddTeam] = useState("");
  const [addReserved, setAddReserved] = useState(false);
  const [addPaid, setAddPaid] = useState(true);
  const [msg, setMsg] = useState("");
  const [cap, setCap] = useState({ max_teams: 0, reserved_slots: 0 });

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", session.user.id).maybeSingle();
    const uid = (prof as { id?: string } | null)?.id ?? null;

    const { data: tr } = await supabase
      .from("tournaments")
      .select("id,name,slug,status,start_date,end_date,max_teams,reserved_slots,team_fee,currency,country_id,created_by,director_id,countries(code,name)")
      .eq("id", id).maybeSingle();
    if (!tr) { setLoading(false); return; }
    const row = tr as unknown as Tournament & { created_by: string | null; director_id: string | null };
    if (uid && row.created_by !== uid && row.director_id !== uid) { setDenied(true); setLoading(false); return; }
    setT(row);
    setCap({ max_teams: row.max_teams ?? 0, reserved_slots: row.reserved_slots ?? 0 });

    const { data: rg } = await supabase
      .from("tournament_registrations")
      .select("id,team_id,status,is_reserved,payment_method,total_charged,entry_fee,currency,invoice_number,paid_at,teams(name,city)")
      .eq("tournament_id", id).order("created_at", { ascending: true });
    setRegs((rg as unknown as Reg[]) ?? []);

    const { data: tm } = await supabase.from("teams").select("id,name,city").eq("country_id", row.country_id).order("name");
    setTeams((tm as Team[]) ?? []);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><p style={{ color: "var(--muted)" }}>Loading…</p></main><Footer /></>;
  if (denied) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><h1 style={{ fontWeight: 900 }}>Not your tournament</h1><p style={{ color: "var(--muted)" }}>You don&apos;t have organizer access to this event.</p><Link className="btn btn-dark" href="/organizer" style={{ marginTop: 14 }}>Back</Link></main><Footer /></>;
  if (!t) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><h1 style={{ fontWeight: 900 }}>Tournament not found</h1><Link className="btn btn-dark" href="/organizer" style={{ marginTop: 14 }}>Back</Link></main><Footer /></>;

  const cur = t.currency ?? "EUR";
  const fee = t.team_fee ?? 0;
  const ccode = t.countries?.code ?? "";
  const vat = VAT[ccode] ?? 0;
  const active = regs.filter((r) => r.status !== "cancelled");
  const reservedUsed = active.filter((r) => r.is_reserved).length;
  const publicUsed = active.filter((r) => !r.is_reserved).length;
  const reserved = t.reserved_slots ?? 0;
  const maxT = t.max_teams ?? 0;
  const publicOpen = Math.max(0, maxT - reserved - publicUsed);
  const reservedOpen = Math.max(0, reserved - reservedUsed);
  const paidCount = active.filter((r) => r.status === "registered" || r.status === "paid").length;
  const revenue = active.filter((r) => r.status === "registered" || r.status === "paid").reduce((s, r) => s + (r.total_charged ?? 0), 0);
  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2500); };

  async function setStatus(status: string) {
    if (!supabase) return;
    await supabase.from("tournaments").update({ status }).eq("id", id);
    setT((p) => (p ? { ...p, status } : p));
    flash("Status updated.");
  }
  async function saveCap() {
    if (!supabase) return;
    await supabase.from("tournaments").update({ max_teams: Number(cap.max_teams), reserved_slots: Number(cap.reserved_slots) }).eq("id", id);
    setT((p) => (p ? { ...p, max_teams: Number(cap.max_teams), reserved_slots: Number(cap.reserved_slots) } : p));
    flash("Capacity saved.");
  }
  async function addRegistration() {
    if (!supabase || !addTeam) return;
    if (addReserved ? reservedOpen <= 0 : publicOpen <= 0) { flash("No open slots of that type."); return; }
    const { data: exist } = await supabase.from("tournament_registrations").select("id").eq("tournament_id", id).eq("team_id", addTeam).maybeSingle();
    if (exist) { flash("That team is already registered."); return; }
    const vatAmt = +(fee * vat).toFixed(2);
    const total = +(fee + vatAmt).toFixed(2);
    await supabase.from("tournament_registrations").insert({
      tournament_id: id, team_id: addTeam, is_reserved: addReserved,
      status: addPaid ? "registered" : "pending_payment",
      payment_method: "online",
      entry_fee: fee, vat_amount: vatAmt, vat_rate: vat, total_charged: total, currency: cur,
      paid_at: addPaid ? new Date().toISOString() : null,
    });
    setAddTeam("");
    await load();
    flash("Team added.");
  }
  async function markPaid(r: Reg, method: string) {
    if (!supabase) return;
    await supabase.from("tournament_registrations").update({ status: "registered", payment_method: method, paid_at: new Date().toISOString() }).eq("id", r.id);
    await load();
    flash("Marked paid.");
  }
  async function cancelReg(r: Reg) {
    if (!supabase) return;
    await supabase.from("tournament_registrations").update({ status: "cancelled" }).eq("id", r.id);
    await load();
    flash("Registration cancelled.");
  }
  async function genInvoice(r: Reg) {
    if (!supabase) return;
    const { data: cnt } = await supabase.from("invoice_counters").select("last_seq").eq("tournament_id", id).maybeSingle();
    const next = (((cnt as { last_seq?: number } | null)?.last_seq) ?? 0) + 1;
    await supabase.from("invoice_counters").upsert({ tournament_id: id, last_seq: next });
    const base = (t!.slug || id.slice(0, 6)).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const num = `INV-${base}-${String(next).padStart(4, "0")}`;
    await supabase.from("tournament_registrations").update({ invoice_number: num, invoice_issued_at: new Date().toISOString() }).eq("id", r.id);
    await load();
    flash(`Invoice ${num} created.`);
  }

  const st = TSTATUS[t.status ?? ""] ?? [t.status ?? "—", "#5b6675", "#eef1f6"];

  return (
    <>
      <Header />
      <main className="wrap" style={{ padding: "40px 24px 64px" }}>
        <Link className="back" href="/organizer" style={{ color: "var(--navy)" }}>← Your tournaments</Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 900 }}>{t.name}</h1>
            <p style={{ color: "var(--muted)" }}>{t.countries?.name} · {fmtDate(t.start_date)}{t.end_date ? ` – ${fmtDate(t.end_date)}` : ""} · {money(fee, cur)} entry</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className="status-pill" style={{ color: st[1], background: st[2] }}>{st[0]}</span>
            <select value={t.status ?? "draft"} onChange={(e) => setStatus(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: "#fff" }}>
              {PUBLISH.map((s) => <option key={s} value={s}>{TSTATUS[s]?.[0] ?? s}</option>)}
            </select>
          </div>
        </div>

        {msg && <div style={{ marginTop: 14, background: "#e1f8ea", color: "#138a45", padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>{msg}</div>}

        {/* CAPACITY */}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginTop: 22 }}>
          <div className="card"><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Public slots</div><div style={{ fontSize: 26, fontWeight: 900 }}>{publicUsed}<span style={{ fontSize: 15, color: "var(--muted)" }}>/{Math.max(0, maxT - reserved)}</span></div><div style={{ fontSize: 12, color: "var(--muted)" }}>{publicOpen} open</div></div>
          <div className="card"><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Reserved slots</div><div style={{ fontSize: 26, fontWeight: 900 }}>{reservedUsed}<span style={{ fontSize: 15, color: "var(--muted)" }}>/{reserved}</span></div><div style={{ fontSize: 12, color: "var(--muted)" }}>{reservedOpen} held</div></div>
          <div className="card"><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Paid teams</div><div style={{ fontSize: 26, fontWeight: 900 }}>{paidCount}<span style={{ fontSize: 15, color: "var(--muted)" }}>/{active.length}</span></div><div style={{ fontSize: 12, color: "var(--muted)" }}>{active.length - paidCount} awaiting</div></div>
          <div className="card"><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5 }}>Revenue (paid)</div><div style={{ fontSize: 26, fontWeight: 900 }}>{money(revenue, cur)}</div><div style={{ fontSize: 12, color: "var(--muted)" }}>incl. VAT</div></div>
        </div>

        {/* CAPACITY EDIT */}
        <div className="card" style={{ marginTop: 14, display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div><label style={{ fontSize: 12, fontWeight: 700, color: "#33404f", display: "block", marginBottom: 4 }}>Total slots</label><input type="number" min={2} value={cap.max_teams} onChange={(e) => setCap((c) => ({ ...c, max_teams: Number(e.target.value) }))} style={{ width: 100, padding: "9px 11px", border: "1.5px solid var(--line)", borderRadius: 8, fontFamily: "inherit" }} /></div>
          <div><label style={{ fontSize: 12, fontWeight: 700, color: "#33404f", display: "block", marginBottom: 4 }}>Reserved</label><input type="number" min={0} value={cap.reserved_slots} onChange={(e) => setCap((c) => ({ ...c, reserved_slots: Number(e.target.value) }))} style={{ width: 100, padding: "9px 11px", border: "1.5px solid var(--line)", borderRadius: 8, fontFamily: "inherit" }} /></div>
          <button className="btn btn-dark" onClick={saveCap} style={{ padding: "9px 18px" }}>Save capacity</button>
        </div>

        {/* ADD TEAM */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "30px 0 12px" }}>Add a team</h2>
        <div className="card" style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#33404f", display: "block", marginBottom: 4 }}>Team ({t.countries?.name})</label>
            <select value={addTeam} onChange={(e) => setAddTeam(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 8, fontFamily: "inherit", background: "#fff" }}>
              <option value="">Select a team…</option>
              {teams.map((tm) => <option key={tm.id} value={tm.id}>{tm.name}{tm.city ? ` — ${tm.city}` : ""}</option>)}
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, paddingBottom: 9 }}><input type="checkbox" checked={addReserved} onChange={(e) => setAddReserved(e.target.checked)} /> Use a reserved slot (invited/qualified)</label>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, paddingBottom: 9 }}><input type="checkbox" checked={addPaid} onChange={(e) => setAddPaid(e.target.checked)} /> Mark as paid</label>
          <button className="btn btn-primary" onClick={addRegistration} disabled={!addTeam} style={{ padding: "10px 20px" }}>Add team</button>
        </div>
        {teams.length === 0 && <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>No teams in {t.countries?.name} yet.</p>}

        {/* REGISTRATIONS */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "30px 0 12px" }}>Registrations ({active.length})</h2>
        {regs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No registrations yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="std-table" style={{ minWidth: 760 }}>
              <thead><tr><th style={{ textAlign: "left" }}>Team</th><th>Slot</th><th>Status</th><th>Payment</th><th>Amount</th><th>Invoice</th><th></th></tr></thead>
              <tbody>
                {regs.map((r) => {
                  const rs = REG_STATUS[r.status ?? ""] ?? [r.status ?? "—", "#5b6675", "#eef1f6"];
                  const paid = r.status === "registered" || r.status === "paid";
                  return (
                    <tr key={r.id} style={{ opacity: r.status === "cancelled" ? 0.5 : 1 }}>
                      <td style={{ textAlign: "left", fontWeight: 700 }}>{r.teams?.name ?? "—"}{r.teams?.city ? <span style={{ fontWeight: 400, color: "var(--muted)" }}> · {r.teams.city}</span> : null}</td>
                      <td style={{ textAlign: "center" }}>{r.is_reserved ? <span className="champ-pill" style={{ background: "#e7eefb", color: "#1a4fa0" }}>Reserved</span> : "Public"}</td>
                      <td style={{ textAlign: "center" }}><span className="status-pill" style={{ color: rs[1], background: rs[2] }}>{rs[0]}</span></td>
                      <td style={{ textAlign: "center", fontSize: 13 }}>{paid ? pmLabel(r.payment_method) : "—"}</td>
                      <td style={{ textAlign: "center" }}>{money(r.total_charged ?? 0, r.currency ?? cur)}</td>
                      <td style={{ textAlign: "center", fontSize: 13 }}>
                        {r.invoice_number
                          ? <Link href={`/organizer/${id}/invoice/${r.id}`} style={{ color: "var(--navy)", fontWeight: 700 }}>{r.invoice_number}</Link>
                          : <button onClick={() => genInvoice(r)} className="btn btn-ghost" style={{ padding: "5px 12px", fontSize: 12 }}>Generate</button>}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                        {r.status !== "cancelled" && (
                          <>
                            {!paid && (
                              <select defaultValue="" onChange={(e) => { if (e.target.value) markPaid(r, e.target.value); }} style={{ padding: "5px 8px", border: "1.5px solid var(--line)", borderRadius: 7, fontSize: 12, fontFamily: "inherit", marginRight: 6 }}>
                                <option value="">Mark paid…</option>
                                {PM.map((m) => <option key={m} value={m}>{pmLabel(m)}</option>)}
                              </select>
                            )}
                            <button onClick={() => cancelReg(r)} className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12, color: "#b3261e" }}>Remove</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 30, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Link className="btn btn-dark" href={`/organizer/${id}/schedule`}>Schedule, standings &amp; bracket →</Link>
          <span className="champ-pill" style={{ background: "#eef1f6", color: "#5b6675" }}>Live results — coming next</span>
          <span className="champ-pill" style={{ background: "#eef1f6", color: "#5b6675" }}>eLineUp — coming next</span>
        </div>
      </main>
      <Footer />
    </>
  );
}
