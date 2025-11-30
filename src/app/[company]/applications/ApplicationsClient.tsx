"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge, EnvironmentBadge, Badge } from "@/components/common/Badge";
import { formatRelativeTime, formatNumber, formatPercentage } from "@/lib/api";
import type { Application } from "@/lib/types";

interface ApplicationsClientProps {
  applications: Application[];
  companySlug?: string;
}

// Create App Modal Component
function CreateAppModal({
  isOpen,
  onClose,
  companySlug,
}: {
  isOpen: boolean;
  onClose: () => void;
  companySlug: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [createdApp, setCreatedApp] = useState<{
    app: Application;
    apiKey: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    environment: "sandbox" as "sandbox" | "production",
    rateLimit: 1000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          environment: formData.environment,
          rateLimit: formData.rateLimit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create application");
        setIsSubmitting(false);
        return;
      }

      // Show the API key
      setCreatedApp({
        app: data.app,
        apiKey: data.apiKey,
      });
      setShowApiKey(true);
    } catch (err) {
      console.error("Error creating app:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCopyApiKey = () => {
    if (createdApp?.apiKey) {
      navigator.clipboard.writeText(createdApp.apiKey);
    }
  };

  const handleDone = () => {
    onClose();
    router.refresh();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!showApiKey ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in">
        {showApiKey && createdApp ? (
          // Success state - show API key
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-center text-[var(--foreground)] mb-2">
              Application Created!
            </h2>
            <p className="text-center text-[var(--foreground-muted)] mb-6">
              Your application <strong>{createdApp.app.name}</strong> is ready.
              Save your API key now - you won&apos;t be able to see it again.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdApp.apiKey}
                  readOnly
                  className="input flex-1 font-mono text-sm bg-[var(--background-alt)]"
                />
                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className="btn btn-secondary"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                    />
                  </svg>
                  Copy
                </button>
              </div>
              <p className="mt-2 text-xs text-amber-500">
                ⚠️ This key will only be shown once. Store it securely.
              </p>
            </div>

            <div className="p-4 bg-[var(--background-alt)] rounded-lg mb-6">
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">
                Quick Start
              </p>
              <pre className="text-xs text-[var(--foreground-muted)] overflow-x-auto">
{`curl -X POST https://api.shield.lat/v1/evaluate \\
  -H "Authorization: Bearer ${createdApp.apiKey.substring(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"action": "transfer", "amount": 1000}'`}
              </pre>
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="btn btn-primary w-full"
            >
              Done
            </button>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Register New Application
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-[var(--background-alt)] text-[var(--foreground-muted)]"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Connect your AI agent to Shield for real-time safety evaluation.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Application Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Mobile Banking Bot"
                  className="input"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="What does this application do?"
                  className="input min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5">
                  Environment
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, environment: "sandbox" }))
                    }
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                      formData.environment === "sandbox"
                        ? "border-amber-500 bg-amber-500/10 text-amber-500"
                        : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-sm font-medium">Sandbox</span>
                    <p className="text-xs mt-1 opacity-70">
                      For development & testing
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        environment: "production",
                      }))
                    }
                    className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                      formData.environment === "production"
                        ? "border-green-500 bg-green-500/10 text-green-500"
                        : "border-[var(--card-border)] text-[var(--foreground-muted)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-sm font-medium">Production</span>
                    <p className="text-xs mt-1 opacity-70">For live traffic</p>
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="rateLimit"
                  className="block text-sm font-medium text-[var(--foreground-muted)] mb-1.5"
                >
                  Rate Limit (requests/minute)
                </label>
                <input
                  id="rateLimit"
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      rateLimit: parseInt(e.target.value) || 1000,
                    }))
                  }
                  min={1}
                  max={100000}
                  className="input"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--card-border)] flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Application"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
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
        No applications yet
      </h2>
      <p className="text-[var(--foreground-muted)] text-center max-w-md mb-8">
        Register your first AI application to start protecting your users with
        real-time safety evaluation, attack detection, and human-in-the-loop
        workflows.
      </p>

      <button type="button" onClick={onCreateClick} className="btn btn-primary">
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
      </button>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
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
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-[var(--foreground)] mb-1">
            Real-time Protection
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Evaluate every AI action in milliseconds
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
            Block prompt injections & jailbreaks
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
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>
          <h3 className="font-medium text-[var(--foreground)] mb-1">
            Human-in-the-Loop
          </h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Escalate high-risk actions for review
          </p>
        </div>
      </div>
    </div>
  );
}

export function ApplicationsClient({
  applications,
  companySlug = "",
}: ApplicationsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show empty state if no applications
  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Applications
            </h1>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Manage and monitor your protected applications
            </p>
          </div>
        </div>

        <div className="card">
          <EmptyState onCreateClick={() => setIsModalOpen(true)} />
        </div>

        <CreateAppModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          companySlug={companySlug}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Applications
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Manage and monitor your protected applications
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <svg
            className="w-4 h-4"
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
          Register Application
        </button>
      </div>

      {/* Applications grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app, index) => (
          <Link
            key={app.id}
            href={`/${companySlug}/applications/${app.id}`}
            className="card card-hover animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">
                  {app.name}
                </h3>
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
                <p className="text-xs text-[var(--foreground-muted)]">
                  Total Actions
                </p>
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

      <CreateAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companySlug={companySlug}
      />
    </div>
  );
}
