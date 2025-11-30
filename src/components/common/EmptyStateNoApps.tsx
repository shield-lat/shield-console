"use client";

import Link from "next/link";

interface EmptyStateNoAppsProps {
  companySlug: string;
  title?: string;
  description?: string;
}

export function EmptyStateNoApps({
  companySlug,
  title = "No applications registered",
  description = "Register your first AI application to start seeing data here.",
}: EmptyStateNoAppsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400/20 to-cyan-500/20 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-[var(--primary)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
        {title}
      </h2>
      <p className="text-[var(--foreground-muted)] text-center max-w-md mb-8">
        {description}
      </p>

      <Link
        href={`/${companySlug}/applications`}
        className="btn btn-primary"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Register Your First Application
      </Link>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[var(--background-alt)] flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-[var(--foreground)] mb-1">
            Real-time Metrics
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            See live data from your AI agents
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[var(--background-alt)] flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-[var(--foreground)] mb-1">
            Attack Detection
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Monitor threats and anomalies
          </p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-[var(--background-alt)] flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-[var(--primary)]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-[var(--foreground)] mb-1">
            Risk Analytics
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Understand your risk distribution
          </p>
        </div>
      </div>
    </div>
  );
}

