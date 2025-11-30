"use client";

import { useGlobalFilters } from "@/lib/hooks/useGlobalFilters";
import type { Application } from "@/lib/types";

interface ApplicationFilterProps {
  applications: Application[];
}

export function ApplicationFilter({ applications }: ApplicationFilterProps) {
  const { filters, setApplicationId } = useGlobalFilters();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="app-filter" className="text-sm font-medium text-[var(--foreground-muted)]">
        Application:
      </label>
      <select
        id="app-filter"
        value={filters.applicationId || ""}
        onChange={(e) => setApplicationId(e.target.value || null)}
        className="input select text-sm py-1.5 w-48"
      >
        <option value="">All Applications</option>
        {applications.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>
    </div>
  );
}

