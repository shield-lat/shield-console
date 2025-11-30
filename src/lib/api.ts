/**
 * Shield Console - API Layer
 *
 * This module provides data fetching functions for the Shield Console.
 * It supports two modes:
 *
 * 1. Real API Mode: Connects to Shield Core backend when NEXT_PUBLIC_SHIELD_API_URL is set
 * 2. Mock Mode: Uses mock data for development/demo when no API URL is configured
 *
 * The mode is automatically selected based on environment configuration.
 */

import {
  filterByApplication,
  getApplicationById,
  mockAgentActions,
  mockApplications,
  mockAttackEvents,
  mockHitlTasks,
  mockOverviewMetrics,
} from "./mockData";
import * as shieldApi from "./shield-api";
import type {
  ActivityLogFilters,
  AgentAction,
  Application,
  AttackEvent,
  HitlDecisionPayload,
  HitlStatus,
  HitlTask,
  OrganizationSettings,
  OverviewMetrics,
  RiskTier,
  TimeRangePreset,
} from "./types";

// ============================================================================
// Configuration
// ============================================================================

// Check if we should use the real API
const API_URL = process.env.NEXT_PUBLIC_SHIELD_API_URL;
const USE_REAL_API = !!API_URL && API_URL !== "";

// Simulated network delay for mock responses (ms)
const MOCK_DELAY = 100;

async function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
}

// Auth context for server-side API calls
export interface AuthContext {
  companyId?: string | null;
  accessToken?: string;
}

// ============================================================================
// Overview / Dashboard
// ============================================================================

export interface GetOverviewParams extends AuthContext {
  applicationId?: string | null;
  timeRange?: TimeRangePreset;
}

export async function getOverviewMetrics(
  params?: GetOverviewParams
): Promise<OverviewMetrics> {
  const companyId = params?.companyId;
  const accessToken = params?.accessToken;

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.getMetricsOverview(
        companyId,
        {
          timeRange: params?.timeRange || "7d",
          appId: params?.applicationId,
        },
        accessToken
      );
    } catch (error) {
      console.error(
        "Failed to fetch metrics from API, falling back to mock:",
        error
      );
    }
  }

  // Mock implementation
  await mockDelay();
  const metrics = { ...mockOverviewMetrics };

  if (params?.applicationId) {
    const app = getApplicationById(params.applicationId);
    if (app) {
      metrics.totalActions = app.metrics.totalActions;
      metrics.blockedActions = app.metrics.blockedActions;
      metrics.escalatedActions = app.metrics.hitlActions;
      metrics.attackAttempts = app.metrics.attacksDetected;
      metrics.attackSuccessRate = app.metrics.attackSuccessRate * 100;
      metrics.usersImpacted = app.metrics.usersImpacted;
      metrics.attacksByApplication = metrics.attacksByApplication.filter(
        (a) => a.applicationId === params.applicationId
      );
    }
  }

  return metrics;
}

// ============================================================================
// Applications
// ============================================================================

export interface GetApplicationsParams extends AuthContext {}

export async function getApplications(
  params?: GetApplicationsParams
): Promise<Application[]> {
  const companyId = params?.companyId;
  const accessToken = params?.accessToken;

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.listApps(companyId, accessToken);
    } catch (error) {
      console.error(
        "Failed to fetch apps from API, falling back to mock:",
        error
      );
    }
  }

  await mockDelay();
  return mockApplications;
}

export interface GetApplicationParams extends AuthContext {
  id: string;
}

export async function getApplication(
  params: GetApplicationParams
): Promise<Application | null> {
  const { id, companyId, accessToken } = params;

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.getApp(companyId, id, accessToken);
    } catch (error) {
      console.error(
        "Failed to fetch app from API, falling back to mock:",
        error
      );
    }
  }

  await mockDelay();
  return getApplicationById(id) || null;
}

// ============================================================================
// Agent Actions
// ============================================================================

export interface GetActionsParams extends AuthContext {
  applicationId?: string | null;
  decision?: string;
  riskTier?: string;
  search?: string;
  limit?: number;
}

