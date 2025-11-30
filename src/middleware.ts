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
    // If logged in and on login/register, redirect to workspace selection
    if (
      isLoggedIn &&
      (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")
    ) {
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

  // For root path, redirect to onboarding to select/create company
  if (nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/onboarding", nextUrl));
  }

  // For legacy dashboard routes, redirect to onboarding
  const legacyDashboardRoutes = [
    "/overview",
    "/applications",
    "/hitl",
    "/activity",
    "/settings",
  ];
  if (legacyDashboardRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
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
