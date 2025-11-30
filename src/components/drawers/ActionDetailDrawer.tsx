"use client";

import { DecisionBadge, RiskBadge } from "@/components/common/Badge";
import { formatCurrency, formatDateTime } from "@/lib/api";
import type { AgentAction } from "@/lib/types";

interface ActionDetailDrawerProps {
  action: AgentAction;
  onClose: () => void;
}

export function ActionDetailDrawer({ action, onClose }: ActionDetailDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="drawer-content animate-slide-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Action Details
              </h2>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                {formatDateTime(action.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[var(--background-alt)] rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-3 mb-6">
            <DecisionBadge decision={action.decision} />
            <RiskBadge tier={action.riskTier} />
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Basic info */}
            <section>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                Basic Information
              </h3>
              <dl className="space-y-0">
                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <dt className="text-sm text-[var(--foreground-muted)]">
                    Action Type
                  </dt>
                  <dd className="text-sm font-medium text-[var(--foreground)]">
                    {action.actionType}
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <dt className="text-sm text-[var(--foreground-muted)]">
                    Application
                  </dt>
                  <dd className="text-sm font-medium text-[var(--foreground)]">
                    {action.applicationName}
                  </dd>
                </div>
                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <dt className="text-sm text-[var(--foreground-muted)]">
                    User ID
                  </dt>
                  <dd className="text-sm">
                    <code>{action.userId}</code>
                  </dd>
                </div>
                {action.amount && (
                  <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                    <dt className="text-sm text-[var(--foreground-muted)]">
                      Amount
                    </dt>
                    <dd className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(action.amount, action.currency)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                  <dt className="text-sm text-[var(--foreground-muted)]">
                    Trace ID
                  </dt>
                  <dd className="text-sm">
                    <code className="text-xs">{action.traceId}</code>
                  </dd>
                </div>
              </dl>
            </section>

            {/* Original intent */}
            <section>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                Original Intent
              </h3>
              <div className="bg-[var(--background-alt)] border border-[var(--card-border)] rounded-lg p-4">
                <p className="text-sm text-[var(--foreground)] italic leading-relaxed">
                  "{action.originalIntent}"
                </p>
              </div>
            </section>

            {/* Rule hits / Reasons */}
            <section>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                Rule Hits & Signals
              </h3>
              <div className="space-y-2">
                {action.reasons.map((reason, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm bg-[var(--risk-medium-bg)] border border-[var(--risk-medium)] border-opacity-30 rounded-lg px-3 py-2.5"
                  >
                    <svg
                      className="w-4 h-4 text-[var(--risk-medium)] flex-shrink-0"
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
                    <span className="text-[var(--risk-medium-text)]">{reason}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* CoT placeholder */}
            <section>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                Chain of Thought (Shield Reasoning)
              </h3>
              <div className="code-block rounded-lg p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap text-xs">
                  {`[Shield Analysis]
├─ Action: ${action.actionType}
├─ Amount: ${action.amount ? formatCurrency(action.amount) : "N/A"}
├─ Risk Assessment:
│   ├─ Base risk score: 0.${action.riskTier === "Low" ? "15" : action.riskTier === "Medium" ? "45" : action.riskTier === "High" ? "72" : "91"}
│   ├─ User history factor: 1.0
│   └─ Context factor: ${action.decision === "Block" ? "2.3" : "1.1"}
├─ Policy Evaluation:
│   ├─ threshold_check: ${action.amount && action.amount > 5000 ? "EXCEEDED" : "PASS"}
│   ├─ velocity_check: PASS
│   └─ intent_alignment: ${action.decision === "Block" ? "FAILED" : "PASS"}
└─ Decision: ${action.decision.toUpperCase()}
    └─ Confidence: ${action.decision === "Allow" ? "98.5" : action.decision === "Block" ? "99.2" : "87.3"}%`}
                </pre>
              </div>
            </section>

            {/* Raw payload */}
            <section>
              <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">
                Full Payload (JSON)
              </h3>
              <div className="code-block rounded-lg p-4 overflow-x-auto max-h-48">
                <pre className="text-xs">{JSON.stringify(action, null, 2)}</pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
