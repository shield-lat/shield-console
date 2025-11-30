"use client";

import Link from "next/link";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusBadge, EnvironmentBadge, DecisionBadge, Badge } from "@/components/common/Badge";
import { ActionsTable } from "@/components/tables/ActionsTable";
import { formatNumber, formatPercentage, formatRelativeTime, formatDateTime } from "@/lib/api";
import type { AgentAction, Application, AttackEvent } from "@/lib/types";

interface ApplicationDetailClientProps {
  application: Application;
  recentActions: AgentAction[];
  recentAttacks: AttackEvent[];
}

const attackTypeLabels: Record<string, string> = {
  PromptInjection: "Prompt Injection",
  Misalignment: "Misalignment",
  DataExfiltration: "Data Exfiltration",
  PolicyBypass: "Policy Bypass",
  SocialEngineering: "Social Engineering",
};

export function ApplicationDetailClient({
  application: app,
  recentActions,
  recentAttacks,
}: ApplicationDetailClientProps) {
  // Count action types for "most common actions" section
  const actionTypeCounts = recentActions.reduce(
    (acc, action) => {
      acc[action.actionType] = (acc[action.actionType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedActionTypes = Object.entries(actionTypeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/applications" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]">
          Applications
        </Link>
        <span className="text-[var(--foreground-muted)]">/</span>
        <span className="text-[var(--foreground)] font-medium">{app.name}</span>
      </nav>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{app.name}</h1>
              <StatusBadge status={app.status} />
              <EnvironmentBadge environment={app.environment} />
            </div>
            {app.description && (
              <p className="text-[var(--foreground-muted)] mb-4">{app.description}</p>
            )}
            <div className="flex items-center gap-6 text-sm text-[var(--foreground-muted)]">
              <span>
                Created {formatDateTime(app.createdAt)}
              </span>
              <span>
                Last active {formatRelativeTime(app.lastActivityAt)}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configure
            </button>
            <Link href={`/hitl?application=${app.id}`} className="btn btn-primary">
              View HITL Queue
            </Link>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          title="Total Actions"
          value={formatNumber(app.metrics.totalActions)}
          className="stagger-1"
        />
        <KpiCard
          title="Blocked"
          value={formatNumber(app.metrics.blockedActions)}
          variant="danger"
          className="stagger-2"
        />
        <KpiCard
          title="HITL"
          value={formatNumber(app.metrics.hitlActions)}
          variant="warning"
          className="stagger-3"
        />
        <KpiCard
          title="Attacks"
          value={formatNumber(app.metrics.attacksDetected)}
          variant="danger"
          className="stagger-4"
        />
        <KpiCard
          title="ASR"
          value={formatPercentage(app.metrics.attackSuccessRate * 100)}
          variant="success"
          className="stagger-5"
        />
        <KpiCard
          title="Users Impacted"
          value={formatNumber(app.metrics.usersImpacted)}
          className="stagger-6"
        />
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most common actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Most Common Actions</h2>
          {sortedActionTypes.length > 0 ? (
            <div className="space-y-3">
              {sortedActionTypes.map(([type, count]) => {
                const percentage = (count / recentActions.length) * 100;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[var(--foreground)]">{type}</span>
                      <span className="text-[var(--foreground-muted)]">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground-muted)]">No actions recorded yet</p>
          )}
        </div>

        {/* Recent attacks */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Attacks</h2>
            <Badge variant="danger">{recentAttacks.length} detected</Badge>
          </div>
          {recentAttacks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Attack Type</th>
                    <th>Outcome</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAttacks.slice(0, 5).map((attack) => (
                    <tr key={attack.id}>
                      <td className="whitespace-nowrap text-[var(--foreground-muted)]">
                        {formatRelativeTime(attack.createdAt)}
                      </td>
                      <td>
                        <Badge variant="danger">{attackTypeLabels[attack.attackType]}</Badge>
                      </td>
                      <td>
                        <span
                          className={`text-sm font-medium ${
                            attack.outcome === "Blocked"
                              ? "text-green-600"
                              : attack.outcome === "Escalated"
                                ? "text-amber-600"
                                : "text-red-600"
                          }`}
                        >
                          {attack.outcome}
                        </span>
                      </td>
                      <td className="max-w-xs">
                        <span className="text-sm text-[var(--foreground-muted)] line-clamp-1">
                          {attack.details}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[var(--foreground-muted)]">No attacks detected</p>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent Activity</h2>
          <Link
            href={`/activity?application=${app.id}`}
            className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
          >
            View all →
          </Link>
        </div>
        <ActionsTable actions={recentActions} showApplication={false} />
      </div>
    </div>
  );
}

