import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// Shield Core API URL - normalize to base URL without /v1
// Try multiple environment variable names for flexibility
function getShieldApiBaseUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SHIELD_API_URL || process.env.SHIELD_API_URL || "";
  if (!envUrl) return "";
  return envUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const SHIELD_API_BASE = getShieldApiBaseUrl();

// Log config in development
if (process.env.NODE_ENV === "development") {
  console.log(
    "[Company Layout] SHIELD_API_BASE:",
    SHIELD_API_BASE || "(not set)"
  );
}

// Validate that user has access to this company
// First check session, then verify with API if not found (for newly created companies)
async function validateCompanyAccess(
  companySlug: string,
  userCompanies:
    | Array<{ id: string; name: string; slug: string; role: string }>
    | undefined,
  accessToken: string | undefined
): Promise<{ id: string; name: string; slug: string } | null> {
  console.log("[Company Layout] Validating access to:", companySlug);
  console.log(
    "[Company Layout] Session companies:",
    userCompanies?.length || 0
  );
  console.log("[Company Layout] Has access token:", !!accessToken);
  console.log(
    "[Company Layout] SHIELD_API_BASE:",
    SHIELD_API_BASE || "(not set)"
  );

  // First, check if company is in the session
  if (userCompanies && userCompanies.length > 0) {
    const company = userCompanies.find((c) => c.slug === companySlug);
    if (company) {
      console.log("[Company Layout] Found in session:", company.id);
      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
      };
    }
    console.log("[Company Layout] Not found in session companies");
  }

  // Company not in session - check API for newly created companies
  if (SHIELD_API_BASE && accessToken) {
    try {
      console.log("[Company Layout] Checking Shield Core API...");
      const response = await fetch(`${SHIELD_API_BASE}/v1/companies`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      console.log("[Company Layout] API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(
          "[Company Layout] API returned",
          data.companies?.length || 0,
          "companies"
        );

        const apiCompany = data.companies?.find(
          (c: { slug: string }) => c.slug === companySlug
        );

        if (apiCompany) {
          console.log("[Company Layout] Found via API:", apiCompany.id);
          return {
            id: apiCompany.id,
            name: apiCompany.name,
            slug: apiCompany.slug,
          };
        }
        console.log(
          "[Company Layout] Company not found in API response. Available slugs:",
          data.companies?.map((c: { slug: string }) => c.slug).join(", ")
        );
      }
    } catch (error) {
      console.error("[Company Layout] API verification failed:", error);
    }
  } else {
    console.log(
      "[Company Layout] Cannot check API - SHIELD_API_BASE:",
      !!SHIELD_API_BASE,
      "accessToken:",
      !!accessToken
    );
  }

  console.log("[Company Layout] Company not found anywhere, returning null");
  return null;
}

export default async function CompanyDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
}) {
  const session = await auth();
  const { company: companySlug } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  // Validate company access - checks session first, then API
  const company = await validateCompanyAccess(
    companySlug,
    session.user.companies,
    session.user.accessToken
  );

  if (!company) {
    // User doesn't have access to this company - show 404
    notFound();
  }

  return (
    <DashboardShell
      companySlug={companySlug}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      companyName={company.name}
    >
      {children}
    </DashboardShell>
  );
}
