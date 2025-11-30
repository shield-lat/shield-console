import { getApplications, getHitlTasks } from "@/lib/api";
import { HitlClient } from "./HitlClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "HITL Queue | Shield Console",
};

export default async function HitlPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userCompany = session.user.companies?.find((c) => c.slug === company);
  const companyId = userCompany?.id || session.user.companyId;
  const accessToken = session.user.accessToken;

  const [applications, tasks] = await Promise.all([
    getApplications({ companyId, accessToken }),
    getHitlTasks({ status: "Pending", companyId, accessToken }),
  ]);

  return <HitlClient applications={applications} initialTasks={tasks} />;
}

