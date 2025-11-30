/**
 * Shield Core API Module
 * 
 * This module provides a complete integration with the Shield Core backend.
 * 
 * Usage:
 * 
 * ```ts
 * import { shieldApi } from "@/lib/shield-api";
 * 
 * // Auth
 * await shieldApi.login({ email, password });
 * const user = await shieldApi.getCurrentUser();
 * 
 * // Companies
 * const companies = await shieldApi.listCompanies();
 * 
 * // Metrics
 * const metrics = await shieldApi.getMetricsOverview(companyId, { timeRange: "7d" });
 * ```
 */

// Re-export client utilities
export { getToken, setToken, clearToken, checkHealth } from "./client";

// Re-export all services
export * from "./services";

// Re-export transformers for advanced usage
export * from "./transformers";

// Convenience namespace export
import * as services from "./services";
export const shieldApi = services;

