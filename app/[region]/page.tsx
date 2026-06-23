import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContinentMap from "@/components/ContinentMap";
import Flag from "@/components/Flag";
import { regionByKey, continentByKey, PRESENCE } from "@/lib/countries";

export const runtime = "edge";

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: regionKey } = await params;
  const region = regionByKey(regionKey);

  // Continents we don't operate in yet (Africa, Oceania, …) → coming-soon page.
  if (!region) {
    const cont = continentByKey(regionKey);
    if (!cont) notFound();
    return (
      <>
        <Header />
        <main className="map-hero" style={{ minHeight: "70vh" }}>
          <div className="wrap" style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center" }}>
            <Link className="back" href="/" style={{ display: "inline-block", marginBottom: 14 }}>← All regions</Link>
            <div className="eyebrow" style={{ color: "var(--gold)" }}>{cont.label}</div>
            <h1 style={{ fontSize: "clamp(32px,5vw,52px)", fontWeight: 900, margin: "10px 0" }}>Coming soon to {cont.label}</h1>
            <p style={{ color: "rgba(255,255,255,.8)", maxWidth: 560, margin: "0 auto 26px" }}>
              Global Sports isn&apos;t live in {cont.label} yet. Want it in your country? Join the waitlist and you&apos;ll be first to know.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/signup">Join the waitlist</Link>
              <Link className="btn btn-ghost" href="/europe">Explore Europe (live)</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const countries = [...region.countries].sort((a, b) => a.n.localeCompare(b.n));
  const activeCount = region.countries.filter((c) => PRESENCE[c.c]).length;

  return (
    <>
      <Header />
      <main>
        <section className="map-hero">
          <div className="wrap">
            <div className="hero-copy">
              <Link className="back" href="/" style={{ display: "inline-block", marginBottom: 10 }}>← All regions</Link>
              <div className="eyebrow" style={{ color: "var(--gold)" }}>{region.label}</div>
              <h1>Pick your country</h1>
              <p>Tap your country on the {region.label} map to enter its site — or search below.</p>
            </div>
            <ContinentMap regionKey={region.key} countries={region.countries} />
          </div>
        </section>

        <section className="pad">
          <div className="wrap">
            <div className="sec-head">
              <div className="eyebrow">All countries</div>
              <h2 style={{ fontSize: 24 }}>{region.label} — {countries.length} countries</h2>
              {activeCount > 0 && <p>{activeCount} with active teams or events.</p>}
            </div>
            <div className="region-countries">
              {countries.map((c) => (
                <Link key={c.c} className="cc-card" href={`/${region.key}/${c.c.toLowerCase()}`}>
                  <span className="flag"><Flag code={c.c} /></span>
                  <span className="meta">
                    <span className="cn">{c.n}</span>
                    <span className="cc">{c.c} · {c.cur}</span>
                  </span>
                  {PRESENCE[c.c] && <span className="tag">{PRESENCE[c.c].teams} TEAMS</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
