"use client";

import { useState } from "react";
import {
  mockRegulatoryFrameworks,
  mockGovernmentPolicies,
  mockSafetyPolicies,
  mockAiGovernancePrinciples,
} from "@/lib/mockData";
import type {
  RegulatoryFramework,
  GovernmentPolicy,
  SafetyPolicy,
  AiGovernancePrinciple,
  ComplianceStatus,
  RegulatoryCategory,
} from "@/lib/types";

type TabId = "safety" | "compliance" | "government" | "principles";

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "safety",
    label: "Safety Policies",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    id: "compliance",
    label: "Regulatory Compliance",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    id: "government",
    label: "Public Policy",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
  },
  {
    id: "principles",
    label: "AI Governance",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

function getComplianceStatusBadge(status: ComplianceStatus) {
  const styles: Record<ComplianceStatus, string> = {
    compliant: "badge-risk-low",
    partial: "badge-risk-medium",
    non_compliant: "badge-risk-critical",
    not_applicable: "bg-[var(--background-alt)] text-[var(--foreground-muted)]",
  };

  const labels: Record<ComplianceStatus, string> = {
    compliant: "Compliant",
    partial: "Partial",
    non_compliant: "Non-Compliant",
    not_applicable: "N/A",
  };

  return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
}

function getCategoryBadge(category: RegulatoryCategory) {
  const styles: Record<RegulatoryCategory, string> = {
    data_protection: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    financial_services: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    ai_governance: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    consumer_protection: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    cybersecurity: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const labels: Record<RegulatoryCategory, string> = {
    data_protection: "Data Protection",
    financial_services: "Financial Services",
    ai_governance: "AI Governance",
    consumer_protection: "Consumer Protection",
    cybersecurity: "Cybersecurity",
  };

  return <span className={`badge ${styles[category]}`}>{labels[category]}</span>;
}

function SafetyPoliciesTab({ policies }: { policies: SafetyPolicy[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categoryIcons: Record<SafetyPolicy["category"], React.ReactNode> = {
    detection: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    prevention: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    response: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    governance: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Active Safety Policies</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            {policies.filter((p) => p.enabled).length} of {policies.length} policies enabled
          </p>
        </div>
        <button className="btn btn-primary" disabled>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Policy
        </button>
      </div>

      <div className="grid gap-4">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className={`card cursor-pointer transition-all ${
              expandedId === policy.id ? "ring-2 ring-[var(--primary)]" : ""
            }`}
            onClick={() => setExpandedId(expandedId === policy.id ? null : policy.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    policy.enabled
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "bg-[var(--background-alt)] text-[var(--foreground-muted)]"
                  }`}
                >
                  {categoryIcons[policy.category]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--foreground)]">{policy.name}</h3>
                    <span className={`badge badge-risk-${policy.severity.toLowerCase()}`}>
                      {policy.severity}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">{policy.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`badge ${
                    policy.enabled ? "badge-risk-low" : "bg-[var(--background-alt)] text-[var(--foreground-muted)]"
                  }`}
                >
                  {policy.enabled ? "Enabled" : "Disabled"}
                </span>
                <svg
                  className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${
                    expandedId === policy.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {expandedId === policy.id && (
              <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">Configuration</h4>
                <pre className="code-block text-xs overflow-x-auto">
                  {JSON.stringify(policy.configuration, null, 2)}
                </pre>
                <p className="text-xs text-[var(--foreground-muted)] mt-3">
                  Last updated: {new Date(policy.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RegulatoryComplianceTab({ frameworks }: { frameworks: RegulatoryFramework[] }) {
  const [selectedFramework, setSelectedFramework] = useState<RegulatoryFramework | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Regulatory Compliance Status</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Compliance with industry standards and regulatory frameworks
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--risk-low-bg)]">
              <svg className="w-5 h-5 text-[var(--risk-low)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {frameworks.filter((f) => f.status === "compliant").length}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Compliant</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--risk-medium-bg)]">
              <svg className="w-5 h-5 text-[var(--risk-medium)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {frameworks.filter((f) => f.status === "partial").length}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Partial</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary-light)]">
              <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{frameworks.length}</p>
              <p className="text-xs text-[var(--foreground-muted)]">Total Frameworks</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--background-alt)]">
              <svg className="w-5 h-5 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {frameworks.filter((f) => f.nextAudit).length}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Scheduled Audits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Frameworks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {frameworks.map((framework) => (
          <div
            key={framework.id}
            className={`card cursor-pointer transition-all hover:border-[var(--primary)] ${
              selectedFramework?.id === framework.id ? "ring-2 ring-[var(--primary)]" : ""
            }`}
            onClick={() => setSelectedFramework(selectedFramework?.id === framework.id ? null : framework)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--foreground)]">{framework.shortName}</h3>
                  {getComplianceStatusBadge(framework.status)}
                </div>
                <p className="text-sm text-[var(--foreground-muted)]">{framework.name}</p>
              </div>
              {getCategoryBadge(framework.category)}
            </div>

            <p className="text-sm text-[var(--foreground-muted)] mb-3">{framework.description}</p>

            <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
              <span>📍 {framework.jurisdiction}</span>
              {framework.lastAudit && (
                <span>Last audit: {new Date(framework.lastAudit).toLocaleDateString()}</span>
              )}
            </div>

            {selectedFramework?.id === framework.id && (
              <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">Requirements</h4>
                <div className="space-y-2">
                  {framework.requirements.map((req) => (
                    <div key={req.id} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5">
                        {req.status === "compliant" ? (
                          <svg className="w-4 h-4 text-[var(--risk-low)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-[var(--risk-medium)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{req.name}</p>
                        <p className="text-[var(--foreground-muted)]">{req.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {framework.certificationUrl && (
                  <a
                    href={framework.certificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[var(--primary)] mt-3 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Certification
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GovernmentPoliciesTab({ policies }: { policies: GovernmentPolicy[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Government & Public Policy</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Regulatory landscape affecting AI in financial services
        </p>
      </div>

      {/* World Map Placeholder */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-lg bg-[var(--primary-light)]">
            <svg className="w-6 h-6 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Global Regulatory Coverage</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Tracking {policies.length} active policies across {new Set(policies.map((p) => p.jurisdiction)).size} jurisdictions
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(policies.map((p) => p.jurisdiction))).map((jurisdiction) => (
            <span key={jurisdiction} className="badge bg-[var(--background-alt)] text-[var(--foreground-muted)]">
              {jurisdiction}
            </span>
          ))}
        </div>
      </div>

      {/* Policies Timeline */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-[var(--foreground)]">{policy.name}</h3>
                  {getCategoryBadge(policy.category)}
                  <span
                    className={`badge ${
                      policy.status === "active"
                        ? "badge-risk-low"
                        : policy.status === "proposed"
                        ? "badge-risk-medium"
                        : "bg-[var(--background-alt)] text-[var(--foreground-muted)]"
                    }`}
                  >
                    {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-[var(--foreground-muted)] mt-1">
                  {policy.issuingBody} • {policy.jurisdiction}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-[var(--foreground-muted)]">Effective</p>
                <p className="font-medium text-[var(--foreground)]">
                  {new Date(policy.effectiveDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-[var(--foreground-muted)] mb-4">{policy.summary}</p>

            <div className="p-3 bg-[var(--background-alt)] rounded-lg border border-[var(--card-border)]">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">How Shield Addresses This</p>
                  <p className="text-sm text-[var(--foreground-muted)]">{policy.impactOnShield}</p>
                </div>
              </div>
            </div>

            {policy.sourceUrl && (
              <a
                href={policy.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[var(--primary)] mt-3 hover:underline"
              >
                View Official Source
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AiGovernancePrinciplesTab({ principles }: { principles: AiGovernancePrinciple[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">AI Governance Principles</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Core principles guiding Shield's approach to responsible AI
        </p>
      </div>

      {/* Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {principles.map((principle, index) => (
          <div key={principle.id} className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">{principle.principle}</h3>
              </div>
            </div>

            <p className="text-sm text-[var(--foreground-muted)] mb-4">{principle.description}</p>

            <div className="p-3 bg-[var(--background-alt)] rounded-lg mb-4">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">Implementation in Shield</p>
              <p className="text-sm text-[var(--foreground-muted)]">{principle.implementation}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">Aligned Standards</p>
              <div className="flex flex-wrap gap-1">
                {principle.standards.map((standard) => (
                  <span key={standard} className="badge bg-[var(--background-alt)] text-[var(--foreground-muted)] text-xs">
                    {standard}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources */}
      <div className="card">
        <h3 className="font-semibold text-[var(--foreground)] mb-4">Learn More</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="#" className="p-4 rounded-lg border border-[var(--card-border)] hover:border-[var(--primary)] transition-colors">
            <svg className="w-6 h-6 text-[var(--primary)] mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="font-medium text-[var(--foreground)]">Documentation</p>
            <p className="text-sm text-[var(--foreground-muted)]">Technical guides on AI safety</p>
          </a>
          <a href="#" className="p-4 rounded-lg border border-[var(--card-border)] hover:border-[var(--primary)] transition-colors">
            <svg className="w-6 h-6 text-[var(--primary)] mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <p className="font-medium text-[var(--foreground)]">FAQ</p>
            <p className="text-sm text-[var(--foreground-muted)]">Common questions answered</p>
          </a>
          <a href="#" className="p-4 rounded-lg border border-[var(--card-border)] hover:border-[var(--primary)] transition-colors">
            <svg className="w-6 h-6 text-[var(--primary)] mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="font-medium text-[var(--foreground)]">Contact</p>
            <p className="text-sm text-[var(--foreground-muted)]">Get compliance support</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export function PoliciesClient() {
  const [activeTab, setActiveTab] = useState<TabId>("safety");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Policies & Compliance</h1>
        <p className="text-sm text-[var(--foreground-muted)] mt-1">
          Safety policies, regulatory frameworks, and AI governance principles
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--card-border)]">
        <nav className="flex gap-6 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--card-border)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "safety" && <SafetyPoliciesTab policies={mockSafetyPolicies} />}
        {activeTab === "compliance" && <RegulatoryComplianceTab frameworks={mockRegulatoryFrameworks} />}
        {activeTab === "government" && <GovernmentPoliciesTab policies={mockGovernmentPolicies} />}
        {activeTab === "principles" && <AiGovernancePrinciplesTab principles={mockAiGovernancePrinciples} />}
      </div>
    </div>
  );
}

