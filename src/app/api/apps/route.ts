import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getCompanyFromSlug } from "@/lib/getCompanyFromSlug";

// Shield Core API URL
function getShieldApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SHIELD_API_URL || "";
  if (!envUrl) return "";
  return envUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

const SHIELD_API_BASE = getShieldApiBaseUrl();
const USE_REAL_API = !!SHIELD_API_BASE;

interface CreateAppRequest {
  name: string;
  description?: string;
  environment?: "sandbox" | "production";
  rateLimit?: number;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = session.user.accessToken;
  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token available" },
      { status: 401 }
    );
  }

  try {
    const body: CreateAppRequest = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Application name is required" },
        { status: 400 }
      );
    }

    // Get the user's first company (or we could accept companyId in the request)
    const companies = session.user.companies || [];
    let companyId: string | undefined;

    if (companies.length > 0) {
      companyId = companies[0].id;
    } else {
      // Try to fetch companies from API
      try {
        const companiesRes = await fetch(`${SHIELD_API_BASE}/v1/companies`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (companiesRes.ok) {
          const data = await companiesRes.json();
          if (data.companies && data.companies.length > 0) {
            companyId = data.companies[0].id;
          }
        }
      } catch (error) {
        console.error("[Create App] Failed to fetch companies:", error);
      }
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "No company found. Please create a company first." },
        { status: 400 }
      );
    }

    // Create app via Shield Core API
    if (USE_REAL_API) {
      try {
        console.log("[Create App] Creating app for company:", companyId);

        const response = await fetch(
          `${SHIELD_API_BASE}/v1/companies/${companyId}/apps`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              name: body.name.trim(),
              description: body.description || "",
              rate_limit: body.rateLimit || 1000,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[Create App] API error:", errorData);
          return NextResponse.json(
            { error: errorData.message || "Failed to create application" },
            { status: response.status }
          );
        }

        const data = await response.json();
        console.log("[Create App] Success:", {
          appId: data.app?.id,
          hasApiKey: !!data.api_key,
        });

        // Transform response to frontend format
        const app = {
          id: data.app.id,
          name: data.app.name,
          description: data.app.description || "",
          status: data.app.status || "active",
          environment: body.environment || "sandbox",
          apiKeyPrefix: data.app.api_key_prefix,
          rateLimit: data.app.rate_limit,
          createdAt: data.app.created_at,
          updatedAt: data.app.updated_at,
          lastActivityAt: data.app.created_at,
          metrics: {
            totalActions: 0,
            blockedActions: 0,
            hitlActions: 0,
            attacksDetected: 0,
            attackSuccessRate: 0,
            usersImpacted: 0,
            pendingHitlTasks: 0,
          },
        };

        return NextResponse.json({
          success: true,
          app,
          apiKey: data.api_key, // Only returned on creation
          warning: data.warning,
        });
      } catch (error) {
        console.error("[Create App] Error:", error);
        return NextResponse.json(
          { error: "Failed to create application" },
          { status: 500 }
        );
      }
    }

    // Mock implementation (when no API)
    const mockApp = {
      id: `app-${Date.now()}`,
      name: body.name.trim(),
      description: body.description || "",
      status: "active",
      environment: body.environment || "sandbox",
      apiKeyPrefix: "shld_" + Math.random().toString(36).substring(2, 10),
      rateLimit: body.rateLimit || 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      metrics: {
        totalActions: 0,
        blockedActions: 0,
        hitlActions: 0,
        attacksDetected: 0,
        attackSuccessRate: 0,
        usersImpacted: 0,
        pendingHitlTasks: 0,
      },
    };

    const mockApiKey = `shld_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

    return NextResponse.json({
      success: true,
      app: mockApp,
      apiKey: mockApiKey,
    });
  } catch (error) {
    console.error("[Create App] Error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

