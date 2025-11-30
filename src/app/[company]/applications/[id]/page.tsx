import { notFound, redirect } from "next/navigation";
import { getApplication, getRecentActions, getAttackEvents } from "@/lib/api";
import { ApplicationDetailClient } from "./ApplicationDetailClient";
import { auth } from "@/auth";
import { getCompanyFromSlug } from "@/lib/getCompanyFromSlug";

interface Props {
  params: Promise<{ company: string; id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id, company: companySlug } = await params;
  const session = await auth();

  if (!session?.user) {
    return { title: "Application | Shield Console" };
  }

  const company = await getCompanyFromSlug(
    companySlug,
    session.user.companies,
    session.user.accessToken
  );

  if (!company) {
    return { title: "Application | Shield Console" };
  }

  const app = await getApplication({
    companyId: company.id,
    id,
    accessToken: session.user.accessToken,
  });

  return {
    title: app ? `${app.name} | Shield Console` : "Application Not Found",
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id, company: companySlug } = await params;
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

  const [app, actions, attacks] = await Promise.all([
    getApplication({ companyId: company.id, id, accessToken }),
    getRecentActions({ companyId: company.id, applicationId: id, accessToken, limit: 10 }),
    getAttackEvents({ companyId: company.id, applicationId: id, accessToken }),
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

