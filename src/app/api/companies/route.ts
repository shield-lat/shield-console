import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Company, OnboardingData } from "@/lib/types";

// In-memory store for demo purposes
// In production, this would be a database
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

  // Get all companies for the current user
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

