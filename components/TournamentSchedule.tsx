"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { computeStandings, type Game as StatGame } from "@/lib/standings";
import { roundRobin, firstRoundMatches, roundLabel } from "@/lib/schedule";

type T = { id: string; name: string; status: string | null; start_date: string | null; age_group: string | null; created_by: string | null; director_id: string | null };
type Reg = { team_id: string; status: string | null; teams: { name: string } | null };
type G = { id: string; round: string; game_number: number | null; home_team_id: string; away_team_id: string; home_score: number | null; away_score: number | null; status: string | null };
type Bracket = { id: string; status: string; seeds: unknown };

export default function TournamentSchedule({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [t, setT] = useState<T | null>(null);
  const [regs, setRegs] = useState<Reg[]>([]);
  const [games, setGames] = useState<G[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2600); };

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    const { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", session.user.id).maybeSingle();
    const uid = (prof as { id?: string } | null)?.id ?? null;

    const { data: tr } = await supabase.from("tournaments").select("id,name,status,start_date,age_group,created_by,director_id").eq("id", id).maybeSingle();
    if (!tr) { setLoading(false); return; }
    const row = tr as T;
    if (uid && row.created_by !== uid && row.director_id !== uid) { setDenied(true); setLoading(false); return; }
    setT(row);

    const { data: rg } = await supabase.from("tournament_registrations").select("team_id,status,teams(name)").eq("tournament_id", id);
    const confirmed = ((rg as unknown as Reg[]) ?? []).filter((r) => r.status === "registered" || r.status === "paid");
    setRegs(confirmed);
    const nm: Record<string, string> = {};
    confirmed.forEach((r) => { if (r.teams?.name) nm[r.team_id] = r.teams.name; });
    setNames(nm);

    const { data: gm } = await supabase.from("games").select("id,round,game_number,home_team_id,away_team_id,home_score,away_score,status").eq("tournament_id", id).order("game_number", { ascending: true });
    setGames((gm as G[]) ?? []);

    const { data: br } = await supabase.from("brackets").select("id,status,seeds").eq("tournament_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setBracket((br as Bracket) ?? null);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><p style={{ color: "var(--muted)" }}>Loading…</p></main><Footer /></>;
  if (denied) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><h1 style={{ fontWeight: 900 }}>Not your tournament</h1><Link className="btn btn-dark" href="/organizer" style={{ marginTop: 14 }}>Back</Link></main><Footer /></>;
  if (!t) return <><Header /><main className="wrap" style={{ padding: "60px 24px" }}><h1 style={{ fontWeight: 900 }}>Tournament not found</h1></main><Footer /></>;

  const teamIds = regs.map((r) => r.team_id);
  const nm = (id2: string) => names[id2] ?? "—";
  const poolGames = games.filter((g) => g.round === "pool_play");
  const statGames: StatGame[] = games.map((g) => ({ home_team_id: g.home_team_id, away_team_id: g.away_team_id, home_score: g.home_score, away_score: g.away_score, status: g.status }));
  const standings = computeStandings(teamIds, statGames);
  const playedCount = statGames.filter((g) => g.status === "final" && g.home_score != null).length;

  // seeds = standings order
  const seedList = standings.map((s) => s.team_id);
  const { size, matches } = firstRoundMatches(Math.max(2, seedList.length));
  const seedTeam = (seed: number) => (seed <= seedList.length ? seedList[seed - 1] : null);

  async function generateRoundRobin() {
    if (!supabase || teamIds.length < 2) { flash("Need at least 2 confirmed teams."); return; }
    setBusy(true);
    const rounds = roundRobin(teamIds);
    const base = t!.start_date ? new Date(t!.start_date + "T10:00:00Z") : new Date();
    const rows: Record<string, unknown>[] = [];
    let gn = 1;
    rounds.forEach((round, ri) => {
      round.forEach((p) => {
        const when = new Date(base.getTime() + ri * 90 * 60000); // stagger 90 min per round
        rows.push({ tournament_id: id, home_team_id: p.home, away_team_id: p.away, scheduled_at: when.toISOString(), round: "pool_play", game_number: gn++, status: "scheduled" });
      });
    });
    const { error } = await supabase.from("games").insert(rows);
    setBusy(false);
    if (error) { flash(error.message); return; }
    await load();
    flash(`Generated ${rows.length} pool-play games.`);
  }

  async function clearPool() {
    if (!supabase) return;
    setBusy(true);
    await supabase.from("games").delete().eq("tournament_id", id).eq("round", "pool_play");
    setBusy(false);
    await load();
    flash("Pool schedule cleared.");
  }

  async function publishBracket(publish: boolean) {
    if (!supabase) return;
    setBusy(true);
    const seeds = standings.map((s, i) => ({ seed: i + 1, team_id: s.team_id, name: nm(s.team_id), rank: s.rank }));
    if (bracket) {
      await supabase.from("brackets").update({ status: publish ? "published" : "pending", seeds, num_teams: seedList.length }).eq("id", bracket.id);
    } else {
      await supabase.from("brackets").insert({ tournament_id: id, division_type: (t!.age_group || "open"), format: "single_elimination", num_teams: Math.max(2, seedList.length), seeds, status: publish ? "published" : "pending" });
    }
    setBusy(false);
    await load();
    flash(publish ? "Bracket published." : "Bracket set to draft.");
  }

  const published = bracket?.status === "published";

  return (
    <>
      <Header />
      <main className="wrap" style={{ padding: "40px 24px 64px" }}>
        <Link className="back" href={`/organizer/${id}`} style={{ color: "var(--navy)" }}>← Manage event</Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>{t.name} — Schedule &amp; standings</h1>
        <p style={{ color: "var(--muted)" }}>{regs.length} confirmed teams · {playedCount} games played</p>
        {msg && <div style={{ marginTop: 14, background: "#e1f8ea", color: "#138a45", padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>{msg}</div>}

        {/* STANDINGS */}
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "30px 0 6px" }}>Standings</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>Win % → head-to-head → run differential (cap 10) → runs scored → runs allowed → coin flip. Shaded rows are still tied after every tiebreaker.</p>
        {teamIds.length === 0 ? <p style={{ color: "var(--muted)" }}>No confirmed teams yet.</p> : (
          <div style={{ overflowX: "auto" }}>
            <table className="std-table" style={{ minWidth: 640 }}>
              <thead><tr><th style={{ textAlign: "left" }}>#</th><th style={{ textAlign: "left" }}>Team</th><th>GP</th><th>W</th><th>L</th><th>T</th><th>RF</th><th>RA</th><th>Diff</th><th>Pct</th></tr></thead>
              <tbody>
                {standings.map((s) => (
                  <tr key={s.team_id} style={{ background: s.tiedFrom ? "#fff8df" : undefined }}>
                    <td style={{ textAlign: "left", fontWeight: 800 }}>{s.rank}</td>
                    <td style={{ textAlign: "left", fontWeight: 700 }}>{nm(s.team_id)}{s.tiedFrom ? <span title="Still tied" style={{ color: "#8a6300" }}> ·=</span> : null}</td>
                    <td>{s.gp}</td><td>{s.w}</td><td>{s.l}</td><td>{s.t}</td><td>{s.rf}</td><td>{s.ra}</td>
                    <td style={{ fontWeight: 700, color: s.diff > 0 ? "#138a45" : s.diff < 0 ? "#b3261e" : undefined }}>{s.diff > 0 ? "+" : ""}{s.diff}</td>
                    <td style={{ fontWeight: 700 }}>{s.pct.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* POOL PLAY */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "34px 0 12px", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Pool play ({poolGames.length} games)</h2>
          {poolGames.length === 0
            ? <button className="btn btn-primary" disabled={busy || teamIds.length < 2} onClick={generateRoundRobin}>Generate round-robin</button>
            : <button className="btn btn-ghost" disabled={busy} onClick={clearPool} style={{ color: "#b3261e" }}>Clear &amp; regenerate</button>}
        </div>
        {poolGames.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No schedule yet. Generate a round-robin where every team plays every other team once.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="std-table" style={{ minWidth: 560 }}>
              <thead><tr><th>#</th><th style={{ textAlign: "left" }}>Home</th><th>Score</th><th style={{ textAlign: "left" }}>Away</th><th>Status</th></tr></thead>
              <tbody>
                {poolGames.map((g) => {
                  const done = g.status === "final" && g.home_score != null;
                  return (
                    <tr key={g.id}>
                      <td style={{ color: "var(--muted)" }}>{g.game_number}</td>
                      <td style={{ textAlign: "left", fontWeight: done && (g.home_score! > g.away_score!) ? 800 : 400 }}>{nm(g.home_team_id)}</td>
                      <td style={{ fontWeight: 700 }}>{done ? `${g.home_score}–${g.away_score}` : "vs"}</td>
                      <td style={{ textAlign: "left", fontWeight: done && (g.away_score! > g.home_score!) ? 800 : 400 }}>{nm(g.away_team_id)}</td>
                      <td style={{ fontSize: 12, color: "var(--muted)" }}>{done ? "Final" : "Scheduled"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 10 }}>Score entry comes with the live results tool (next build). Standings update automatically as finals are recorded.</p>
          </div>
        )}

        {/* BRACKET */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "34px 0 6px", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Bracket seeding</h2>
          <span className="status-pill" style={{ color: published ? "#138a45" : "#8a6300", background: published ? "#e1f8ea" : "#fff4e0" }}>{published ? "Published" : "Draft — not visible to teams"}</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>Seeds follow the standings above. Review, then publish to release the bracket. {size}-team single elimination ({seedList.length} teams{size > seedList.length ? `, ${size - seedList.length} byes` : ""}).</p>
        {seedList.length < 2 ? <p style={{ color: "var(--muted)" }}>Need at least 2 confirmed teams to seed a bracket.</p> : (
          <>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              {matches.map((m) => {
                const h = seedTeam(m.homeSeed), a = seedTeam(m.awaySeed);
                return (
                  <div key={m.slot} className="card" style={{ padding: 14 }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>Match {m.slot + 1}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span><span style={{ color: "var(--muted)" }}>#{m.homeSeed}</span> {h ? nm(h) : <em style={{ color: "var(--muted)" }}>BYE</em>}</span></div>
                    <div style={{ borderTop: "1px solid var(--line)", margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}><span><span style={{ color: "var(--muted)" }}>#{m.awaySeed}</span> {a ? nm(a) : <em style={{ color: "var(--muted)" }}>BYE</em>}</span></div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {!published
                ? <button className="btn btn-primary" disabled={busy} onClick={() => publishBracket(true)}>{bracket ? "Publish bracket" : "Save & publish bracket"}</button>
                : <button className="btn btn-ghost" disabled={busy} onClick={() => publishBracket(false)} style={{ color: "#b3261e" }}>Unpublish (back to draft)</button>}
              {!published && bracket && <span style={{ fontSize: 13, color: "var(--muted)", alignSelf: "center" }}>Saved as draft.</span>}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
