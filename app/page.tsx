import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorldMap from "@/components/WorldMap";
import { REGIONS, PRESENCE } from "@/lib/countries";

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        {/* MAP HERO */}
        <section className="map-hero" id="map">
          <div className="wrap">
            <div className="hero-copy">
              <div className="eyebrow" style={{ color: "var(--gold)" }}>Adult Slow-Pitch · Worldwide</div>
              <h1>Where do you play? <span className="accent">Pick your region.</span></h1>
              <p>Tap your region on the map to zoom in and choose your country — then scroll to see why one membership puts the whole world in play.</p>
            </div>
            <WorldMap />
            <div className="continent-tiles">
              {REGIONS.map((r) => {
                const active = r.countries.filter((c) => PRESENCE[c.c]).length;
                return (
                  <Link key={r.key} href={`/${r.key}`} className="ct">
                    <span className="ct-flags">{r.countries.slice(0, 3).map((c) => c.f).join(" ")}</span>
                    <span className="ct-name">{r.label}</span>
                    <span className="ct-meta">{r.countries.length} countries{active ? ` · ${active} active` : ""}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="scroll-cue">Scroll to learn more about Global Sports<span className="arrow">↓</span></div>
        </section>

        {/* WHY */}
        <section className="pad" id="why">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">Why choose us</div>
              <h2>Built for players who want the real thing.</h2>
              <p>Not a pickup league. A structured, ranked, cross-border championship system — with the local feel of your own country.</p>
            </div>
            <div className="grid why">
              <div className="card"><div className="ic">🌍</div><h3>One membership, worldwide</h3><p>Sign up once. Your Global Sports membership is valid in every country we run — play at home or abroad, no second fee.</p></div>
              <div className="card"><div className="ic">🏆</div><h3>A true championship path</h3><p>Pool play, brackets, classifications and player ratings that carry across events. Earn your way up, country to continent.</p></div>
              <div className="card"><div className="ic">📍</div><h3>Your country, your way</h3><p>Every country runs as its own home — local language, currency and events — under one global standard.</p></div>
              <div className="card"><div className="ic">💳</div><h3>Pay in your currency</h3><p>Local pricing, local VAT, local checkout. Powered by one secure platform so directors get paid and players stay protected.</p></div>
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="pad steps-sec" id="how">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">How it works</div>
              <h2>From sign-up to first pitch in three steps.</h2>
            </div>
            <div className="grid steps">
              <div className="step"><div className="num">1</div><h3>Pick your country</h3><p>Select where you play. We route you to your country&apos;s home, set up in your language and currency.</p></div>
              <div className="step"><div className="num">2</div><h3>Create your membership</h3><p>One required Global Sports membership unlocks events everywhere. Choose Standard, Select or Elite.</p></div>
              <div className="step"><div className="num">3</div><h3>Join a team &amp; register</h3><p>Get added to a roster, register for tournaments, and start chasing the title.</p></div>
            </div>
          </div>
        </section>

        {/* MEMBERSHIP */}
        <section className="pad" id="membership">
          <div className="wrap">
            <div className="sec-head center">
              <div className="eyebrow">Membership</div>
              <h2>One membership. Valid everywhere.</h2>
              <span className="mem-note">🔔 Buy once — play in any Global Sports country, no second fee</span>
            </div>
            <div className="grid tiers">
              <div className="tier"><h3>Standard</h3><div className="price">€30<span>/yr</span></div><div className="cur">Charged in your local currency + VAT</div>
                <ul><li>Required to register &amp; play</li><li>Player profile &amp; rating</li><li>Roster eligibility</li></ul></div>
              <div className="tier pop"><div className="pill">MOST POPULAR</div><h3>Select</h3><div className="price">€45<span>/yr</span></div><div className="cur">Charged in your local currency + VAT</div>
                <ul><li>Everything in Standard</li><li>Priority event registration</li><li>Enhanced stats &amp; history</li></ul></div>
              <div className="tier"><h3>Elite</h3><div className="price">€75<span>/yr</span></div><div className="cur">Charged in your local currency + VAT</div>
                <ul><li>Everything in Select</li><li>Premium membership card</li><li>Early access to championships</li></ul></div>
            </div>
            <div style={{ textAlign: "center", marginTop: 30 }}>
              <a href="/membership" className="btn btn-primary">Choose your membership →</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
