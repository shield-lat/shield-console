import {
  getOverviewMetrics,
  getRecentActions,
  getApplications,
} from "@/lib/api";
import { OverviewClient } from "./OverviewClient";

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

  // Fetch initial data server-side
  const [metrics, recentActions, applications] = await Promise.all([
    getOverviewMetrics(),
    getRecentActions(),
    getApplications(),
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
