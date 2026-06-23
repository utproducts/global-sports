import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export type ValueProp = { icon: string; title: string; desc: string };
export type Step = { title: string; desc: string };

export type AudienceContent = {
  eyebrow: string;
  titleA: string;
  titleB: string; // gold-gradient part
  sub: string;
  accent: string;
  pills: string[];
  whyHead: string;
  whySub: string;
  valueProps: ValueProp[];
  stepsHead: string;
  steps: Step[];
  ctaTitle: string;
  ctaText: string;
  ctaLabel: string;
  ctaHref: string;
};

export default function AudienceLanding({ c }: { c: AudienceContent }) {
  return (
    <>
      <Header />
      <main>
        {/* HERO */}
        <section className="ev-hero" style={{ background: `radial-gradient(1100px 520px at 80% -25%, ${c.accent}, var(--navy) 64%)` }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>{c.eyebrow}</div>
            <h1>{c.titleA}<br /><span className="ev-grad">{c.titleB}</span></h1>
            <p>{c.sub}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
              {c.pills.map((p) => (
                <span key={p} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#fff" }}>{p}</span>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <Link className="btn btn-primary" href={c.ctaHref} style={{ padding: "14px 26px" }}>{c.ctaLabel} →</Link>
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="pad">
          <div className="wrap">
            <div className="sec-head center"><div className="eyebrow">{c.whyHead}</div><h2>{c.whySub}</h2></div>
            <div className="grid why">
              {c.valueProps.map((v) => (
                <div key={v.title} className="card">
                  <div className="ic">{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="pad steps-sec">
          <div className="wrap">
            <div className="sec-head center"><div className="eyebrow">How it works</div><h2>{c.stepsHead}</h2></div>
            <div className="grid steps">
              {c.steps.map((s, i) => (
                <div key={s.title} className="step">
                  <div className="num">{i + 1}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pad">
          <div className="wrap">
            <div style={{ background: "linear-gradient(165deg,#17386a,#0a1628)", borderRadius: 20, padding: "44px 32px", textAlign: "center", color: "#fff" }}>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,34px)", fontWeight: 900, marginBottom: 10 }}>{c.ctaTitle}</h2>
              <p style={{ color: "rgba(255,255,255,.8)", maxWidth: 560, margin: "0 auto 22px" }}>{c.ctaText}</p>
              <Link className="btn btn-primary" href={c.ctaHref} style={{ padding: "14px 28px" }}>{c.ctaLabel} →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
