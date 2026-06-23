import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContinentMap from "@/components/ContinentMap";
import { regionByKey, PRESENCE } from "@/lib/countries";

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: regionKey } = await params;
  const region = regionByKey(regionKey);
  if (!region) notFound();

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
                  <span className="flag">{c.f}</span>
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
