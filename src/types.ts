// ReviveAI — Core Domain Types and Interfaces

export type EventType =
  | 'PAYMENT_FAILED'
  | 'PAYMENT_SUCCESS'
  | 'SUBSCRIPTION_FAILED'
  | 'CHECKOUT_ABANDONED'
  | 'INVOICE_OVERDUE'
  | 'MANDATE_FAILED'
  | 'PAYMENT_RETRY'
  | 'RECOVERY_SUCCESS'
  | 'RECOVERY_FAILED'
  | 'CUSTOMER_OPT_OUT'
  | 'DISPUTE_DETECTED';

export type PaymentMethod =
  | 'UPI'
  | 'CARD'
  | 'NETBANKING'
  | 'MANDATE'
  | 'WALLET';

export type FailureReason =
  | 'INSUFFICIENT_FUNDS'
  | 'BANK_DOWNTIME'
  | 'AUTH_EXPIRED'
  | 'NETWORK_TIMEOUT'
  | 'LIMIT_EXCEEDED'
  | 'MANDATE_DECLINED'
  | 'USER_DROPPED'
  | 'CARD_EXPIRED'
  | 'FRAUD_CHECK_FAILED';

export type CustomerSegment = 'ENTERPRISE' | 'SMB' | 'STARTUP' | 'CONSUMER';

export type RecoveryCaseStatus =
  | 'DETECTED'
  | 'ANALYZING'
  | 'PREDICTED'
  | 'POLICY_REVIEW'
  | 'AWAITING_HUMAN'
  | 'ACTION_READY'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'RECOVERED'
  | 'FAILED'
  | 'STOPPED'
  | 'ESCALATED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ActionType =
  | 'RETRY_PAYMENT'
  | 'SEND_PAYMENT_LINK'
  | 'SEND_REMINDER'
  | 'SEND_INVOICE_REMINDER'
  | 'SCHEDULE_RETRY'
  | 'ESCALATE_HUMAN'
  | 'STOP_RECOVERY';

export type PolicyDecisionType = 'ALLOW' | 'HUMAN_REVIEW' | 'STOP' | 'ESCALATE';

export type OutcomeStatus = 'RECOVERED' | 'FAILED' | 'PENDING' | 'STOPPED';

export type ActorType = 'SYSTEM' | 'AI' | 'USER' | 'WEBHOOK';

export interface Customer {
  id: string;
  merchant_id: string;
  name: string;
  email: string;
  phone: string;
  segment: CustomerSegment;
  tenure_days: number;
  previous_successes: number;
  previous_failures: number;
  historical_recovery_rate: number;
  customer_opted_out: boolean;
  lifetime_value: number;
  last_payment_days_ago: number;
  created_at: string;
}

export interface PaymentEvent {
  id: string;
  merchant_id: string;
  customer_id: string;
  event_type: EventType;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  failure_reason: FailureReason;
  timestamp: string;
  metadata?: Record<string, unknown>;
  source: 'RAZORPAY_WEBHOOK' | 'DEMO_GENERATOR' | 'MANUAL_IMPORT';
  idempotency_key: string;
}

export interface ContributingFactor {
  factor: string;
  impact: 'POSITIVE' | 'NEGATIVE';
  description: string;
  weight: number;
}

export interface MLPrediction {
  case_id: string;
  recovery_probability: number;
  risk_level: RiskLevel;
  model_version: string;
  contributing_factors: ContributingFactor[];
  created_at: string;
}

export interface AIDiagnosis {
  case_id: string;
  diagnosis: string;
  confidence: number;
  recommended_action: ActionType;
  reasoning: string[];
  customer_risk: RiskLevel;
  requires_human_review: boolean;
  is_fallback?: boolean;
  created_at: string;
}

export interface PolicyEvaluation {
  case_id: string;
  decision: PolicyDecisionType;
  reason: string;
  policy_version: string;
  rules_evaluated: {
    rule_name: string;
    passed: boolean;
    description: string;
  }[];
  created_at: string;
}

export interface RecoveryAction {
  action_id: string;
  recovery_case_id: string;
  action_type: ActionType;
  reason: string;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  created_at: string;
  executed_at?: string;
  result?: {
    success: boolean;
    recovered_amount?: number;
    payment_link?: string;
    razorpay_payment_id?: string;
    message?: string;
    processing_time_ms?: number;
  };
  idempotency_key: string;
}

export interface HumanReview {
  review_id: string;
  recovery_case_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_role: string;
  decision: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'STOPPED';
  reason: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  case_id?: string;
  actor_type: ActorType;
  actor_id: string;
  event_type: string;
  timestamp: string;
  reason: string;
  metadata?: Record<string, unknown>;
  model_version?: string;
  policy_version?: string;
}

