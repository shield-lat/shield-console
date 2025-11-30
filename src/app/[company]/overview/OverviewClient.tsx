"use client";

import { useState } from "react";
import { KpiCard } from "@/components/common/KpiCard";
import { ApplicationFilter } from "@/components/common/ApplicationFilter";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { RiskPieChart } from "@/components/charts/RiskPieChart";
import { ActionsTable } from "@/components/tables/ActionsTable";
import { EmptyStateNoApps } from "@/components/common/EmptyStateNoApps";
import { useGlobalFilters } from "@/lib/hooks/useGlobalFilters";
import {
  formatNumber,
  formatPercentage,
} from "@/lib/api";
import type { AgentAction, Application, OverviewMetrics } from "@/lib/types";

interface OverviewClientProps {
  initialMetrics: OverviewMetrics;
  applications: Application[];
  initialActions: AgentAction[];
  companySlug: string;
}

export function OverviewClient({
  initialMetrics,
  applications,
  initialActions,
  companySlug,
}: OverviewClientProps) {
  const { filters } = useGlobalFilters();
  const [metrics, setMetrics] = useState(initialMetrics);
  const [actions, setActions] = useState(initialActions);
  const [isLoading, setIsLoading] = useState(false);

  // Show empty state if no applications
  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Overview
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Real-time view of Shield&apos;s AI safety decisions
          </p>
        </div>
        <div className="card">
          <EmptyStateNoApps
            companySlug={companySlug}
            title="No data yet"
            description="Register your first AI application to start seeing real-time metrics, attack detection, and safety analytics."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Overview
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Real-time view of Shield's AI safety decisions
          </p>
        </div>
        <ApplicationFilter applications={applications} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Total Actions"
          value={formatNumber(metrics.totalActions)}
          icon={
            <svg
              className="w-5 h-5"
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
          }
          className="stagger-1"
        />
        <KpiCard
          title="Blocked"
          value={formatNumber(metrics.blockedActions)}
          variant="danger"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          }
          className="stagger-2"
        />
        <KpiCard
          title="Escalated (HITL)"
          value={formatNumber(metrics.escalatedActions)}
          variant="warning"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          }
          className="stagger-3"
        />
        <KpiCard
          title="Attack Attempts"
          value={formatNumber(metrics.attackAttempts)}
          variant="danger"
          icon={
            <svg
              className="w-5 h-5"
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
          }
          className="stagger-4"
        />
        <KpiCard
          title="ASR"
          value={formatPercentage(metrics.attackSuccessRate)}
          subtitle="Attack Success Rate"
          variant="success"
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          }
          className="stagger-5"
        />
        <KpiCard
          title="Users Impacted"
          value={formatNumber(metrics.usersImpacted)}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          }
          className="stagger-6"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions over time */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Actions Over Time
            </h2>
            <span className="text-sm text-[var(--foreground-muted)]">
              Last{" "}
              {filters.timeRange === "24h"
                ? "24 hours"
                : filters.timeRange === "7d"
                ? "7 days"
                : filters.timeRange === "30d"
                ? "30 days"
                : "90 days"}
            </span>
          </div>
          <div className="h-56">
            <AreaChart data={metrics.actionsOverTime} height={224} />
          </div>
        </div>

        {/* Attacks by application */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Attacks by Application
            </h2>
            <span className="text-sm text-[var(--foreground-muted)]">
              Top 5
            </span>
          </div>
          <div className="h-56">
            <BarChart data={metrics.attacksByApplication} height={224} />
          </div>
        </div>
      </div>

      {/* Second charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Risk Distribution
          </h2>
          <div className="flex items-center justify-center py-4">
            <RiskPieChart data={metrics.riskTierDistribution} size={140} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Shield Performance
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--foreground-muted)]">
                  Allow Rate
                </span>
                <span className="text-sm font-medium">
                  {formatPercentage(
                    (1 -
                      (metrics.blockedActions + metrics.escalatedActions) /
                        metrics.totalActions) *
                      100
                  )}
                </span>
              </div>
              <div className="h-2 bg-[var(--background-alt)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--chart-1)] rounded-full"
                  style={{
                    width: `${
                      (1 -
                        (metrics.blockedActions + metrics.escalatedActions) /
                          metrics.totalActions) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--foreground-muted)]">
                  Block Rate
                </span>
                <span className="text-sm font-medium">
                  {formatPercentage(
                    (metrics.blockedActions / metrics.totalActions) * 100
                  )}
                </span>
              </div>
              <div className="h-2 bg-[var(--background-alt)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--chart-3)] rounded-full"
                  style={{
                    width: `${
                      (metrics.blockedActions / metrics.totalActions) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--foreground-muted)]">
                  HITL Rate
                </span>
                <span className="text-sm font-medium">
                  {formatPercentage(
                    (metrics.escalatedActions / metrics.totalActions) * 100
                  )}
                </span>
              </div>
              <div className="h-2 bg-[var(--background-alt)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--chart-2)] rounded-full"
                  style={{
                    width: `${
                      (metrics.escalatedActions / metrics.totalActions) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--foreground-muted)]">
                  Attack Detection Rate
                </span>
                <span className="text-sm font-medium">
                  {formatPercentage(100 - metrics.attackSuccessRate)}
                </span>
              </div>
              <div className="h-2 bg-[var(--background-alt)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--status-healthy)] rounded-full"
                  style={{ width: `${100 - metrics.attackSuccessRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Recent Activity
          </h2>
          <a
            href={`/${companySlug}/activity`}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
          >
            View all →
          </a>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : (
          <ActionsTable actions={actions} />
        )}
      </div>
    </div>
  );
}
