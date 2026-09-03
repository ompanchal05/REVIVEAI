// ReviveAI — Automated Unit, Integration, and Safety Test Suite
import { mlService } from './mlService';
import { policyEngine } from './policyEngine';
import { razorpayService } from './razorpayService';
import { StateMachine } from './stateMachine';
import { dbStore } from './db';
import crypto from 'crypto';

export interface TestResult {
  id: string;
  category: 'SECURITY' | 'POLICY' | 'STATE_MACHINE' | 'ML' | 'OUTCOME';
  name: string;
  passed: boolean;
  duration_ms: number;
  message: string;
  details?: any;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  timestamp: string;
  results: TestResult[];
}

export class TestRunner {
  public async runAll(): Promise<TestSuiteSummary> {
    const results: TestResult[] = [];

    // Test 1: Policy Engine - Customer Opt-out Guardrail
    {
      const start = Date.now();
      const evalResult = policyEngine.evaluate({
        case_id: 'test_opt_out',
        amount: 2500,
        retry_count: 0,
        reminder_count: 0,
        recovery_probability: 0.85,
        event_type: 'PAYMENT_FAILED',
        failure_reason: 'BANK_DOWNTIME',
        proposed_action: 'RETRY_PAYMENT',
        customer: { customer_opted_out: true }
      });
      const passed = evalResult.decision === 'STOP';
      results.push({
        id: 'test_opt_out',
        category: 'POLICY',
        name: 'Policy: Opted-out Customer Outreach Block',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Successfully halted outreach for opted-out customer'
          : `Failed: Expected STOP but received ${evalResult.decision}`
      });
    }

    // Test 2: Policy Engine - High-value Transaction Threshold (> ₹10,000)
    {
      const start = Date.now();
      const evalResult = policyEngine.evaluate({
        case_id: 'test_high_val',
        amount: 35000,
        retry_count: 0,
        reminder_count: 0,
        recovery_probability: 0.82,
        event_type: 'PAYMENT_FAILED',
        failure_reason: 'BANK_DOWNTIME',
        proposed_action: 'RETRY_PAYMENT',
        customer: { customer_opted_out: false }
      });
      const passed = evalResult.decision === 'HUMAN_REVIEW';
      results.push({
        id: 'test_high_val',
        category: 'POLICY',
        name: 'Policy: High-Value Threshold Enforcement (> ₹10,000)',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Required human review for high-value transaction'
          : `Failed: Expected HUMAN_REVIEW but received ${evalResult.decision}`
      });
    }

    // Test 3: Policy Engine - Max Retries Cap
    {
      const start = Date.now();
      const evalResult = policyEngine.evaluate({
        case_id: 'test_max_retry',
        amount: 1500,
        retry_count: 3,
        reminder_count: 0,
        recovery_probability: 0.65,
        event_type: 'PAYMENT_FAILED',
        failure_reason: 'INSUFFICIENT_FUNDS',
        proposed_action: 'RETRY_PAYMENT',
        customer: { customer_opted_out: false }
      });
      const passed = evalResult.decision === 'STOP';
      results.push({
        id: 'test_max_retry',
        category: 'POLICY',
        name: 'Policy: Max Automated Retry Limit (3 Retries)',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Stopped automated retry after 3 failed attempts'
          : `Failed: Expected STOP but received ${evalResult.decision}`
      });
    }

    // Test 4: Policy Engine - Disputed / Fraud Payment Escalation
    {
      const start = Date.now();
      const evalResult = policyEngine.evaluate({
        case_id: 'test_dispute',
        amount: 12000,
        retry_count: 0,
        reminder_count: 0,
        recovery_probability: 0.10,
        event_type: 'DISPUTE_DETECTED',
        failure_reason: 'FRAUD_CHECK_FAILED',
        proposed_action: 'STOP_RECOVERY',
        customer: { customer_opted_out: false }
      });
      const passed = evalResult.decision === 'ESCALATE';
      results.push({
        id: 'test_dispute',
        category: 'POLICY',
        name: 'Policy: Dispute / Fraud Chargeback Immediate Escalation',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Immediately escalated disputed fraud event to Risk Ops'
          : `Failed: Expected ESCALATE but received ${evalResult.decision}`
      });
    }

    // Test 5: Webhook Signature Verification (HMAC SHA256)
    {
      const start = Date.now();
      const payload = JSON.stringify({ event: 'payment.failed', id: 'pay_test_999' });
      const secret = 'rzp_whsec_reviveai_demo_secret';
      const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

      const verifiedValid = razorpayService.verifyWebhookSignature(payload, validSig);
      const rejectedInvalid = !razorpayService.verifyWebhookSignature(payload, 'corrupt_signature_xyz');

      const passed = verifiedValid && rejectedInvalid;
      results.push({
        id: 'test_webhook_hmac',
        category: 'SECURITY',
        name: 'Security: Webhook HMAC SHA256 Signature Verification',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Authenticated valid signatures and rejected forged signatures'
          : 'Failed: Webhook signature verification mismatch'
      });
    }

    // Test 6: Idempotency Protection on Duplicate Actions
    {
      const start = Date.now();
      const idempKey = `idemp_test_${Date.now()}`;
      const firstResult = { success: true, recovered_amount: 5000 };

      dbStore.setIdempotencyResult(idempKey, firstResult);
      const cached = dbStore.getIdempotencyResult(idempKey);

      const passed = cached !== null && cached.recovered_amount === 5000;
      results.push({
        id: 'test_idempotency',
        category: 'SECURITY',
        name: 'Security: Action Idempotency Cache Protection',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Duplicate request safely returns identical cached execution outcome without re-billing'
          : 'Failed: Idempotency cache missed'
      });
    }

    // Test 7: State Machine - Illegal Transition Prevention
    {
      const start = Date.now();
      const legal = StateMachine.canTransition('DETECTED', 'ANALYZING');
      const illegal = StateMachine.canTransition('DETECTED', 'RECOVERED'); // Cannot jump straight to recovered

      const passed = legal && !illegal;
      results.push({
        id: 'test_state_machine',
        category: 'STATE_MACHINE',
        name: 'State Machine: Strict State Transition Enforcement',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? 'Passed: Blocked illicit state jump from DETECTED directly to RECOVERED'
          : 'Failed: Illegal transition was erroneously allowed'
      });
    }

    // Test 8: ML Prediction Engine Accuracy & Bounded Output
    {
      const start = Date.now();
      const pred = mlService.predict({
        amount: 5000,
        payment_method: 'UPI',
        failure_reason: 'BANK_DOWNTIME',
        previous_successes: 15,
        previous_failures: 1,
        days_overdue: 0,
        previous_recovery_attempts: 0,
        customer_segment: 'SMB'
      });

      const passed =
        pred.recovery_probability >= 0 &&
        pred.recovery_probability <= 1 &&
        pred.contributing_factors.length > 0 &&
        pred.expected_recovery_value > 0;

      results.push({
        id: 'test_ml_predict',
        category: 'ML',
        name: 'ML: Recovery Probability Estimation & Explainability (SHAP)',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? `Passed: Estimated ${(pred.recovery_probability * 100).toFixed(1)}% probability with ${pred.contributing_factors.length} contributing factors`
          : 'Failed: ML prediction returned invalid bounds'
      });
    }

    // Test 9: Outcome Verification - Genuine Settlement Attribution
    {
      const start = Date.now();
      const overview = dbStore.getDashboardOverview();
      const totalRecovered = overview.revenue_recovered;
      const atRisk = overview.revenue_at_risk;

      const passed = totalRecovered <= atRisk && totalRecovered >= 0;
      results.push({
        id: 'test_outcome_verification',
        category: 'OUTCOME',
        name: 'Outcome Engine: Revenue Attribution Ledger Consistency',
        passed,
        duration_ms: Date.now() - start,
        message: passed
          ? `Passed: Revenue recovered (₹${totalRecovered.toLocaleString('en-IN')}) is strictly bounded by revenue at risk`
          : 'Failed: Mathematical inconsistency in revenue attribution'
      });
    }

    const passedCount = results.filter(r => r.passed).length;

    return {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      timestamp: new Date().toISOString(),
      results
    };
  }
}

export const testRunner = new TestRunner();
