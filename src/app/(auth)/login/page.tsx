import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign In | Shield Console",
  description: "Sign in to Shield Console",
};

export default async function LoginPage() {
  const session = await auth();

  // If already signed in, redirect appropriately
  if (session?.user) {
    if (!session.user.companyId) {
      redirect("/onboarding");
    }
    redirect("/overview");
  }

  return <LoginForm />;
}

