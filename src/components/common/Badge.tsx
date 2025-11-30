import type {
  Decision,
  RiskTier,
  ApplicationStatus,
  HitlStatus,
} from "@/lib/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  default: "bg-[var(--primary-light)] text-[var(--primary)]",
  success: "bg-[var(--decision-allow-bg)] text-[var(--decision-allow-text)]",
  warning: "bg-[var(--decision-hitl-bg)] text-[var(--decision-hitl-text)]",
  danger: "bg-[var(--decision-block-bg)] text-[var(--decision-block-text)]",
  info: "bg-[var(--secondary-light)] text-[var(--secondary)]",
  neutral: "bg-[var(--background-alt)] text-[var(--foreground-muted)]",
};

const sizeStyles = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

// Specialized badge components for domain types

export function RiskBadge({ tier }: { tier: RiskTier }) {
  const styles: Record<RiskTier, string> = {
    Low: "badge-risk-low",
    Medium: "badge-risk-medium",
    High: "badge-risk-high",
    Critical: "badge-risk-critical",
  };

  return <span className={`badge ${styles[tier]}`}>{tier}</span>;
}

export function DecisionBadge({ decision }: { decision: Decision }) {
  const labels: Record<Decision, string> = {
    Allow: "Allow",
    RequireHitl: "HITL",
    Block: "Block",
  };

  const styles: Record<Decision, string> = {
    Allow: "badge-decision-allow",
    RequireHitl: "badge-decision-hitl",
    Block: "badge-decision-block",
  };

  return <span className={`badge ${styles[decision]}`}>{labels[decision]}</span>;
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const styles: Record<ApplicationStatus, string> = {
    healthy: "badge-status-healthy",
    degraded: "badge-status-degraded",
    offline: "badge-status-offline",
  };

  const labels: Record<ApplicationStatus, string> = {
    healthy: "Healthy",
    degraded: "Degraded",
    offline: "Offline",
  };

  const dotColors: Record<ApplicationStatus, string> = {
    healthy: "bg-[var(--status-healthy)]",
    degraded: "bg-[var(--status-degraded)]",
    offline: "bg-[var(--status-offline)]",
  };

  return (
    <span className={`badge ${styles[status]} flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
      {labels[status]}
    </span>
  );
}

export function HitlStatusBadge({ status }: { status: HitlStatus }) {
  const styles: Record<HitlStatus, string> = {
    Pending: "badge-decision-hitl",
    Approved: "badge-decision-allow",
    Rejected: "badge-decision-block",
  };

  return <span className={`badge ${styles[status]}`}>{status}</span>;
}

export function EnvironmentBadge({
  environment,
}: {
  environment: "sandbox" | "production";
}) {
  return (
    <Badge variant={environment === "production" ? "success" : "info"}>
      {environment === "production" ? "Prod" : "Sandbox"}
    </Badge>
  );
}
