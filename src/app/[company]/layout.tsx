import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

// In production, this would validate against the database
async function validateCompanyAccess(companySlug: string, userId: string) {
  // For demo purposes, we'll accept any slug
  // In production, check if the user has access to this company
  const validSlugs = ["acme-financial", "demo", "test"];
  
  // Accept any slug for demo
  return {
    id: `company-${companySlug}`,
    name: companySlug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar companySlug={companySlug} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar
          user={{
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          }}
          companyName={company.name}
          companySlug={companySlug}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}

