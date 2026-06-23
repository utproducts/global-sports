"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, PRESENCE, ALL_COUNTRIES } from "@/lib/countries";
import Flag from "./Flag";

export default function CountrySwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function go(regionKey: string, code: string) {
    setOpen(false);
    setQuery("");
    router.push(`/${regionKey}/${code.toLowerCase()}`);
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? ALL_COUNTRIES.filter(
        (e) => e.country.n.toLowerCase().includes(q) || e.country.c.toLowerCase().includes(q)
      )
    : null;

  return (
    <div className="cswitch">
      <button className="cswitch-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        🌐 <span>Countries</span> <span className="cs-caret">▾</span>
      </button>

      {open && (
        <>
          <div className="cswitch-backdrop" onClick={() => setOpen(false)} />
          <div className="cswitch-panel" role="dialog" aria-label="Select a country">
            <div className="cswitch-head">
              <div className="cswitch-title">Jump to your country</div>
              <button className="cswitch-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            <input
              className="cswitch-search"
              type="text"
              placeholder="Search countries…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="cswitch-list">
              {filtered ? (
                filtered.length ? (
                  filtered.map((e) => (
                    <button key={e.country.c} className="cswitch-row" onClick={() => go(e.region.key, e.country.c)}>
                      <span className="csr-flag"><Flag code={e.country.c} /></span>
                      <span className="csr-name">{e.country.n}</span>
                      {PRESENCE[e.country.c] && <span className="csr-dot" title="Active here" />}
                    </button>
                  ))
                ) : (
                  <div className="cswitch-empty">No country matches that search.</div>
                )
              ) : (
                REGIONS.map((r) => (
                  <div key={r.key} className="cswitch-group">
                    <div className="cswitch-region">{r.label}</div>
                    {[...r.countries]
                      .sort((a, b) => a.n.localeCompare(b.n))
                      .map((c) => (
                        <button key={c.c} className="cswitch-row" onClick={() => go(r.key, c.c)}>
                          <span className="csr-flag"><Flag code={c.c} /></span>
                          <span className="csr-name">{c.n}</span>
                          {PRESENCE[c.c] && <span className="csr-dot" title="Active here" />}
                        </button>
                      ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
