"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { HIERARCHY, tierForRole, type Tier } from "@/lib/roles";

type Profile = { first_name?: string; last_name?: string; role?: string; email?: string };
type Scope = { role: string; scope_type: string; scope_value: string | null };

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [tier, setTier] = useState<Tier>(HIERARCHY[HIERARCHY.length - 1]);

  useEffect(() => {
    (async () => {
      if (!supabase) { router.push("/login"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setEmail(session.user.email ?? "");

      const { data: prof } = await supabase
        .from("users")
        .select("id,first_name,last_name,role,email")
        .eq("supabase_auth_id", session.user.id)
        .maybeSingle();
      if (prof) {
        setProfile(prof as Profile);
        setTier(tierForRole((prof as Profile).role));
        const uid = (prof as { id?: string }).id;
        if (uid) {
          const { data: dr } = await supabase
            .from("director_roles")
            .select("role,scope_type,scope_value")
            .eq("user_id", uid)
            .eq("is_active", true);
          if (dr) setScopes(dr as Scope[]);
        }
      }
      setLoading(false);
    })();
  }, [router]);

  async function signOut() {
    await supabase?.auth.signOut();
    router.push("/login");
  }

  if (loading) return <main className="auth-wrap"><div className="auth-card"><p>Loading your dashboard…</p></div></main>;

  const name = profile?.first_name ? `${profile.first_name} ${profile.last_name ?? ""}`.trim() : email;

  return (
    <>
      <header className="site">
        <div className="wrap nav">
          <Link className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/global-icon.png" alt="Global Sports" />
            <div className="name">GLOBAL SPORTS<small>DASHBOARD</small></div>
          </Link>
          <nav className="nav-links">
            <button className="btn btn-dark" onClick={signOut}>Sign out</button>
          </nav>
        </div>
      </header>

      <main className="wrap" style={{ padding: "48px 24px" }}>
        <div className="eyebrow">Signed in</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, margin: "8px 0 4px" }}>Welcome, {name}</h1>
        <p style={{ color: "var(--muted)" }}>
          Your access level: <strong style={{ color: "var(--navy)" }}>{tier.label}</strong> — {tier.scope}.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 800, margin: "34px 0 14px" }}>Access hierarchy</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
          {HIERARCHY.map((t) => {
            const me = t.key === tier.key;
            return (
              <div key={t.key} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                padding: "14px 18px", borderRadius: 12,
                border: me ? "2px solid var(--navy)" : "1px solid var(--line)",
                background: me ? "#fff8df" : "#fff",
              }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{t.label} {me && <span style={{ color: "#8a6300", fontSize: 12, fontWeight: 800 }}>· YOU</span>}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{t.scope}</div>
                </div>
              </div>
            );
          })}
        </div>

        {scopes.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "34px 0 14px" }}>Your assignments</h2>
            <ul style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.9 }}>
              {scopes.map((s, i) => (
                <li key={i}>{s.role} — {s.scope_type}{s.scope_value ? `: ${s.scope_value}` : ""}</li>
              ))}
            </ul>
          </>
        )}

        {!profile && (
          <p style={{ marginTop: 28, color: "var(--muted)", fontSize: 14, maxWidth: 640 }}>
            You&apos;re signed in, but we couldn&apos;t find a member profile linked to this account yet.
            Once your profile is linked in the directory, your role and assignments will appear here.
          </p>
        )}
      </main>
    </>
  );
}
