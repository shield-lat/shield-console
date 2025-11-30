import { getApplications, getActivityLog } from "@/lib/api";
import { ActivityClient } from "./ActivityClient";

export const metadata = {
  title: "Activity Log | Shield Console",
};

export default async function ActivityPage() {
  const [applications, actions] = await Promise.all([
    getApplications(),
    getActivityLog(),
  ]);

  return <ActivityClient applications={applications} initialActions={actions} />;
}

