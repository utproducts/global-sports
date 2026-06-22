"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, PRESENCE, byCode, ALL_COUNTRIES, type CountryEntry } from "@/lib/countries";
import { supabase } from "@/lib/supabase";
import "jsvectormap/dist/jsvectormap.min.css";

export default function WorldMap() {
  const mapEl = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  function go(entry: CountryEntry) {
    router.push(`/${entry.region.key}/${entry.country.c.toLowerCase()}`);
  }

  useEffect(() => {
    let map: any;
    let cancelled = false;

    (async () => {
      // Determine which countries we operate in — LIVE from the database
      // (any country with teams or events). Falls back to the static snapshot.
      const active = new Set<string>(Object.keys(PRESENCE));
      try {
        if (supabase) {
          const [teamsRes, eventsRes] = await Promise.all([
            supabase.from("teams").select("countries(code)"),
            supabase.from("tournament_summary").select("country_code"),
          ]);
          const live = new Set<string>();
          (teamsRes.data as { countries?: { code?: string } }[] | null)?.forEach((r) => {
            const code = r.countries?.code;
            if (code) live.add(code);
          });
          (eventsRes.data as { country_code?: string }[] | null)?.forEach((r) => {
            if (r.country_code) live.add(r.country_code);
          });
          if (live.size) { active.clear(); live.forEach((c) => active.add(c)); }
        }
      } catch {
        /* keep static fallback */
      }

      const mod = await import("jsvectormap");
      const JsVectorMap = mod.default;
      // world map data registers itself onto the JsVectorMap global
      (globalThis as any).jsVectorMap = JsVectorMap;
      await import("jsvectormap/dist/maps/world.js");
      if (cancelled || !mapEl.current) return;

      // jsvectormap series colors values through an ordinal SCALE (category -> color).
      const regionValues: Record<string, string> = {};
      for (const r of REGIONS)
        for (const c of r.countries)
          regionValues[c.c] = active.has(c.c) ? "active" : "inProgram";

      map = new JsVectorMap({
        selector: mapEl.current,
        map: "world",
        zoomButtons: true,
        zoomOnScroll: false,
        backgroundColor: "transparent",
        regionStyle: {
          initial: { fill: "#27406a", stroke: "#0a1628", strokeWidth: 0.4, fillOpacity: 1 },
          hover: { fill: "#ffd84a", fillOpacity: 1, cursor: "pointer" },
        },
        series: {
          regions: [
            {
              attribute: "fill",
              scale: { active: "#f5c518", inProgram: "#3a5fa0" },
              values: regionValues,
            },
          ],
        },
        onRegionTooltipShow(_e: any, tooltip: any, code: string) {
          const info = byCode[code];
          if (info) {
            const p = info.presence;
            const extra = p ? ` — ${p.teams} team${p.teams > 1 ? "s" : ""} active` : "";
            tooltip.text(`${info.country.f} ${info.country.n}${extra}`, true);
          }
        },
        onRegionClick(_e: any, code: string) {
          const info = byCode[code];
          if (info) go(info);
        },
      });
    })();

    return () => {
      cancelled = true;
      try { map?.destroy(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hits = query.trim()
    ? ALL_COUNTRIES.filter(
        (e) =>
          e.country.n.toLowerCase().includes(query.trim().toLowerCase()) ||
          e.country.c.toLowerCase().includes(query.trim().toLowerCase())
      )
        .sort((a, b) => a.country.n.localeCompare(b.country.n))
        .slice(0, 8)
    : [];

  return (
    <>
      <div className="map-tools">
        <div className="legend">
          <span><span className="dot data" /> We&apos;re active here</span>
          <span><span className="dot live" /> Select to enter</span>
        </div>
        <div className="csearch-wrap" onBlur={() => setTimeout(() => setOpen(false), 150)}>
          <span className="si">🔎</span>
          <input
            type="text"
            placeholder="Or search your country…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
          />
          {open && hits.length > 0 && (
            <div className="csearch-results">
              {hits.map((e) => (
                <div key={e.country.c} className="row" onMouseDown={() => go(e)}>
                  <span style={{ fontSize: 18 }}>{e.country.f}</span>
                  <span>{e.country.n}</span>
                  {e.presence && <span className="tag">{e.presence.teams} TEAMS</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="map-box"><div ref={mapEl} style={{ width: "100%", height: "100%" }} /></div>
    </>
  );
}
