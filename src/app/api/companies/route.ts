import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Company, OnboardingData } from "@/lib/types";

// Shield Core API URL - normalize to base URL without /v1
function getShieldApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SHIELD_API_URL || "";
  if (!envUrl) return "";
  return envUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const SHIELD_API_BASE = getShieldApiBaseUrl();
const USE_SHIELD_API = !!SHIELD_API_BASE;

// In-memory store for demo purposes (used when SHIELD_API_URL is not set)
const companiesStore: Map<string, Company> = new Map();
const userCompaniesStore: Map<string, string[]> = new Map(); // userId -> companyIds

// Initialize with demo company
companiesStore.set("company-acme", {
  id: "company-acme",
  name: "Acme Financial Services",
  slug: "acme-financial",
  logo: null,
  plan: "pro",
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
userCompaniesStore.set("user-demo", ["company-acme"]);

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use Shield Core API if available
  if (USE_SHIELD_API && session.user.accessToken) {
    try {
      const response = await fetch(`${SHIELD_API_BASE}/v1/companies`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend companies to frontend format
        const companies: Company[] = data.companies.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          logo: null,
          plan: "pro", // Default, not in backend yet
          status: "active",
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        return NextResponse.json({ companies });
      }
    } catch (error) {
      console.error("Shield Core API error:", error);
      // Fall through to mock data
    }
  }

  // Fallback to mock data
  const companyIds = userCompaniesStore.get(session.user.id) || [];
  const companies = companyIds
    .map((id) => companiesStore.get(id))
    .filter((c): c is Company => c !== undefined);

  return NextResponse.json({ companies });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: OnboardingData = await request.json();

    // Validate required fields
    if (!body.companyName || !body.companySlug) {
      return NextResponse.json(
        { error: "Company name and slug are required" },
        { status: 400 }
      );
    }

    // Use Shield Core API if available
    if (USE_SHIELD_API && session.user.accessToken) {
      try {
        console.log("[Shield API] Creating company:", body.companyName);
        const response = await fetch(`${SHIELD_API_BASE}/v1/companies`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.accessToken}`,
          },
          body: JSON.stringify({
            name: body.companyName,
            description: body.useCase || "",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const company: Company = {
            id: data.company.id,
            name: data.company.name,
            slug: data.company.slug,
            logo: null,
            plan: "free",
            status: "active",
            createdAt: data.company.created_at,
            updatedAt: data.company.updated_at,
          };

          return NextResponse.json({
            success: true,
            company,
            redirectUrl: `/${company.slug}/overview`,
          });
        } else if (response.status === 409) {
          return NextResponse.json(
            { error: "This workspace URL is already taken" },
            { status: 409 }
          );
        } else {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.message || "Failed to create company" },
            { status: response.status }
          );
        }
      } catch (error) {
        console.error("Shield Core API error:", error);
        // Fall through to mock implementation
      }
    }

    // Fallback to mock implementation
    // Check if slug is already taken
    const existingCompany = Array.from(companiesStore.values()).find(
      (c) => c.slug === body.companySlug
    );

    if (existingCompany) {
      return NextResponse.json(
        { error: "This workspace URL is already taken" },
        { status: 409 }
      );
    }

    // Create the company
    const companyId = `company-${Date.now()}`;
    const company: Company = {
      id: companyId,
      name: body.companyName,
      slug: body.companySlug,
      logo: null,
      plan: "free",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store the company
    companiesStore.set(companyId, company);

    // Associate user with company
    const userCompanies = userCompaniesStore.get(session.user.id) || [];
    userCompanies.push(companyId);
    userCompaniesStore.set(session.user.id, userCompanies);

    // Return success with company data
    return NextResponse.json({
      success: true,
      company,
      redirectUrl: `/${company.slug}/overview`,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
