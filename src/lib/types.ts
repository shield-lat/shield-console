/**
 * Shield Console - Domain Types
 * These types map to the shield-core Rust backend models
 */

// ============================================================================
// Application - Base unit of protection and measurement
// ============================================================================

export type Environment = "sandbox" | "production";
export type ApplicationStatus = "healthy" | "degraded" | "offline";

export interface Application {
  id: string;
  name: string;
  description?: string;
  environment: Environment;
  status: ApplicationStatus;
  createdAt: string;
  lastActivityAt: string;
  // Aggregated metrics (computed server-side)
  metrics: ApplicationMetrics;
}

export interface ApplicationMetrics {
  totalActions: number;
  blockedActions: number;
  hitlActions: number;
  attacksDetected: number;
  attackSuccessRate: number; // ASR = successfulAttacks / totalAttempts
  usersImpacted: number;
  pendingHitlTasks: number;
}

// ============================================================================
// AgentAction - A single action proposed by an AI agent
// ============================================================================

export type ActionType =
  | "GetBalance"
  | "TransferFunds"
  | "PayBill"
  | "RequestLoan"
  | "UpdateProfile"
  | "ViewTransactions"
  | "CreatePaymentLink"
  | "RefundTransaction"
  | "CloseAccount"
  | "AddBeneficiary";

export type Decision = "Allow" | "RequireHitl" | "Block";

export type RiskTier = "Low" | "Medium" | "High" | "Critical";

export interface AgentAction {
  id: string;
  traceId: string;
  applicationId: string;
  applicationName: string; // Denormalized for display
  userId: string;
  actionType: ActionType;
  amount?: number;
  currency?: string;
  originalIntent: string;
  decision: Decision;
  riskTier: RiskTier;
  reasons: string[]; // Rule hits, signals
  createdAt: string;
  // Optional extended info
  metadata?: Record<string, unknown>;
}

// ============================================================================
// HitlTask - Human-In-The-Loop review task
// ============================================================================

export type HitlStatus = "Pending" | "Approved" | "Rejected";

export interface HitlTask {
  id: string;
  applicationId: string;
  applicationName: string;
  agentActionId: string;
  agentAction: AgentAction; // Embedded for convenience
  status: HitlStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface HitlDecisionPayload {
  decision: "Approved" | "Rejected";
  reviewNotes?: string;
}

// ============================================================================
// Attack Metrics
// ============================================================================

export interface AttackMetrics {
  totalAttempts: number;
  blockedAttacks: number;
  successfulAttacks: number;
  attackSuccessRate: number; // ASR percentage
}

export type AttackType =
  | "PromptInjection"
  | "Misalignment"
  | "DataExfiltration"
  | "PolicyBypass"
  | "SocialEngineering";

export interface AttackEvent {
  id: string;
  applicationId: string;
  applicationName: string;
  attackType: AttackType;
  decision: Decision;
  outcome: "Blocked" | "Escalated" | "Succeeded";
  userId: string;
  createdAt: string;
  details: string;
}

// ============================================================================
// Overview / Dashboard Metrics
// ============================================================================

export interface OverviewMetrics {
  totalActions: number;
  blockedActions: number;
  escalatedActions: number; // HITL
  attackAttempts: number;
  attackSuccessRate: number;
  usersImpacted: number;
  // Time series for charts
  actionsOverTime: TimeSeriesDataPoint[];
  attacksByApplication: ApplicationAttackData[];
  riskTierDistribution: RiskTierData[];
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  allow: number;
  requireHitl: number;
  block: number;
}

export interface ApplicationAttackData {
  applicationId: string;
  applicationName: string;
  attackCount: number;
}

export interface RiskTierData {
  tier: RiskTier;
  count: number;
  percentage: number;
}

// ============================================================================
// Filter and Query Types
// ============================================================================

export interface DateRange {
  from: string;
  to: string;
}

export type TimeRangePreset = "24h" | "7d" | "30d" | "90d";

export interface ActivityFilters {
  applicationId?: string;
  decision?: Decision;
  riskTier?: RiskTier;
  search?: string;
  timeRange?: TimeRangePreset;
}

export interface HitlFilters {
  applicationId?: string;
  status?: HitlStatus;
  riskTier?: RiskTier;
  search?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface GlobalFilters {
  applicationId: string | null; // null = all applications
  timeRange: TimeRangePreset;
  environment: Environment;
}
