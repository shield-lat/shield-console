import { getApplications, getActivityLog } from "@/lib/api";
import { ActivityClient } from "./ActivityClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Activity Log | Shield Console",
};

export default async function ActivityPage({
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

  const [applications, actions] = await Promise.all([
    getApplications({ companyId, accessToken }),
    getActivityLog({ companyId, accessToken }),
  ]);

  return <ActivityClient applications={applications} initialActions={actions} />;
}

