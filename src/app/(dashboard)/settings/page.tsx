export const metadata = {
  title: "Settings | Shield Console",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Manage your organization and Shield configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Organization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue="Acme Financial Services"
                className="input"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Organization ID
              </label>
              <input
                type="text"
                defaultValue="org_acme_financial"
                className="input bg-slate-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                  AF
                </div>
                <button type="button" className="btn btn-secondary" disabled>
                  Change Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">API Keys</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Production API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="input flex-1 font-mono"
                  disabled
                />
                <button type="button" className="btn btn-secondary" disabled>
                  Copy
                </button>
              </div>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Last used 2 hours ago
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-1">
                Sandbox API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="input flex-1 font-mono"
                  disabled
                />
                <button type="button" className="btn btn-secondary" disabled>
                  Copy
                </button>
              </div>
            </div>
            <button type="button" className="btn btn-danger" disabled>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Regenerate Keys
            </button>
          </div>
        </div>

        {/* Policy Configuration */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Policy Configuration</h2>
          <p className="text-sm text-[var(--foreground-muted)] mb-6">
            Current thresholds and limits configured for your Shield instance.
            Contact support to modify these settings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Auto-Allow Threshold</span>
                <span className="badge badge-risk-low">Active</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">$5,000</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Transactions below this amount are auto-approved
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">HITL Threshold</span>
                <span className="badge badge-risk-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">$50,000</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Transactions above this require human review
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Hard Block Threshold</span>
                <span className="badge badge-risk-critical">Active</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">$500,000</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Transactions above this are automatically blocked
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Velocity Limit</span>
                <span className="badge badge-risk-medium">Active</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">10 / hour</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Max transfers per user per hour
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Prompt Injection Detection</span>
                <span className="badge badge-risk-low">Enabled</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">Strict</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Aggressive detection of injection attempts
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Misalignment Check</span>
                <span className="badge badge-risk-low">Enabled</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">On</p>
              <p className="text-xs text-[var(--foreground-muted)] mt-1">
                Verify agent actions match user intent
              </p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Email Alerts</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Receive alerts for critical events
                </p>
              </div>
              <button
                type="button"
                className="relative w-11 h-6 bg-[var(--primary)] rounded-full transition-colors"
                disabled
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Slack Integration</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Post HITL tasks to Slack channel
                </p>
              </div>
              <button
                type="button"
                className="relative w-11 h-6 bg-slate-200 rounded-full transition-colors"
                disabled
              >
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Webhook Callbacks</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Send events to your webhook endpoint
                </p>
              </div>
              <button
                type="button"
                className="relative w-11 h-6 bg-[var(--primary)] rounded-full transition-colors"
                disabled
              >
                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card border-red-200 bg-red-50/30">
          <h2 className="text-lg font-semibold text-red-700 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Disable Shield</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Temporarily disable Shield protection (not recommended)
                </p>
              </div>
              <button type="button" className="btn btn-danger" disabled>
                Disable
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Delete Organization</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  Permanently delete all data and settings
                </p>
              </div>
              <button type="button" className="btn btn-danger" disabled>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

