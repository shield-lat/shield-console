import { notFound, redirect } from "next/navigation";
import { getApplication, getRecentActions, getAttackEvents } from "@/lib/api";
import { ApplicationDetailClient } from "./ApplicationDetailClient";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ company: string; id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id, company } = await params;
  const session = await auth();

  if (!session?.user) {
    return { title: "Application | Shield Console" };
  }

  const userCompany = session.user.companies?.find((c) => c.slug === company);
  const companyId = userCompany?.id || session.user.companyId;

  const app = await getApplication({
    id,
    companyId,
    accessToken: session.user.accessToken,
  });

  return {
    title: app ? `${app.name} | Shield Console` : "Application Not Found",
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id, company } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userCompany = session.user.companies?.find((c) => c.slug === company);
  const companyId = userCompany?.id || session.user.companyId;
  const accessToken = session.user.accessToken;

  const [app, actions, attacks] = await Promise.all([
    getApplication({ id, companyId, accessToken }),
    getRecentActions({ applicationId: id, companyId, accessToken, limit: 10 }),
    getAttackEvents({ applicationId: id, companyId, accessToken }),
  ]);

  if (!app) {
    notFound();
  }

  return (
    <ApplicationDetailClient
      application={app}
      recentActions={actions}
      recentAttacks={attacks}
    />
  );
}

