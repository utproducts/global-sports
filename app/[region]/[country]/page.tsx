import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { regionByKey, findCountry, PRESENCE } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

type Stats = { teams: number; tournaments: number; venues: number };

// Pull live counts for the country; fall back to static PRESENCE if Supabase isn't reachable.
async function getStats(code: string): Promise<Stats> {
  const fallback: Stats = {
    teams: PRESENCE[code]?.teams ?? 0,
    tournaments: PRESENCE[code]?.tournaments ?? 0,
    venues: PRESENCE[code]?.venues ?? 0,
  };
  if (!supabase) return fallback;
  try {
    const { data: country } = await supabase.from("countries").select("id").eq("code", code).maybeSingle();
    if (!country) return fallback;
    const id = (country as { id: string }).id;
    const [teams, tournaments, venues] = await Promise.all([
      supabase.from("teams").select("id", { count: "exact", head: true }).eq("country_id", id),
      supabase.from("tournaments").select("id", { count: "exact", head: true }).eq("country_id", id),
      supabase.from("venues").select("id", { count: "exact", head: true }).eq("country_id", id),
    ]);
    return {
      teams: teams.count ?? fallback.teams,
      tournaments: tournaments.count ?? fallback.tournaments,
      venues: venues.count ?? fallback.venues,
    };
  } catch {
    return fallback;
  }
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ region: string; country: string }>;
}) {
  const { region: regionKey, country: countryCode } = await params;
  const region = regionByKey(regionKey);
  const entry = findCountry(countryCode);
  if (!region || !entry || entry.region.key !== region.key) notFound();

  const c = entry.country;
  const stats = await getStats(c.c);

  const cards = [
    { ic: "🏆", h: "Events", p: `Browse and register for tournaments across ${c.n}.`, soon: stats.tournaments === 0 },
    { ic: "👥", h: "Teams", p: `${stats.teams || "Your"} team${stats.teams === 1 ? "" : "s"} — manage rosters, invites and classifications.`, soon: false },
    { ic: "🎫", h: "Membership", p: `Create your one global membership, billed in ${c.cur}.`, soon: false },
    { ic: "📊", h: "Standings & ratings", p: "Live pool standings, brackets and player ratings.", soon: stats.tournaments === 0 },
    { ic: "📍", h: "Venues", p: `${stats.venues || "Find"} venue${stats.venues === 1 ? "" : "s"} and fields near you.`, soon: stats.venues === 0 },
    { ic: "🔑", h: "Log in", p: "Players, coaches and directors — access your dashboard.", soon: false },
  ];

  return (
    <>
      <Header />
      <main>
        <section className="country-hero">
          <div className="wrap">
            <Link className="back" href={`/${region.key}`}>← {region.label}</Link>
            <div className="flagbig">{c.f}</div>
            <h1>Global Sports {c.n}</h1>
            <p className="sub">Adult slow-pitch championship play in {c.n} — part of the {region.label} program.</p>
            <div className="chips">
              <span className="chip">Currency: {c.cur}</span>
              <span className="chip">{region.subdomain}/{c.c.toLowerCase()}</span>
              {entry.presence && <span className="chip gold">{stats.teams} teams active</span>}
            </div>
          </div>
        </section>

        <section className="pad">
          <div className="wrap">
            <div className="grid shell-grid">
              {cards.map((card) => (
                <div key={card.h} className="shell-card">
                  <div className="ic">{card.ic}</div>
                  <h3>{card.h}</h3>
                  <p>{card.p}</p>
                  {card.soon && <span className="soon">COMING IN BUILD</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
