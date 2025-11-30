import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = {
  title: "Complete Setup | Shield Console",
  description: "Set up your organization on Shield Console",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // If user already has a company, redirect to dashboard
  if (session.user.companyId) {
    redirect("/overview");
  }

  return (
    <OnboardingForm
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || null,
      }}
    />
  );
}

