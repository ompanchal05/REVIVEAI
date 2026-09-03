// ReviveAI — Realistic Synthetic Revenue Engine
import {
  Customer,
  CustomerSegment,
  EventType,
  FailureReason,
  PaymentEvent,
  PaymentMethod,
  RecoveryCase,
  RiskLevel,
} from '../types';

export const INDIAN_NAMES = [
  'Aditi Sharma', 'Aarav Patel', 'Priya Nair', 'Vikram Mehta', 'Rohan Gupta',
  'Ananya Iyer', 'Rahul Deshmukh', 'Pooja Verma', 'Karan Malhotra', 'Neha Reddy',
  'Siddharth Joshi', 'Tanvi Kulkarni', 'Arjun Kapoor', 'Meera Rao', 'Aditya Singh',
  'Sneha Bhatt', 'Varun Pillai', 'Riya Sen', 'Manish Agarwal', 'Kavita Das',
  'Nikhil Nambiar', 'Shreya Banerjee', 'Deepak Tiwari', 'Kritika Roy', 'Gaurav Jain'
];

export const COMPANY_DOMAINS = [
  'finflow.in', 'quickpay.co', 'zephyrlabs.io', 'nexustech.org', 'cloudscale.in',
  'urbanstride.com', 'hypercart.in', 'pulsehealth.in', 'eduvibe.co', 'bharatretail.in'
];

export const FAILURE_REASONS: FailureReason[] = [
  'INSUFFICIENT_FUNDS',
  'BANK_DOWNTIME',
  'AUTH_EXPIRED',
  'NETWORK_TIMEOUT',
  'LIMIT_EXCEEDED',
  'MANDATE_DECLINED',
  'USER_DROPPED',
  'CARD_EXPIRED',
  'FRAUD_CHECK_FAILED'
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'CARD',
  'NETBANKING',
  'MANDATE',
  'WALLET'
];

export const SEGMENTS: CustomerSegment[] = ['ENTERPRISE', 'SMB', 'STARTUP', 'CONSUMER'];