export interface RecoveryCase {
  id: string;
  merchant_id: string;
  customer_id: string;
  customer: Customer;
  event_id: string;
  event_type: EventType;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  failure_reason: FailureReason;
  status: RecoveryCaseStatus;
  days_overdue: number;
  retry_count: number;
  reminder_count: number;

  // ML layer
  recovery_probability: number;
  risk_level: RiskLevel;
  expected_recovery_value: number;
  ml_model_version: string;
  contributing_factors: ContributingFactor[];

  // AI Investigation layer
  ai_diagnosis?: string;
  ai_confidence?: number;
  ai_recommended_action?: ActionType;
  ai_reasoning?: string[];
  ai_requires_human_review?: boolean;

  // Policy layer
  policy_decision: PolicyDecisionType;
  policy_reason: string;
  policy_version: string;

  // Actions & Outcomes
  proposed_action: ActionType;
  executed_action?: ActionType;
  action_id?: string;
  action_status?: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  recovered_amount: number;
  intervention_cost: number;
  actual_recovery_value: number;
  outcome_verified: boolean;
  outcome_status: OutcomeStatus;

  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface DashboardMetrics {
  revenue_at_risk: number;
  revenue_recovered: number;
  recovery_rate: number;
  active_cases: number;
  expected_recovery_value: number;
  avg_recovery_time_hours: number;
  human_escalations: number;
  automated_actions: number;
  stopped_by_policy: number;
  failed_recovery_attempts: number;

  baseline_comparison: {
    baseline_recovery_rate: number;
    revive_recovery_rate: number;
    baseline_recovered: number;
    revive_recovered: number;
    incremental_revenue: number;
    improvement_pct: number;
    actions_avoided: number;
  };

  trends: {
    date: string;
    revenue_at_risk: number;
    revenue_recovered: number;
    recovery_rate: number;
  }[];

  by_failure_reason: {
    reason: FailureReason;
    count: number;
    at_risk: number;
    recovered: number;
    rate: number;
  }[];

  by_payment_method: {
    method: PaymentMethod;
    count: number;
    at_risk: number;
    recovered: number;
    rate: number;
  }[];

  by_customer_segment: {
    segment: CustomerSegment;
    count: number;
    at_risk: number;
    recovered: number;
    rate: number;
  }[];

  recovery_funnel: {
    stage: string;
    count: number;
    amount: number;
  }[];
}

export interface ModelPerformanceData {
  model_version: string;
  model_name: string;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  pr_auc: number;
  brier_score: number;
  business_recovery_rate: number;
  confusion_matrix: {
    true_positive: number;
    false_positive: number;
    true_negative: number;
    false_negative: number;
  };
  feature_importance: {
    feature: string;
    label: string;
    importance: number;
  }[];
  calibration_curve: {
    predicted_prob: number;
    observed_frequency: number;
  }[];
  probability_buckets: {
    bucket: string;
    count: number;
    at_risk: number;
    recovered: number;
    actual_rate: number;
  }[];
}

export interface SystemStatus {
  backend_status: 'Connected' | 'Degraded' | 'Offline';
  database_status: 'Connected (In-Memory + Synced Store)' | 'Connected (PostgreSQL/Supabase)';
  ml_model_status: 'Loaded (Active: xgboost-v1)';
  ai_agent_status: string;
  razorpay_mode: 'Razorpay Test Mode' | 'DEMO MODE';
  policy_engine_status: 'Active (v1.4.0 Deterministic)';
  audit_logging_status: 'Active (Immutable Hash Chain)';
  total_events: number;
  total_cases: number;
  total_audit_logs: number;
  demo_mode: boolean;
}

export interface PolicyConfig {
  max_retries: number;
  min_retry_interval_hours?: number;
  max_discount_percent?: number;
  max_automated_recovery_amount?: number;
  max_customer_reminders?: number;
  human_review_probability_threshold?: number;
  max_reminders?: number;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  high_value_threshold?: number;
  enforce_customer_opt_out?: boolean;
  require_human_review_for_high_value?: boolean;
  require_human_review_for_disputes?: boolean;
  policy_version?: string;
}

export interface ModelPerformanceComparison {
  champion_model: string;
  models: {
    model_name: string;
    model_version: string;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    pr_auc: number;
    brier_score: number;
    dollar_recovery_ratio: number;
    confusion_matrix: {
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
  }[];
  calibration_curve: {
    predicted: number;
    observed: number;
  }[];
  feature_importance: {
    feature: string;
    importance: number;
  }[];
  probability_buckets: {
    bucket: string;
    case_count: number;
    revenue_at_risk: number;
    revenue_recovered: number;
  }[];
}
