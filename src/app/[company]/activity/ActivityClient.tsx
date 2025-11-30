"use client";

import { useEffect, useState } from "react";
import { DecisionBadge, RiskBadge } from "@/components/common/Badge";
import { ActionDetailDrawer } from "@/components/drawers/ActionDetailDrawer";
import { EmptyStateNoApps } from "@/components/common/EmptyStateNoApps";
import { formatCurrency, formatDateTime } from "@/lib/api";
import type { AgentAction, Application, Decision, RiskTier } from "@/lib/types";

interface ActivityClientProps {
  applications: Application[];
  initialActions: AgentAction[];
  companySlug?: string;
}

export function ActivityClient({
  applications,
  initialActions,
  companySlug = "",
}: ActivityClientProps) {
  const [actions, setActions] = useState(initialActions);
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [applicationId, setApplicationId] = useState<string>("");
  const [decision, setDecision] = useState<Decision | "">("");
  const [riskTier, setRiskTier] = useState<RiskTier | "">("");
  const [search, setSearch] = useState("");

  // Fetch when filters change (only if we have apps)
  useEffect(() => {
    if (applications.length === 0) return;

    async function refetch() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (companySlug) params.set("companySlug", companySlug);
        if (applicationId) params.set("applicationId", applicationId);
        if (decision) params.set("decision", decision);
        if (riskTier) params.set("riskTier", riskTier);
        if (search) params.set("search", search);
        params.set("limit", "100");

        const res = await fetch(`/api/activity?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setActions(data.actions || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
    refetch();
  }, [applicationId, decision, riskTier, search, applications.length, companySlug]);

  // Show empty state if no applications
  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Activity Log
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Complete audit history of all Shield decisions
          </p>
        </div>
        <div className="card">
          <EmptyStateNoApps
            companySlug={companySlug}
            title="No activity yet"
            description="Register your first AI application to start seeing activity logs and audit history."
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
            Activity Log
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Complete audit history of all Shield decisions
          </p>
        </div>
        <button type="button" className="btn btn-secondary" disabled>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="app-filter"
              className="text-sm font-medium text-[var(--foreground-muted)]"
            >
              Application:
            </label>
            <select
              id="app-filter"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
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

          <div className="flex items-center gap-2">
            <label
              htmlFor="decision-filter"
              className="text-sm font-medium text-[var(--foreground-muted)]"
            >
              Decision:
            </label>
            <select
              id="decision-filter"
              value={decision}
              onChange={(e) => setDecision(e.target.value as Decision | "")}
              className="input select text-sm py-1.5 w-36"
            >
              <option value="">All</option>
              <option value="Allow">Allow</option>
              <option value="RequireHitl">HITL</option>
              <option value="Block">Block</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="risk-filter"
              className="text-sm font-medium text-[var(--foreground-muted)]"
            >
              Risk:
            </label>
            <select
              id="risk-filter"
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value as RiskTier | "")}
              className="input select text-sm py-1.5 w-32"
            >
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user ID, trace ID, action type..."
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Activity table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton h-12 rounded" />
            ))}
          </div>
        ) : actions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Application</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Amount</th>
                  <th>Decision</th>
                  <th>Risk</th>
                  <th>Trace ID</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr
                    key={action.id}
                    onClick={() => setSelectedAction(action)}
                    className="hover:bg-[var(--card-hover)] cursor-pointer"
                  >
                    <td className="whitespace-nowrap text-[var(--foreground-muted)]">
                      {formatDateTime(action.createdAt)}
                    </td>
                    <td className="font-medium text-[var(--foreground)]">
                      {action.applicationName}
                    </td>
                    <td>
                      <code>{action.userId}</code>
                    </td>
                    <td className="font-medium text-[var(--foreground)]">
                      {action.actionType}
                    </td>
                    <td className="whitespace-nowrap text-[var(--foreground)]">
                      {action.amount
                        ? formatCurrency(action.amount, action.currency)
                        : "—"}
                    </td>
                    <td>
                      <DecisionBadge decision={action.decision} />
                    </td>
                    <td>
                      <RiskBadge tier={action.riskTier} />
                    </td>
                    <td>
                      <code className="text-xs">
                        {action.traceId.substring(0, 12)}...
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state py-16">
            <svg
              className="w-16 h-16 mb-4 text-[var(--foreground-muted)] opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <p className="text-lg font-medium text-[var(--foreground)]">
              No activity found
            </p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Try adjusting your filters or time range.
            </p>
          </div>
        )}
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--foreground-muted)]">
          Showing {actions.length} results
        </p>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" disabled>
            Previous
          </button>
          <button type="button" className="btn btn-secondary" disabled>
            Next
          </button>
        </div>
      </div>

      {/* Detail drawer */}
      {selectedAction && (
        <ActionDetailDrawer
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </div>
  );
}
