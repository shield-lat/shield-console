import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { getHitlTasks } from "@/lib/api";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || undefined;

  // Get company from session or API
  const companies = session.user.companies || [];
  const companyId = companies[0]?.id || session.user.companyId;
  const accessToken = session.user.accessToken;

  try {
    const tasks = await getHitlTasks({
      companyId,
      accessToken,
      status: status as any,
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[HITL API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch HITL tasks" },
      { status: 500 }
    );
  }
}

