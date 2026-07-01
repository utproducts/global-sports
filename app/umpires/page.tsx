"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const STEPS = [
  { h: "Train", p: "Learn the .52/300 world rules and Global Sports mechanics through a standard curriculum, available in your language." },
  { h: "Certify", p: "Complete certification to officiate at league, qualifier and championship level — recognised across every region." },
  { h: "Get assigned", p: "Be matched to events near you, from local leagues to flagship championships, with clear pay and schedules." },
];

export default function UmpiresPage() {
  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 34 }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Global Umpire Program</div>
            <h1>One standard for officials, worldwide.</h1>
            <p className="sub">Global Sports is building a unified umpire program — consistent training, certification and event assignment across every region, so the game is called the same way from a local league to the World Slowpitch Championship.</p>
            <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href="/signup">Register your interest</Link>
              <Link className="btn btn-ghost" href="/events">See upcoming events</Link>
            </div>
          </div>
        </section>

        <section className="pad">
          <div className="wrap">
            <div className="sec-head center"><div className="eyebrow">How it works</div><h2>From training to the field.</h2></div>
            <div className="grid steps">
              {STEPS.map((s, i) => (
                <div key={i} className="step"><div className="num">{i + 1}</div><h3>{s.h}</h3><p>{s.p}</p></div>
              ))}
            </div>
            <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, marginTop: 24 }}>
              Program details, certification levels and pay structure are being finalised with regional partners.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
