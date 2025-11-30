"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Environment, GlobalFilters, TimeRangePreset } from "@/lib/types";

interface GlobalFiltersContextType {
  filters: GlobalFilters;
  setApplicationId: (id: string | null) => void;
  setTimeRange: (range: TimeRangePreset) => void;
  setEnvironment: (env: Environment) => void;
}

const defaultFilters: GlobalFilters = {
  applicationId: null,
  timeRange: "7d",
  environment: "production",
};

const GlobalFiltersContext = createContext<GlobalFiltersContextType | undefined>(undefined);

export function GlobalFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);

  const setApplicationId = (id: string | null) => {
    setFilters((prev) => ({ ...prev, applicationId: id }));
  };

  const setTimeRange = (range: TimeRangePreset) => {
    setFilters((prev) => ({ ...prev, timeRange: range }));
  };

  const setEnvironment = (env: Environment) => {
    setFilters((prev) => ({ ...prev, environment: env }));
  };

  return (
    <GlobalFiltersContext.Provider
      value={{
        filters,
        setApplicationId,
        setTimeRange,
        setEnvironment,
      }}
    >
      {children}
    </GlobalFiltersContext.Provider>
  );
}

export function useGlobalFilters(): GlobalFiltersContextType {
  const context = useContext(GlobalFiltersContext);
  if (!context) {
    throw new Error("useGlobalFilters must be used within a GlobalFiltersProvider");
  }
  return context;
}

