import { auth } from "@/auth";
import { getActivityLog } from "@/lib/api";
import type { Decision, RiskTier, TimeRangePreset } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId") || undefined;
  const decision = searchParams.get("decision") as Decision | undefined;
  const riskTier = searchParams.get("riskTier") as RiskTier | undefined;
  const search = searchParams.get("search") || undefined;
  const timeRange = searchParams.get("timeRange") as
    | TimeRangePreset
    | undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!)
    : undefined;
  const offset = searchParams.get("offset")
    ? parseInt(searchParams.get("offset")!)
    : undefined;

  // Get company from URL param or session
  const companySlug = searchParams.get("companySlug");
  const companies = session.user.companies || [];

  // Find company by slug if provided, otherwise use first company
  const company = companySlug
    ? companies.find((c) => c.slug === companySlug)
    : companies[0];

  const companyId = company?.id || session.user.companyId;
  const accessToken = session.user.accessToken;

  if (!companyId) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  if (!accessToken) {
    return NextResponse.json({ error: "No access token" }, { status: 401 });
  }

  try {
    const result = await getActivityLog({
      companyId,
      accessToken,
      filters: {
        applicationId,
        decision,
        riskTier,
        search,
        timeRange,
        limit,
        offset,
      },
    });

    return NextResponse.json({
      actions: result.actions,
      total: result.total,
    });
  } catch (error) {
    console.error("[Activity API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}
