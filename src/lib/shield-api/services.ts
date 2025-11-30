/**
 * Shield Core API Services
 *
 * High-level service functions that call the API and transform responses.
 * These are the functions that should be used throughout the application.
 */

import type {
  ActivityLogFilters,
  AgentAction,
  Application,
  AttackEvent,
  Company,
  Decision,
  HitlDecisionPayload,
  HitlStatus,
  HitlTask,
  OrganizationSettings,
  OverviewMetrics,
  RiskTier,
  TimeRangePreset,
  User,
} from "@/lib/types";
import { api, clearToken, getToken, setToken } from "./client";
import {
  toBackendSettings,
  transformAction,
  transformApp,
  transformAttackEvent,
  transformCompany,
  transformHitlTaskDetails,
  transformMetricsOverview,
  transformRiskDistributionPoint,
  transformSettings,
  transformTimeSeriesPoint,
  type BackendActionListItem,
  type BackendApp,
  type BackendAttackEvent,
  type BackendCompany,
  type BackendCompanySettings,
  type BackendHitlTaskDetails,
  type BackendHitlTaskSummary,
  type BackendMetricsOverview,
  type BackendRiskDistributionPoint,
  type BackendTimeSeriesPoint,
} from "./transformers";

// ============================================================================
// Auth Services
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  expiresIn: number;
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResult> {
  const response = await api.post<{
    token: string;
    user: { id: string; email: string; role: string };
    expires_in: number;
  }>("/auth/login", credentials);

  // Store the token
  setToken(response.token);

  return {
    token: response.token,
    user: response.user,
    expiresIn: response.expires_in,
  };
}

export async function logout(): Promise<void> {
  clearToken();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ id: string; email: string; role: string }>(
      "/auth/me"
    );
    return {
      id: response.id,
      email: response.email,
      name: response.email.split("@")[0], // Derive name from email
      image: null,
      emailVerified: null,
      companyId: null, // Will be set after fetching companies
      role: response.role as "owner" | "admin" | "member" | "viewer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ============================================================================
// Company Services
// ============================================================================

export async function listCompanies(): Promise<Company[]> {
  const response = await api.get<{ companies: BackendCompany[] }>("/companies");
  return response.companies.map(transformCompany);
}

export async function getCompany(id: string): Promise<Company> {
  const response = await api.get<{ company: BackendCompany }>(
    `/companies/${id}`
  );
  return transformCompany(response.company);
}

export async function createCompany(data: {
  name: string;
  description?: string;
}): Promise<Company> {
  const response = await api.post<{ company: BackendCompany }>(
    "/companies",
    data
  );
  return transformCompany(response.company);
}

export async function updateCompany(
  id: string,
  data: { name?: string; description?: string }
): Promise<Company> {
  const response = await api.put<{ company: BackendCompany }>(
    `/companies/${id}`,
    data
  );
  return transformCompany(response.company);
}

export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`/companies/${id}`);
}

// ============================================================================
// Application (App) Services
// ============================================================================

export async function listApps(
  companyId: string,
  token?: string
): Promise<Application[]> {
  const response = await api.get<{ apps: BackendApp[] }>(
    `/companies/${companyId}/apps`,
    undefined,
    token
  );
  return response.apps.map(transformApp);
}

export async function getApp(
  companyId: string,
  appId: string,
  token?: string
): Promise<Application> {
  const response = await api.get<{ app: BackendApp }>(
    `/companies/${companyId}/apps/${appId}`,
    undefined,
    token
  );
  return transformApp(response.app);
}

export async function createApp(
  companyId: string,
  data: { name: string; description?: string; rate_limit?: number }
): Promise<{ app: Application; apiKey: string }> {
  const response = await api.post<{
    app: BackendApp;
    api_key: string;
    warning: string;
  }>(`/companies/${companyId}/apps`, data);

  return {
    app: transformApp(response.app),
    apiKey: response.api_key,
  };
}

