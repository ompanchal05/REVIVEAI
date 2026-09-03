// ReviveAI — Immutable Financial & AI Governance Audit Service
import { ActorType, AuditLog } from '../types';

export class AuditService {
  private logs: AuditLog[] = [];

  public log(entry: {
    case_id?: string;
    actor_type: ActorType;
    actor_id: string;
    event_type: string;
    reason: string;
    metadata?: Record<string, unknown>;
    model_version?: string;
    policy_version?: string;
  }): AuditLog {
    const record: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      case_id: entry.case_id,
      actor_type: entry.actor_type,
      actor_id: entry.actor_id,
      event_type: entry.event_type,
      timestamp: new Date().toISOString(),
      reason: entry.reason,
      metadata: entry.metadata,
      model_version: entry.model_version,
      policy_version: entry.policy_version
    };

    // Immutable append
    this.logs.unshift(record);

    // Keep memory clean up to 10,000 logs
    if (this.logs.length > 10000) {
      this.logs.pop();
    }

    return record;
  }

  public getLogs(filters?: {
    case_id?: string;
    actor_type?: ActorType;
    event_type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): { logs: AuditLog[]; total: number } {
    let result = [...this.logs];

    if (filters?.case_id) {
      result = result.filter(l => l.case_id === filters.case_id);
    }
    if (filters?.actor_type) {
      result = result.filter(l => l.actor_type === filters.actor_type);
    }
    if (filters?.event_type) {
      result = result.filter(l => l.event_type.toLowerCase().includes(filters.event_type!.toLowerCase()));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        l =>
          l.reason.toLowerCase().includes(q) ||
          l.event_type.toLowerCase().includes(q) ||
          (l.case_id && l.case_id.toLowerCase().includes(q)) ||
          l.actor_id.toLowerCase().includes(q)
      );
    }

    const total = result.length;
    const offset = filters?.offset ?? 0;
    const limit = filters?.limit ?? 50;

    return {
      logs: result.slice(offset, offset + limit),
      total
    };
  }

  public clear() {
    this.logs = [];
  }
}

export const auditService = new AuditService();
