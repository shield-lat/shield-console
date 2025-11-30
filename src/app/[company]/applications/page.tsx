import { getApplications } from "@/lib/api";
import { ApplicationsClient } from "./ApplicationsClient";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getCompanyFromSlug } from "@/lib/getCompanyFromSlug";

export const metadata = {
  title: "Applications | Shield Console",
};

export default async function ApplicationsPage({
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

  const applications = await getApplications({
    companyId: company.id,
    accessToken: session.user.accessToken,
  });

  return <ApplicationsClient applications={applications} companySlug={companySlug} />;
}

