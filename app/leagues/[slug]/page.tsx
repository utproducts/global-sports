import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { leagueBySlug } from "@/lib/leagues";
import { byCode } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

type Ev = { slug: string | null; name: string; start_date: string | null; end_date: string | null; status: string | null; registered_teams: number | null; max_teams: number | null };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD");

export default async function LeaguePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const league = leagueBySlug(slug);
  if (!league) notFound();

  let events: Ev[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("tournament_summary")
      .select("slug,name,start_date,end_date,status,registered_teams,max_teams")
      .eq("country_code", league.code)
      .order("start_date", { ascending: true });
    if (data) events = data as Ev[];
  }
  const region = byCode[league.code]?.region.key;
  const linkFor = (e: Ev) => (region && e.slug ? `/${region}/${league.code.toLowerCase()}/events/${e.slug}` : null);

  return (
    <>
      <Header />
      <main>
        <section className="ev-hero" style={{ background: `radial-gradient(1100px 520px at 80% -25%, ${league.accent}, var(--navy) 62%)` }}>
          <div className="wrap">
            <Link className="back" href="/leagues" style={{ display: "inline-block", marginBottom: 12 }}>← All leagues</Link>
            <div style={{ fontSize: 46, lineHeight: 1, marginBottom: 8 }}><Flag code={league.code} style={{ width: "1.4em", height: "1em", borderRadius: 8 }} /></div>
            <h1 style={{ fontSize: "clamp(30px,5vw,52px)" }}>{league.name}</h1>
            <p>{league.country} · {league.season} · {league.teams} clubs</p>
            <div className="ev-stats">
              <div><span className="n">{league.teams}</span><span className="l">Clubs</span></div>
              <div><span className="n">{events.length || "—"}</span><span className="l">Events in series</span></div>
              <div><span className="n">{league.season.split(" ")[0]}</span><span className="l">Season</span></div>
            </div>
          </div>
        </section>

        {/* SERIES OF EVENTS */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head"><div className="eyebrow">Series</div><h2>Events in this league</h2><p>A league runs as a series of events across the season — each one feeds the standings and ranking.</p></div>
            {events.length > 0 ? (
              <div className="ev-list">
                {events.map((e, i) => {
                  const href = linkFor(e);
                  const open = e.status === "registration_open";
                  return (
                    <div key={i} className="ev-card">
                      <div className="ev-card-main">
                        <div className="ev-card-date"><span className="d">{e.start_date ? new Date(e.start_date).getDate() : "–"}</span><span className="m">{e.start_date ? new Date(e.start_date).toLocaleDateString("en-GB", { month: "short" }) : ""}</span></div>
                        <div><h3>{href ? <Link href={href} style={{ color: "var(--navy)" }}>{e.name}</Link> : e.name}</h3><p>{fmt(e.start_date)}{e.end_date ? ` – ${fmt(e.end_date)}` : ""}{e.registered_teams != null ? ` · ${e.registered_teams} teams` : ""}</p></div>
                      </div>
                      {href && <Link className="btn btn-dark" href={open ? `${href}/register` : href} style={{ padding: "9px 18px" }}>{open ? "Register" : "Details"}</Link>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ev-list">
                {[1, 2, 3].map((r) => (
                  <div key={r} className="ev-card" style={{ opacity: 0.85 }}>
                    <div className="ev-card-main">
                      <div className="ev-card-date" style={{ background: "#e2e7ef", color: "var(--muted)" }}><span className="d">R{r}</span></div>
                      <div><h3>Round {r}</h3><p>Schedule &amp; venues — coming soon</p></div>
                    </div>
                    <span className="status-pill status-other">Upcoming</span>
                  </div>
                ))}
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>The {league.season} fixture list is being finalized.</p>
              </div>
            )}
          </div>
        </section>

        {/* STANDINGS TEASER */}
        <section className="pad steps-sec">
          <div className="wrap" style={{ textAlign: "center" }}>
            <div className="eyebrow">Standings</div>
            <h2 style={{ fontSize: 26, fontWeight: 900, margin: "10px 0" }}>League table coming soon</h2>
            <p style={{ color: "var(--muted)", maxWidth: 520, margin: "0 auto 18px" }}>Live standings update after each round, and roll up into the country, continent and world rankings.</p>
            <Link className="btn btn-dark" href="/rankings">See global rankings</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
