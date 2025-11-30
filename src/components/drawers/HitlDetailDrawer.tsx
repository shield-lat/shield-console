"use client";

import { useState } from "react";
import { DecisionBadge, RiskBadge, HitlStatusBadge } from "@/components/common/Badge";
import { formatCurrency, formatDateTime, submitHitlDecision } from "@/lib/api";
import type { HitlTask } from "@/lib/types";

interface HitlDetailDrawerProps {
  task: HitlTask;
  onClose: () => void;
  onDecision: (taskId: string, decision: "Approved" | "Rejected") => void;
}

export function HitlDetailDrawer({ task, onClose, onDecision }: HitlDetailDrawerProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDecision = async (decision: "Approved" | "Rejected") => {
    setIsSubmitting(true);
    try {
      await submitHitlDecision(task.id, { decision, reviewNotes: notes || undefined });
      onDecision(task.id, decision);
      onClose();
    } catch (error) {
      console.error("Failed to submit decision:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const action = task.agentAction;
  const isPending = task.status === "Pending";

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="drawer-content animate-slide-in">
        <div className="flex flex-col h-full">
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)]">HITL Review</h2>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  Task {task.id} • Created {formatDateTime(task.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-[var(--background-alt)] rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status badges */}
            <div className="flex items-center gap-3 mb-6">
              <HitlStatusBadge status={task.status} />
              <RiskBadge tier={action.riskTier} />
            </div>

            {/* Alert for pending tasks */}
            {isPending && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Action Pending Review</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This action requires human approval before it can be executed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Review history (if not pending) */}
            {!isPending && task.reviewerId && (
              <div className="bg-slate-50 border border-[var(--card-border)] rounded-lg p-4 mb-6">
                <p className="text-sm">
                  <span className="font-medium">{task.reviewerName}</span>
                  {" "}{task.status.toLowerCase()} this task on{" "}
                  <span className="font-medium">{formatDateTime(task.reviewedAt!)}</span>
                </p>
                {task.reviewNotes && (
                  <p className="text-sm text-[var(--foreground-muted)] mt-2 italic">
                    "{task.reviewNotes}"
                  </p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-6">
              {/* Action info */}
              <section>
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Action Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                    <dt className="text-sm text-[var(--foreground-muted)]">Type</dt>
                    <dd className="text-sm font-medium">{action.actionType}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                    <dt className="text-sm text-[var(--foreground-muted)]">Application</dt>
                    <dd className="text-sm font-medium">{action.applicationName}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                    <dt className="text-sm text-[var(--foreground-muted)]">User</dt>
                    <dd className="text-sm">
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded">{action.userId}</code>
                    </dd>
                  </div>
                  {action.amount && (
                    <div className="flex justify-between py-2 border-b border-[var(--card-border)]">
                      <dt className="text-sm text-[var(--foreground-muted)]">Amount</dt>
                      <dd className="text-sm font-bold text-[var(--foreground)]">
                        {formatCurrency(action.amount, action.currency)}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* Original intent */}
              <section>
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Original Intent</h3>
                <div className="bg-slate-50 border border-[var(--card-border)] rounded-lg p-4">
                  <p className="text-sm text-[var(--foreground)] italic">"{action.originalIntent}"</p>
                </div>
              </section>

              {/* Escalation reasons */}
              <section>
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Escalation Reasons</h3>
                <div className="space-y-2">
                  {action.reasons.map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                    >
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* CoT placeholder */}
              <section>
                <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Shield Reasoning</h3>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
{`[Shield Analysis]
├─ Action: ${action.actionType}
├─ Amount: ${action.amount ? formatCurrency(action.amount) : 'N/A'}
├─ Risk Assessment:
│   ├─ Base risk: ${action.riskTier}
│   └─ Confidence: 87.3%
├─ Policy Evaluation:
│   ├─ threshold_check: ${action.amount && action.amount > 5000 ? "EXCEEDED" : "PASS"}
│   └─ requires_approval: TRUE
└─ Decision: REQUIRE_HITL
    └─ Reason: Human judgment recommended`}
                  </pre>
                </div>
              </section>

              {/* Review notes (for pending) */}
              {isPending && (
                <section>
                  <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Review Notes (Optional)</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    className="input min-h-[80px] resize-none"
                  />
                </section>
              )}
            </div>
          </div>

          {/* Action buttons (only for pending) */}
          {isPending && (
            <div className="p-6 border-t border-[var(--card-border)] bg-white">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDecision("Rejected")}
                  disabled={isSubmitting}
                  className="btn btn-danger flex-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("Approved")}
                  disabled={isSubmitting}
                  className="btn btn-success flex-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Approve & Execute
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

