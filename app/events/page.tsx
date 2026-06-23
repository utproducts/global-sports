"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { supabase } from "@/lib/supabase";
import { byCode } from "@/lib/countries";

type Ev = { slug: string | null; name: string; start_date: string | null; end_date: string | null; status: string | null; country_code: string | null; registered_teams: number | null; max_teams: number | null };

const FLAGSHIP = [
  { tag: "WORLD CUP", name: "World Slow-Pitch Championship", desc: "The World Cup of slow-pitch — the pinnacle event where the best from every continent compete for the global title.", color: "#1f3a8a" },
  { tag: "EUROPE'S #1", name: "ESSC — European Slow-Pitch Championship", desc: "The top championship in Europe. A stable, prestigious brand and the event every European team builds their season around.", color: "#c8102e" },
  { tag: "FLAGSHIP", name: "Global Games", desc: "Our marquee multi-nation showcase — elite competition and the Global Sports spectacle.", color: "#b8860b" },
];

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD");

export default function EventsPage() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase.from("tournament_summary").select("slug,name,start_date,end_date,status,country_code,registered_teams,max_teams").order("start_date", { ascending: true });
      if (data) setEvents(data as Ev[]);
      setLoading(false);
    })();
  }, []);

  const linkFor = (e: Ev) => {
    const region = e.country_code ? byCode[e.country_code]?.region.key : null;
    return region && e.slug ? `/${region}/${e.country_code!.toLowerCase()}/events/${e.slug}` : null;
  };

  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 26 }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Events</div>
            <h1>Flagship championships &amp; events</h1>
            <p className="sub">The tentpole events of world slow-pitch — plus every Global Sports tournament, all in one place.</p>
          </div>
        </section>

        {/* FLAGSHIP */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head"><div className="eyebrow">Flagship programs</div><h2>The events that define the season</h2></div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
              {FLAGSHIP.map((f) => (
                <div key={f.name} className="card" style={{ borderTop: `4px solid ${f.color}` }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: f.color }}>{f.tag}</div>
                  <h3 style={{ margin: "8px 0" }}>{f.name}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ALL EVENTS */}
        <section className="pad steps-sec">
          <div className="wrap">
            <div className="sec-head"><div className="eyebrow">All events</div><h2>Upcoming &amp; recent tournaments</h2></div>
            {loading ? <p style={{ color: "var(--muted)" }}>Loading events…</p> : events.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No events yet.</p>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
                {events.map((e, i) => {
                  const href = linkFor(e);
                  const open = e.status === "registration_open";
                  return (
                    <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <h3 style={{ marginBottom: 4 }}>{href ? <Link href={href} style={{ color: "var(--navy)" }}>{e.name}</Link> : e.name}</h3>
                        <p>{e.country_code && <Flag code={e.country_code} />} {fmt(e.start_date)}{e.end_date ? ` – ${fmt(e.end_date)}` : ""}{e.registered_teams != null ? ` · ${e.registered_teams}${e.max_teams ? `/${e.max_teams}` : ""} teams` : ""}</p>
                      </div>
                      {href && <Link className="btn btn-dark" href={open ? `${href}/register` : href} style={{ padding: "9px 16px" }}>{open ? "Register" : "Details"}</Link>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
