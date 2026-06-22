"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { REGIONS, VAT, byCode } from "@/lib/countries";

const TIERS = [
  { key: "standard", label: "Standard", eur: 30, features: ["Required to register & play", "Player profile & rating", "Roster eligibility"] },
  { key: "select", label: "Select", eur: 45, popular: true, features: ["Everything in Standard", "Priority event registration", "Enhanced stats & history"] },
  { key: "elite", label: "Elite", eur: 75, features: ["Everything in Select", "Premium membership card", "Early access to championships"] },
];

export default function MembershipPage() {
  const router = useRouter();
  const [country, setCountry] = useState("DE");
  const [tier, setTier] = useState("select");

  // Preselect country from ?country= (read client-side to avoid Suspense bailout).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("country");
    if (p && byCode[p.toUpperCase()]) setCountry(p.toUpperCase());
  }, []);

  const entry = byCode[country];
  const cur = entry?.country.cur ?? "EUR";
  const vat = VAT[country] ?? 0;
  const selected = TIERS.find((t) => t.key === tier)!;
  const vatAmt = selected.eur * vat;
  const total = selected.eur + vatAmt;
  const money = (n: number) => `€${n.toFixed(2)}`;

  function onContinue() {
    router.push(`/membership/checkout?plan=${tier}&country=${country}`);
  }

  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 30 }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Membership</div>
            <h1>One membership. Valid in every country.</h1>
            <p className="sub">Buy once and play anywhere Global Sports runs. Pick your country — we price it in your local currency and tax.</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 900 }}>
            {/* Step 1 — country */}
            <div className="sec-head" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Step 1</div>
              <h2 style={{ fontSize: 24 }}>Select your country</h2>
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              style={{ width: "100%", maxWidth: 420, padding: "13px 14px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 15, fontFamily: "inherit", marginBottom: 8 }}
            >
              {REGIONS.map((r) => (
                <optgroup key={r.key} label={r.label}>
                  {[...r.countries].sort((a, b) => a.n.localeCompare(b.n)).map((c) => (
                    <option key={c.c} value={c.c}>{c.f} {c.n} ({c.cur})</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              Billed in <strong>{cur}</strong> · {entry?.country.n} VAT {(vat * 100).toFixed(vat * 100 % 1 ? 1 : 0)}%
            </p>

            {/* Step 2 — tier */}
            <div className="sec-head" style={{ margin: "40px 0 18px" }}>
              <div className="eyebrow">Step 2</div>
              <h2 style={{ fontSize: 24 }}>Choose your tier</h2>
            </div>
            <div className="grid tiers">
              {TIERS.map((t) => {
                const isSel = t.key === tier;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTier(t.key)}
                    className={"tier" + (isSel ? " pop" : "")}
                    style={{ textAlign: "left", cursor: "pointer", outline: isSel ? "2px solid var(--navy)" : "none", background: isSel ? "#fff8df" : "#fff" }}
                  >
                    {t.popular && <div className="pill">MOST POPULAR</div>}
                    <h3>{t.label}</h3>
                    <div className="price">€{t.eur}<span>/yr</span></div>
                    <div className="cur">+ {(vat * 100).toFixed(vat * 100 % 1 ? 1 : 0)}% VAT · in {cur}</div>
                    <ul>{t.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                    {isSel && <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: "#8a6300" }}>✓ SELECTED</div>}
                  </button>
                );
              })}
            </div>

            {/* Summary + continue */}
            <div style={{ marginTop: 34, padding: 24, border: "1.5px solid var(--line)", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{selected.label} membership · {entry?.country.f} {entry?.country.n}</div>
                <div style={{ fontSize: 26, fontWeight: 900 }}>{money(total)} <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>/yr</span></div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{money(selected.eur)} + {money(vatAmt)} VAT{cur !== "EUR" ? ` · charged in ${cur}` : ""}</div>
              </div>
              <button className="btn btn-primary" onClick={onContinue} style={{ padding: "14px 28px" }}>Continue →</button>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 12 }}>
              Next: create your account, then secure checkout (Stripe). Your membership is one record, valid in every Global Sports country.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
