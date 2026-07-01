"use client";

import { useState } from "react";
import Link from "next/link";
import AudienceMenu from "./AudienceMenu";
import CountrySwitcher from "./CountrySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function MainNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/events", label: t("nav.flagship") },
    { href: "/champions", label: t("nav.champions") },
    { href: "/rankings", label: t("nav.rankings") },
    { href: "/membership", label: t("nav.membership") },
    { href: "/login", label: t("nav.login") },
  ];
  const audiences = [
    { href: "/players", label: t("common.players") },
    { href: "/teams", label: t("common.teams") },
    { href: "/organizers", label: t("common.organizers") },
    { href: "/leagues", label: t("common.leagues") },
  ];

  return (
    <>
      <nav className="nav-links">
        <AudienceMenu />
        {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        <LanguageSwitcher />
        <span className="nav-desktop"><CountrySwitcher /></span>
        <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
          <span /><span /><span />
        </button>
      </nav>

      {open && (
        <>
          <div className="nav-scrim" onClick={() => setOpen(false)} />
          <div className="nav-drawer">
            <div className="nav-drawer-sec">{t("nav.foryou")}</div>
            {audiences.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}
            <div className="nav-drawer-sep" />
            {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>)}
            <div className="nav-drawer-sep" />
            <div className="nav-drawer-row"><CountrySwitcher /></div>
          </div>
        </>
      )}
    </>
  );
}
