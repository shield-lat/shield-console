import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Routes that require authentication but allow no company
const authOnlyRoutes = ["/onboarding"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userCompanies = req.auth?.user?.companies;
  const hasCompany = userCompanies && userCompanies.length > 0;
  const defaultCompanySlug = hasCompany ? userCompanies[0].slug : null;

  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );
  const isAuthApiRoute = nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Check if it's a company-scoped route (e.g., /acme/overview)
  const pathSegments = nextUrl.pathname.split("/").filter(Boolean);
  const isCompanyRoute =
    pathSegments.length >= 2 &&
    !publicRoutes.some((r) => nextUrl.pathname.startsWith(r)) &&
    !isApiRoute &&
    !isAuthOnlyRoute;

  // Always allow auth API routes
  if (isAuthApiRoute) {
    return NextResponse.next();
  }

  // Allow other API routes (they handle their own auth)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    // If logged in and on login/register, redirect appropriately
    if (
      isLoggedIn &&
      (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")
    ) {
      // If user has a company, go to dashboard; otherwise, onboarding
      if (hasCompany && defaultCompanySlug) {
        return NextResponse.redirect(
          new URL(`/${defaultCompanySlug}/overview`, nextUrl)
        );
      }
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
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

  // Allow onboarding route for authenticated users
  if (isAuthOnlyRoute) {
    return NextResponse.next();
  }

  // Allow company-scoped routes for authenticated users
  if (isCompanyRoute) {
    return NextResponse.next();
  }

  // For root path, redirect based on company status
  if (nextUrl.pathname === "/") {
    if (hasCompany && defaultCompanySlug) {
      return NextResponse.redirect(
        new URL(`/${defaultCompanySlug}/overview`, nextUrl)
      );
    }
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // For legacy dashboard routes, redirect appropriately
  const legacyDashboardRoutes = [
    "/overview",
    "/applications",
    "/hitl",
    "/activity",
    "/settings",
    "/policies",
  ];
  if (legacyDashboardRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (hasCompany && defaultCompanySlug) {
      // Preserve the path, just prepend company slug
      const newPath = `/${defaultCompanySlug}${nextUrl.pathname}`;
      return NextResponse.redirect(new URL(newPath, nextUrl));
    }
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
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
