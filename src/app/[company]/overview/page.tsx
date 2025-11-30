import {
  getOverviewMetrics,
  getRecentActions,
  getApplications,
} from "@/lib/api";
import { OverviewClient } from "./OverviewClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Overview | Shield Console",
  description: "Real-time view of Shield AI safety decisions",
};

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get company ID from session
  const companyId = session.user.companyId;

  // Fetch initial data server-side with auth context
  const [metrics, recentActions, applications] = await Promise.all([
    getOverviewMetrics({ companyId, accessToken: session.user.accessToken }),
    getRecentActions({ companyId, accessToken: session.user.accessToken }),
    getApplications({ companyId, accessToken: session.user.accessToken }),
  ]);

  return (
    <OverviewClient
      initialMetrics={metrics}
      applications={applications}
      initialActions={recentActions}
      companySlug={company}
    />
  );
}
