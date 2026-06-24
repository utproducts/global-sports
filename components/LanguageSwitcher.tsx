"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS, useI18n, type Lang } from "@/lib/i18n";
import Flag from "@/components/Flag";

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="lang-switch" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)} aria-label="Language">
        <Flag code={current.flag} /> <span>{current.code.toUpperCase()}</span> <span className="lang-caret">▾</span>
      </button>
      {open && (
        <div className="lang-menu">
          {LANGS.map((l) => (
            <button key={l.code} className={"lang-item" + (l.code === lang ? " on" : "")} onClick={() => { setLang(l.code as Lang); setOpen(false); }}>
              <Flag code={l.flag} /> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
