import { getApplications, getHitlTasks } from "@/lib/api";
import { HitlClient } from "./HitlClient";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getCompanyFromSlug } from "@/lib/getCompanyFromSlug";

export const metadata = {
  title: "HITL Queue | Shield Console",
};

export default async function HitlPage({
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

  const [applications, tasks] = await Promise.all([
    getApplications({ companyId: company.id, accessToken }),
    getHitlTasks({ status: "Pending", companyId: company.id, accessToken }),
  ]);

  return <HitlClient applications={applications} initialTasks={tasks} />;
}

