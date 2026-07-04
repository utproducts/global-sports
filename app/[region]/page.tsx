import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContinentMap from "@/components/ContinentMap";
import Flag from "@/components/Flag";
import { regionByKey, continentByKey, PRESENCE, byCode } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

type Ev = { slug: string | null; name: string; start_date: string | null; country_code: string | null; status: string | null; registered_teams: number | null; max_teams: number | null };
type News = { id: string; title: string; body: string; published_at: string | null; type: string | null };
const fmtD = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
const eventHref = (e: Ev) => {
  const rk = e.country_code ? byCode[e.country_code]?.region.key : null;
  return rk && e.slug ? `/${rk}/${e.country_code!.toLowerCase()}/events/${e.slug}` : "/events";
};

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
  const codes = region.countries.map((c) => c.c);

  // Region-scoped content, with a global fallback when the region has nothing yet.
  let events: Ev[] = [];
  let tournamentCount = 0;
  let news: News[] = [];
  let usingGlobalEvents = false;
  if (supabase) {
    const evSel = "slug,name,start_date,country_code,status,registered_teams,max_teams";
    const [{ data: evs }, { count }] = await Promise.all([
      supabase.from("tournament_summary").select(evSel).in("country_code", codes).order("start_date", { ascending: true }).limit(4),
      supabase.from("tournament_summary").select("*", { count: "exact", head: true }).in("country_code", codes),
    ]);
    events = (evs as Ev[]) ?? [];
    tournamentCount = count ?? events.length;

    const { data: rn } = await supabase.from("announcements").select("id,title,body,published_at,type").eq("status", "published").in("country", codes).order("published_at", { ascending: false }).limit(3);
    news = (rn as News[]) ?? [];
    if (news.length === 0) {
      const { data: gn } = await supabase.from("announcements").select("id,title,body,published_at,type").eq("status", "published").is("country", null).order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(3);
      news = (gn as News[]) ?? [];
    }
    if (events.length === 0) {
      usingGlobalEvents = true;
      const { data: ge } = await supabase.from("tournament_summary").select(evSel).order("start_date", { ascending: true }).limit(4);
      events = (ge as Ev[]) ?? [];
    }
  }

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

        {/* REGION OVERVIEW */}
        <section className="pad">
          <div className="wrap">
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
              <div className="card" style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 900 }}>{tournamentCount}</div><div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--muted)" }}>Tournaments</div></div>
              <div className="card" style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 900 }}>{countries.length}</div><div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--muted)" }}>Countries</div></div>
              <div className="card" style={{ textAlign: "center" }}><div style={{ fontSize: 32, fontWeight: 900 }}>{activeCount}</div><div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, color: "var(--muted)" }}>Active countries</div></div>
            </div>

            <div className="home-two" style={{ marginTop: 26 }}>
              <div>
                <div className="sec-head" style={{ marginBottom: 16 }}><div className="eyebrow">{usingGlobalEvents ? "Featured worldwide" : `In ${region.label}`}</div><h2 style={{ fontSize: 22 }}>Featured events</h2></div>
                {events.length === 0 ? (
                  <div className="card"><p style={{ color: "var(--muted)" }}>No events scheduled in {region.label} yet. Check back soon, or explore events across the world.</p><Link className="btn btn-dark" href="/events" style={{ marginTop: 12 }}>See all events →</Link></div>
                ) : (
                  <>
                    {usingGlobalEvents && <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>Nothing scheduled in {region.label} yet — here&apos;s what&apos;s happening worldwide.</p>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {events.map((e, i) => (
                        <Link key={i} href={eventHref(e)} className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center", textDecoration: "none" }}>
                          <div className="ev-card-date"><span className="d">{e.start_date ? new Date(e.start_date).getDate() : "–"}</span><span className="m">{e.start_date ? new Date(e.start_date).toLocaleDateString("en-GB", { month: "short" }) : ""}</span></div>
                          <div><h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{e.name}</h3><p style={{ fontSize: 13, color: "var(--muted)" }}>{e.country_code && <Flag code={e.country_code} />} {fmtD(e.start_date)}{e.registered_teams != null ? ` · ${e.registered_teams}${e.max_teams ? `/${e.max_teams}` : ""} teams` : ""}</p></div>
                        </Link>
                      ))}
                    </div>
                    <Link className="btn btn-dark" href="/events" style={{ marginTop: 14 }}>See all events →</Link>
                  </>
                )}
              </div>
              <div>
                <div className="sec-head" style={{ marginBottom: 16 }}><div className="eyebrow">Latest</div><h2 style={{ fontSize: 22 }}>News</h2></div>
                {news.length === 0 ? (
                  <div className="card"><p style={{ color: "var(--muted)" }}>No news yet for {region.label}.</p></div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {news.map((n) => (
                      <div key={n.id} className="card" style={{ padding: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .5, textTransform: "uppercase", color: "var(--gold)" }}>{n.type}</div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, margin: "4px 0" }}>{n.title}</h3>
                        <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.5 }}>{n.body}</p>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{fmtD(n.published_at)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="pad" style={{ paddingTop: 0 }}>
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

        <section className="pad" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div style={{ background: "linear-gradient(165deg,#17386a,#0a1628)", borderRadius: 20, padding: "34px 30px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ maxWidth: 560 }}>
                <div className="eyebrow" style={{ color: "var(--gold)" }}>Officiating</div>
                <h2 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 900, margin: "6px 0" }}>Umpires in {region.label}</h2>
                <p style={{ color: "rgba(255,255,255,.8)" }}>Join the Global Umpire Program and officiate across {region.label} — one standard for training, certification and assignment.</p>
              </div>
              <Link className="btn btn-primary" href="/umpires">Learn more →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
