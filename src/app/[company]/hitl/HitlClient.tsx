"use client";

import { useEffect, useState } from "react";
import { RiskBadge, HitlStatusBadge, Badge } from "@/components/common/Badge";
import { HitlDetailDrawer } from "@/components/drawers/HitlDetailDrawer";
import { EmptyStateNoApps } from "@/components/common/EmptyStateNoApps";
import { formatCurrency, formatRelativeTime } from "@/lib/api";
import type { Application, HitlTask, HitlStatus, RiskTier } from "@/lib/types";

interface HitlClientProps {
  applications: Application[];
  initialTasks: HitlTask[];
  companySlug?: string;
}

export function HitlClient({
  applications,
  initialTasks,
  companySlug = "",
}: HitlClientProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<HitlTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [applicationId, setApplicationId] = useState<string>("");
  const [status, setStatus] = useState<HitlStatus | "">("");
  const [riskTier, setRiskTier] = useState<RiskTier | "">("");
  const [search, setSearch] = useState("");

  // Fetch tasks when filters change (only if we have apps)
  useEffect(() => {
    if (applications.length === 0) return;

    async function refetch() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (status) params.set("status", status);

        const res = await fetch(`/api/hitl?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTasks(data.tasks || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
    refetch();
  }, [applicationId, status, riskTier, search, applications.length]);

  const handleDecision = (taskId: string, decision: "Approved" | "Rejected") => {
    // Update local state (in reality, we'd refetch from the server)
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, status: decision, reviewedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;

  // Show empty state if no applications
  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            HITL Queue
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Review and approve actions that require human judgment
          </p>
        </div>
        <div className="card">
          <EmptyStateNoApps
            companySlug={companySlug}
            title="No pending reviews"
            description="Register your first AI application to start receiving human-in-the-loop review requests."
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              HITL Queue
            </h1>
            {pendingCount > 0 && (
              <Badge variant="warning">{pendingCount} pending</Badge>
            )}
          </div>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Review and approve actions that require human judgment
          </p>
        </div>
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
              htmlFor="status-filter"
              className="text-sm font-medium text-[var(--foreground-muted)]"
            >
              Status:
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value as HitlStatus | "")}
              className="input select text-sm py-1.5 w-36"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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
              placeholder="Search by user ID, trace ID..."
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 border-b border-[var(--card-border)]">
        <button
          type="button"
          onClick={() => setStatus("")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            status === ""
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setStatus("Pending")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            status === "Pending"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Pending
          {pendingCount > 0 && (
            <span className="bg-[var(--decision-hitl-bg)] text-[var(--decision-hitl-text)] text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setStatus("Approved")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            status === "Approved"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Approved
        </button>
        <button
          type="button"
          onClick={() => setStatus("Rejected")}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            status === "Rejected"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Tasks table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16 rounded" />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Created</th>
                  <th>Application</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Amount</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`hover:bg-[var(--card-hover)] cursor-pointer ${
                      task.status === "Pending" ? "pending-row" : ""
                    }`}
                  >
                    <td className="whitespace-nowrap text-[var(--foreground-muted)]">
                      {formatRelativeTime(task.createdAt)}
                    </td>
                    <td className="font-medium text-[var(--foreground)]">
                      {task.applicationName}
                    </td>
                    <td>
                      <code>{task.agentAction.userId}</code>
                    </td>
                    <td className="font-medium text-[var(--foreground)]">
                      {task.agentAction.actionType}
                    </td>
                    <td className="whitespace-nowrap text-[var(--foreground)]">
                      {task.agentAction.amount
                        ? formatCurrency(
                            task.agentAction.amount,
                            task.agentAction.currency
                          )
                        : "—"}
                    </td>
                    <td>
                      <RiskBadge tier={task.agentAction.riskTier} />
                    </td>
                    <td>
                      <HitlStatusBadge status={task.status} />
                    </td>
                    <td className="max-w-xs">
                      <span className="text-sm text-[var(--foreground-muted)] line-clamp-1">
                        {task.agentAction.reasons[0]}
                      </span>
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-medium text-[var(--foreground)]">
              No tasks found
            </p>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              {status === "Pending"
                ? "All caught up! No pending tasks to review."
                : "Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selectedTask && (
        <HitlDetailDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDecision={handleDecision}
        />
      )}
    </div>
  );
}
