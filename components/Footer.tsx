import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot">
          <div>
            <div className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/global-icon-white.png" alt="" style={{ height: 40, width: 40, objectFit: "contain" }} />
              <div className="name" style={{ color: "#fff", fontWeight: 900 }}>GLOBAL SPORTS</div>
            </div>
            <small>The worldwide adult slow-pitch championship program. Play local, compete global.</small>
          </div>
          <div className="foot-links">
            <div className="foot-col">
              <h4>Program</h4>
              <Link href="/#why">Why us</Link>
              <Link href="/#how">How it works</Link>
              <Link href="/#membership">Membership</Link>
            </div>
            <div className="foot-col">
              <h4>Regions</h4>
              <Link href="/europe">Europe</Link>
              <Link href="/middle-east">Middle East</Link>
              <Link href="/asia">Asia</Link>
              <Link href="/americas">Americas</Link>
            </div>
            <div className="foot-col">
              <h4>Account</h4>
              <Link href="/#map">Select country</Link>
              <Link href="/#">Log in</Link>
              <Link href="/#">Become a director</Link>
            </div>
          </div>
        </div>
        <div className="copy">
          <span>© 2026 Global Sports. All rights reserved.</span>
          <span>Next.js · Supabase · Stripe</span>
        </div>
      </div>
    </footer>
  );
}
