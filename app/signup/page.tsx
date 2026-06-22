"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) { setError("Auth is not configured."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: first, last_name: last } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    // If the project auto-confirms, a session is returned immediately.
    if (data.session) window.location.href = "/dashboard";
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/global-icon.png" alt="" />
          <span>GLOBAL SPORTS</span>
        </Link>
        {done ? (
          <>
            <h1>Almost there</h1>
            <p className="auth-sub">
              We&apos;ve created your account. If email confirmation is enabled, check your inbox to verify, then{" "}
              <Link href="/login">log in</Link>.
            </p>
          </>
        ) : (
          <>
            <h1>Create your account</h1>
            <p className="auth-sub">One membership, valid in every Global Sports country.</p>
            <form onSubmit={onSubmit}>
              <div style={{ display: "flex", gap: 10 }}>
                <label style={{ flex: 1 }}>First name
                  <input value={first} onChange={(e) => setFirst(e.target.value)} required autoComplete="given-name" />
                </label>
                <label style={{ flex: 1 }}>Last name
                  <input value={last} onChange={(e) => setLast(e.target.value)} required autoComplete="family-name" />
                </label>
              </div>
              <label>Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </label>
              <label>Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
              </label>
              {error && <div className="auth-error">{error}</div>}
              <button className="btn btn-dark" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>
          </>
        )}
        <p className="auth-foot">Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </main>
  );
}