export async function getRecentActions(
  params?: GetActionsParams
): Promise<AgentAction[]> {
  const companyId = params?.companyId;
  const accessToken = params?.accessToken;

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.getRecentActions(
        companyId,
        {
          appId: params?.applicationId,
          limit: params?.limit || 15,
        },
        accessToken
      );
    } catch (error) {
      console.error(
        "Failed to fetch actions from API, falling back to mock:",
        error
      );
    }
  }

  // Mock implementation
  await mockDelay();
  let actions = [...mockAgentActions];

  if (params?.applicationId) {
    actions = filterByApplication(actions, params.applicationId);
  }

  if (params?.decision) {
    actions = actions.filter((a) => a.decision === params.decision);
  }

  if (params?.riskTier) {
    actions = actions.filter((a) => a.riskTier === params.riskTier);
  }

  if (params?.search) {
    const term = params.search.toLowerCase();
    actions = actions.filter(
      (a) =>
        a.userId.toLowerCase().includes(term) ||
        a.traceId.toLowerCase().includes(term) ||
        a.actionType.toLowerCase().includes(term) ||
        a.originalIntent.toLowerCase().includes(term)
    );
  }

  const limit = params?.limit || 20;
  return actions.slice(0, limit);
}

export async function getActionById(id: string): Promise<AgentAction | null> {
  // Real API doesn't have a get-by-id endpoint yet
  await mockDelay();
  return mockAgentActions.find((a) => a.id === id) || null;
}

// ============================================================================
// HITL Tasks
// ============================================================================

export interface GetHitlTasksParams extends AuthContext {
  status?: HitlStatus;
  applicationId?: string;
  riskTier?: RiskTier;
  search?: string;
}

export async function getHitlTasks(
  params?: GetHitlTasksParams
): Promise<HitlTask[]> {
  const { companyId, accessToken, ...filters } = params || {};

  if (USE_REAL_API && accessToken) {
    try {
      const result = await shieldApi.listHitlTasks(
        {
          status: filters?.status,
          limit: 50,
        },
        accessToken
      );
      // Note: The real API returns partial tasks, we may need to fetch details
      return result.tasks as HitlTask[];
    } catch (error) {
      console.error(
        "Failed to fetch HITL tasks from API, falling back to mock:",
        error
      );
    }
  }

  // Mock implementation
  await mockDelay();
  let tasks = [...mockHitlTasks];

  if (filters?.applicationId) {
    tasks = filterByApplication(tasks, filters.applicationId);
  }

  if (filters?.status) {
    tasks = tasks.filter((t) => t.status === filters.status);
  }

  if (filters?.riskTier) {
    tasks = tasks.filter((t) => t.agentAction.riskTier === filters.riskTier);
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.agentAction.userId.toLowerCase().includes(term) ||
        t.agentAction.traceId.toLowerCase().includes(term) ||
        t.id.toLowerCase().includes(term)
    );
  }

  return tasks;
}

export async function getHitlTask(id: string): Promise<HitlTask | null> {
  if (USE_REAL_API) {
    try {
      return await shieldApi.getHitlTask(id);
    } catch (error) {
      console.error(
        "Failed to fetch HITL task from API, falling back to mock:",
        error
      );
    }
  }

  await mockDelay();
  return mockHitlTasks.find((t) => t.id === id) || null;
}

