"use client";

import type { ApplicationAttackData } from "@/lib/types";

interface BarChartProps {
  data: ApplicationAttackData[];
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.attackCount), 1);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">
        No data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between gap-2 h-[calc(100%-2rem)]">
        {data.map((item, index) => {
          const percentage = (item.attackCount / maxValue) * 100;
          const colors = [
            "bg-[var(--chart-1)]",
            "bg-[var(--chart-2)]",
            "bg-[var(--chart-3)]",
            "bg-[var(--chart-4)]",
            "bg-[var(--chart-5)]",
          ];
          return (
            <div key={item.applicationId} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-[var(--foreground)]">{item.attackCount}</span>
              <div
                className={`w-full rounded-t-md ${colors[index % colors.length]} transition-all duration-500`}
                style={{
                  height: `${percentage}%`,
                  minHeight: "4px",
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between gap-2 mt-2">
        {data.map((item) => (
          <div key={item.applicationId} className="flex-1 text-center">
            <span className="text-[10px] text-[var(--foreground-muted)] line-clamp-2 leading-tight">
              {item.applicationName.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

