import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get("Authentication");

  const unprotectedPaths = ["/auth/login", "/auth/register"];
  if (unprotectedPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!cookie?.value) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
