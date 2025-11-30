"use client";

import { useGlobalFilters } from "@/lib/hooks/useGlobalFilters";
import type { Environment, TimeRangePreset } from "@/lib/types";

const timeRangeOptions: { value: TimeRangePreset; label: string }[] = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export function Topbar() {
  const { filters, setEnvironment, setTimeRange } = useGlobalFilters();

  return (
    <header className="h-16 bg-white border-b border-[var(--card-border)] flex items-center justify-between px-6">
      {/* Left: Page context (will be filled by pages) */}
      <div className="flex items-center gap-4">
        {/* Time range selector */}
        <select
          value={filters.timeRange}
          onChange={(e) => setTimeRange(e.target.value as TimeRangePreset)}
          className="input select text-sm py-1.5 w-40"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Environment toggle + User menu */}
      <div className="flex items-center gap-4">
        {/* Environment toggle */}
        <div className="flex items-center bg-[var(--background-alt)] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setEnvironment("sandbox")}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${
                filters.environment === "sandbox"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }
            `}
          >
            Sandbox
          </button>
          <button
            type="button"
            onClick={() => setEnvironment("production")}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${
                filters.environment === "production"
                  ? "bg-white text-[var(--foreground)] shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }
            `}
          >
            Production
          </button>
        </div>

        {/* Notifications placeholder */}
        <button
          type="button"
          className="relative p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-alt)] rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--card-border)]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[var(--foreground)]">Bregy Malpartida</p>
            <p className="text-xs text-[var(--foreground-muted)]">Admin</p>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-medium text-sm"
          >
            BM
          </button>
        </div>
      </div>
    </header>
  );
}

