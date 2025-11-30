// ============================================================================
// Shield Console - Type Definitions
// Domain models for the AI Safety Gateway dashboard
// ============================================================================

// ============================================================================
// Auth & User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: Date | null;
  companyId: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: CompanyPlan;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
}

export type CompanyPlan = "free" | "starter" | "pro" | "enterprise";
export type CompanyStatus = "active" | "suspended" | "pending";

export interface OnboardingData {
  companyName: string;
  companySlug: string;
  industry: string;
  teamSize: string;
  useCase: string;
}

// ============================================================================
// Application Types
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
  // Metrics
  totalActions: number;
  blockedActions: number;
  escalatedActions: number;
  attacksDetected: number;
  attackSuccessRate: number;
  usersImpacted: number;
}

// ============================================================================
// Agent Action Types
// ============================================================================

export type Decision = "Allow" | "RequireHitl" | "Block";

export type RiskTier = "Low" | "Medium" | "High" | "Critical";

export type ActionType =
  | "GetBalance"
  | "TransferFunds"
  | "PayBill"
  | "RequestLoan"
  | "AddBeneficiary"
  | "UpdateProfile"
  | "ViewTransactions"
  | "CloseAccount";

export interface AgentAction {
  id: string;
  traceId: string;
  applicationId: string;
  applicationName: string;
  userId: string;
  actionType: ActionType;
  amount?: number;
  currency?: string;
  originalIntent: string;
  decision: Decision;
  riskTier: RiskTier;
  reasons: string[];
  createdAt: string;
}

// ============================================================================
// HITL (Human-In-The-Loop) Types
// ============================================================================

export type HitlStatus = "Pending" | "Approved" | "Rejected";

export interface HitlTask {
  id: string;
  applicationId: string;
  applicationName: string;
  agentActionId: string;
  agentAction: AgentAction;
  status: HitlStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

// ============================================================================
// Attack & Security Types
// ============================================================================

export type AttackType =
  | "prompt_injection"
  | "jailbreak_attempt"
  | "data_exfiltration"
  | "privilege_escalation"
  | "misalignment"
  | "social_engineering";

export interface AttackEvent {
  id: string;
  applicationId: string;
  applicationName: string;
  attackType: AttackType;
  severity: RiskTier;
  blocked: boolean;
  userId: string;
  description: string;
  createdAt: string;
}

// ============================================================================
// Metrics & Analytics Types
// ============================================================================

export interface OverviewMetrics {
  totalActions: number;
  blockedActions: number;
  escalatedActions: number;
  attackAttempts: number;
  attackSuccessRate: number;
  usersImpacted: number;
  // Trends (percentage change from previous period)
  trends: {
    totalActions: number;
    blockedActions: number;
    escalatedActions: number;
    attackAttempts: number;
  };
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  allowed: number;
  hitl: number;
  blocked: number;
}

export interface ApplicationAttackData {
  applicationId: string;
  applicationName: string;
  attackCount: number;
  successRate: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// ============================================================================
// Filter & Query Types
// ============================================================================

export type TimeRangePreset = "24h" | "7d" | "30d" | "90d";

export interface GlobalFilters {
  applicationId?: string;
  timeRange: TimeRangePreset;
  environment: Environment;
}

export interface ActivityLogFilters {
  applicationId?: string;
  decision?: Decision;
  riskTier?: RiskTier;
  search?: string;
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

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface PolicyThresholds {
  maxAutoApproveAmount: number;
  hitlThresholdAmount: number;
  velocityLimitPerHour: number;
  velocityLimitPerDay: number;
  blockHighRiskActions: boolean;
  requireHitlForNewBeneficiaries: boolean;
}

export interface OrganizationSettings {
  id: string;
  name: string;
  logo?: string;
  webhookUrl?: string;
  notificationEmail?: string;
  policyThresholds: PolicyThresholds;
}
