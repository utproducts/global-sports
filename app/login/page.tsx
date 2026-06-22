"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabase) { setError("Auth is not configured."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push("/dashboard");
  }

  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <Link href="/" className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/global-icon.png" alt="" />
          <span>GLOBAL SPORTS</span>
        </Link>
        <h1>Log in</h1>
        <p className="auth-sub">Players, coaches and directors — access your dashboard.</p>
        <form onSubmit={onSubmit}>
          <label>Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn btn-dark" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>
        <p className="auth-foot">Don&apos;t have a membership yet? <Link href="/#map">Pick your country</Link> to get started.</p>
      </div>
    </main>
  );
}
