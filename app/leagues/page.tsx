import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { LEAGUES } from "@/lib/leagues";

export default function LeaguesPage() {
  const totalTeams = LEAGUES.reduce((s, l) => s + l.teams, 0);
  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="ev-hero">
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Leagues</div>
            <h1>League play,<br /><span className="ev-grad">season after season.</span></h1>
            <p>Beyond one-off tournaments — recurring national and club leagues under one standard, every result feeding the global ranking.</p>
            <div className="ev-stats">
              <div><span className="n">{LEAGUES.length}</span><span className="l">Leagues</span></div>
              <div><span className="n">{new Set(LEAGUES.map((l) => l.code)).size}</span><span className="l">Countries</span></div>
              <div><span className="n">{totalTeams}</span><span className="l">Clubs competing</span></div>
            </div>
          </div>
        </section>

        {/* LEAGUE CARDS */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head center"><div className="eyebrow">Our leagues</div><h2>Where teams compete week to week</h2></div>
            <div className="flagship">
              {LEAGUES.map((l) => (
                <Link key={l.slug} href={`/leagues/${l.slug}`} className="fcard" style={{ ["--accent" as string]: l.accent, textDecoration: "none" }}>
                  <span className="fcard-emblem"><Flag code={l.code} style={{ width: "1.4em", height: "1em", borderRadius: 8 }} /></span>
                  <div className="fcard-bar" />
                  <div className="fcard-body">
                    <div className="fcard-tag">{l.season}</div>
                    <h3>{l.name}</h3>
                    <div className="fcard-sub">{l.country} · {l.teams} clubs</div>
                    <p>{l.desc}</p>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 14, display: "inline-block" }}>View league →</span>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 40, padding: 28, borderRadius: 16, border: "1.5px solid var(--line)", textAlign: "center" }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>Run a league?</h3>
              <p style={{ color: "var(--muted)", margin: "8px auto 16px", maxWidth: 520 }}>
                Bring your national or regional league onto Global Sports — standings, schedules, registrations and ranking points, all in one place.
              </p>
              <Link className="btn btn-primary" href="/signup">Become an organizer</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
