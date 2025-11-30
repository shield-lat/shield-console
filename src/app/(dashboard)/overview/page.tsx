import {
  getApplications,
  getOverviewMetrics,
  getRecentActions,
} from "@/lib/api";
import { OverviewClient } from "./OverviewClient";

export const metadata = {
  title: "Overview | Shield Console",
};

export default async function OverviewPage() {
  // Fetch initial data on the server
  const [metrics, applications, recentActions] = await Promise.all([
    getOverviewMetrics(),
    getApplications(),
    getRecentActions({ limit: 15 }),
  ]);

  return (
    <OverviewClient
      initialMetrics={metrics}
      applications={applications}
      initialActions={recentActions}
    />
  );
}
