import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const PROTECTED_PATHS   = ["/dashboard", "/reader"];
const ADMIN_PATHS       = ["/admin"];
const AUTH_PATHS        = ["/auth/login", "/auth/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Rate-limit headers (informational) ──────────────────────────────────
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow"); // overridden per-route via metadata

  // ── Authentication guards ────────────────────────────────────────────────
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAdmin     = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin) {
    const session = await auth();

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
    const session = await auth();
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard/notes", req.url));
    }
  }

  // ── Security headers (belt-and-suspenders beyond next.config) ────────────
  const response = NextResponse.next();
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Download-Options",     "noopen");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico / manifest.json / sw.js / robots.txt / sitemap.xml
     * - public assets (png, jpg, svg, webp, ico, css, js)
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|sitemap.xml|icon-|apple-touch|screenshots|.*\\.(?:png|jpg|jpeg|webp|svg|ico|css|js|woff2?)).*)",
  ],
};
