import { getApplications, getHitlTasks } from "@/lib/api";
import { HitlClient } from "./HitlClient";

export const metadata = {
  title: "HITL Queue | Shield Console",
};

export default async function HitlPage() {
  const [applications, tasks] = await Promise.all([
    getApplications(),
    getHitlTasks({ status: "Pending" }),
  ]);

  return <HitlClient applications={applications} initialTasks={tasks} />;
}

