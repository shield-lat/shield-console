import { notFound } from "next/navigation";
import { getApplication, getRecentActions, getAttackEvents } from "@/lib/api";
import { ApplicationDetailClient } from "./ApplicationDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const app = await getApplication(id);
  return {
    title: app ? `${app.name} | Shield Console` : "Application Not Found",
  };
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;
  const [app, actions, attacks] = await Promise.all([
    getApplication(id),
    getRecentActions({ applicationId: id, limit: 10 }),
    getAttackEvents(id),
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

