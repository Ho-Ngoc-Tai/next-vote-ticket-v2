// src/proxy.ts
import { AUTH_SIGNIN_PAGE, HOME_PAGE } from "@routes/web";
import { WEB_PRIVATE_ROUTE } from "@routes/web.private";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE_NAME = process.env.COOKIE_TOKEN_NAME || "vtt";
const REFRESH_COOKIE_NAME = process.env.COOKIE_REFRESH_TOKEN_NAME || "vttr";

/* ================= AUTH CHECK ================= */
function isAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  return Boolean(token || refreshToken);
}

/* ================= SECURITY WRAPPER ================= */
function secure(resp: NextResponse) {
  resp.headers.set("X-Frame-Options", "DENY");
  resp.headers.set("X-Content-Type-Options", "nosniff");
  resp.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  resp.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  resp.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  return resp;
}

/* ================= MAIN PROXY HANDLER ================= */
export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone(); // Next.js URL object
  const pathname = url.pathname;
  const auth = isAuthenticated(req);

  // --- 1) Bypass SEO / static / special files ---
  const bypassPaths = ["/robots.txt", "/sitemap.xml", "/favicon.ico"];
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || bypassPaths.includes(pathname)) {
    return secure(NextResponse.next());
  }

  // --- 2) Redirect nếu đã login nhưng vào trang signin ---
  if ([AUTH_SIGNIN_PAGE].includes(pathname) && auth) {
    return secure(NextResponse.redirect(new URL(HOME_PAGE, req.nextUrl.origin)));
  }

  // --- 3) Các route private yêu cầu auth ---
  if (WEB_PRIVATE_ROUTE.includes(pathname)) {
    if (!auth) {
      const to = new URL(AUTH_SIGNIN_PAGE, req.nextUrl.origin);
      to.searchParams.set("redirect", pathname);
      return secure(NextResponse.redirect(to));
    }
    return secure(NextResponse.next());
  }

  // --- 4) Default: cho phép truy cập, áp dụng security headers ---
  return secure(NextResponse.next());
}

/* ================= CONFIG ================= */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // Áp dụng proxy cho tất cả trừ static/image/favicon
  ],
};
