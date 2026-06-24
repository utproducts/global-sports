"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ACCOUNT_ROLES } from "@/lib/roles";

export default function SignupPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<string[]>(["player"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function toggle(key: string) {
    setRoles((r) => (r.includes(key) ? r.filter((k) => k !== key) : [...r, key]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) { setError("Auth is not configured."); return; }
    if (roles.length === 0) { setError("Pick at least one role."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: first, last_name: last, roles } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    if (data.session) window.location.href = "/dashboard";
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 560 }}>
        <Link href="/" className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/global-icon-white-blue.png" alt="" />
          <span>GLOBAL SPORTS</span>
        </Link>
        {done ? (
          <>
            <h1>Almost there</h1>
            <p className="auth-sub">Account created. If email confirmation is on, verify your inbox, then <Link href="/login">log in</Link>.</p>
          </>
        ) : (
          <>
            <h1>Create your account</h1>
            <p className="auth-sub">Pick everything that applies — you can be more than one.</p>
            <form onSubmit={onSubmit}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#33404f", display: "block", marginBottom: 8 }}>I am a…</label>
                <div className="role-grid">
                  {ACCOUNT_ROLES.map((r) => {
                    const on = roles.includes(r.key);
                    return (
                      <button type="button" key={r.key} onClick={() => toggle(r.key)} className={"role-card" + (on ? " on" : "")}>
                        <span className="role-check">{on ? "✓" : ""}</span>
                        <span className="role-name">{r.label}</span>
                        <span className="role-desc">{r.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <label style={{ flex: 1 }}>First name<input value={first} onChange={(e) => setFirst(e.target.value)} required autoComplete="given-name" /></label>
                <label style={{ flex: 1 }}>Last name<input value={last} onChange={(e) => setLast(e.target.value)} required autoComplete="family-name" /></label>
              </div>
              <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
              <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" /></label>
              {error && <div className="auth-error">{error}</div>}
              <button className="btn btn-dark" type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
            </form>
          </>
        )}
        <p className="auth-foot">Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </main>
  );
}
