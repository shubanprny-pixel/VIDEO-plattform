import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Coarse-grained, cookie-presence-only check for fast redirects/UX.
// This is NOT the authorization boundary — every protected Server
// Component/Action/Route Handler must still call auth.api.getSession()
// and (for admin/enrollment) requireAdmin()/isEnrolled() itself.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/learn/:path*", "/admin/:path*"],
};
