"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorldMap from "@/components/WorldMap";
import Flag from "@/components/Flag";
import { CONTINENTS } from "@/lib/countries";
import { useI18n } from "@/lib/i18n";
import { HOME } from "@/lib/home-content";

const AUD_HREFS = ["/players", "/teams", "/organizers", "/leagues"];
const WHY_ICONS = ["🌍", "🏆", "📍", "💳"];
const AUD_ICONS = ["🥎", "👥", "🗓️", "🏆"];

export default function Home() {
  const { lang } = useI18n();
  const c = HOME[lang] ?? HOME.en;

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
