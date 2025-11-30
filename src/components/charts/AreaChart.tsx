"use client";

import { useMemo } from "react";
import type { TimeSeriesDataPoint } from "@/lib/types";

interface AreaChartProps {
  data: TimeSeriesDataPoint[];
  height?: number;
}

export function AreaChart({ data, height = 200 }: AreaChartProps) {
  const chartData = useMemo(() => {
    if (!data.length) return null;

    const maxValue = Math.max(...data.map((d) => d.allow + d.requireHitl + d.block));
    const width = 100;
    const padding = 0;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const total = d.allow + d.requireHitl + d.block;
      return {
        x,
        total,
        allow: d.allow,
        requireHitl: d.requireHitl,
        block: d.block,
        yAllow: 100 - (d.allow / maxValue) * 100,
        yHitl: 100 - ((d.allow + d.requireHitl) / maxValue) * 100,
        yBlock: 100 - (total / maxValue) * 100,
      };
    });

    // Create SVG paths for stacked area
    const createPath = (yKey: "yAllow" | "yHitl" | "yBlock", prevYKey?: "yAllow" | "yHitl") => {
      let path = `M ${points[0].x} ${points[0][yKey]}`;
      for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i][yKey]}`;
      }
      // Close the path back to the bottom (or previous layer)
      for (let i = points.length - 1; i >= 0; i--) {
        path += ` L ${points[i].x} ${prevYKey ? points[i][prevYKey] : 100}`;
      }
      path += " Z";
      return path;
    };

    return {
      points,
      maxValue,
      pathAllow: createPath("yAllow"),
      pathHitl: createPath("yHitl", "yAllow"),
      pathBlock: createPath("yBlock", "yHitl"),
    };
  }, [data]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-full text-[var(--foreground-muted)]">
        No data available
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="10" height="20" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 20" fill="none" stroke="var(--card-border)" strokeWidth="0.2" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" opacity="0.5" />

        {/* Stacked areas */}
        <path d={chartData.pathAllow} fill="var(--chart-1)" opacity="0.7" />
        <path d={chartData.pathHitl} fill="var(--chart-2)" opacity="0.7" />
        <path d={chartData.pathBlock} fill="var(--chart-3)" opacity="0.7" />

        {/* Line on top */}
        <polyline
          points={chartData.points.map((p) => `${p.x},${p.yBlock}`).join(" ")}
          fill="none"
          stroke="var(--chart-3)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs pb-1">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--chart-1)] opacity-70" />
          <span className="text-[var(--foreground-muted)]">Allow</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--chart-2)] opacity-70" />
          <span className="text-[var(--foreground-muted)]">HITL</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-[var(--chart-3)] opacity-70" />
          <span className="text-[var(--foreground-muted)]">Block</span>
        </div>
      </div>
    </div>
  );
}

