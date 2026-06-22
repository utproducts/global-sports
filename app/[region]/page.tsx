import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { regionByKey, PRESENCE } from "@/lib/countries";

export const runtime = "edge";

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: regionKey } = await params;
  const region = regionByKey(regionKey);
  if (!region) notFound();

  const countries = [...region.countries].sort((a, b) => a.n.localeCompare(b.n));

  return (
    <>
      <Header />
      <main>
        <section className="country-hero">
          <div className="wrap">
            <Link className="back" href="/">← All regions</Link>
            <h1>{region.label}</h1>
            <p className="sub">Choose your country to see events, teams and membership — set up in your local currency.</p>
            <div className="chips">
              <span className="chip">{countries.length} countries</span>
              <span className="chip gold">{region.subdomain}</span>
            </div>
          </div>
        </section>

        <section className="pad">
          <div className="wrap">
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
