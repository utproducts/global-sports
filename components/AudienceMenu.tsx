"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { href: "/players", icon: "🥎", title: "Players", desc: "Membership, events & your world ranking" },
  { href: "/teams", icon: "👥", title: "Teams", desc: "Rosters, registration & team ranking" },
  { href: "/organizers", icon: "🗓️", title: "Organizers", desc: "Run tournaments — brackets, pay, payouts" },
  { href: "/leagues", icon: "🏆", title: "Leagues", desc: "Season-long league play" },
];

export default function AudienceMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="amenu" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="amenu-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        For you <span className="cs-caret">▾</span>
      </button>
      {open && (
        <div className="amenu-panel" role="menu">
          {ITEMS.map((i) => (
            <Link key={i.href} href={i.href} className="amenu-row" onClick={() => setOpen(false)}>
              <span className="amenu-ic">{i.icon}</span>
              <span>
                <span className="amenu-title">{i.title}</span>
                <span className="amenu-desc">{i.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
