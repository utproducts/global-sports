"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { supabase } from "@/lib/supabase";
import { COUNTRY_CONTINENT, CONTINENTS, byCode } from "@/lib/countries";

type Row = { team: string; code: string; w: number; l: number; rd: number; evts: number; pts: number };

export default function RankingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [continent, setContinent] = useState("world");
  const [country, setCountry] = useState("all");

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const [ps, teams, countries] = await Promise.all([
        supabase.from("pool_standings").select("team_id,team_name,wins,losses,run_differential,tournament_id"),
        supabase.from("teams").select("id,country_id"),
        supabase.from("countries").select("id,code"),
      ]);
      const teamCountry: Record<string, string> = {};
      const ctry: Record<string, string> = {};
      (countries.data as { id: string; code: string }[] | null)?.forEach((c) => (ctry[c.id] = c.code));
      (teams.data as { id: string; country_id: string }[] | null)?.forEach((t) => (teamCountry[t.id] = ctry[t.country_id] || ""));

      const agg: Record<string, Row & { tourns: Set<string> }> = {};
      (ps.data as { team_id: string; team_name: string; wins: number; losses: number; run_differential: number; tournament_id: string }[] | null)?.forEach((r) => {
        const key = r.team_id || r.team_name;
        if (!agg[key]) agg[key] = { team: r.team_name, code: teamCountry[r.team_id] || "", w: 0, l: 0, rd: 0, evts: 0, pts: 0, tourns: new Set() };
        agg[key].w += r.wins || 0;
        agg[key].l += r.losses || 0;
        agg[key].rd += r.run_differential || 0;
        agg[key].tourns.add(r.tournament_id);
      });
      const list = Object.values(agg).map((a) => ({ team: a.team, code: a.code, w: a.w, l: a.l, rd: a.rd, evts: a.tourns.size, pts: a.w * 100 + a.rd }));
      list.sort((x, y) => y.pts - x.pts);
      setRows(list);
      setLoading(false);
    })();
  }, []);

  const countryOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.code).filter(Boolean));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    let r = rows;
    if (continent !== "world") r = r.filter((x) => COUNTRY_CONTINENT[x.code] === continent);
    if (country !== "all") r = r.filter((x) => x.code === country);
    return r;
  }, [rows, continent, country]);

  const scopeLabel = country !== "all" ? (byCode[country]?.country.n || country) : continent === "world" ? "World" : (CONTINENTS.find((c) => c.key === continent)?.label || "");

  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 26 }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Global Ranking System</div>
            <h1>Where do you stand?</h1>
            <p className="sub">See how teams rank by world, continent, and country. Play in Global Sports events and climb the rankings.</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 900 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18, alignItems: "center" }}>
              <select value={continent} onChange={(e) => { setContinent(e.target.value); setCountry("all"); }} style={selStyle}>
                <option value="world">🌍 World</option>
                {CONTINENTS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={selStyle}>
                <option value="all">All countries</option>
                {countryOptions.map((c) => <option key={c} value={c}>{byCode[c]?.country.n || c}</option>)}
              </select>
              <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>{filtered.length} teams · {scopeLabel}</span>
            </div>

            {loading ? (
              <p style={{ color: "var(--muted)" }}>Loading rankings…</p>
            ) : filtered.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No ranked teams in this scope yet — rankings build as events are played.</p>
            ) : (
              <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
                <div className="rk-row rk-head">
                  <span>#</span><span>Team</span><span>Country</span><span>Ev</span><span>W-L</span><span>Diff</span><span>Pts</span>
                </div>
                {filtered.map((r, i) => (
                  <div className="rk-row" key={r.team + i}>
                    <span style={{ fontWeight: 800, color: i < 3 ? "#b8860b" : "var(--muted)" }}>{i + 1}</span>
                    <span style={{ fontWeight: 700 }}>{r.team}</span>
                    <span>{r.code ? <><Flag code={r.code} /> {r.code}</> : "—"}</span>
                    <span>{r.evts}</span>
                    <span>{r.w}-{r.l}</span>
                    <span style={{ color: r.rd >= 0 ? "#138a45" : "#b3261e" }}>{r.rd >= 0 ? "+" : ""}{r.rd}</span>
                    <span style={{ fontWeight: 800 }}>{r.pts}</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 14 }}>
              v1 ranking: points = wins ×100 + run differential, aggregated across events. The full points model (per Sean &amp; Marc) lands next.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const selStyle: React.CSSProperties = { padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 9, fontSize: 14, fontFamily: "inherit", fontWeight: 600 };
