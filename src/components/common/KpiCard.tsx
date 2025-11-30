import type { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "border-l-[var(--primary)]",
  success: "border-l-[var(--risk-low)]",
  warning: "border-l-[var(--risk-medium)]",
  danger: "border-l-[var(--risk-critical)]",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  className = "",
}: KpiCardProps) {
  return (
    <div
      className={`card border-l-4 ${variantStyles[variant]} animate-fade-in ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-[var(--foreground-muted)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                trend.isPositive ? "text-[var(--risk-low)]" : "text-[var(--risk-critical)]"
              }`}
            >
              <svg
                className={`w-4 h-4 ${trend.isPositive ? "" : "rotate-180"}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[var(--background-alt)] flex items-center justify-center text-[var(--foreground-muted)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

