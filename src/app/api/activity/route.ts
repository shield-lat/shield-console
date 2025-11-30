import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getActivityLog } from "@/lib/api";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId") || undefined;
  const decision = searchParams.get("decision") || undefined;
  const riskTier = searchParams.get("riskTier") || undefined;
  const search = searchParams.get("search") || undefined;

  // Get company from session or API
  const companies = session.user.companies || [];
  const companyId = companies[0]?.id || session.user.companyId;
  const accessToken = session.user.accessToken;

  try {
    const actions = await getActivityLog({
      companyId,
      accessToken,
      filters: {
        applicationId,
        decision: decision as any,
        riskTier: riskTier as any,
        search,
      },
    });

    return NextResponse.json({ actions });
  } catch (error) {
    console.error("[Activity API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 }
    );
  }
}

