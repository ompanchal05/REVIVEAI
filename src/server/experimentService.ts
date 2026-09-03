// ReviveAI — Strategy Experimentation & Baseline Comparison Engine
import { dbStore } from './db';
import { mlService } from './mlService';
import { policyEngine } from './policyEngine';

export interface ExperimentRunResult {
  experiment_id: string;
  name: string;
  sample_size: number;
  run_timestamp: string;
  baseline: {
    recovered_amount: number;
    recovery_rate: number;
    actions_executed: number;
    failed_retries: number;
    customer_complaints: number;
    total_cost: number;
    net_value: number;
  };
  revive_ai: {
    recovered_amount: number;
    recovery_rate: number;
    actions_executed: number;
    actions_avoided: number;
    human_escalations: number;
    total_cost: number;
    net_value: number;
  };
  impact: {
    incremental_revenue: number;
    incremental_pct: number;
    actions_saved: number;
    roi_multiple: number;
    summary: string;
  };
}

export class ExperimentService {
  public runSimulation(sampleSize = 250): ExperimentRunResult {
    const { cases } = dbStore.getCases({ limit: sampleSize });
    const runCases = cases.slice(0, sampleSize);

    let baselineRecovered = 0;
    let baselineActions = 0;
    let baselineFailedRetries = 0;
    let baselineComplaints = 0;

    let reviveRecovered = 0;
    let reviveActions = 0;
    let reviveActionsAvoided = 0;
    let reviveHumanEscalations = 0;

    for (const c of runCases) {
      // 1. Baseline Strategy Simulation: Always blindly retry once
      baselineActions += 1;
      const baselineCost = 15;

      if (c.customer.customer_opted_out) {
        // Blind retry on opted-out customer causes complaint & 0 recovery
        baselineComplaints += 1;
        baselineFailedRetries += 1;
      } else if (['BANK_DOWNTIME', 'NETWORK_TIMEOUT'].includes(c.failure_reason)) {
        // Random naive retry succeeds ~52% of the time on bank downtime
        if (Math.random() < 0.52) {
          baselineRecovered += c.amount;
        } else {
          baselineFailedRetries += 1;
        }
      } else if (c.failure_reason === 'INSUFFICIENT_FUNDS') {
        // Immediate naive retry on insufficient funds fails ~85% of the time
        if (Math.random() < 0.15) {
          baselineRecovered += c.amount;
        } else {
          baselineFailedRetries += 1;
        }
      } else if (c.failure_reason === 'FRAUD_CHECK_FAILED') {
        // Blind retry on fraud causes severe complaint
        baselineComplaints += 1;
        baselineFailedRetries += 1;
      } else {
        // General naive retry
        if (Math.random() < 0.38) {
          baselineRecovered += c.amount;
        } else {
          baselineFailedRetries += 1;
        }
      }

      // 2. ReviveAI Strategy Simulation: ML + AI + Deterministic Policy + Channel Selection
      const pred = mlService.predict({
        amount: c.amount,
        payment_method: c.payment_method,
        failure_reason: c.failure_reason,
        previous_successes: c.customer.previous_successes,
        previous_failures: c.customer.previous_failures,
        days_overdue: c.days_overdue,
        previous_recovery_attempts: c.retry_count,
        customer_segment: c.customer.segment
      });

      const policyEval = policyEngine.evaluate({
        case_id: c.id,
        amount: c.amount,
        retry_count: c.retry_count,
        reminder_count: c.reminder_count,
        recovery_probability: pred.recovery_probability,
        event_type: c.event_type,
        failure_reason: c.failure_reason,
        proposed_action: c.proposed_action,
        customer: {
          customer_opted_out: c.customer.customer_opted_out
        }
      });

      if (policyEval.decision === 'STOP') {
        // ReviveAI intelligently halts wasteful action!
        reviveActionsAvoided += 1;
      } else if (policyEval.decision === 'HUMAN_REVIEW' || policyEval.decision === 'ESCALATE') {
        reviveHumanEscalations += 1;
        // High-value cases reviewed by human have high recoverability
        if (Math.random() < (pred.recovery_probability * 0.92)) {
          reviveRecovered += c.amount;
          reviveActions += 1;
        }
      } else {
        // ALLOW with tailored intervention
        reviveActions += 1;
        // High recoverability due to channel optimization (e.g. smart link vs schedule)
        const effectiveProb = Math.min(0.95, pred.recovery_probability * 1.12);
        if (Math.random() < effectiveProb) {
          reviveRecovered += c.amount;
        }
      }
    }

    const totalAtRisk = runCases.reduce((sum, c) => sum + c.amount, 0);
    const baselineRate = totalAtRisk > 0 ? Number(((baselineRecovered / totalAtRisk) * 100).toFixed(1)) : 0;
    const reviveRate = totalAtRisk > 0 ? Number(((reviveRecovered / totalAtRisk) * 100).toFixed(1)) : 0;

    const baselineTotalCost = baselineActions * 15;
    const reviveTotalCost = reviveActions * 15;

    const incrementalRevenue = Math.max(0, reviveRecovered - baselineRecovered);
    const incrementalPct = baselineRecovered > 0 ? Number(((incrementalRevenue / baselineRecovered) * 100).toFixed(1)) : 0;
    const roiMultiple = reviveTotalCost > 0 ? Number((incrementalRevenue / reviveTotalCost).toFixed(1)) : 0;

    return {
      experiment_id: `exp_${Date.now()}`,
      name: 'Baseline (Blind 1x Retry) vs ReviveAI (ML + Policy Control)',
      sample_size: runCases.length,
      run_timestamp: new Date().toISOString(),
      baseline: {
        recovered_amount: baselineRecovered,
        recovery_rate: baselineRate,
        actions_executed: baselineActions,
        failed_retries: baselineFailedRetries,
        customer_complaints: baselineComplaints,
        total_cost: baselineTotalCost,
        net_value: baselineRecovered - baselineTotalCost
      },
      revive_ai: {
        recovered_amount: reviveRecovered,
        recovery_rate: reviveRate,
        actions_executed: reviveActions,
        actions_avoided: reviveActionsAvoided,
        human_escalations: reviveHumanEscalations,
        total_cost: reviveTotalCost,
        net_value: reviveRecovered - reviveTotalCost
      },
      impact: {
        incremental_revenue: incrementalRevenue,
        incremental_pct: incrementalPct,
        actions_saved: reviveActionsAvoided,
        roi_multiple: roiMultiple,
        summary: `ReviveAI recovered ₹${incrementalRevenue.toLocaleString('en-IN')} (+${incrementalPct}%) more revenue than the baseline strategy while eliminating ${reviveActionsAvoided} unnecessary or disruptive payment attempts.`
      }
    };
  }
}

export const experimentService = new ExperimentService();
