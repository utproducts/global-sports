import Link from "next/link";
import CountrySwitcher from "./CountrySwitcher";
import AudienceMenu from "./AudienceMenu";

export default function Header() {
  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/global-icon.png" alt="Global Sports" />
          <div className="name">
            GLOBAL SPORTS<small>CHAMPIONSHIP PROGRAM</small>
          </div>
        </Link>
        <nav className="nav-links">
          <AudienceMenu />
          <Link href="/events">Flagship Events</Link>
          <Link href="/rankings">Rankings</Link>
          <Link href="/membership">Membership</Link>
          <Link href="/login">Log in</Link>
          <CountrySwitcher />
        </nav>
      </div>
    </header>
  );
}
