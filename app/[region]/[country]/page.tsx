import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { regionByKey, findCountry, PRESENCE } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

type EventRow = {
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  venue_city: string | null;
  registered_teams: number | null;
};
type TeamRow = { name: string; city: string | null; current_class: string | null };

function fmtDate(d: string | null) {
  if (!d) return "TBD";
  try {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

const STATUS_LABEL: Record<string, string> = {
  registration_open: "Registration open",
  registration_closed: "Registration closed",
  in_progress: "Live now",
  completed: "Completed",
  upcoming: "Upcoming",
};

async function getCountryData(code: string) {
  const result = { events: [] as EventRow[], teams: [] as TeamRow[], teamCount: PRESENCE[code]?.teams ?? 0 };
  if (!supabase) return result;
  try {
    const { data: country } = await supabase.from("countries").select("id").eq("code", code).maybeSingle();
    const [{ data: events }, teamsRes] = await Promise.all([
      supabase
        .from("tournament_summary")
        .select("name,start_date,end_date,status,venue_city,registered_teams")
        .eq("country_code", code)
        .order("start_date", { ascending: true }),
      country
        ? supabase
            .from("teams")
            .select("name,city,current_class", { count: "exact" })
            .eq("country_id", (country as { id: string }).id)
            .order("name", { ascending: true })
        : Promise.resolve({ data: null, count: null } as { data: TeamRow[] | null; count: number | null }),
    ]);
    if (events) result.events = events as EventRow[];
    if (teamsRes && "data" in teamsRes && teamsRes.data) {
      result.teams = teamsRes.data as TeamRow[];
      result.teamCount = (teamsRes as { count?: number | null }).count ?? result.teams.length;
    }
  } catch {
    /* graceful fallback */
  }
  return result;
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
  const { events, teams, teamCount } = await getCountryData(c.c);

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
              {teamCount > 0 && <span className="chip gold">{teamCount} teams active</span>}
              <span className="chip">{events.length} event{events.length === 1 ? "" : "s"}</span>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/signup">Create your membership</Link>
              <Link className="btn btn-ghost" href="/login">Log in</Link>
            </div>
          </div>
        </section>

        {/* EVENTS */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head"><div className="eyebrow">Events</div><h2>Tournaments in {c.n}</h2></div>
            {events.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No events scheduled yet — check back soon, or follow {region.label} for announcements.</p>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
                {events.map((e, i) => (
                  <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{e.name}</h3>
                      <p>{fmtDate(e.start_date)}{e.end_date ? ` – ${fmtDate(e.end_date)}` : ""}{e.venue_city ? ` · ${e.venue_city}` : ""}{e.registered_teams ? ` · ${e.registered_teams} teams` : ""}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {e.status && <span className="chip" style={{ background: e.status === "registration_open" ? "#e1f8ea" : "#eef1f6", color: e.status === "registration_open" ? "#138a45" : "#5b6675", border: "none" }}>{STATUS_LABEL[e.status] ?? e.status}</span>}
                      <Link className="btn btn-dark" href="/login" style={{ padding: "9px 16px" }}>Register</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* TEAMS */}
        <section className="pad steps-sec">
          <div className="wrap">
            <div className="sec-head"><div className="eyebrow">Teams</div><h2>{teamCount > 0 ? `${teamCount} teams` : "Teams"} in {c.n}</h2></div>
            {teams.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>Be the first team in {c.n} — create your membership and register your roster.</p>
            ) : (
              <div className="region-countries">
                {teams.map((t, i) => (
                  <div key={i} className="cc-card">
                    <span className="flag">{c.f}</span>
                    <span className="meta">
                      <span className="cn">{t.name}</span>
                      <span className="cc">{t.city ?? c.n}{t.current_class ? ` · ${t.current_class}` : ""}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* MEMBERSHIP CTA */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">Get started</div>
              <h2>Play in {c.n} — one membership, valid worldwide.</h2>
              <span className="mem-note">🔔 Billed in {c.cur} + local VAT · valid in every Global Sports country</span>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/signup">Create membership</Link>
              <Link className="btn btn-dark" href={`/${region.key}`}>Back to {region.label}</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
