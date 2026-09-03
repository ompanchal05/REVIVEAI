// ReviveAI — Recovery Case State Machine
import { RecoveryCaseStatus } from '../types';

export const VALID_TRANSITIONS: Record<RecoveryCaseStatus, RecoveryCaseStatus[]> = {
  DETECTED: ['ANALYZING', 'STOPPED'],
  ANALYZING: ['PREDICTED', 'STOPPED', 'FAILED'],
  PREDICTED: ['POLICY_REVIEW', 'STOPPED'],
  POLICY_REVIEW: ['ACTION_READY', 'AWAITING_HUMAN', 'STOPPED', 'ESCALATED'],
  AWAITING_HUMAN: ['ACTION_READY', 'STOPPED', 'ESCALATED', 'FAILED'],
  ACTION_READY: ['EXECUTING', 'STOPPED', 'AWAITING_HUMAN'],
  EXECUTING: ['VERIFYING', 'FAILED', 'STOPPED'],
  VERIFYING: ['RECOVERED', 'FAILED', 'STOPPED'],
  RECOVERED: [], // Terminal state
  FAILED: ['ACTION_READY', 'STOPPED'], // Allowed for retry attempt if policy permits
  STOPPED: ['AWAITING_HUMAN'], // Allowed only if manager manually re-opens
  ESCALATED: ['AWAITING_HUMAN', 'STOPPED']
};

export class StateMachine {
  public static canTransition(from: RecoveryCaseStatus, to: RecoveryCaseStatus): boolean {
    if (from === to) return true;
    const allowed = VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static assertTransition(from: RecoveryCaseStatus, to: RecoveryCaseStatus, caseId: string) {
    if (!this.canTransition(from, to)) {
      throw new Error(
        `Invalid State Transition: Cannot move case ${caseId} from '${from}' to '${to}'. Allowed: [${(VALID_TRANSITIONS[from] || []).join(', ')}]`
      );
    }
  }
}
