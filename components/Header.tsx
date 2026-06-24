import Link from "next/link";
import MainNav from "./MainNav";

export default function Header() {
  return (
    <header className="site">
      <div className="wrap nav">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/global-icon-white-blue.png" alt="Global Sports" />
          <div className="name">
            GLOBAL SPORTS<small>CHAMPIONSHIP PROGRAM</small>
          </div>
        </Link>
        <MainNav />
      </div>
    </header>
  );
}
