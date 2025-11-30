/**
 * Shield Console - API Layer
 * Data fetching functions that currently return mock data.
 * Designed to be swapped out for real shield-core endpoints.
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
import type {
  ActivityFilters,
  AgentAction,
  Application,
  AttackEvent,
  HitlDecisionPayload,
  HitlFilters,
  HitlTask,
  OverviewMetrics,
  TimeRangePreset,
} from "./types";

// ============================================================================
// Configuration
// ============================================================================

// Base URL for the shield-core backend (to be configured via env)
const API_BASE_URL = process.env.NEXT_PUBLIC_SHIELD_API_URL || "/api";

// Simulated network delay for mock responses (ms)
const MOCK_DELAY = 100;

async function mockDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
}

// ============================================================================
// Overview / Dashboard
// ============================================================================

export interface GetOverviewParams {
  applicationId?: string | null;
  timeRange?: TimeRangePreset;
}

export async function getOverviewMetrics(
  params?: GetOverviewParams
): Promise<OverviewMetrics> {
  await mockDelay();

  // In production, this would call:
  // GET ${API_BASE_URL}/metrics/overview?applicationId=${params.applicationId}&timeRange=${params.timeRange}

  const metrics = { ...mockOverviewMetrics };

  // Adjust metrics if filtering by application
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

export async function getApplications(): Promise<Application[]> {
  await mockDelay();

  // In production: GET ${API_BASE_URL}/applications
  return mockApplications;
}

export async function getApplication(id: string): Promise<Application | null> {
  await mockDelay();

  // In production: GET ${API_BASE_URL}/applications/${id}
  return getApplicationById(id) || null;
}

// ============================================================================
// Agent Actions
// ============================================================================

export interface GetActionsParams {
  applicationId?: string | null;
  decision?: string;
  riskTier?: string;
  search?: string;
  limit?: number;
}

export async function getRecentActions(
  params?: GetActionsParams
): Promise<AgentAction[]> {
  await mockDelay();

  // In production: GET ${API_BASE_URL}/actions/recent?...
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
  await mockDelay();

  // In production: GET ${API_BASE_URL}/actions/${id}
  return mockAgentActions.find((a) => a.id === id) || null;
}

// ============================================================================
// HITL Tasks
// ============================================================================

export async function getHitlTasks(filters?: HitlFilters): Promise<HitlTask[]> {
  await mockDelay();

  // In production: GET ${API_BASE_URL}/hitl/tasks?...
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
  await mockDelay();

  // In production: GET ${API_BASE_URL}/hitl/tasks/${id}
  return mockHitlTasks.find((t) => t.id === id) || null;
}

export async function submitHitlDecision(
  taskId: string,
  payload: HitlDecisionPayload
): Promise<{ success: boolean; task: HitlTask }> {
  await mockDelay();

  // In production: POST ${API_BASE_URL}/hitl/tasks/${taskId}/decision

  const task = mockHitlTasks.find((t) => t.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  // Update the task (in mock, this doesn't persist)
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

export async function getAttackEvents(
  applicationId?: string | null
): Promise<AttackEvent[]> {
  await mockDelay();

  // In production: GET ${API_BASE_URL}/attacks?applicationId=${applicationId}
  let events = [...mockAttackEvents];

  if (applicationId) {
    events = filterByApplication(events, applicationId);
  }

  return events;
}

// ============================================================================
// Activity Log (for auditors)
// ============================================================================

export async function getActivityLog(
  filters?: ActivityFilters
): Promise<AgentAction[]> {
  await mockDelay();

  // In production: GET ${API_BASE_URL}/activity?...
  // This returns a more comprehensive list for audit purposes
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
// Utility
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
