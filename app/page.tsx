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

type News = { id: string; title: string; type: string | null; country: string | null; location: string | null; image_url: string | null };
type Ev = { slug: string | null; name: string; start_date: string | null; end_date: string | null; country_code: string | null; status: string | null; registered_teams: number | null; max_teams: number | null };
const fmtD = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
const eventHref = (e: Ev) => {
  const rk = e.country_code ? byCode[e.country_code]?.region.key : null;
  return rk && e.slug ? `/${rk}/${e.country_code!.toLowerCase()}/events/${e.slug}` : "/events";
};
const newsImg = (n: News) => n.image_url || `https://picsum.photos/seed/gsn-${n.id.slice(0, 8)}/720/480`;

export default function Home() {
  const { lang } = useI18n();
  const c = HOME[lang] ?? HOME.en;
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const [{ data: a }, { data: e }] = await Promise.all([
        supabase.from("announcements").select("id,title,type,country,location,image_url").eq("status", "published").order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(3),
        supabase.from("tournament_summary").select("slug,name,start_date,end_date,country_code,status,registered_teams,max_teams").order("start_date", { ascending: true }).limit(2),
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

        {/* FEATURED EVENTS BANNER */}
        {events.length > 0 && (
          <div className="wrap" style={{ marginTop: -46, position: "relative", zIndex: 3 }}>
            <div className="feat-banner">
              <div style={{ flex: "1 1 340px" }}>
                <div className="feat-tag">★ {c.eventsTitle}</div>
                {events.map((e, i) => (
                  <Link key={i} href={eventHref(e)} style={{ display: "block", textDecoration: "none", marginTop: i ? 14 : 6 }}>
                    <h2 style={{ color: "var(--navy)" }}>{e.name}</h2>
                    <p>{e.country_code && <Flag code={e.country_code} />} {fmtD(e.start_date)}{e.end_date ? ` – ${fmtD(e.end_date)}` : ""}{e.registered_teams != null ? ` · ${e.registered_teams}${e.max_teams ? `/${e.max_teams}` : ""} teams` : ""}</p>
                  </Link>
                ))}
              </div>
              <Link className="btn btn-primary" href="/events" style={{ padding: "14px 26px" }}>{c.eventsCta}</Link>
            </div>
          </div>
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

        {/* LATEST NEWS */}
        {news.length > 0 && (
          <section className="pad" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head center"><div className="eyebrow">{c.newsEyebrow}</div><h2>{c.newsTitle}</h2></div>
              <div className="news-grid">
                {news.map((n) => (
                  <Link key={n.id} href="/events" className="news-card" style={{ backgroundImage: `linear-gradient(180deg, rgba(10,22,40,.12), rgba(10,22,40,.9)), url('${newsImg(n)}')` }}>
                    {n.country && <span className="news-flag"><Flag code={n.country} /></span>}
                    <div className="news-body">
                      <h3>{n.title}</h3>
                      {n.location && <span className="news-loc">{n.location}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
