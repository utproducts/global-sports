"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { CHAMPIONS } from "@/lib/champions";
import { CONTINENTS } from "@/lib/countries";

export default function ChampionsPage() {
  const [region, setRegion] = useState("all");
  const [year, setYear] = useState("all");
  const [category, setCategory] = useState("all");

  const years = useMemo(() => Array.from(new Set(CHAMPIONS.map((c) => c.year))).sort((a, b) => b - a), []);
  const categories = useMemo(() => Array.from(new Set(CHAMPIONS.map((c) => c.category))).sort(), []);

  const filtered = CHAMPIONS.filter(
    (c) => (region === "all" || c.region === region) && (year === "all" || String(c.year) === year) && (category === "all" || c.category === category)
  ).sort((a, b) => b.year - a.year || a.event.localeCompare(b.event));

  return (
    <>
      <Header />
      <main>
        <section className="ev-hero" style={{ background: "radial-gradient(1100px 520px at 80% -25%, #8a6a00, var(--navy) 64%)" }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Hall of Champions</div>
            <h1>The names that<br /><span className="ev-grad">made history.</span></h1>
            <p>Every Global Sports champion — across flagships, leagues and regions. This is what teams play for: their place on the board.</p>
            <div className="ev-stats">
              <div><span className="n">{CHAMPIONS.length}</span><span className="l">Titles recorded</span></div>
              <div><span className="n">{years.length}</span><span className="l">Seasons</span></div>
              <div><span className="n">{new Set(CHAMPIONS.map((c) => c.code)).size}</span><span className="l">Nations</span></div>
            </div>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 980 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
              <select value={region} onChange={(e) => setRegion(e.target.value)} style={sel}>
                <option value="all">All regions</option>
                {CONTINENTS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)} style={sel}>
                <option value="all">All years</option>
                {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
              </select>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={sel}>
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="champ-grid">
              {filtered.map((c, i) => (
                <div key={i} className="champ-card">
                  <div className="champ-trophy">🏆</div>
                  <div className="champ-meta">{c.brand ? `${c.brand} · ` : ""}{c.year}</div>
                  <div className="champ-name">{c.champion}</div>
                  <div className="champ-event">{c.event}</div>
                  <div className="champ-tags">
                    <span className="champ-flag"><Flag code={c.code} /></span>
                    <span className="champ-pill">{c.category}</span>
                    {c.level && <span className="champ-pill">{c.level}</span>}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length === 0 && <p style={{ color: "var(--muted)" }}>No champions match those filters.</p>}
            <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 18 }}>Honor roll is editorially maintained — official results are published here after each event.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const sel: React.CSSProperties = { padding: "10px 12px", border: "1.5px solid var(--line)", borderRadius: 9, fontSize: 14, fontFamily: "inherit", fontWeight: 600 };
