import Link from "next/link";

export default function CountryNav({
  region,
  code,
  name,
  flag,
  active,
}: {
  region: string;
  code: string;
  name: string;
  flag: string;
  active?: "overview" | "events" | "teams";
}) {
  const base = `/${region}/${code.toLowerCase()}`;
  const items: { h: string; href: string; key: string }[] = [
    { h: "Overview", href: base, key: "overview" },
    { h: "Events", href: `${base}#events`, key: "events" },
    { h: "Teams", href: `${base}#teams`, key: "teams" },
    { h: "Membership", href: `/membership?country=${code}`, key: "membership" },
  ];
  return (
    <div className="country-nav">
      <div className="wrap country-nav-inner">
        <Link href={base} className="cn-id"><span className="cn-flag">{flag}</span> {name}</Link>
        <nav className="cn-links">
          {items.map((i) => (
            <Link key={i.key} href={i.href} className={active === i.key ? "active" : ""}>{i.h}</Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
