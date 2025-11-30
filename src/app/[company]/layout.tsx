import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// Shield Core API URL - normalize to base URL without /v1
function getShieldApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SHIELD_API_URL || "";
  if (!envUrl) return "";
  return envUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const SHIELD_API_BASE = getShieldApiBaseUrl();

// Validate that user has access to this company
// First check session, then verify with API if not found (for newly created companies)
async function validateCompanyAccess(
  companySlug: string,
  userCompanies: Array<{ id: string; name: string; slug: string; role: string }> | undefined,
  accessToken: string | undefined
): Promise<{ id: string; name: string; slug: string } | null> {
  // First, check if company is in the session
  if (userCompanies && userCompanies.length > 0) {
    const company = userCompanies.find((c) => c.slug === companySlug);
    if (company) {
      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
      };
    }
  }

  // Company not in session - check API for newly created companies
  if (SHIELD_API_BASE && accessToken) {
    try {
      const response = await fetch(`${SHIELD_API_BASE}/v1/companies`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // Don't cache this request
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const apiCompany = data.companies?.find(
          (c: { slug: string }) => c.slug === companySlug
        );

        if (apiCompany) {
          return {
            id: apiCompany.id,
            name: apiCompany.name,
            slug: apiCompany.slug,
          };
        }
      }
    } catch (error) {
      console.error("[Company Layout] API verification failed:", error);
    }
  }

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
