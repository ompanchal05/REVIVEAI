import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  Cpu,
  User,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Ban,
  ArrowUpRight,
  Clock,
  FileText,
  Copy,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ActionType, AuditLog, RecoveryAction, RecoveryCase } from '../types';
import { formatINR, formatPercent, formatTimeAgo, getStatusBadgeStyle, getRiskBadgeStyle } from '../utils/formatters';

interface CaseDetailsDrawerProps {
  caseData: RecoveryCase | null;
  actions: RecoveryAction[];
  auditLogs: AuditLog[];
  onClose: () => void;
  onExecuteAction: (caseId: string, actionType: ActionType, idempotencyKey: string) => Promise<void>;
  onStopCase: (caseId: string) => Promise<void>;
  onEscalateCase: (caseId: string) => Promise<void>;
  onReanalyzeAI: (caseId: string) => Promise<void>;
  onRepredictML: (caseId: string) => Promise<void>;
}

export const CaseDetailsDrawer: React.FC<CaseDetailsDrawerProps> = ({
  caseData,
  actions,
  auditLogs,
  onClose,
  onExecuteAction,
  onStopCase,
  onEscalateCase,
  onReanalyzeAI,
  onRepredictML,
}) => {
  if (!caseData) return null;

  const [selectedAction, setSelectedAction] = useState<ActionType>(caseData.proposed_action || 'SEND_PAYMENT_LINK');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const statusStyle = getStatusBadgeStyle(caseData.status);
  const riskStyle = getRiskBadgeStyle(caseData.risk_level);

  const handleCopyId = () => {
    navigator.clipboard.writeText(caseData.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const idempKey = `idemp_${caseData.id}_${Date.now()}`;
      await onExecuteAction(caseData.id, selectedAction, idempKey);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReanalyze = async () => {
    setIsAnalyzing(true);
    try {
      await onReanalyzeAI(caseData.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRepredict = async () => {
    setIsPredicting(true);
    try {
      await onRepredictML(caseData.id);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-3xl bg-[#0F0F0F] border-l border-[#2A2A2A] h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#0F0F0F]/95 backdrop-blur z-20 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">Case Dossier</span>
              <span className="text-xs text-[#E5E5E5]/30">•</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-xs text-[#E5E5E5]/60 hover:text-white font-mono flex items-center space-x-1 transition"
                title="Copy Case ID"
              >
                <span>{caseData.id}</span>
                <Copy className="h-3 w-3 text-[#C5A059]" />
              </button>
              {copiedId && <span className="text-[9px] font-mono text-[#00FF66]">Copied!</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <h2 className="text-2xl font-serif italic text-white">{caseData.customer.name}</h2>
              <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                {caseData.status}
              </span>
              <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${riskStyle.bg}`}>
                {caseData.risk_level} RISK
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#E5E5E5]/40 hover:text-white border border-[#2A2A2A] hover:bg-[#1A1A1A] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Summary Financial Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-[#141414] border border-[#2A2A2A]">
              <div className="text-[9px] text-[#E5E5E5]/50 font-medium uppercase tracking-[0.25em]">Amount At Risk</div>
              <div className="text-xl font-serif text-white mt-1">{formatINR(caseData.amount)}</div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">{caseData.currency} • {caseData.days_overdue}d overdue</div>
            </div>
            <div className="p-4 bg-[#141414] border border-[#2A2A2A]">
              <div className="text-[9px] text-[#E5E5E5]/50 font-medium uppercase tracking-[0.25em]">Recovery Probability</div>
              <div className="text-xl font-serif text-[#C5A059] mt-1">
                {(caseData.recovery_probability * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Model: {caseData.ml_model_version}</div>
            </div>
            <div className="p-4 bg-[#141414] border border-[#2A2A2A]">
              <div className="text-[9px] text-[#E5E5E5]/50 font-medium uppercase tracking-[0.25em]">Expected Value (ERV)</div>
              <div className="text-xl font-serif text-[#00FF66] mt-1">
                {formatINR(caseData.expected_recovery_value)}
              </div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Net of intervention cost</div>
            </div>
          </div>

          {/* Outcome Verification Banner (if completed) */}
          {caseData.outcome_verified && (
            <div
              className={`p-4 border flex items-start space-x-3 ${
                caseData.outcome_status === 'RECOVERED'
                  ? 'bg-[#141414] border-[#00FF66]/50 text-[#00FF66]'
                  : 'bg-[#141414] border-rose-500/50 text-rose-300'
              }`}
            >
              {caseData.outcome_status === 'RECOVERED' ? (
                <CheckCircle2 className="h-5 w-5 text-[#00FF66] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-serif text-base text-white">
                  {caseData.outcome_status === 'RECOVERED'
                    ? `Verified Gateway Settlement: ${formatINR(caseData.recovered_amount)} Recovered`
                    : `Intervention Result: ${caseData.outcome_status}`}
                </div>
                <div className="text-xs text-[#E5E5E5]/70 mt-1 font-light">
                  Reconciliation confirmed via Razorpay API ledger. Net recovery value: {formatINR(caseData.actual_recovery_value)}.
                </div>
              </div>
            </div>
          )}

          {/* Customer & Failure Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-[#141414] border border-[#2A2A2A] p-5">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em] mb-4">
                <User className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Customer Profile</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Email:</span>
                  <span className="text-white font-mono">{caseData.customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Phone:</span>
                  <span className="text-white font-mono">{caseData.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Segment:</span>
                  <span className="text-white uppercase tracking-wider text-[11px]">{caseData.customer.segment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Customer Lifetime Value:</span>
                  <span className="text-[#C5A059] font-serif font-semibold">{formatINR(caseData.customer.lifetime_value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Past Payments:</span>
                  <span className="text-white font-mono">
                    {caseData.customer.previous_successes} ok / {caseData.customer.previous_failures} fail
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Opt-Out Status:</span>
                  <span className={`font-mono text-[10px] uppercase tracking-wider ${caseData.customer.customer_opted_out ? 'text-rose-400 font-bold' : 'text-[#00FF66]'}`}>
                    {caseData.customer.customer_opted_out ? 'OPTED OUT' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Failure Event */}
            <div className="bg-[#141414] border border-[#2A2A2A] p-5">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em] mb-4">
                <CreditCard className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Payment Telemetry</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Event Type:</span>
                  <span className="text-white font-mono text-[11px]">{caseData.event_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Payment Instrument:</span>
                  <span className="text-white font-mono">{caseData.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Gateway Failure Code:</span>
                  <span className="text-[#C5A059] font-mono font-medium">{caseData.failure_reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Prior Retries Attempted:</span>
                  <span className="text-white font-mono">{caseData.retry_count} / 3 cap</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Reminders Sent:</span>
                  <span className="text-white font-mono">{caseData.reminder_count} / 2 cap</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E5E5E5]/50">Event Timestamp:</span>
                  <span className="text-[#E5E5E5]/50">{formatTimeAgo(caseData.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Machine Learning Prediction & Explainability */}
          <div className="bg-[#141414] border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
                <Cpu className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>ML Recovery Probability & SHAP Attribution</span>
              </div>
              <button
                type="button"
                onClick={handleRepredict}
                disabled={isPredicting}
                className="text-[10px] uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#D4B36D] flex items-center space-x-1"
              >
                <RotateCcw className={`h-3 w-3 ${isPredicting ? 'animate-spin' : ''}`} />
                <span>Re-score ML</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-[#E5E5E5]/60 font-light">
                Model estimate: <span className="text-white font-serif font-semibold text-sm">{(caseData.recovery_probability * 100).toFixed(1)}%</span> probability of recovery.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {caseData.contributing_factors.map((factor, idx) => (
                  <div key={idx} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif italic text-white">{factor.factor}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 uppercase ${
                          factor.impact === 'POSITIVE'
                            ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                            : factor.impact === 'NEGATIVE'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-[#141414] text-[#E5E5E5]/60'
                        }`}
                      >
                        {factor.impact}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#E5E5E5]/50 mt-1 font-light">{factor.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Investigation & Diagnosis (Gemini 3.8 Flash / Diagnostic Engine) */}
          <div className="bg-[#141414] border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
                <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>AI Investigation & Strategic Recommendation</span>
              </div>
              <button
                type="button"
                onClick={handleReanalyze}
                disabled={isAnalyzing}
                className="text-[10px] uppercase tracking-[0.15em] text-[#C5A059] hover:text-[#D4B36D] flex items-center space-x-1"
              >
                <RotateCcw className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                <span>Re-investigate (Gemini)</span>
              </button>
            </div>

            <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A]">
              <div className="text-sm font-serif italic text-white mb-2 leading-relaxed">
                "{caseData.ai_diagnosis || 'Automated AI diagnosis complete.'}"
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono text-[#E5E5E5]/50 mb-3">
                <span>Confidence: <strong className="text-[#C5A059]">{(caseData.ai_confidence * 100).toFixed(0)}%</strong></span>
                <span>•</span>
                <span>Action: <strong className="text-white">{caseData.ai_recommended_action}</strong></span>
              </div>

              {caseData.ai_reasoning && caseData.ai_reasoning.length > 0 && (
                <div className="space-y-1 text-xs text-[#E5E5E5]/80 pt-2 border-t border-[#2A2A2A]">
                  <div className="font-semibold text-[#C5A059] text-[9px] uppercase tracking-[0.25em]">Diagnostic Reasoning:</div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#E5E5E5]/60 font-light">
                    {caseData.ai_reasoning.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Deterministic Financial Policy Evaluation (Crucial Guardrail) */}
          <div className="bg-[#141414] border border-[#2A2A2A] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C5A059]" />
                <span>Deterministic Safety Policy Evaluation</span>
              </div>
              <span className="text-[10px] text-[#E5E5E5]/40 font-mono">{caseData.policy_version}</span>
            </div>

            <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-[#E5E5E5]/60">Policy Authorization Verdict:</div>
                <span
                  className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider font-bold ${
                    caseData.policy_decision === 'ALLOW'
                      ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                      : caseData.policy_decision === 'HUMAN_REVIEW'
                      ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {caseData.policy_decision}
                </span>
              </div>
              <div className="text-xs text-[#E5E5E5]/80 bg-[#0F0F0F] p-3 border border-[#2A2A2A] font-light">
                <strong className="text-white font-medium">Reason:</strong> {caseData.policy_reason}
              </div>

              {/* Policy Rule Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex items-center space-x-2 text-[#E5E5E5]/70">
                  {caseData.customer.customer_opted_out ? (
                    <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                  )}
                  <span>Customer Opt-out Safeguard</span>
                </div>
                <div className="flex items-center space-x-2 text-[#E5E5E5]/70">
                  {caseData.amount > 10000 ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                  )}
                  <span>High-Value Threshold (&le; ₹10,000)</span>
                </div>
                <div className="flex items-center space-x-2 text-[#E5E5E5]/70">
                  {caseData.retry_count >= 3 ? (
                    <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                  )}
                  <span>Retry Fatigue Cap (&le; 3)</span>
                </div>
                <div className="flex items-center space-x-2 text-[#E5E5E5]/70">
                  {caseData.event_type === 'DISPUTE_DETECTED' ? (
                    <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66] shrink-0" />
                  )}
                  <span>Dispute / Fraud Check</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bounded Action Execution Panel */}
          <div className="bg-[#141414] border border-[#2A2A2A] p-5">
            <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em] mb-4">
              <Play className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Bounded Action Execution Control</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 mb-1">Intervention to Dispatch:</label>
                  <select
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value as ActionType)}
                    className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
                  >
                    <option value="SEND_PAYMENT_LINK">SEND_PAYMENT_LINK (Razorpay Link)</option>
                    <option value="RETRY_PAYMENT">RETRY_PAYMENT (Direct Gateway Retry)</option>
                    <option value="SCHEDULE_RETRY">SCHEDULE_RETRY (Off-peak Window)</option>
                    <option value="SEND_REMINDER">SEND_REMINDER (Email / SMS Notification)</option>
                    <option value="SEND_INVOICE_REMINDER">SEND_INVOICE_REMINDER (Invoice Due Link)</option>
                    <option value="STOP_RECOVERY">STOP_RECOVERY (Halt all attempts)</option>
                    <option value="ESCALATE_HUMAN">ESCALATE_HUMAN (Escalate to Risk Ops)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 mb-1">Execution Safety Mode:</label>
                  <div className="bg-[#0F0F0F] border border-[#2A2A2A] p-2 text-xs text-[#E5E5E5]/80 flex items-center justify-between">
                    <span>Deterministic Policy Guard</span>
                    <span className="text-[#00FF66] font-mono font-semibold">Strict</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2A2A]">
                {caseData.policy_decision === 'STOP' ? (
                  <div className="text-xs text-rose-400 font-medium flex items-center space-x-1">
                    <Ban className="h-4 w-4" />
                    <span>Action execution blocked by policy: {caseData.policy_reason}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleExecute}
                    disabled={isExecuting || caseData.status === 'RECOVERED'}
                    className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] transition flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Play className={`h-3 w-3 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                    <span>{isExecuting ? 'Executing...' : 'Dispatch Authorized Action'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onStopCase(caseData.id)}
                  disabled={caseData.status === 'STOPPED'}
                  className="px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-medium bg-[#1A1A1A] hover:bg-[#222222] text-[#E5E5E5] border border-[#2A2A2A] transition"
                >
                  Halt Recovery
                </button>

                <button
                  type="button"
                  onClick={() => onEscalateCase(caseData.id)}
                  disabled={caseData.status === 'ESCALATED'}
                  className="px-3.5 py-2 text-[10px] uppercase tracking-[0.15em] font-medium bg-[#1A1A1A] hover:bg-[#222222] text-rose-400 border border-[#2A2A2A] transition"
                >
                  Escalate to Risk Ops
                </button>
              </div>
            </div>
          </div>

          {/* Action History & Immutable Audit Logs */}
          <div className="bg-[#141414] border border-[#2A2A2A] p-5">
            <div className="flex items-center space-x-2 text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em] mb-4">
              <FileText className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Immutable Governance Audit Trail</span>
            </div>

            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <div className="text-xs text-[#E5E5E5]/40 py-2 font-light">No audit records logged for this case yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white font-mono text-[11px]">{log.event_type}</span>
                      <span className="text-[10px] text-[#E5E5E5]/40">{formatTimeAgo(log.timestamp)}</span>
                    </div>
                    <div className="text-[#E5E5E5]/80 text-[11px] mt-1 font-light">{log.reason}</div>
                    <div className="text-[10px] text-[#E5E5E5]/40 mt-1 flex items-center space-x-2 font-mono">
                      <span>Actor: {log.actor_type} ({log.actor_id})</span>
                      {log.policy_version && <span>• Policy: {log.policy_version}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
