"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PRESENCE, type Country } from "@/lib/countries";
import "jsvectormap/dist/jsvectormap.min.css";

export default function ContinentMap({ regionKey, countries }: { regionKey: string; countries: Country[] }) {
  const mapEl = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const byCodeLocal: Record<string, Country> = {};
  countries.forEach((c) => (byCodeLocal[c.c] = c));

  function go(code: string) {
    setOpen(false);
    router.push(`/${regionKey}/${code.toLowerCase()}`);
  }

  useEffect(() => {
    let map: any;
    let cancelled = false;
    (async () => {
      const mod = await import("jsvectormap");
      const J = mod.default;
      (globalThis as any).jsVectorMap = J;
      await import("jsvectormap/dist/maps/world.js");
      if (cancelled || !mapEl.current) return;

      const codes = countries.map((c) => c.c);
      const values: Record<string, string> = {};
      codes.forEach((c) => (values[c] = PRESENCE[c] ? "active" : "inProgram"));

      map = new J({
        selector: mapEl.current,
        map: "world",
        zoomButtons: true,
        zoomOnScroll: false,
        backgroundColor: "transparent",
        regionStyle: {
          initial: { fill: "#27406a", stroke: "#0a1628", strokeWidth: 0.4, fillOpacity: 1 },
          hover: { fill: "#ffd84a", fillOpacity: 1, cursor: "pointer" },
        },
        series: { regions: [{ attribute: "fill", scale: { active: "#f5c518", inProgram: "#3a5fa0" }, values }] },
        onRegionTooltipShow(_e: any, tt: any, code: string) {
          const info = byCodeLocal[code];
          if (info) tt.text(`${info.f} ${info.n}`, true);
        },
        onRegionClick(_e: any, code: string) {
          if (byCodeLocal[code]) go(code);
        },
      });
      try { map.setFocus({ regions: codes.filter((c) => map.regions[c]), animate: false }); } catch {}
    })();
    return () => { cancelled = true; try { map?.destroy(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim().toLowerCase();
  const hits = q ? countries.filter((c) => c.n.toLowerCase().includes(q) || c.c.toLowerCase().includes(q)).sort((a, b) => a.n.localeCompare(b.n)).slice(0, 8) : [];

  return (
    <div>
      <div className="map-tools" style={{ justifyContent: "center" }}>
        <div className="legend">
          <span><span className="dot data" /> We&apos;re active here</span>
          <span><span className="dot live" /> Select to enter</span>
        </div>
        <div className="csearch-wrap" onBlur={() => setTimeout(() => setOpen(false), 150)}>
          <span className="si">🔎</span>
          <input type="text" placeholder="Search this region…" value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} />
          {open && hits.length > 0 && (
            <div className="csearch-results">
              {hits.map((c) => (
                <div key={c.c} className="row" onMouseDown={() => go(c.c)}>
                  <span style={{ fontSize: 18 }}>{c.f}</span><span>{c.n}</span>
                  {PRESENCE[c.c] && <span className="tag">{PRESENCE[c.c].teams} TEAMS</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="map-box" style={{ height: "min(520px,56vh)" }}><div ref={mapEl} style={{ width: "100%", height: "100%" }} /></div>
    </div>
  );
}
