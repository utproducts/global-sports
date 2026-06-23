"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS, PRESENCE, byCode, ALL_COUNTRIES, COUNTRY_CONTINENT, continentByKey, type CountryEntry } from "@/lib/countries";
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
      const mod = await import("jsvectormap");
      const JsVectorMap = mod.default;
      // world map data registers itself onto the JsVectorMap global
      (globalThis as any).jsVectorMap = JsVectorMap;
      await import("jsvectormap/dist/maps/world.js");
      if (cancelled || !mapEl.current) return;

      // jsvectormap series colors values through an ordinal SCALE (category -> color).
      let activeSet = new Set<string>(Object.keys(PRESENCE));
      const buildValues = () => {
        const v: Record<string, string> = {};
        for (const r of REGIONS)
          for (const c of r.countries)
            v[c.c] = activeSet.has(c.c) ? "active" : "inProgram";
        return v;
      };

      // 1) Paint immediately from the known operating set — reliable, no waiting.
      map = new JsVectorMap({
        selector: mapEl.current,
        map: "world",
        zoomButtons: true,
        zoomOnScroll: false,
        backgroundColor: "transparent",
        regionStyle: {
          initial: { fill: "#27406a", stroke: "#0a1628", strokeWidth: 0.4, fillOpacity: 1 },
          hover: { cursor: "pointer" }, // per-country hover disabled; whole-region hover handled below
        },
        series: {
          regions: [
            { attribute: "fill", scale: { active: "#f5c518", inProgram: "#3a5fa0" }, values: buildValues() },
          ],
        },
        onRegionTooltipShow(_e: any, tooltip: any, code: string) {
          const cont = continentByKey(COUNTRY_CONTINENT[code]);
          if (cont) tooltip.text(`${cont.label} — click to explore`, true);
          else tooltip.text("", true);
        },
        onRegionClick(_e: any, code: string) {
          const cont = COUNTRY_CONTINENT[code];
          if (cont) router.push(`/${cont}`); // continent page
        },
      });

      // Continent-level hover: hovering ANY country brightens its whole continent.
      const GOLD = "#f5c518", BLUE = "#3a5fa0", NAVY = "#27406a", HOVER = "#ffd84a";
      const nodeToCode = new Map<Element, string>();
      const continentCodes: Record<string, string[]> = {};
      Object.keys((map as any).regions || {}).forEach((code) => {
        const node = (map as any).regions[code]?.element?.shape?.node as Element | undefined;
        if (node) nodeToCode.set(node, code);
        const cont = COUNTRY_CONTINENT[code];
        if (cont) (continentCodes[cont] ||= []).push(code);
      });
      const baseColor = (code: string) => (activeSet.has(code) ? GOLD : byCode[code] ? BLUE : NAVY);
      const setColor = (code: string, color: string) => {
        const el = (map as any).regions[code]?.element;
        if (el) { try { el.setStyle("fill", color); } catch {} } // fill only — keep the borders
      };
      const paintContinent = (cont: string, hovering: boolean) => {
        (continentCodes[cont] || []).forEach((code) => setColor(code, hovering ? HOVER : baseColor(code)));
      };
      let currentCont: string | null = null;
      const onOver = (e: Event) => {
        const code = nodeToCode.get(e.target as Element);
        const cont = code ? COUNTRY_CONTINENT[code] : null;
        if (cont !== currentCont) {
          if (currentCont) paintContinent(currentCont, false);
          if (cont) paintContinent(cont, true);
          currentCont = cont;
        }
      };
      const onLeave = () => { if (currentCont) { paintContinent(currentCont, false); currentCont = null; } };
      mapEl.current.addEventListener("mouseover", onOver);
      mapEl.current.addEventListener("mouseleave", onLeave);

      // 2) Enhance with LIVE data (countries with teams/events) — non-blocking.
      if (supabase) {
        (async () => {
          try {
            const [teamsRes, eventsRes] = await Promise.all([
              supabase.from("teams").select("countries(code)"),
              supabase.from("tournament_summary").select("country_code"),
            ]);
            const live = new Set<string>();
            (teamsRes.data as { countries?: { code?: string } }[] | null)?.forEach((r) => {
              if (r.countries?.code) live.add(r.countries.code);
            });
            (eventsRes.data as { country_code?: string }[] | null)?.forEach((r) => {
              if (r.country_code) live.add(r.country_code);
            });
            if (live.size && map && !cancelled) {
              activeSet = live;
              map.series.regions[0].setValues(buildValues());
            }
          } catch {
            /* keep the immediate static coloring */
          }
        })();
      }
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
          <span><span className="dot live" /> In our program</span>
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
      <div className="map-box map-flat"><div ref={mapEl} style={{ width: "100%", height: "100%" }} /></div>
    </>
  );
}