// Deterministic Pseudo-random Generator (seedable for reproducibility)
class PRNG {
  private seed: number;
  constructor(seed = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export function generateSyntheticDataset(count = 1000, seed = 1337): {
  customers: Customer[];
  events: PaymentEvent[];
  cases: RecoveryCase[];
} {
  const prng = new PRNG(seed);
  const merchant_id = 'mer_razorpay_default';

  const customers: Customer[] = [];
  const events: PaymentEvent[] = [];
  const cases: RecoveryCase[] = [];

  // Generate 250 distinct customers
  for (let i = 0; i < 250; i++) {
    const rawName = INDIAN_NAMES[i % INDIAN_NAMES.length] + (i >= INDIAN_NAMES.length ? ` ${Math.floor(i / INDIAN_NAMES.length) + 1}` : '');
    const cleanName = rawName.toLowerCase().replace(/[^a-z]/g, '.');
    const domain = prng.pick(COMPANY_DOMAINS);
    const segment = prng.pick(SEGMENTS);
    const tenure_days = prng.int(15, 1200);
    const previous_successes = prng.int(2, 45);
    const previous_failures = prng.int(0, Math.floor(previous_successes * 0.4));
    const total_tx = previous_successes + previous_failures;
    const historical_recovery_rate = Number(((previous_successes / total_tx) * prng.range(0.65, 0.95)).toFixed(4));
    const customer_opted_out = prng.next() < 0.04; // 4% opted out
    const lifetime_value = prng.int(10000, 750000);
    const last_payment_days_ago = prng.int(1, 45);

    customers.push({
      id: `cust_${i + 1001}`,
      merchant_id,
      name: rawName,
      email: `${cleanName}@${domain}`,
      phone: `+91 ${prng.int(90000, 99999)} ${prng.int(10000, 99999)}`,
      segment,
      tenure_days,
      previous_successes,
      previous_failures,
      historical_recovery_rate,
      customer_opted_out,
      lifetime_value,
      last_payment_days_ago,
      created_at: new Date(Date.now() - tenure_days * 86400000).toISOString()
    });
  }

  // Generate recovery cases & events
  const eventTypes: EventType[] = [
    'PAYMENT_FAILED',
    'SUBSCRIPTION_FAILED',
    'INVOICE_OVERDUE',
    'MANDATE_FAILED',
    'CHECKOUT_ABANDONED'
  ];

  for (let i = 0; i < count; i++) {
    const customer = prng.pick(customers);
    const event_type = prng.pick(eventTypes);
    const failure_reason = prng.pick(FAILURE_REASONS);
    const payment_method = prng.pick(PAYMENT_METHODS);

    // Realistic amounts based on segment & event type
    let amount: number;
    if (customer.segment === 'ENTERPRISE') {
      amount = prng.int(12000, 85000);
    } else if (customer.segment === 'SMB') {
      amount = prng.int(3500, 24000);
    } else if (customer.segment === 'STARTUP') {
      amount = prng.int(1500, 15000);
    } else {
      amount = prng.int(499, 4999);
    }

    const days_overdue = prng.int(0, 14);
    const retry_count = prng.int(0, 4);
    const reminder_count = prng.int(0, 3);
    const createdTimestamp = Date.now() - prng.int(1, 30) * 86400000 - prng.int(1000, 80000);

    const event_id = `evt_rzp_${i + 10001}`;
    const case_id = `rc_case_${i + 10001}`;
    const idempotency_key = `idemp_${case_id}_${createdTimestamp}`;

    events.push({
      id: event_id,
      merchant_id,
      customer_id: customer.id,
      event_type,
      amount,
      currency: 'INR',
      payment_method,
      failure_reason,
      timestamp: new Date(createdTimestamp).toISOString(),
      source: 'RAZORPAY_WEBHOOK',
      idempotency_key,
      metadata: {
        razorpay_payment_id: `pay_test_${i + 50001}`,
        retry_count,
        bank_code: payment_method === 'UPI' ? 'HDFC_UPI' : 'ICICI_NB'
      }
    });

    // Realistic Recovery Probability Calculation (Deterministic Signal Engine)
    let baseProb = 0.55;

    // Positive signals
    if (customer.previous_successes > 10) baseProb += 0.15;
    if (customer.historical_recovery_rate > 0.70) baseProb += 0.12;
    if (['BANK_DOWNTIME', 'NETWORK_TIMEOUT'].includes(failure_reason)) baseProb += 0.14; // Temporary
    if (payment_method === 'UPI') baseProb += 0.08;
    if (days_overdue <= 1) baseProb += 0.09;

    // Negative signals
    if (customer.customer_opted_out) baseProb = 0.02;
    if (failure_reason === 'FRAUD_CHECK_FAILED') baseProb = 0.05;
    if (failure_reason === 'INSUFFICIENT_FUNDS') baseProb -= 0.15;
    if (failure_reason === 'CARD_EXPIRED') baseProb -= 0.20;
    if (retry_count >= 3) baseProb -= 0.28;
    if (days_overdue > 7) baseProb -= 0.22;
    if (amount > 30000) baseProb -= 0.10;

    const recovery_probability = Math.min(0.96, Math.max(0.04, Number(baseProb.toFixed(4))));

    let risk_level: RiskLevel = 'LOW';
    if (recovery_probability < 0.30 || amount > 40000) risk_level = 'CRITICAL';
    else if (recovery_probability < 0.50 || amount > 20000) risk_level = 'HIGH';
    else if (recovery_probability < 0.75) risk_level = 'MEDIUM';

    const intervention_cost = 15.0; // ₹15 standard SMS/WhatsApp/Webhook cost
    const expected_recovery_value = Math.max(0, Math.round(amount * recovery_probability - intervention_cost));

    // Contributing Factors (Explainability)
    const contributing_factors = [
      {
        factor: 'Customer Payment History',
        impact: customer.previous_successes >= 5 ? 'POSITIVE' : 'NEGATIVE',
        description: `${customer.previous_successes} successful lifetime payments on record`,
        weight: 0.28
      },
      {
        factor: 'Failure Classification',
        impact: ['BANK_DOWNTIME', 'NETWORK_TIMEOUT', 'USER_DROPPED'].includes(failure_reason) ? 'POSITIVE' : 'NEGATIVE',
        description: ['BANK_DOWNTIME', 'NETWORK_TIMEOUT'].includes(failure_reason)
          ? 'Temporary network/banking failure with high retry resilience'
          : `Failure reason ${failure_reason} requires alternative intervention`,
        weight: 0.24
      },
      {
        factor: 'Retry Pressure',
        impact: retry_count <= 1 ? 'POSITIVE' : 'NEGATIVE',
        description: retry_count === 0 ? 'Fresh failure with no prior retry fatigue' : `${retry_count} prior retries registered`,
        weight: 0.20
      },
      {
        factor: 'Overdue Elapsed Days',
        impact: days_overdue <= 2 ? 'POSITIVE' : 'NEGATIVE',
        description: days_overdue === 0 ? 'Same-day occurrence, highest engagement likelihood' : `${days_overdue} days overdue`,
        weight: 0.18
      }
    ] as const;

    // Policy Decision
    let policy_decision: 'ALLOW' | 'HUMAN_REVIEW' | 'STOP' | 'ESCALATE' = 'ALLOW';
    let policy_reason = 'Passes automated safety guardrails and retry thresholds.';

    if (customer.customer_opted_out) {
      policy_decision = 'STOP';
      policy_reason = 'Customer has explicitly opted out of automated recovery outreach.';
    } else if (failure_reason === 'FRAUD_CHECK_FAILED') {
      policy_decision = 'ESCALATE';
      policy_reason = 'Dispute / Fraud check flagged. Requires risk team escalation.';
    } else if (retry_count >= 3) {
      policy_decision = 'STOP';
      policy_reason = 'Maximum automated retry attempts (3) exceeded.';
    } else if (amount > 10000) {
      policy_decision = 'HUMAN_REVIEW';
      policy_reason = 'High-value transaction exceeds automated recovery threshold (₹10,000).';
    } else if (reminder_count >= 3) {
      policy_decision = 'STOP';
      policy_reason = 'Maximum customer reminder outreach cap reached.';
    } else if (recovery_probability < 0.20) {
      policy_decision = 'STOP';
      policy_reason = 'Recovery probability below viable automated recovery floor (20%).';
    }

    // Recommended Action
    let proposed_action: any = 'SEND_PAYMENT_LINK';
    if (['BANK_DOWNTIME', 'NETWORK_TIMEOUT'].includes(failure_reason) && retry_count < 2) {
      proposed_action = 'RETRY_PAYMENT';
    } else if (failure_reason === 'INSUFFICIENT_FUNDS') {
      proposed_action = 'SCHEDULE_RETRY';
    } else if (event_type === 'INVOICE_OVERDUE') {
      proposed_action = 'SEND_INVOICE_REMINDER';
    } else if (policy_decision === 'HUMAN_REVIEW') {
      proposed_action = 'ESCALATE_HUMAN';
    } else if (policy_decision === 'STOP') {
      proposed_action = 'STOP_RECOVERY';
    }

    // Determine current status & outcome
    // To ensure the system contains realistic historical cases:
    // Some are RECOVERED, some FAILED, some AWAITING_HUMAN, some ACTIVE
    let status: any = 'RECOVERED';
    let outcome_status: any = 'RECOVERED';
    let outcome_verified = false;
    let recovered_amount = 0;
    let actual_recovery_value = 0;
    const isHistoric = prng.next() < 0.70; // 70% processed, 30% active in queue

    if (!isHistoric) {
      if (policy_decision === 'HUMAN_REVIEW') {
        status = 'AWAITING_HUMAN';
        outcome_status = 'PENDING';
      } else if (policy_decision === 'STOP') {
        status = 'STOPPED';
        outcome_status = 'STOPPED';
      } else if (policy_decision === 'ESCALATE') {
        status = 'ESCALATED';
        outcome_status = 'STOPPED';
      } else {
        status = prng.pick(['ACTION_READY', 'EXECUTING', 'VERIFYING', 'PREDICTED']);
        outcome_status = 'PENDING';
      }
    } else {
      // Historical resolution
      if (policy_decision === 'STOP' || policy_decision === 'ESCALATE') {
        status = policy_decision === 'STOP' ? 'STOPPED' : 'ESCALATED';
        outcome_status = 'STOPPED';
      } else {
        // Did the payment actually succeed based on probability?
        const recoveredSuccessfully = prng.next() < (recovery_probability * 0.90);
        if (recoveredSuccessfully) {
          status = 'RECOVERED';
          outcome_status = 'RECOVERED';
          outcome_verified = true;
          recovered_amount = amount;
          actual_recovery_value = amount - intervention_cost;
        } else {
          status = 'FAILED';
          outcome_status = 'FAILED';
          outcome_verified = true;
          recovered_amount = 0;
          actual_recovery_value = -intervention_cost;
        }
      }
    }

    cases.push({
      id: case_id,
      merchant_id,
      customer_id: customer.id,
      customer,
      event_id,
      event_type,
      amount,
      currency: 'INR',
      payment_method,
      failure_reason,
      status,
      days_overdue,
      retry_count,
      reminder_count,
      recovery_probability,
      risk_level,
      expected_recovery_value,
      ml_model_version: 'xgboost-v1',
      contributing_factors: [...contributing_factors],
      ai_diagnosis: `Case analyzed: ${failure_reason} for ${customer.segment} account. Historical recovery rate ${Math.round(customer.historical_recovery_rate * 100)}% indicates ${recovery_probability > 0.6 ? 'high' : 'moderate'} recoverability via ${proposed_action}.`,
      ai_confidence: Number((recovery_probability * prng.range(0.9, 0.99)).toFixed(2)),
      ai_recommended_action: proposed_action,
      ai_reasoning: [
        `Identified ${failure_reason} with ${retry_count} prior retries`,
        `Customer tenure is ${customer.tenure_days} days with ${customer.previous_successes} successful orders`,
        `Policy engine evaluates ${policy_decision} based on transaction value and customer safety caps`
      ],
      ai_requires_human_review: policy_decision === 'HUMAN_REVIEW',
      policy_decision,
      policy_reason,
      policy_version: 'policy-v1',
      proposed_action,
      executed_action: isHistoric ? proposed_action : undefined,
      action_status: isHistoric ? (outcome_status === 'RECOVERED' ? 'SUCCESS' : 'FAILED') : 'PENDING',
      recovered_amount,
      intervention_cost,
      actual_recovery_value,
      outcome_verified,
      outcome_status,
      created_at: new Date(createdTimestamp).toISOString(),
      updated_at: new Date(createdTimestamp + 3600000).toISOString(),
      resolved_at: isHistoric ? new Date(createdTimestamp + 7200000).toISOString() : undefined
    });
  }

  return { customers, events, cases };
}
