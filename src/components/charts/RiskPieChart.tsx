"use client";

import type { RiskTierDistributionItem } from "@/lib/types";

interface RiskPieChartProps {
  data: RiskTierDistributionItem[];
  size?: number;
}

const tierColors: Record<string, string> = {
  Low: "var(--risk-low)",
  Medium: "var(--risk-medium)",
  High: "var(--risk-high)",
  Critical: "var(--risk-critical)",
};

export function RiskPieChart({ data, size = 120 }: RiskPieChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  let currentAngle = -90; // Start from top

  const segments = data.map((d) => {
    const angle = (d.count / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const path =
      angle >= 360
        ? `M 50 10 A 40 40 0 1 1 49.99 10`
        : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...d,
      path,
      color: tierColors[d.tier],
    };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {segments.map((segment, i) => (
          <path
            key={segment.tier}
            d={segment.path}
            fill={segment.color}
            className="transition-all duration-300 hover:opacity-80"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
        {/* Center circle for donut effect */}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>

      <div className="flex flex-col gap-2">
        {data.map((item) => (
          <div key={item.tier} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: tierColors[item.tier] }}
            />
            <span className="text-[var(--foreground-muted)]">{item.tier}</span>
            <span className="font-medium text-[var(--foreground)]">{item.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

