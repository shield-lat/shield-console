/**
 * Utility to get company ID from slug
 * 
 * First checks session companies, then falls back to API
 * for newly created companies not yet in the session JWT.
 */

// Shield Core API URL - normalize to base URL without /v1
function getShieldApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SHIELD_API_URL || "";
  if (!envUrl) return "";
  return envUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const SHIELD_API_BASE = getShieldApiBaseUrl();

interface Company {
  id: string;
  name: string;
  slug: string;
}

interface SessionCompany {
  id: string;
  name: string;
  slug: string;
  role: string;
}

/**
 * Get company ID from slug
 * 
 * @param companySlug - The company slug from the URL
 * @param sessionCompanies - Companies from the session (may be stale)
 * @param accessToken - Access token for API calls
 * @returns Company object or null if not found/authorized
 */
export async function getCompanyFromSlug(
  companySlug: string,
  sessionCompanies: SessionCompany[] | undefined,
  accessToken: string | undefined
): Promise<Company | null> {
  // First, check if company is in the session
  if (sessionCompanies && sessionCompanies.length > 0) {
    const company = sessionCompanies.find((c) => c.slug === companySlug);
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
      console.error("[getCompanyFromSlug] API call failed:", error);
    }
  }

  return null;
}

