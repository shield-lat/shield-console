import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

// In production, this would validate against the database
async function validateCompanyAccess(companySlug: string, userId: string) {
  // For demo purposes, we'll accept any slug
  // In production, check if the user has access to this company

  // Accept any slug for demo
  return {
    id: `company-${companySlug}`,
    name: companySlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    slug: companySlug,
  };
}

export default async function CompanyDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
}) {
  const session = await auth();
  const { company: companySlug } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  // Validate company access
  const company = await validateCompanyAccess(companySlug, session.user.id);

  if (!company) {
    notFound();
  }

  return (
    <DashboardShell
      companySlug={companySlug}
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }}
      companyName={company.name}
    >
      {children}
    </DashboardShell>
  );
}
