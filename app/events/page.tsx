"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { supabase } from "@/lib/supabase";
import { byCode } from "@/lib/countries";
import { FLAGSHIPS } from "@/lib/flagships";

type Ev = { slug: string | null; name: string; start_date: string | null; end_date: string | null; status: string | null; country_code: string | null; registered_teams: number | null; max_teams: number | null };

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "TBD");
const STATUS: Record<string, [string, string, string]> = {
  registration_open: ["Registration open", "#138a45", "#e1f8ea"],
  registration_closed: ["Closed", "#b3261e", "#fdecec"],
  in_progress: ["Live now", "#8a6300", "#fff4e0"],
  completed: ["Completed", "#5b6675", "#eef1f6"],
};

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
  const featured = events.find((e) => e.status === "registration_open") || events[0];
  const featuredHref = featured ? linkFor(featured) : null;
  const totalTeams = events.reduce((s, e) => s + (e.registered_teams || 0), 0);
  const countries = new Set(events.map((e) => e.country_code).filter(Boolean)).size;

  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="ev-hero">
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Flagship Events</div>
            <h1>The events that<br /><span className="ev-grad">define the season.</span></h1>
            <p>World slow-pitch, unified. From the World Cup to your local championship — every Global Sports event, one stage.</p>
            <div className="ev-stats">
              <div><span className="n">{events.length || "—"}</span><span className="l">Events</span></div>
              <div><span className="n">{countries || "—"}</span><span className="l">Countries</span></div>
              <div><span className="n">{totalTeams || "—"}</span><span className="l">Teams competing</span></div>
              <div><span className="n">3</span><span className="l">Flagship titles</span></div>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        {featured && (
          <div className="wrap" style={{ marginTop: -42, position: "relative", zIndex: 2 }}>
            <div className="feat-banner">
              <div>
                <div className="feat-tag">★ Featured event</div>
                <h2>{featured.name}</h2>
                <p>{featured.country_code && <Flag code={featured.country_code} />} {fmt(featured.start_date)}{featured.end_date ? ` – ${fmt(featured.end_date)}` : ""}{featured.registered_teams != null ? ` · ${featured.registered_teams}${featured.max_teams ? `/${featured.max_teams}` : ""} teams` : ""}</p>
              </div>
              {featuredHref && (
                <Link className="btn btn-primary" href={featured.status === "registration_open" ? `${featuredHref}/register` : featuredHref} style={{ padding: "14px 26px" }}>
                  {featured.status === "registration_open" ? "Register now →" : "View event →"}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* FLAGSHIP */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head center"><div className="eyebrow">Flagship programs</div><h2>Three titles. One pursuit.</h2></div>
            <div className="flagship">
              {FLAGSHIPS.map((f) => (
                <Link key={f.slug} href={`/flagship/${f.slug}`} className="fcard" style={{ ["--accent" as string]: f.accent, textDecoration: "none" }}>
                  <div className="fcard-bar" />
                  <div className="fcard-body">
                    <div className="fcard-tag">{f.brand || "Flagship"}</div>
                    <h3>{f.name}</h3>
                    <div className="fcard-sub">{f.location}</div>
                    <p>{f.tagline}</p>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 12, display: "inline-block" }}>View event →</span>
                  </div>
                </Link>
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
              <div className="ev-list">
                {events.map((e, i) => {
                  const href = linkFor(e);
                  const open = e.status === "registration_open";
                  const pct = e.max_teams ? Math.min(100, Math.round(((e.registered_teams ?? 0) / e.max_teams) * 100)) : 0;
                  const st = STATUS[e.status ?? ""] ?? [e.status ?? "", "#5b6675", "#eef1f6"];
                  return (
                    <div key={i} className="ev-card">
                      <div className="ev-card-main">
                        <div className="ev-card-date">
                          <span className="d">{e.start_date ? new Date(e.start_date).getDate() : "–"}</span>
                          <span className="m">{e.start_date ? new Date(e.start_date).toLocaleDateString("en-GB", { month: "short" }) : ""}</span>
                        </div>
                        <div>
                          <h3>{href ? <Link href={href} style={{ color: "var(--navy)" }}>{e.name}</Link> : e.name}</h3>
                          <p>{e.country_code && <Flag code={e.country_code} />} {fmt(e.start_date)}{e.end_date ? ` – ${fmt(e.end_date)}` : ""}{e.registered_teams != null ? ` · ${e.registered_teams}${e.max_teams ? `/${e.max_teams}` : ""} teams` : ""}</p>
                          {e.max_teams ? <div className="cap-bar" style={{ maxWidth: 220, marginTop: 8 }}><span style={{ width: `${pct}%` }} /></div> : null}
                        </div>
                      </div>
                      <div className="ev-card-side">
                        <span className="status-pill" style={{ color: st[1], background: st[2] }}>{st[0]}</span>
                        {href && <Link className="btn btn-dark" href={open ? `${href}/register` : href} style={{ padding: "9px 18px" }}>{open ? "Register" : "Details"}</Link>}
                      </div>
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
