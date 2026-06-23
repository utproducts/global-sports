"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { href: "/players", title: "Players", desc: "Membership, events & your world ranking" },
  { href: "/teams", title: "Teams", desc: "Rosters, registration & team ranking" },
  { href: "/organizers", title: "Organizers", desc: "Run tournaments — brackets, pay, payouts" },
  { href: "/leagues", title: "Leagues", desc: "Season-long league play" },
];

export default function AudienceMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="amenu">
      <button className="amenu-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        For you <span className="cs-caret">▾</span>
      </button>
      {open && (
        <>
          <div className="amenu-backdrop" onClick={() => setOpen(false)} />
          <div className="amenu-panel" role="menu">
            {ITEMS.map((i) => (
              <Link key={i.href} href={i.href} className="amenu-row" onClick={() => setOpen(false)}>
                <span className="amenu-title">{i.title}</span>
                <span className="amenu-desc">{i.desc}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
