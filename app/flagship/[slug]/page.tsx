import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Flag from "@/components/Flag";
import { FLAGSHIPS, flagshipBySlug } from "@/lib/flagships";

export function generateStaticParams() {
  return FLAGSHIPS.map((f) => ({ slug: f.slug }));
}

const STATUS: Record<string, string> = { open: "Registration open", soon: "Coming soon", closed: "Registration closed" };

export default async function FlagshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const f = flagshipBySlug(slug);
  if (!f) notFound();

  const img = `https://picsum.photos/seed/${f.imgSeed}/1600/800`;

  return (
    <>
      <Header />
      <main>
        {/* HERO with photo */}
        <section
          className="fl-hero"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(10,22,40,.55), rgba(10,22,40,.92)), url('${img}')` }}
        >
          <div className="wrap fl-hero-inner">
            <Link className="back" href="/events" style={{ color: "rgba(255,255,255,.85)" }}>← All events</Link>
            <span className="fl-tag" style={{ background: f.accent }}>{f.brand || "Flagship"}</span>
            <h1>{f.name}</h1>
            <p className="fl-tagline">{f.tagline}</p>
            <div className="fl-meta">
              <span><Flag code={f.code} /> {f.location}</span>
              <span>📅 {f.dates}</span>
              <span className="fl-status">{STATUS[f.status]}</span>
            </div>
            <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" href={f.registerHref} style={{ padding: "14px 30px", fontSize: 15 }}>
                {f.status === "closed" ? "Join the waitlist" : "Register your team →"}
              </Link>
              <Link className="btn btn-ghost" href="/membership">Get membership</Link>
            </div>
          </div>
        </section>

        {/* ABOUT + DETAILS */}
        <section className="pad">
          <div className="wrap fl-about">
            <div>
              <div className="eyebrow">About the event</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, margin: "10px 0 14px" }}>{f.tagline}</h2>
              <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>{f.blurb}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                {f.categories.map((c) => <span key={c} className="champ-pill">{c}</span>)}
              </div>
            </div>
            <div className="fl-details">
              <div className="fl-d"><span className="l">Location</span><span className="v"><Flag code={f.code} /> {f.location}</span></div>
              <div className="fl-d"><span className="l">Dates</span><span className="v">{f.dates}</span></div>
              <div className="fl-d"><span className="l">Categories</span><span className="v">{f.categories.join(", ")}</span></div>
              {f.levels && <div className="fl-d"><span className="l">Levels</span><span className="v">{f.levels.join(" · ")}</span></div>}
              <div className="fl-d"><span className="l">Status</span><span className="v">{STATUS[f.status]}</span></div>
            </div>
          </div>
        </section>

        {/* CHAMPIONSHIPS (ESSC etc.) */}
        {f.championships && (
          <section className="pad steps-sec">
            <div className="wrap">
              <div className="sec-head"><div className="eyebrow">Championships</div><h2>Six titles, three levels</h2></div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
                {f.championships.map((ch) => (
                  <div key={ch.name} className="card" style={{ borderTop: `4px solid ${f.accent}` }}>
                    <h3 style={{ marginBottom: 6 }}>{ch.name}</h3>
                    <p>{ch.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REGISTER CTA */}
        <section className="pad">
          <div className="wrap">
            <div style={{ background: "linear-gradient(165deg,#17386a,#0a1628)", borderRadius: 20, padding: "44px 32px", textAlign: "center", color: "#fff" }}>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,34px)", fontWeight: 900, marginBottom: 10 }}>Be part of {f.name}.</h2>
              <p style={{ color: "rgba(255,255,255,.8)", maxWidth: 560, margin: "0 auto 22px" }}>Register your team and compete for your place in the rankings and the Hall of Champions.</p>
              <Link className="btn btn-primary" href={f.registerHref} style={{ padding: "14px 30px" }}>
                {f.status === "closed" ? "Join the waitlist" : "Register your team →"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
