import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Create Account | Shield Console",
  description: "Create your Shield Console account",
};

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    if (!session.user.companyId) {
      redirect("/onboarding");
    }
    redirect("/overview");
  }

  return <RegisterForm />;
}

