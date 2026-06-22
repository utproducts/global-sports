import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountryNav from "@/components/CountryNav";
import { regionByKey, findCountry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

type Ev = {
  name: string; start_date: string | null; end_date: string | null; status: string | null;
  age_group: string | null; usssa_class: string | null; team_fee: number | null;
  max_teams: number | null; venue_name: string | null; venue_city: string | null; registered_teams: number | null;
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD");
const STATUS: Record<string, [string, string]> = {
  registration_open: ["Registration open", "status-open"],
  registration_closed: ["Registration closed", "status-closed"],
  in_progress: ["Live now", "status-other"],
  completed: ["Completed", "status-other"],
};

export default async function EventPage({ params }: { params: Promise<{ region: string; country: string; slug: string }> }) {
  const { region: regionKey, country: countryCode, slug } = await params;
  const region = regionByKey(regionKey);
  const entry = findCountry(countryCode);
  if (!region || !entry || entry.region.key !== region.key) notFound();
  const c = entry.country;

  let ev: Ev | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("tournament_summary")
      .select("name,start_date,end_date,status,age_group,usssa_class,team_fee,max_teams,venue_name,venue_city,registered_teams")
      .eq("slug", slug).eq("country_code", c.c).maybeSingle();
    ev = (data as Ev) ?? null;
  }
  if (!ev) notFound();

  const base = `/${region.key}/${c.c.toLowerCase()}`;
  const open = ev.status === "registration_open";
  const pct = ev.max_teams ? Math.min(100, Math.round(((ev.registered_teams ?? 0) / ev.max_teams) * 100)) : 0;
  const [statusLabel, statusClass] = STATUS[ev.status ?? ""] ?? [ev.status ?? "", "status-other"];

  return (
    <>
      <Header />
      <CountryNav region={region.key} code={c.c} name={c.n} flag={c.f} active="events" />
      <main>
        <section className="country-hero" style={{ paddingBottom: 28 }}>
          <div className="wrap">
            <Link className="back" href={`${base}#events`}>← {c.f} {c.n} events</Link>
            <span className={`status-pill ${statusClass}`} style={{ marginBottom: 12 }}>{statusLabel}</span>
            <h1 style={{ marginTop: 8 }}>{ev.name}</h1>
            <p className="sub">{fmt(ev.start_date)}{ev.end_date ? ` – ${fmt(ev.end_date)}` : ""}{ev.venue_city ? ` · ${ev.venue_city}` : ""}</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 860 }}>
            <div className="event-meta">
              <div className="em"><div className="l">Dates</div><div className="v">{fmt(ev.start_date)}</div></div>
              <div className="em"><div className="l">Class</div><div className="v">{ev.usssa_class ?? "—"}</div></div>
              <div className="em"><div className="l">Division</div><div className="v">{ev.age_group ?? "Open"}</div></div>
              <div className="em"><div className="l">Entry fee</div><div className="v">€{ev.team_fee ?? "—"}</div></div>
              <div className="em">
                <div className="l">Teams</div>
                <div className="v">{ev.registered_teams ?? 0}{ev.max_teams ? ` / ${ev.max_teams}` : ""}</div>
                {ev.max_teams ? <div className="cap-bar"><span style={{ width: `${pct}%` }} /></div> : null}
              </div>
              <div className="em"><div className="l">Venue</div><div className="v">{ev.venue_name ?? ev.venue_city ?? "TBA"}</div></div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
              {open ? (
                <Link className="btn btn-primary" href={`${base}/events/${slug}/register`}>Register your team →</Link>
              ) : (
                <span className="btn btn-dark" style={{ opacity: 0.6, cursor: "not-allowed" }}>Registration {ev.status === "registration_closed" ? "closed" : "unavailable"}</span>
              )}
              <Link className="btn btn-ghost" href={base} style={{ color: "var(--navy)", borderColor: "var(--line)" }}>Back to {c.n}</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
