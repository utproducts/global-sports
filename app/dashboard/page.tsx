"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { HIERARCHY, tierForRole, type Tier } from "@/lib/roles";
import CountrySwitcher from "@/components/CountrySwitcher";

type Profile = { first_name?: string; last_name?: string; role?: string; email?: string };
type Scope = { role: string; scope_type: string; scope_value: string | null };

type Link2 = { label: string; href: string; soon?: boolean };
type Module = { title: string; links: Link2[] };
const ROLE_MODULES: Record<string, Module> = {
  player: { title: "Player", links: [
    { label: "My membership", href: "/membership" },
    { label: "Global rankings", href: "/rankings" },
    { label: "Find an event", href: "/events" },
    { label: "Edit my player profile", href: "#", soon: true },
  ] },
  coach: { title: "Coach", links: [
    { label: "My teams", href: "#", soon: true },
    { label: "Manage roster", href: "#", soon: true },
    { label: "Register a team", href: "/events" },
  ] },
  manager: { title: "Team Manager", links: [
    { label: "My teams", href: "#", soon: true },
    { label: "Register for an event", href: "/events" },
    { label: "Team rankings", href: "/rankings" },
  ] },
  organizer: { title: "Event Organizer", links: [
    { label: "Create an event", href: "#", soon: true },
    { label: "Manage my events", href: "#", soon: true },
    { label: "Flagship programs", href: "/events" },
  ] },
  league: { title: "League Operator", links: [
    { label: "Manage leagues", href: "/leagues" },
    { label: "Create a league", href: "#", soon: true },
    { label: "Standings & results", href: "/leagues" },
  ] },
};

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [tier, setTier] = useState<Tier>(HIERARCHY[HIERARCHY.length - 1]);
  const [membership, setMembership] = useState<{ tier: string; status: string; expires_at: string | null } | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      if (!supabase) { router.push("/login"); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
      setEmail(session.user.email ?? "");
      const md = session.user.user_metadata as { roles?: string[] } | undefined;
      if (md?.roles?.length) setRoles(md.roles);

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

          const { data: mem } = await supabase
            .from("ipr_memberships")
            .select("tier,status,expires_at")
            .eq("player_id", uid)
            .order("activated_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (mem) setMembership(mem as { tier: string; status: string; expires_at: string | null });
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
            <CountrySwitcher />
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

        <div style={{ marginTop: 22, maxWidth: 640, borderRadius: 14, padding: "18px 22px", border: "1.5px solid var(--line)", background: membership && membership.status === "active" ? "#fff8df" : "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "var(--muted)" }}>Global Sports Membership</div>
            {membership ? (
              <div style={{ fontWeight: 800, fontSize: 18, textTransform: "capitalize" }}>
                {membership.tier} · <span style={{ color: membership.status === "active" ? "#138a45" : "#8a6300" }}>{membership.status}</span>
                {membership.expires_at && <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)" }}> · renews {new Date(membership.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>}
              </div>
            ) : (
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--muted)" }}>No active membership</div>
            )}
          </div>
          {!membership && <Link className="btn btn-primary" href="/membership">Get membership</Link>}
        </div>

        {roles.length > 0 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "34px 0 4px" }}>Your roles &amp; tools</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Built from the roles you chose at sign-up. Add more anytime.</p>
            <div className="dash-mods">
              {roles.filter((r) => ROLE_MODULES[r]).map((r) => {
                const m = ROLE_MODULES[r];
                return (
                  <div key={r} className="dash-mod">
                    <span className="mh">{m.title}</span>
                    {m.links.map((l) => (
                      l.soon
                        ? <a key={l.label} className="soon">{l.label} <span className="sb">SOON</span></a>
                        : <Link key={l.label} href={l.href}>{l.label} <span aria-hidden>→</span></Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}

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
