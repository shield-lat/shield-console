import { getApplications, getActivityLog } from "@/lib/api";
import { ActivityClient } from "./ActivityClient";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getCompanyFromSlug } from "@/lib/getCompanyFromSlug";

export const metadata = {
  title: "Activity Log | Shield Console",
};

export default async function ActivityPage({
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

  const [applications, actions] = await Promise.all([
    getApplications({ companyId: company.id, accessToken }),
    getActivityLog({ companyId: company.id, accessToken }),
  ]);

  return <ActivityClient applications={applications} initialActions={actions} />;
}

