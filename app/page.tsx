"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorldMap from "@/components/WorldMap";
import Flag from "@/components/Flag";
import { CONTINENTS, byCode } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";
import { HOME } from "@/lib/home-content";
import { supabase } from "@/lib/supabase";

const AUD_HREFS = ["/players", "/teams", "/organizers", "/leagues"];
const WHY_ICONS = ["🌍", "🏆", "📍", "💳"];
const AUD_ICONS = ["🥎", "👥", "🗓️", "🏆"];

type News = { id: string; title: string; body: string; published_at: string | null; type: string | null };
type Ev = { name: string; start_date: string | null; country_code: string | null; status: string | null };
const fmtD = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

export default function Home() {
  const { lang } = useI18n();
  const c = HOME[lang] ?? HOME.en;
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const [{ data: a }, { data: e }] = await Promise.all([
        supabase.from("announcements").select("id,title,body,published_at,type").eq("status", "published").order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(3),
        supabase.from("tournament_summary").select("name,start_date,country_code,status").order("start_date", { ascending: true }).limit(4),
      ]);
      setNews((a as News[]) ?? []);
      setEvents((e as Ev[]) ?? []);
    })();
  }, []);

  return (
    <>
      <Header />
      <main id="top">
        {/* MAP HERO */}
        <section className="map-hero" id="map">
          <div className="wrap">
            <div className="hero-copy">
              <div className="eyebrow" style={{ color: "var(--gold)" }}>{c.heroEyebrow}</div>
              <h1>{c.heroH1a} <span className="accent">{c.heroH1b}</span></h1>
              <p>{c.heroP}</p>
            </div>
            <WorldMap />
            <div className="continent-tiles">
              {CONTINENTS.map((ct) => (
                <Link key={ct.key} href={`/${ct.key}`} className="ct">
                  <span className="ct-flags">{ct.codes.map((code) => <Flag key={code} code={code} />)}</span>
                  <span className="ct-name">{ct.label}</span>
                  <span className="ct-meta">{ct.live ? c.tileLive : c.tileSoon}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="scroll-cue">{c.scroll}<span className="arrow">↓</span></div>
        </section>

        {/* NEWS + FEATURED EVENTS */}
        {(news.length > 0 || events.length > 0) && (
          <section className="pad">
            <div className="wrap home-two">
              {news.length > 0 && (
                <div>
                  <div className="sec-head" style={{ marginBottom: 16 }}><div className="eyebrow">{c.newsEyebrow}</div><h2 style={{ fontSize: 24 }}>{c.newsTitle}</h2></div>
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
                </div>
              )}
              {events.length > 0 && (
                <div>
                  <div className="sec-head" style={{ marginBottom: 16 }}><div className="eyebrow">{c.eventsEyebrow}</div><h2 style={{ fontSize: 24 }}>{c.eventsTitle}</h2></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {events.map((e, i) => (
                      <Link key={i} href="/events" className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center", textDecoration: "none" }}>
                        <div className="ev-card-date"><span className="d">{e.start_date ? new Date(e.start_date).getDate() : "–"}</span><span className="m">{e.start_date ? new Date(e.start_date).toLocaleDateString("en-GB", { month: "short" }) : ""}</span></div>
                        <div><h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{e.name}</h3><p style={{ fontSize: 13, color: "var(--muted)" }}>{e.country_code && <Flag code={e.country_code} />} {fmtD(e.start_date)}</p></div>
                      </Link>
                    ))}
                  </div>
                  <Link className="btn btn-dark" href="/events" style={{ marginTop: 14 }}>{c.eventsCta}</Link>
                </div>
              )}
            </div>
          </section>
        )}

        {/* WHY */}
        <section className="pad" id="why">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">{c.whyEyebrow}</div>
              <h2>{c.whyH2}</h2>
              <p>{c.whyP}</p>
            </div>
            <div className="grid why">
              {c.why.map((card, i) => (
                <div key={i} className="card"><div className="ic">{WHY_ICONS[i]}</div><h3>{card.h}</h3><p>{card.p}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* AUDIENCES */}
        <section className="pad" id="audiences" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head center"><div className="eyebrow">{c.audEyebrow}</div><h2>{c.audH2}</h2></div>
            <div className="grid why">
              {c.aud.map((card, i) => (
                <a key={i} href={AUD_HREFS[i]} className="card"><div className="ic">{AUD_ICONS[i]}</div><h3>{card.h}</h3><p>{card.p}</p></a>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="pad steps-sec" id="how">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">{c.howEyebrow}</div>
              <h2>{c.howH2}</h2>
            </div>
            <div className="grid steps">
              {c.steps.map((s, i) => (
                <div key={i} className="step"><div className="num">{i + 1}</div><h3>{s.h}</h3><p>{s.p}</p></div>
              ))}
            </div>
          </div>
        </section>

        {/* UMPIRE PROGRAM */}
        <section className="pad" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div style={{ background: "linear-gradient(165deg,#17386a,#0a1628)", borderRadius: 20, padding: "40px 32px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{ maxWidth: 580 }}>
                <div className="eyebrow" style={{ color: "var(--gold)" }}>{c.umpireEyebrow}</div>
                <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, margin: "6px 0 8px" }}>{c.umpireTitle}</h2>
                <p style={{ color: "rgba(255,255,255,.8)" }}>{c.umpireBlurb}</p>
              </div>
              <Link className="btn btn-primary" href="/umpires">{c.umpireCta}</Link>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP */}
        <section className="pad" id="membership">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">{c.memEyebrow}</div>
              <h2>{c.memH2}</h2>
              <span className="mem-note">🔔 {c.memNote}</span>
            </div>
            <div className="grid tiers">
              {c.tierNames.map((name, i) => {
                const popular = i === c.tierNames.length - 1;
                return (
                  <div key={i} className={"tier" + (popular ? " pop" : "")}>
                    {popular && <div className="pill">{c.popular}</div>}
                    <h3>{name}</h3>
                    <div className="price">{c.tierPrices[i]}<span>{c.perYr}</span></div>
                    <div className="cur">{c.cur}</div>
                    <ul>{c.tierFeatures[i].map((f, j) => <li key={j}>{f}</li>)}</ul>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <a href="/membership" className="btn btn-primary">{c.choose}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
