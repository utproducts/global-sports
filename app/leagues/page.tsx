import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";

const LEAGUES = [
  { code: "PL", name: "Polish Slow-Pitch League", country: "Poland", note: "National league play across the season.", live: true },
  { code: "AT", name: "Austrian Slow-Pitch League", country: "Austria", note: "Club competition throughout the year.", live: true },
];

export default function LeaguesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 26 }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Leagues</div>
            <h1>League play, season-long</h1>
            <p className="sub">Beyond one-off tournaments — recurring national and club leagues under the Global Sports standard, feeding the global ranking.</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap">
            <div className="sec-head"><div className="eyebrow">Our leagues</div><h2>Where teams compete week to week</h2></div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
              {LEAGUES.map((l) => (
                <div key={l.code} className="card">
                  <div style={{ fontSize: 30, marginBottom: 8 }}><Flag code={l.code} style={{ width: "1.8em", height: "1.3em" }} /></div>
                  <h3 style={{ marginBottom: 4 }}>{l.name}</h3>
                  <p style={{ marginBottom: 12 }}>{l.country} · {l.note}</p>
                  <span className="chip" style={{ background: "#e1f8ea", color: "#138a45", border: "none" }}>Active</span>
                  <div style={{ marginTop: 14 }}>
                    <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>Standings &amp; schedule — coming soon</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40, padding: 28, borderRadius: 16, border: "1.5px solid var(--line)", textAlign: "center" }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>Run a league?</h3>
              <p style={{ color: "var(--muted)", margin: "8px 0 16px", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                Bring your national or regional league onto Global Sports — standings, schedules, registrations and ranking points, all managed in one place.
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
