"use client";

import { useState } from "react";
import { DecisionBadge, RiskBadge } from "@/components/common/Badge";
import { ActionDetailDrawer } from "@/components/drawers/ActionDetailDrawer";
import { formatCurrency, formatRelativeTime } from "@/lib/api";
import type { AgentAction } from "@/lib/types";

interface ActionsTableProps {
  actions: AgentAction[];
  showApplication?: boolean;
  compact?: boolean;
}

export function ActionsTable({ actions, showApplication = true, compact = false }: ActionsTableProps) {
  const [selectedAction, setSelectedAction] = useState<AgentAction | null>(null);

  if (!actions.length) {
    return (
      <div className="empty-state py-12">
        <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <p className="text-sm">No actions found</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              {showApplication && <th>Application</th>}
              <th>User</th>
              <th>Action</th>
              {!compact && <th>Amount</th>}
              <th>Decision</th>
              <th>Risk</th>
              {!compact && <th>Reasons</th>}
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
                  {formatRelativeTime(action.createdAt)}
                </td>
                {showApplication && (
                  <td className="font-medium">{action.applicationName}</td>
                )}
                <td>
                  <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                    {action.userId}
                  </code>
                </td>
                <td className="font-medium">{action.actionType}</td>
                {!compact && (
                  <td className="whitespace-nowrap">
                    {action.amount ? formatCurrency(action.amount, action.currency) : "—"}
                  </td>
                )}
                <td>
                  <DecisionBadge decision={action.decision} />
                </td>
                <td>
                  <RiskBadge tier={action.riskTier} />
                </td>
                {!compact && (
                  <td className="max-w-xs">
                    <span className="text-sm text-[var(--foreground-muted)] line-clamp-1">
                      {action.reasons.join(", ")}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAction && (
        <ActionDetailDrawer
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
        />
      )}
    </>
  );
}

