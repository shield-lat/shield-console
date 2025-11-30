import {
  getOverviewMetrics,
  getRecentActions,
  getApplications,
} from "@/lib/api";
import { OverviewClient } from "./OverviewClient";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getCompanyFromSlug } from "@/lib/getCompanyFromSlug";

export const metadata = {
  title: "Overview | Shield Console",
  description: "Real-time view of Shield AI safety decisions",
};

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get company from slug (checks session first, then API for new companies)
  const company = await getCompanyFromSlug(
    companySlug,
    session.user.companies,
    session.user.accessToken
  );

  if (!company) {
    notFound();
  }

  const accessToken = session.user.accessToken;

  // Fetch initial data server-side with auth context
  const [metrics, recentActions, applications] = await Promise.all([
    getOverviewMetrics({ companyId: company.id, accessToken }),
    getRecentActions({ companyId: company.id, accessToken }),
    getApplications({ companyId: company.id, accessToken }),
  ]);

  return (
    <OverviewClient
      initialMetrics={metrics}
      applications={applications}
      initialActions={recentActions}
      companySlug={companySlug}
    />
  );
}
