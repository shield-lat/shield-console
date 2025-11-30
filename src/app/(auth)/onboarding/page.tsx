import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";

export const metadata = {
  title: "Workspaces | Shield Console",
  description: "Select or create a workspace on Shield Console",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Get companies from session (populated by Shield Core OAuth sync)
  const companies = session.user.companies || [];

  // OnboardingForm handles both:
  // - Showing existing companies for selection
  // - Creating new companies
  return (
    <OnboardingForm
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || null,
      }}
      existingCompanies={companies}
    />
  );
}
