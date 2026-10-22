import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic gate for the staff portal: no session cookie -> sign-in page.
 * This is a UX redirect only. The cookie is not verified here; every admin
 * page and Server Action re-verifies it with Firebase (src/lib/admin/auth.ts).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("mimar_admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
