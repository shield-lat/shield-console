import { getApplications } from "@/lib/api";
import { ApplicationsClient } from "./ApplicationsClient";

export const metadata = {
  title: "Applications | Shield Console",
};

export default async function ApplicationsPage() {
  const applications = await getApplications();

  return <ApplicationsClient applications={applications} />;
}

