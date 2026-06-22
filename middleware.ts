import { NextResponse, type NextRequest } from "next/server";

// Region subdomains → path rewrite.
// europe.globalsports.com/de  ->  internally serves /europe/de
// The landing stays on the apex/www domain.
const REGION_KEYS = ["europe", "middle-east", "middleeast", "asia", "americas"];
const ALIAS: Record<string, string> = { middleeast: "middle-east" };

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const label = host.split(":")[0].split(".")[0].toLowerCase();

  if (REGION_KEYS.includes(label)) {
    const region = ALIAS[label] || label;
    const url = req.nextUrl.clone();
    // avoid double-prefixing if the path already starts with the region
    if (!url.pathname.startsWith(`/${region}`)) {
      url.pathname = `/${region}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
