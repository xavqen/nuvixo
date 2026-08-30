// middleware.ts
import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config"; // <-- Import config (adjust path if needed)

// Initialize NextAuth with the Edge-safe config
const { auth } = NextAuth(authConfig);

const PROTECTED_PATHS   = ["/dashboard", "/reader"];
const ADMIN_PATHS       = ["/admin"];
const AUTH_PATHS        = ["/auth/login", "/auth/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth; // Passed automatically by the auth() wrapper

  // ── Authentication guards ────────────────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAdmin     = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin) {
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)) {
      return NextResponse.redirect(new URL("/dashboard/notes", req.url));
    }
  }

  // ── Redirect authenticated users away from auth pages ──────────────────
  if (isAuthPage) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard/notes", req.url));
    }
  }

  // ── Security headers (belt-and-suspenders beyond next.config) ────────────
  const response = NextResponse.next();
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Download-Options",     "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  
  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard") || pathname.startsWith("/reader") || pathname.startsWith("/api")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  
  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|sitemap.xml|icon-|apple-touch|screenshots|.*\\.(?:png|jpg|jpeg|webp|svg|ico|css|js|woff2?)).*)",
  ],
};