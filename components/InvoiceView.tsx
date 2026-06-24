"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { money, fmtDate } from "@/lib/org";

type Data = {
  invoice_number: string | null; invoice_issued_at: string | null;
  status: string | null; payment_method: string | null; paid_at: string | null;
  entry_fee: number | null; vat_amount: number | null; vat_rate: number | null;
  total_charged: number | null; currency: string | null;
  teams: { name: string; city: string | null; contact_email: string | null } | null;
  tournaments: { name: string; start_date: string | null; end_date: string | null; countries: { name: string } | null } | null;
};

export default function InvoiceView({ tournamentId, regId }: { tournamentId: string; regId: string }) {
  const [d, setD] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from("tournament_registrations")
        .select("invoice_number,invoice_issued_at,status,payment_method,paid_at,entry_fee,vat_amount,vat_rate,total_charged,currency,teams(name,city,contact_email),tournaments(name,start_date,end_date,countries(name))")
        .eq("id", regId).maybeSingle();
      setD(data as unknown as Data);
      setLoading(false);
    })();
  }, [regId]);

  if (loading) return <main className="wrap" style={{ padding: "60px 24px" }}><p style={{ color: "var(--muted)" }}>Loading invoice…</p></main>;
  if (!d) return <main className="wrap" style={{ padding: "60px 24px" }}><h1 style={{ fontWeight: 900 }}>Invoice not found</h1><Link className="btn btn-dark" href={`/organizer/${tournamentId}`} style={{ marginTop: 14 }}>Back</Link></main>;

  const cur = d.currency ?? "EUR";
  const fee = d.entry_fee ?? 0;
  const vatAmt = d.vat_amount ?? 0;
  const total = d.total_charged ?? fee + vatAmt;
  const paid = d.status === "registered" || d.status === "paid";

  return (
    <main style={{ background: "#f4f6fa", minHeight: "100vh", padding: "28px 16px" }}>
      <div className="inv-actions" style={{ maxWidth: 760, margin: "0 auto 16px", display: "flex", justifyContent: "space-between" }}>
        <Link className="btn btn-ghost" href={`/organizer/${tournamentId}`}>← Back to event</Link>
        <button className="btn btn-dark" onClick={() => window.print()}>Print / Save PDF</button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", background: "#fff", borderRadius: 14, padding: "44px 48px", boxShadow: "0 2px 18px rgba(10,22,40,.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--navy)", paddingBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "var(--navy)", letterSpacing: .5 }}>GLOBAL SPORTS</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Tournament registration</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>INVOICE</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{d.invoice_number ?? "—"}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{fmtDate(d.invoice_issued_at ?? null)}</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 26, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: .5, color: "var(--muted)" }}>Billed to</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{d.teams?.name ?? "—"}</div>
            {d.teams?.city && <div style={{ color: "var(--muted)", fontSize: 14 }}>{d.teams.city}</div>}
            {d.teams?.contact_email && <div style={{ color: "var(--muted)", fontSize: 14 }}>{d.teams.contact_email}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: .5, color: "var(--muted)" }}>Event</div>
            <div style={{ fontWeight: 800, fontSize: 16, marginTop: 4 }}>{d.tournaments?.name ?? "—"}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{d.tournaments?.countries?.name}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>{fmtDate(d.tournaments?.start_date ?? null)}{d.tournaments?.end_date ? ` – ${fmtDate(d.tournaments.end_date)}` : ""}</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 28, fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f4f6fa" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", borderRadius: "8px 0 0 8px" }}>Description</th>
              <th style={{ textAlign: "right", padding: "10px 12px", borderRadius: "0 8px 8px 0" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: "12px" }}>Team entry — {d.tournaments?.name}</td><td style={{ padding: "12px", textAlign: "right" }}>{money(fee, cur)}</td></tr>
            <tr><td style={{ padding: "12px", color: "var(--muted)" }}>VAT ({((d.vat_rate ?? 0) * 100).toFixed(0)}%)</td><td style={{ padding: "12px", textAlign: "right", color: "var(--muted)" }}>{money(vatAmt, cur)}</td></tr>
          </tbody>
          <tfoot>
            <tr style={{ borderTop: "2px solid var(--navy)" }}><td style={{ padding: "14px 12px", fontWeight: 900, fontSize: 17 }}>Total</td><td style={{ padding: "14px 12px", textAlign: "right", fontWeight: 900, fontSize: 17 }}>{money(total, cur)} {cur}</td></tr>
          </tfoot>
        </table>

        <div style={{ marginTop: 22, display: "inline-block", padding: "8px 16px", borderRadius: 999, fontWeight: 800, fontSize: 14, background: paid ? "#e1f8ea" : "#fff4e0", color: paid ? "#138a45" : "#8a6300" }}>
          {paid ? `PAID — ${d.payment_method === "bank_transfer" ? "Bank transfer" : d.payment_method === "cash" ? "Cash" : "Online"}${d.paid_at ? ` · ${fmtDate(d.paid_at)}` : ""}` : "AWAITING PAYMENT"}
        </div>

        <p style={{ marginTop: 30, fontSize: 12, color: "var(--muted)", lineHeight: 1.6, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          Issued via Global Sports on behalf of the event organizer. For funding-body submissions, this document confirms the registration fee for the team and event named above. Organizer VAT and legal details can be added in event settings.
        </p>
      </div>

      <style>{`@media print{.inv-actions{display:none!important}body{background:#fff}}`}</style>
    </main>
  );
}
