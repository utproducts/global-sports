"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Supported languages. EN and ES are seeded; IT and DE fall back to EN until translated.
export const LANGS = [
  { code: "en", label: "English", flag: "GB" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "it", label: "Italiano", flag: "IT" },
  { code: "de", label: "Deutsch", flag: "DE" },
] as const;
export type Lang = (typeof LANGS)[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.foryou": "For you",
  "nav.flagship": "Flagship Events",
  "nav.champions": "Champions",
  "nav.rankings": "Rankings",
  "nav.membership": "Membership",
  "nav.login": "Log in",
  "nav.dashboard": "Dashboard",
  "common.players": "Players",
  "common.teams": "Teams",
  "common.organizers": "Organizers",
  "common.leagues": "Leagues",
  "common.language": "Language",
};

const es: Dict = {
  "nav.foryou": "Para ti",
  "nav.flagship": "Eventos destacados",
  "nav.champions": "Campeones",
  "nav.rankings": "Clasificación",
  "nav.membership": "Membresía",
  "nav.login": "Iniciar sesión",
  "nav.dashboard": "Panel",
  "common.players": "Jugadores",
  "common.teams": "Equipos",
  "common.organizers": "Organizadores",
  "common.leagues": "Ligas",
  "common.language": "Idioma",
};

// Partial seeds — anything missing falls back to English.
const it: Dict = {
  "nav.flagship": "Eventi principali",
  "nav.champions": "Campioni",
  "nav.rankings": "Classifica",
  "nav.membership": "Iscrizione",
  "nav.login": "Accedi",
  "common.language": "Lingua",
};
const de: Dict = {
  "nav.flagship": "Flaggschiff-Events",
  "nav.champions": "Meister",
  "nav.rankings": "Rangliste",
  "nav.membership": "Mitgliedschaft",
  "nav.login": "Anmelden",
  "common.language": "Sprache",
};

const DICTS: Record<Lang, Dict> = { en, es, it, de };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };
const I18nContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("gs_lang") as Lang | null;
      if (stored && DICTS[stored]) { setLangState(stored); return; }
      const nav = navigator.language.slice(0, 2) as Lang;
      if (DICTS[nav]) setLangState(nav);
    } catch { /* ignore */ }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("gs_lang", l); document.documentElement.lang = l; } catch { /* ignore */ }
  };

  const t = (key: string) => DICTS[lang][key] ?? en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
