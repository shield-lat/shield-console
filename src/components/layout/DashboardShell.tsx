"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  companySlug?: string;
  user?: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  companyName?: string;
}

export function DashboardShell({
  children,
  companySlug,
  user,
  companyName,
}: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Load initial state
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) {
      setIsCollapsed(stored === "true");
    }

    // Listen for toggle events
    const handleToggle = (e: CustomEvent<{ collapsed: boolean }>) => {
      setIsCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebar-toggle", handleToggle as EventListener);
    return () => {
      window.removeEventListener("sidebar-toggle", handleToggle as EventListener);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <Sidebar companySlug={companySlug} />
      <div
        className={`
          flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out
          ${isCollapsed ? "ml-16" : "ml-64"}
        `}
      >
        <Topbar
          user={user}
          companyName={companyName}
          companySlug={companySlug}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}

