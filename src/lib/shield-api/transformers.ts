/**
 * Transformers for Shield Core API
 * 
 * Converts between backend (snake_case) and frontend (camelCase) formats.
 * Also handles enum value transformations.
 */

import type {
  AgentAction,
  Application,
  ApplicationMetrics,
  AttackEvent,
  Company,
  Decision,
  HitlStatus,
  HitlTask,
  OverviewMetrics,
  RiskTier,
  RiskTierDistributionItem,
  TimeSeriesDataPoint,
  AttackOutcome,
  AttackType,
  ActionType,
  PolicyThresholds,
  OrganizationSettings,
} from "@/lib/types";

// ============================================================================
// Backend Response Types (snake_case)
// ============================================================================

export interface BackendCompany {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendApp {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  api_key_prefix: string;
  status: "active" | "paused" | "revoked";
  rate_limit: number;
  last_used_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BackendActionListItem {
  id: string;
  trace_id: string;
  app_id?: string | null;
  app_name?: string | null;
  user_id: string;
  action_type: string;
  amount?: number | null;
  currency?: string | null;
  original_intent: string;
  decision: string;
  risk_tier: string;
  reasons: string[];
  created_at: string;
}

export interface BackendHitlTaskSummary {
  id: string;
  user_id: string;
  action_type: string;
  risk_tier: string;
  status: "pending" | "approved" | "rejected";
  amount?: number | null;
  created_at: string;
}

export interface BackendHitlTaskDetails {
  task: {
    id: string;
    agent_action_id: string;
    evaluation_id: string;
    status: "pending" | "approved" | "rejected";
    reviewer_id?: string | null;
    reviewed_at?: string | null;
    review_notes?: string | null;
    created_at: string;
  };
  agent_action: {
    id: string;
    trace_id: string;
    app_id?: string | null;
    user_id: string;
    channel: string;
    model_name: string;
    original_intent: string;
    action_type: string;
    payload: unknown;
    cot_trace?: string | null;
    created_at: string;
  };
  evaluation: {
    id: string;
    agent_action_id: string;
    decision: string;
    risk_tier: string;
    reasons: string[];
    rule_hits: string[];
    neural_signals: string[];
    created_at: string;
  };
}

export interface BackendAttackEvent {
  id: string;
  company_id: string;
  agent_action_id: string;
  app_id?: string | null;
  app_name?: string | null;
  attack_type: string;
  severity: string;
  blocked: boolean;
  outcome: string;
  user_id: string;
  description: string;
  details?: string | null;
  created_at: string;
}

export interface BackendMetricsOverview {
  total_actions: number;
  blocked_actions: number;
  escalated_actions: number;
  attack_attempts: number;
  attack_success_rate: number;
  users_impacted: number;
  trends: {
    total_actions: number;
    blocked_actions: number;
    escalated_actions: number;
    attack_attempts: number;
  };
}

export interface BackendTimeSeriesPoint {
  timestamp: string;
  allowed: number;
  hitl: number;
  blocked: number;
}

export interface BackendRiskDistributionPoint {
  tier: string;
  count: number;
  percentage: number;
}

export interface BackendCompanySettings {
  id: string;
  name: string;
  logo?: string | null;
  webhook_url?: string | null;
  notification_email?: string | null;
  policy_thresholds: {
    max_auto_approve_amount: number;
    hitl_threshold_amount: number;
    velocity_limit_per_hour: number;
    velocity_limit_per_day: number;
    block_high_risk_actions: boolean;
    require_hitl_for_new_beneficiaries: boolean;
  };
}

// ============================================================================
// Enum Transformers
// ============================================================================

export function toFrontendDecision(backendDecision: string): Decision {
  const map: Record<string, Decision> = {
    allow: "Allow",
    require_hitl: "RequireHitl",
    block: "Block",
  };
  return map[backendDecision.toLowerCase()] || "Block";
}

export function toBackendDecision(frontendDecision: Decision): string {
  const map: Record<Decision, string> = {
    Allow: "allow",
    RequireHitl: "require_hitl",
    Block: "block",
  };
  return map[frontendDecision];
}

export function toFrontendRiskTier(backendTier: string): RiskTier {
  const map: Record<string, RiskTier> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };
  return map[backendTier.toLowerCase()] || "Low";
}

export function toBackendRiskTier(frontendTier: RiskTier): string {
  return frontendTier.toLowerCase();
}

export function toFrontendHitlStatus(backendStatus: string): HitlStatus {
  const map: Record<string, HitlStatus> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
  return map[backendStatus.toLowerCase()] || "Pending";
}

export function toBackendHitlStatus(frontendStatus: HitlStatus): string {
  return frontendStatus.toLowerCase();
}

export function toFrontendActionType(backendType: string): ActionType {
  const map: Record<string, ActionType> = {
    get_balance: "GetBalance",
    transfer_funds: "TransferFunds",
    pay_bill: "PayBill",
    get_transactions: "ViewTransactions",
    request_loan: "RequestLoan",
    add_beneficiary: "AddBeneficiary",
    update_profile: "UpdateProfile",
    close_account: "CloseAccount",
    refund_transaction: "RefundTransaction",
    unknown: "GetBalance", // Default
  };
  return map[backendType.toLowerCase()] || "GetBalance";
}

export function toFrontendAttackType(backendType: string): AttackType {
  const map: Record<string, AttackType> = {
    prompt_injection: "prompt_injection",
    jailbreak_attempt: "jailbreak_attempt",
    data_exfiltration: "data_exfiltration",
    privilege_escalation: "privilege_escalation",
    misalignment: "misalignment",
    social_engineering: "social_engineering",
    unknown: "prompt_injection",
  };
  return map[backendType.toLowerCase()] || "prompt_injection";
}

export function toFrontendAttackOutcome(backendOutcome: string): AttackOutcome {
  const map: Record<string, AttackOutcome> = {
    blocked: "Blocked",
    escalated: "Escalated",
    allowed: "Allowed",
  };
  return map[backendOutcome.toLowerCase()] || "Blocked";
}

// ============================================================================
// Entity Transformers
// ============================================================================

export function transformCompany(backend: BackendCompany): Company {
  return {
    id: backend.id,
    name: backend.name,
    slug: backend.slug,
    logo: null, // Not in backend yet
    plan: "pro", // Not in backend yet, default to pro
    status: "active", // Not in backend yet
    createdAt: backend.created_at,
    updatedAt: backend.updated_at,
  };
}

export function transformApp(backend: BackendApp): Application {
  // Since backend doesn't have metrics yet, we return placeholder metrics
  const metrics: ApplicationMetrics = {
    totalActions: 0,
    blockedActions: 0,
    hitlActions: 0,
    attacksDetected: 0,
    attackSuccessRate: 0,
    usersImpacted: 0,
    pendingHitlTasks: 0,
  };

  return {
    id: backend.id,
    name: backend.name,
    description: backend.description || undefined,
    environment: "production", // Not in backend yet
    status: backend.status === "active" ? "healthy" : backend.status === "paused" ? "degraded" : "offline",
    createdAt: backend.created_at,
    lastActivityAt: backend.last_used_at || backend.updated_at,
    metrics,
  };
}

export function transformAction(backend: BackendActionListItem): AgentAction {
  return {
    id: backend.id,
    traceId: backend.trace_id,
    applicationId: backend.app_id || "",
    applicationName: backend.app_name || "Unknown App",
    userId: backend.user_id,
    actionType: toFrontendActionType(backend.action_type),
    amount: backend.amount || undefined,
    currency: backend.currency || undefined,
    originalIntent: backend.original_intent,
    decision: toFrontendDecision(backend.decision),
    riskTier: toFrontendRiskTier(backend.risk_tier),
    reasons: backend.reasons,
    createdAt: backend.created_at,
  };
}

export function transformHitlTaskSummary(
  backend: BackendHitlTaskSummary,
  appName?: string
): Partial<HitlTask> {
  return {
    id: backend.id,
    status: toFrontendHitlStatus(backend.status),
    createdAt: backend.created_at,
    agentAction: {
      id: backend.id, // Placeholder
      traceId: "",
      applicationId: "",
      applicationName: appName || "Unknown App",
      userId: backend.user_id,
      actionType: toFrontendActionType(backend.action_type),
      amount: backend.amount || undefined,
      originalIntent: "",
      decision: "RequireHitl",
      riskTier: toFrontendRiskTier(backend.risk_tier),
      reasons: [],
      createdAt: backend.created_at,
    },
  };
}

export function transformHitlTaskDetails(backend: BackendHitlTaskDetails): HitlTask {
  const action = backend.agent_action;
  const evaluation = backend.evaluation;
  const task = backend.task;

  return {
    id: task.id,
    applicationId: action.app_id || "",
    applicationName: "", // Need to fetch separately or add to response
    agentActionId: task.agent_action_id,
    agentAction: {
      id: action.id,
      traceId: action.trace_id,
      applicationId: action.app_id || "",
      applicationName: "",
      userId: action.user_id,
      actionType: toFrontendActionType(action.action_type),
      originalIntent: action.original_intent,
      decision: toFrontendDecision(evaluation.decision),
      riskTier: toFrontendRiskTier(evaluation.risk_tier),
      reasons: evaluation.reasons,
      createdAt: action.created_at,
    },
    status: toFrontendHitlStatus(task.status),
    reviewerId: task.reviewer_id || undefined,
    reviewedAt: task.reviewed_at || undefined,
    reviewNotes: task.review_notes || undefined,
    createdAt: task.created_at,
  };
}

export function transformAttackEvent(backend: BackendAttackEvent): AttackEvent {
  return {
    id: backend.id,
    applicationId: backend.app_id || "",
    applicationName: backend.app_name || "Unknown App",
    attackType: toFrontendAttackType(backend.attack_type),
    severity: toFrontendRiskTier(backend.severity),
    blocked: backend.blocked,
    outcome: toFrontendAttackOutcome(backend.outcome),
    userId: backend.user_id,
    description: backend.description,
    details: backend.details || undefined,
    createdAt: backend.created_at,
  };
}

export function transformMetricsOverview(
  backend: BackendMetricsOverview,
  timeSeries: BackendTimeSeriesPoint[],
  riskDistribution: BackendRiskDistributionPoint[],
  attacksByApp: { app_id: string; app_name: string; attack_count: number }[] = []
): OverviewMetrics {
  return {
    totalActions: backend.total_actions,
    blockedActions: backend.blocked_actions,
    escalatedActions: backend.escalated_actions,
    attackAttempts: backend.attack_attempts,
    attackSuccessRate: backend.attack_success_rate,
    usersImpacted: backend.users_impacted,
    actionsOverTime: timeSeries.map(transformTimeSeriesPoint),
    attacksByApplication: attacksByApp.map((a) => ({
      applicationId: a.app_id,
      applicationName: a.app_name,
      attackCount: a.attack_count,
    })),
    riskTierDistribution: riskDistribution.map(transformRiskDistributionPoint),
    trends: {
      totalActions: backend.trends.total_actions,
      blockedActions: backend.trends.blocked_actions,
      escalatedActions: backend.trends.escalated_actions,
      attackAttempts: backend.trends.attack_attempts,
    },
  };
}

export function transformTimeSeriesPoint(backend: BackendTimeSeriesPoint): TimeSeriesDataPoint {
  return {
    timestamp: backend.timestamp,
    allowed: backend.allowed,
    hitl: backend.hitl,
    blocked: backend.blocked,
  };
}

export function transformRiskDistributionPoint(
  backend: BackendRiskDistributionPoint
): RiskTierDistributionItem {
  return {
    tier: toFrontendRiskTier(backend.tier),
    count: backend.count,
    percentage: backend.percentage,
  };
}

export function transformSettings(backend: BackendCompanySettings): OrganizationSettings {
  return {
    id: backend.id,
    name: backend.name,
    logo: backend.logo || undefined,
    webhookUrl: backend.webhook_url || undefined,
    notificationEmail: backend.notification_email || undefined,
    policyThresholds: {
      maxAutoApproveAmount: backend.policy_thresholds.max_auto_approve_amount,
      hitlThresholdAmount: backend.policy_thresholds.hitl_threshold_amount,
      velocityLimitPerHour: backend.policy_thresholds.velocity_limit_per_hour,
      velocityLimitPerDay: backend.policy_thresholds.velocity_limit_per_day,
      blockHighRiskActions: backend.policy_thresholds.block_high_risk_actions,
      requireHitlForNewBeneficiaries: backend.policy_thresholds.require_hitl_for_new_beneficiaries,
    },
  };
}

export function toBackendSettings(frontend: Partial<OrganizationSettings>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (frontend.logo !== undefined) result.logo = frontend.logo;
  if (frontend.webhookUrl !== undefined) result.webhook_url = frontend.webhookUrl;
  if (frontend.notificationEmail !== undefined) result.notification_email = frontend.notificationEmail;

  if (frontend.policyThresholds) {
    result.policy_thresholds = {
      max_auto_approve_amount: frontend.policyThresholds.maxAutoApproveAmount,
      hitl_threshold_amount: frontend.policyThresholds.hitlThresholdAmount,
      velocity_limit_per_hour: frontend.policyThresholds.velocityLimitPerHour,
      velocity_limit_per_day: frontend.policyThresholds.velocityLimitPerDay,
      block_high_risk_actions: frontend.policyThresholds.blockHighRiskActions,
      require_hitl_for_new_beneficiaries: frontend.policyThresholds.requireHitlForNewBeneficiaries,
    };
  }

  return result;
}

