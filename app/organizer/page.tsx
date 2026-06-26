"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { TSTATUS, fmtDate, money } from "@/lib/org";

type T = {
  id: string; name: string; slug: string | null; status: string | null;
  start_date: string | null; end_date: string | null;
  max_teams: number | null; reserved_slots: number | null;
  team_fee: number | null; currency: string | null;
};

export default function OrganizerHome() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<T[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      const { data: prof } = await supabase.from("users").select("id").eq("supabase_auth_id", session.user.id).maybeSingle();
      const uid = (prof as { id?: string } | null)?.id;
      if (!uid) { setLoading(false); return; }

      const { data: ts } = await supabase
        .from("tournaments")
        .select("id,name,slug,status,start_date,end_date,max_teams,reserved_slots,team_fee,currency")
        .or(`created_by.eq.${uid},director_id.eq.${uid}`)
        .order("start_date", { ascending: false });
      const list = (ts as T[]) ?? [];
      setTournaments(list);

      if (list.length) {
        const { data: regs } = await supabase
          .from("tournament_registrations")
          .select("tournament_id")
          .in("tournament_id", list.map((t) => t.id));
        const c: Record<string, number> = {};
        (regs as { tournament_id: string }[] | null)?.forEach((r) => { c[r.tournament_id] = (c[r.tournament_id] || 0) + 1; });
        setCounts(c);
      }
      setLoading(false);
    })();
  }, [router]);

  return (
    <>
      <Header />
      <main className="wrap" style={{ padding: "48px 24px", minHeight: "60vh" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div className="eyebrow">Organizer</div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0 4px" }}>Your tournaments</h1>
            <p style={{ color: "var(--muted)" }}>Create events, manage registrations, reserve slots, and invoice teams.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn btn-ghost" href="/organizer/waivers">Fee waivers</Link>
            <Link className="btn btn-primary" href="/organizer/new">+ Create tournament</Link>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          {loading ? (
            <p style={{ color: "var(--muted)" }}>Loading…</p>
          ) : tournaments.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
              <h3 style={{ fontWeight: 800, fontSize: 18 }}>No tournaments yet</h3>
              <p style={{ color: "var(--muted)", margin: "8px 0 18px" }}>Create your first event to start taking team registrations.</p>
              <Link className="btn btn-dark" href="/organizer/new">Create your first tournament</Link>
            </div>
          ) : (
            <div className="ev-list">
              {tournaments.map((t) => {
                const st = TSTATUS[t.status ?? ""] ?? [t.status ?? "—", "#5b6675", "#eef1f6"];
                const cap = t.max_teams ?? 0;
                const reg = counts[t.id] ?? 0;
                const reserved = t.reserved_slots ?? 0;
                const pct = cap ? Math.min(100, Math.round((reg / cap) * 100)) : 0;
                return (
                  <div key={t.id} className="ev-card">
                    <div className="ev-card-main">
                      <div className="ev-card-date">
                        <span className="d">{t.start_date ? new Date(t.start_date).getDate() : "–"}</span>
                        <span className="m">{t.start_date ? new Date(t.start_date).toLocaleDateString("en-GB", { month: "short" }) : ""}</span>
                      </div>
                      <div>
                        <h3><Link href={`/organizer/${t.id}`} style={{ color: "var(--navy)" }}>{t.name}</Link></h3>
                        <p>{fmtDate(t.start_date)}{t.end_date ? ` – ${fmtDate(t.end_date)}` : ""} · {money(t.team_fee ?? 0, t.currency ?? "EUR")} entry</p>
                        <div className="cap-bar" style={{ maxWidth: 260, marginTop: 8 }}><span style={{ width: `${pct}%` }} /></div>
                        <p style={{ fontSize: 12, marginTop: 4 }}>{reg}/{cap} teams{reserved ? ` · ${reserved} slots reserved` : ""}</p>
                      </div>
                    </div>
                    <div className="ev-card-side">
                      <span className="status-pill" style={{ color: st[1], background: st[2] }}>{st[0]}</span>
                      <Link className="btn btn-dark" href={`/organizer/${t.id}`} style={{ padding: "9px 18px" }}>Manage</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
