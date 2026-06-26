"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { REGIONS, VAT, byCode } from "@/lib/countries";
import { supabase } from "@/lib/supabase";
import { rateFor, regionKeyForCountry, type Tier, type RegionRate } from "@/lib/membership";

export default function MembershipPage() {
  const router = useRouter();
  const [country, setCountry] = useState("DE");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [rates, setRates] = useState<RegionRate[]>([]);
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("country");
    if (p && byCode[p.toUpperCase()]) setCountry(p.toUpperCase());
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const [{ data: t }, { data: r }] = await Promise.all([
        supabase.from("membership_tiers").select("id,label,price_eur,is_popular,sort_order,features,access,description,ipr_tier").eq("is_active", true).order("sort_order"),
        supabase.from("membership_region_rates").select("tier_id,region_key,price,active").eq("active", true),
      ]);
      const list = (t as Tier[]) ?? [];
      setTiers(list);
      setRates((r as RegionRate[]) ?? []);
      setTier(list.find((x) => x.is_popular)?.id ?? list[0]?.id ?? "");
      setLoading(false);
    })();
  }, []);

  const entry = byCode[country];
  const cur = entry?.country.cur ?? "EUR";
  const vat = VAT[country] ?? 0;
  const selected = tiers.find((t) => t.id === tier);
  const base = selected ? rateFor(selected, country, rates) : 0;
  const vatAmt = base * vat;
  const total = base + vatAmt;
  const money = (n: number) => `€${n.toFixed(2)}`;
  const vatPct = (vat * 100).toFixed(vat * 100 % 1 ? 1 : 0);
  const regionLabel = REGIONS.find((r) => r.key === regionKeyForCountry(country))?.label;

  function onContinue() {
    if (tier) router.push(`/membership/checkout?plan=${tier}&country=${country}`);
  }

  return (
    <>
      <Header />
      <main>
        <section className="country-hero" style={{ paddingBottom: 30 }}>
          <div className="wrap">
            <div className="eyebrow" style={{ color: "var(--gold)" }}>Membership (IPM)</div>
            <h1>One player membership. Valid across the world.</h1>
            <p className="sub">Your IPM is your global player registration. Pick your country — we price it in your region&apos;s rate, your local currency and tax.</p>
          </div>
        </section>

        <section className="pad">
          <div className="wrap" style={{ maxWidth: 900 }}>
            <div className="sec-head" style={{ marginBottom: 18 }}>
              <div className="eyebrow">Step 1</div>
              <h2 style={{ fontSize: 24 }}>Select your country</h2>
            </div>
            <select value={country} onChange={(e) => setCountry(e.target.value)}
              style={{ width: "100%", maxWidth: 420, padding: "13px 14px", border: "1.5px solid var(--line)", borderRadius: 10, fontSize: 15, fontFamily: "inherit", marginBottom: 8 }}>
              {REGIONS.map((r) => (
                <optgroup key={r.key} label={r.label}>
                  {[...r.countries].sort((a, b) => a.n.localeCompare(b.n)).map((c) => (
                    <option key={c.c} value={c.c}>{c.f} {c.n} ({c.cur})</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>
              {regionLabel ? <>Region: <strong>{regionLabel}</strong> · </> : null}Billed in <strong>{cur}</strong> · {entry?.country.n} VAT {vatPct}%
            </p>

            <div className="sec-head" style={{ margin: "40px 0 18px" }}>
              <div className="eyebrow">Step 2</div>
              <h2 style={{ fontSize: 24 }}>Choose your IPM</h2>
            </div>

            {loading ? <p style={{ color: "var(--muted)" }}>Loading membership options…</p> : tiers.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No membership tiers are configured yet.</p>
            ) : (
              <div className="grid tiers">
                {tiers.map((t) => {
                  const isSel = t.id === tier;
                  const price = rateFor(t, country, rates);
                  return (
                    <button key={t.id} onClick={() => setTier(t.id)} className={"tier" + (isSel ? " pop" : "")}
                      style={{ textAlign: "left", cursor: "pointer", outline: isSel ? "2px solid var(--navy)" : "none", background: isSel ? "#fff8df" : "#fff" }}>
                      {t.is_popular && <div className="pill">MOST POPULAR</div>}
                      <h3>{t.label}</h3>
                      <div className="price">€{price.toFixed(0)}<span>/yr</span></div>
                      <div className="cur">+ {vatPct}% VAT · in {cur}</div>
                      {t.description && <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 0" }}>{t.description}</p>}
                      <ul>{(t.features ?? []).map((f, i) => <li key={i}>{f}</li>)}</ul>
                      {isSel && <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: "#8a6300" }}>✓ SELECTED</div>}
                    </button>
                  );
                })}
              </div>
            )}

            {selected && (
              <div style={{ marginTop: 34, padding: 24, border: "1.5px solid var(--line)", borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{selected.label} IPM · {entry?.country.f} {entry?.country.n}</div>
                  <div style={{ fontSize: 26, fontWeight: 900 }}>{money(total)} <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted)" }}>/yr</span></div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{money(base)} + {money(vatAmt)} VAT{cur !== "EUR" ? ` · charged in ${cur}` : ""}</div>
                </div>
                <button className="btn btn-primary" onClick={onContinue} style={{ padding: "14px 28px" }}>Continue →</button>
              </div>
            )}
            <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 12 }}>
              Next: create your account, then checkout. Your IPM is one global record, valid everywhere Global Sports runs. Discount codes apply at checkout.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
