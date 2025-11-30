import { getApplications } from "@/lib/api";
import { ApplicationsClient } from "./ApplicationsClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Applications | Shield Console",
};

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get the company ID from user's companies
  const userCompany = session.user.companies?.find((c) => c.slug === company);
  const companyId = userCompany?.id || session.user.companyId;

  const applications = await getApplications({
    companyId,
    accessToken: session.user.accessToken,
  });

  return <ApplicationsClient applications={applications} companySlug={company} />;
}

