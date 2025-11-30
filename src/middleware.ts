import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// Routes that require authentication but not company setup
const authOnlyRoutes = ["/onboarding"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const hasCompany = !!req.auth?.user?.companyId;

  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthApiRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Always allow auth API routes
  if (isAuthApiRoute) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    // If logged in and trying to access login/register, redirect appropriately
    if (isLoggedIn) {
      if (!hasCompany) {
        return NextResponse.redirect(new URL("/onboarding", nextUrl));
      }
      return NextResponse.redirect(new URL("/overview", nextUrl));
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (!isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Check company setup for non-onboarding routes
  if (!hasCompany && !isAuthOnlyRoute && !isApiRoute) {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // If user has company and is on onboarding, redirect to dashboard
  if (hasCompany && isAuthOnlyRoute) {
    return NextResponse.redirect(new URL("/overview", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