export async function updateApp(
  companyId: string,
  appId: string,
  data: {
    name?: string;
    description?: string;
    status?: string;
    rate_limit?: number;
  }
): Promise<Application> {
  const response = await api.put<{ app: BackendApp }>(
    `/companies/${companyId}/apps/${appId}`,
    data
  );
  return transformApp(response.app);
}

export async function deleteApp(
  companyId: string,
  appId: string
): Promise<void> {
  await api.delete(`/companies/${companyId}/apps/${appId}`);
}

// ============================================================================
// Actions Services
// ============================================================================

export interface ListActionsParams {
  appId?: string | null;
  decision?: Decision | null;
  riskTier?: RiskTier | null;
  userId?: string | null;
  search?: string | null;
  timeRange?: TimeRangePreset | null;
  limit?: number;
  offset?: number;
}

export async function listActions(
  companyId: string,
  params?: ListActionsParams,
  token?: string
): Promise<{ actions: AgentAction[]; total: number }> {
  const response = await api.get<{
    actions: BackendActionListItem[];
    total: number;
    limit: number;
    offset: number;
  }>(
    `/companies/${companyId}/actions`,
    {
      app_id: params?.appId,
      decision: params?.decision?.toLowerCase().replace("hitl", "_hitl"),
      risk_tier: params?.riskTier?.toLowerCase(),
      user_id: params?.userId,
      search: params?.search,
      time_range: params?.timeRange,
      limit: params?.limit || 20,
      offset: params?.offset || 0,
    },
    token
  );

  return {
    actions: response.actions.map(transformAction),
    total: response.total,
  };
}

export async function getRecentActions(
  companyId: string,
  params?: { appId?: string | null; limit?: number },
  token?: string
): Promise<AgentAction[]> {
  const result = await listActions(
    companyId,
    {
      appId: params?.appId,
      limit: params?.limit || 15,
    },
    token
  );
  return result.actions;
}

// ============================================================================
// HITL Services
// ============================================================================

export async function listHitlTasks(params?: {
  status?: HitlStatus | null;
  limit?: number;
  offset?: number;
}): Promise<{ tasks: Partial<HitlTask>[]; total: number }> {
  const response = await api.get<{
    tasks: BackendHitlTaskSummary[];
    total: number;
    limit: number;
    offset: number;
  }>("/hitl/tasks", {
    status: params?.status?.toLowerCase(),
    limit: params?.limit || 20,
    offset: params?.offset || 0,
  });

  return {
    tasks: response.tasks.map((t) => ({
      id: t.id,
      status:
        t.status === "pending"
          ? "Pending"
          : t.status === "approved"
          ? "Approved"
          : "Rejected",
      createdAt: t.created_at,
      agentAction: {
        id: t.id,
        traceId: "",
        applicationId: "",
        applicationName: "",
        userId: t.user_id,
        actionType: t.action_type as any,
        amount: t.amount || undefined,
        originalIntent: "",
        decision: "RequireHitl" as Decision,
        riskTier: t.risk_tier as RiskTier,
        reasons: [],
        createdAt: t.created_at,
      },
    })),
    total: response.total,
  };
}

export async function getHitlTask(taskId: string): Promise<HitlTask> {
  const response = await api.get<BackendHitlTaskDetails>(
    `/hitl/tasks/${taskId}`
  );
  return transformHitlTaskDetails(response);
}

export async function submitHitlDecision(
  taskId: string,
  payload: HitlDecisionPayload,
  reviewerId: string
): Promise<{ success: boolean; status: HitlStatus }> {
  const response = await api.post<{
    task_id: string;
    status: string;
    message: string;
  }>(`/hitl/tasks/${taskId}/decision`, {
    decision: payload.decision === "Approved" ? "approve" : "reject",
    reviewer_id: reviewerId,
    notes: payload.reviewNotes,
  });

  return {
    success: true,
    status: response.status === "approved" ? "Approved" : "Rejected",
  };
}

// ============================================================================
// Attack Services
// ============================================================================

