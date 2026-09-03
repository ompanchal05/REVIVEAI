// ReviveAI — Deterministic Financial & Safety Policy Engine
import {
  ActionType,
  Customer,
  PolicyConfig,
  PolicyDecisionType,
  PolicyEvaluation,
  RecoveryCase,
} from '../types';

export const DEFAULT_POLICY_CONFIG: PolicyConfig = {
  max_retries: 3,
  min_retry_interval_hours: 6,
  max_discount_percent: 10,
  max_automated_recovery_amount: 10000, // ₹10,000 threshold for automated execution
  max_customer_reminders: 3,
  human_review_probability_threshold: 0.35,
};

export class PolicyEngine {
  private config: PolicyConfig;
  private version = 'policy-v1.4.0';

  constructor(config: PolicyConfig = DEFAULT_POLICY_CONFIG) {
    this.config = { ...config };
  }

  public getConfig(): PolicyConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PolicyConfig>): PolicyConfig {
    // Validate safety bounds
    if (newConfig.max_retries !== undefined && (newConfig.max_retries < 1 || newConfig.max_retries > 5)) {
      throw new Error('max_retries must be between 1 and 5');
    }
    if (newConfig.max_automated_recovery_amount !== undefined && newConfig.max_automated_recovery_amount < 1000) {
      throw new Error('max_automated_recovery_amount cannot be lower than ₹1,000 for automation safety');
    }
    this.config = { ...this.config, ...newConfig };
    return this.getConfig();
  }

  public evaluate(caseData: {
    case_id: string;
    amount: number;
    retry_count: number;
    reminder_count: number;
    recovery_probability: number;
    ai_confidence?: number;
    event_type: string;
    failure_reason: string;
    proposed_action: ActionType;
    outcome_status?: string;
    customer: {
      customer_opted_out: boolean;
      segment?: string;
    };
  }): PolicyEvaluation {
    const rulesEvaluated: { rule_name: string; passed: boolean; description: string }[] = [];

    // Rule 1: Customer Opt-out Check
    const optedOut = Boolean(caseData.customer.customer_opted_out);
    rulesEvaluated.push({
      rule_name: 'CUSTOMER_OPT_OUT',
      passed: !optedOut,
      description: optedOut
        ? 'Customer has explicitly opted out of recovery communications.'
        : 'Customer is active and has not opted out.'
    });
    if (optedOut) {
      return {
        case_id: caseData.case_id,
        decision: 'STOP',
        reason: 'Policy Violation: Customer opted out of automated recovery outreach.',
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 2: Payment Already Succeeded Check
    const alreadyRecovered = caseData.outcome_status === 'RECOVERED';
    rulesEvaluated.push({
      rule_name: 'PAYMENT_ALREADY_SETTLED',
      passed: !alreadyRecovered,
      description: alreadyRecovered
        ? 'Payment has already been successfully recovered.'
        : 'Payment remains unsettled and at risk.'
    });
    if (alreadyRecovered) {
      return {
        case_id: caseData.case_id,
        decision: 'STOP',
        reason: 'Policy Guardrail: Payment is already settled and verified. No further action needed.',
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 3: Fraud or Dispute Detection
    const isDisputed = caseData.event_type === 'DISPUTE_DETECTED' || caseData.failure_reason === 'FRAUD_CHECK_FAILED';
    rulesEvaluated.push({
      rule_name: 'DISPUTE_FRAUD_FLAG',
      passed: !isDisputed,
      description: isDisputed
        ? 'Payment flagged for fraud inspection or chargeback dispute.'
        : 'No fraud or dispute signals detected.'
    });
    if (isDisputed) {
      return {
        case_id: caseData.case_id,
        decision: 'ESCALATE',
        reason: 'Safety Halt: Fraud check failed or dispute registered. Escalate to Compliance/Risk team immediately.',
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 4: Max Retry Count Limit
    const retryExceeded = caseData.retry_count >= this.config.max_retries;
    rulesEvaluated.push({
      rule_name: 'MAX_RETRY_CAP',
      passed: !retryExceeded,
      description: retryExceeded
        ? `Retry count (${caseData.retry_count}) reached maximum limit of ${this.config.max_retries}.`
        : `Retry count (${caseData.retry_count}) within safe limit of ${this.config.max_retries}.`
    });
    if (retryExceeded) {
      return {
        case_id: caseData.case_id,
        decision: 'STOP',
        reason: `Policy Enforcement: Exceeded maximum allowed retries (${this.config.max_retries}). Halting automated retry to prevent card blocking.`,
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 5: Reminder Outreach Cap
    const reminderExceeded = caseData.reminder_count >= this.config.max_customer_reminders;
    rulesEvaluated.push({
      rule_name: 'MAX_REMINDERS_CAP',
      passed: !reminderExceeded,
      description: reminderExceeded
        ? `Customer reminder count (${caseData.reminder_count}) reached cap of ${this.config.max_customer_reminders}.`
        : `Customer reminder count (${caseData.reminder_count}) within cap.`
    });
    if (reminderExceeded) {
      return {
        case_id: caseData.case_id,
        decision: 'STOP',
        reason: `Customer Protection Policy: Reached reminder ceiling (${this.config.max_customer_reminders}) to prevent harassment.`,
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 6: High Value Transaction Threshold (Automated limit)
    const isHighValue = caseData.amount > this.config.max_automated_recovery_amount;
    rulesEvaluated.push({
      rule_name: 'HIGH_VALUE_THRESHOLD',
      passed: !isHighValue,
      description: isHighValue
        ? `Transaction amount ₹${caseData.amount.toLocaleString('en-IN')} exceeds automated limit ₹${this.config.max_automated_recovery_amount.toLocaleString('en-IN')}.`
        : `Transaction amount ₹${caseData.amount.toLocaleString('en-IN')} within automated limit.`
    });
    if (isHighValue) {
      return {
        case_id: caseData.case_id,
        decision: 'HUMAN_REVIEW',
        reason: `Financial Governance: Transaction value (₹${caseData.amount.toLocaleString('en-IN')}) exceeds automated ceiling of ₹${this.config.max_automated_recovery_amount.toLocaleString('en-IN')}. Requires human manager review.`,
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 7: Minimum Recovery Probability Floor
    const isExtremelyLowProb = caseData.recovery_probability < 0.20;
    rulesEvaluated.push({
      rule_name: 'MIN_PROBABILITY_FLOOR',
      passed: !isExtremelyLowProb,
      description: isExtremelyLowProb
        ? `Recovery probability ${(caseData.recovery_probability * 100).toFixed(1)}% is below 20% floor.`
        : `Recovery probability ${(caseData.recovery_probability * 100).toFixed(1)}% satisfies floor.`
    });
    if (isExtremelyLowProb) {
      return {
        case_id: caseData.case_id,
        decision: 'STOP',
        reason: `ROI Safety: Recovery probability (${(caseData.recovery_probability * 100).toFixed(1)}%) is too low to justify intervention cost.`,
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // Rule 8: Low Confidence or Borderline Probability
    const isBorderline =
      caseData.recovery_probability < this.config.human_review_probability_threshold ||
      (caseData.ai_confidence !== undefined && caseData.ai_confidence < 0.50);

    rulesEvaluated.push({
      rule_name: 'CONFIDENCE_THRESHOLD',
      passed: !isBorderline,
      description: isBorderline
        ? `Model probability ${(caseData.recovery_probability * 100).toFixed(1)}% or confidence is borderline.`
        : 'Model probability and AI confidence are within automated comfort range.'
    });

    if (isBorderline) {
      return {
        case_id: caseData.case_id,
        decision: 'HUMAN_REVIEW',
        reason: `Borderline Recovery Confidence: Probability ${(caseData.recovery_probability * 100).toFixed(1)}% warrants human discretion before outreach.`,
        policy_version: this.version,
        rules_evaluated: rulesEvaluated,
        created_at: new Date().toISOString()
      };
    }

    // All rules passed: ALLOW
    return {
      case_id: caseData.case_id,
      decision: 'ALLOW',
      reason: 'Passes all deterministic financial safety policies, retry limits, and amount ceilings.',
      policy_version: this.version,
      rules_evaluated: rulesEvaluated,
      created_at: new Date().toISOString()
    };
  }
}

export const policyEngine = new PolicyEngine();