export async function submitHitlDecision(
  taskId: string,
  payload: HitlDecisionPayload
): Promise<{ success: boolean; task: HitlTask }> {
  if (USE_REAL_API) {
    try {
      const result = await shieldApi.submitHitlDecision(
        taskId,
        payload,
        "current-user" // TODO: Get from session
      );
      // Fetch the updated task
      const task = await getHitlTask(taskId);
      return { success: result.success, task: task! };
    } catch (error) {
      console.error(
        "Failed to submit HITL decision, falling back to mock:",
        error
      );
    }
  }

  // Mock implementation
  await mockDelay();

  const task = mockHitlTasks.find((t) => t.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  const updatedTask: HitlTask = {
    ...task,
    status: payload.decision,
    reviewerId: "current-user",
    reviewerName: "Current User",
    reviewedAt: new Date().toISOString(),
    reviewNotes: payload.reviewNotes,
  };

  return { success: true, task: updatedTask };
}

// ============================================================================
// Attack Events
// ============================================================================

export interface GetAttackEventsParams extends AuthContext {
  applicationId?: string | null;
}

export async function getAttackEvents(
  params?: GetAttackEventsParams
): Promise<AttackEvent[]> {
  const { companyId, accessToken, applicationId } = params || {};

  if (USE_REAL_API && companyId && accessToken) {
    try {
      const result = await shieldApi.listAttacks(
        companyId,
        {
          appId: applicationId,
          limit: 50,
        },
        accessToken
      );
      return result.attacks;
    } catch (error) {
      console.error(
        "Failed to fetch attacks from API, falling back to mock:",
        error
      );
    }
  }

  await mockDelay();
  let events = [...mockAttackEvents];

  if (applicationId) {
    events = filterByApplication(events, applicationId);
  }

  return events;
}

// ============================================================================
// Activity Log (for auditors)
// ============================================================================

export interface GetActivityLogParams extends AuthContext {
  filters?: ActivityLogFilters;
}

export async function getActivityLog(
  params?: GetActivityLogParams
): Promise<AgentAction[]> {
  const { companyId, accessToken, filters } = params || {};

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.getActivityLog(companyId, filters, accessToken);
    } catch (error) {
      console.error(
        "Failed to fetch activity log from API, falling back to mock:",
        error
      );
    }
  }

  // Mock implementation
  await mockDelay();
  let actions = [...mockAgentActions];

  if (filters?.applicationId) {
    actions = filterByApplication(actions, filters.applicationId);
  }

  if (filters?.decision) {
    actions = actions.filter((a) => a.decision === filters.decision);
  }

  if (filters?.riskTier) {
    actions = actions.filter((a) => a.riskTier === filters.riskTier);
  }

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    actions = actions.filter(
      (a) =>
        a.userId.toLowerCase().includes(term) ||
        a.traceId.toLowerCase().includes(term) ||
        a.actionType.toLowerCase().includes(term)
    );
  }

  return actions;
}

// ============================================================================
// Settings
// ============================================================================

export interface GetSettingsParams extends AuthContext {}

export async function getSettings(
  params?: GetSettingsParams
): Promise<OrganizationSettings | null> {
  const { companyId, accessToken } = params || {};

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.getSettings(companyId, accessToken);
    } catch (error) {
      console.error("Failed to fetch settings from API:", error);
    }
  }

  // Mock settings
  return {
    id: "org-1",
    name: "Acme Financial",
    policyThresholds: {
      maxAutoApproveAmount: 10000,
      hitlThresholdAmount: 50000,
      velocityLimitPerHour: 100,
      velocityLimitPerDay: 1000,
      blockHighRiskActions: true,
      requireHitlForNewBeneficiaries: true,
    },
  };
}

export interface UpdateSettingsParams extends AuthContext {
  data: Partial<OrganizationSettings>;
}

export async function updateSettings(
  params: UpdateSettingsParams
): Promise<OrganizationSettings | null> {
  const { companyId, accessToken, data } = params;

  if (USE_REAL_API && companyId && accessToken) {
    try {
      return await shieldApi.updateSettings(companyId, data, accessToken);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  }

  // Mock - just return the merged data
  const current = await getSettings();
  return { ...current!, ...data };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// API Status
// ============================================================================

export function isUsingRealApi(): boolean {
  return USE_REAL_API;
}

export async function checkApiHealth(): Promise<{
  status: string;
  version?: string;
} | null> {
  if (!USE_REAL_API) {
    return { status: "mock" };
  }

  try {
    const health = await shieldApi.checkHealth();
    return { status: health.status, version: health.version };
  } catch {
    return null;
  }
}