export async function listAttacks(
  companyId: string,
  params?: {
    appId?: string | null;
    attackType?: string | null;
    severity?: RiskTier | null;
    outcome?: string | null;
    limit?: number;
    offset?: number;
  },
  token?: string
): Promise<{ attacks: AttackEvent[]; total: number }> {
  const response = await api.get<{
    attacks: BackendAttackEvent[];
    total: number;
  }>(
    `/companies/${companyId}/attacks`,
    {
      app_id: params?.appId,
      attack_type: params?.attackType,
      severity: params?.severity?.toLowerCase(),
      outcome: params?.outcome?.toLowerCase(),
      limit: params?.limit || 20,
      offset: params?.offset || 0,
    },
    token
  );

  return {
    attacks: response.attacks.map(transformAttackEvent),
    total: response.total,
  };
}

// ============================================================================
// Metrics Services
// ============================================================================

export async function getMetricsOverview(
  companyId: string,
  params?: { timeRange?: TimeRangePreset; appId?: string | null },
  token?: string
): Promise<OverviewMetrics> {
  // Fetch all metrics in parallel
  const [overviewRes, timeSeriesRes, riskDistRes] = await Promise.all([
    api.get<BackendMetricsOverview>(
      `/companies/${companyId}/metrics/overview`,
      {
        time_range: params?.timeRange || "7d",
        app_id: params?.appId,
      },
      token
    ),
    api.get<{ data: BackendTimeSeriesPoint[] }>(
      `/companies/${companyId}/metrics/time-series`,
      {
        time_range: params?.timeRange || "7d",
        app_id: params?.appId,
        granularity: params?.timeRange === "24h" ? "hour" : "day",
      },
      token
    ),
    api.get<{ data: BackendRiskDistributionPoint[] }>(
      `/companies/${companyId}/metrics/risk-distribution`,
      {
        time_range: params?.timeRange || "7d",
        app_id: params?.appId,
      },
      token
    ),
  ]);

  return transformMetricsOverview(
    overviewRes,
    timeSeriesRes.data,
    riskDistRes.data
  );
}

export async function getTimeSeries(
  companyId: string,
  params?: {
    timeRange?: TimeRangePreset;
    appId?: string | null;
    granularity?: "hour" | "day";
  }
): Promise<
  { timestamp: string; allowed: number; hitl: number; blocked: number }[]
> {
  const response = await api.get<{ data: BackendTimeSeriesPoint[] }>(
    `/companies/${companyId}/metrics/time-series`,
    {
      time_range: params?.timeRange || "7d",
      app_id: params?.appId,
      granularity: params?.granularity || "day",
    }
  );

  return response.data.map(transformTimeSeriesPoint);
}

export async function getRiskDistribution(
  companyId: string,
  params?: { timeRange?: TimeRangePreset; appId?: string | null }
): Promise<{ tier: RiskTier; count: number; percentage: number }[]> {
  const response = await api.get<{ data: BackendRiskDistributionPoint[] }>(
    `/companies/${companyId}/metrics/risk-distribution`,
    {
      time_range: params?.timeRange || "7d",
      app_id: params?.appId,
    }
  );

  return response.data.map(transformRiskDistributionPoint);
}

// ============================================================================
// Settings Services
// ============================================================================

export async function getSettings(
  companyId: string,
  token?: string
): Promise<OrganizationSettings> {
  const response = await api.get<BackendCompanySettings>(
    `/companies/${companyId}/settings`,
    undefined,
    token
  );
  return transformSettings(response);
}

export async function updateSettings(
  companyId: string,
  data: Partial<OrganizationSettings>,
  token?: string
): Promise<OrganizationSettings> {
  const response = await api.put<BackendCompanySettings>(
    `/companies/${companyId}/settings`,
    toBackendSettings(data),
    token
  );
  return transformSettings(response);
}

// ============================================================================
// Activity Log (uses actions endpoint)
// ============================================================================

export async function getActivityLog(
  companyId: string,
  filters?: ActivityLogFilters,
  token?: string
): Promise<AgentAction[]> {
  const result = await listActions(
    companyId,
    {
      appId: filters?.applicationId,
      decision: filters?.decision,
      riskTier: filters?.riskTier,
      search: filters?.search,
      limit: 100, // Activity log typically wants more results
    },
    token
  );
  return result.actions;
}
