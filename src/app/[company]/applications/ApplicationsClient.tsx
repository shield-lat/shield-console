"use client";

import Link from "next/link";
import { StatusBadge, EnvironmentBadge, Badge } from "@/components/common/Badge";
import { formatRelativeTime, formatNumber, formatPercentage } from "@/lib/api";
import type { Application } from "@/lib/types";

interface ApplicationsClientProps {
  applications: Application[];
}

export function ApplicationsClient({ applications }: ApplicationsClientProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Applications</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Manage and monitor your protected applications
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Register Application
        </button>
      </div>

      {/* Applications grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app, index) => (
          <Link
            key={app.id}
            href={`/applications/${app.id}`}
            className="card card-hover animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">{app.name}</h3>
                {app.description && (
                  <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
                    {app.description}
                  </p>
                )}
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <EnvironmentBadge environment={app.environment} />
              <span className="text-xs text-[var(--foreground-muted)]">
                Last active {formatRelativeTime(app.lastActivityAt)}
              </span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--card-border)]">
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {formatNumber(app.metrics.totalActions)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">Total Actions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(app.metrics.blockedActions)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">Blocked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {formatNumber(app.metrics.attacksDetected)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">Attacks</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  {formatPercentage(app.metrics.attackSuccessRate * 100)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">ASR</p>
              </div>
            </div>

            {/* Pending HITL indicator */}
            {(app.metrics.pendingHitlTasks ?? 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                <Badge variant="warning">
                  {app.metrics.pendingHitlTasks} pending HITL tasks
                </Badge>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

