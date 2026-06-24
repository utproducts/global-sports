"use client";

import Link from "next/link";
import AudienceMenu from "./AudienceMenu";
import CountrySwitcher from "./CountrySwitcher";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

export default function MainNav() {
  const { t } = useI18n();
  return (
    <nav className="nav-links">
      <AudienceMenu />
      <Link href="/events">{t("nav.flagship")}</Link>
      <Link href="/champions">{t("nav.champions")}</Link>
      <Link href="/rankings">{t("nav.rankings")}</Link>
      <Link href="/membership">{t("nav.membership")}</Link>
      <Link href="/login">{t("nav.login")}</Link>
      <LanguageSwitcher />
      <CountrySwitcher />
    </nav>
  );
}
