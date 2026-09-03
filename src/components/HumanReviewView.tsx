import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  FileText,
  Eye,
  Check,
  Ban
} from 'lucide-react';
import { RecoveryCase } from '../types';
import { formatINR, formatTimeAgo, getRiskBadgeStyle } from '../utils/formatters';

interface HumanReviewViewProps {
  queue: RecoveryCase[];
  onSelectCase: (c: RecoveryCase) => void;
  onApproveCase: (caseId: string, decision: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'STOPPED', notes: string) => Promise<void>;
}

export const HumanReviewView: React.FC<HumanReviewViewProps> = ({
  queue,
  onSelectCase,
  onApproveCase,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeReviewCase = queue.find((c) => c.id === selectedCaseId) || queue[0];

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'STOPPED') => {
    if (!activeReviewCase) return;
    setIsSubmitting(true);
    try {
      await onApproveCase(activeReviewCase.id, decision, reviewNotes || `Decision: ${decision} by Senior Finance Manager.`);
      setReviewNotes('');
      if (queue.length > 1) {
        setSelectedCaseId(queue[1].id);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck className="h-4 w-4" />
            <span>Human-in-the-Loop Governance Queue</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            High-Value & Exception Review Queue ({queue.length})
          </h1>
          <p className="text-xs text-slate-400">
            Cases triggered by financial threshold rules (&gt; ₹10,000), fraud risk flags, or low AI confidence requiring managerial sign-off.
          </p>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Review Queue is Completely Clear</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            All high-value exceptions and borderline cases have been reviewed. Automated recovery pipelines are operating safely within policy bounds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Queue List */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              <span>Pending Cases</span>
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[11px] font-bold">
                {queue.length}
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[600px]">
              {queue.map((c) => {
                const isSelected = activeReviewCase?.id === c.id;
                const riskStyle = getRiskBadgeStyle(c.risk_level);
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`p-4 cursor-pointer transition ${
                      isSelected ? 'bg-slate-800/90 border-l-4 border-amber-400' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-white text-xs">{c.customer.name}</div>
                      <span className="font-bold text-white text-xs">{formatINR(c.amount)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {c.failure_reason.replace(/_/g, ' ')} • {c.payment_method}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                      <span className="text-amber-400 font-semibold">{c.policy_reason}</span>
                      <span className={`px-1.5 py-0.2 rounded font-semibold ${riskStyle.bg}`}>
                        {c.risk_level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Review Dossier & Action Decision Panel */}
          {activeReviewCase && (
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                    Manager Review Required
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">{activeReviewCase.customer.name}</h2>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Case ID: <span className="font-mono text-slate-300">{activeReviewCase.id}</span> • Customer Email:{' '}
                    <span className="text-slate-300">{activeReviewCase.customer.email}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">{formatINR(activeReviewCase.amount)}</div>
                  <div className="text-xs text-slate-400">At-Risk Transaction</div>
                </div>
              </div>

              {/* Policy Trigger Banner */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start space-x-3 text-xs text-amber-300">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Policy Trigger Reason:</div>
                  <div className="mt-0.5">{activeReviewCase.policy_reason}</div>
                  <div className="text-[11px] text-amber-400/80 mt-1">
                    ReviveAI requires explicit managerial authorization before dispatching customer outreach or payment links.
                  </div>
                </div>
              </div>

              {/* Diagnostic Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Recovery Probability:</span>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {(activeReviewCase.recovery_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Model: {activeReviewCase.ml_model_version}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Customer Lifetime Value:</span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {formatINR(activeReviewCase.customer.lifetime_value)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Segment: {activeReviewCase.customer.segment}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Recommended Action:</span>
                  <div className="text-sm font-semibold text-teal-400 mt-0.5 font-mono">
                    {activeReviewCase.proposed_action}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">AI Confidence: {(activeReviewCase.ai_confidence * 100).toFixed(0)}%</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Payment Failure Code:</span>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">
                    {activeReviewCase.failure_reason}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Instrument: {activeReviewCase.payment_method}</div>
                </div>
              </div>

              {/* Reviewer Note Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Manager Review Notes & Authorization Justification:
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter audit rationale for this recovery decision (e.g., 'Verified transaction legitimacy with enterprise client account manager')..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Signing Actor: <span className="text-white font-semibold">FINANCE_MANAGER (usr_mgr_101)</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDecision('STOPPED')}
                    disabled={isSubmitting}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  >
                    Reject & Stop
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('ESCALATED')}
                    disabled={isSubmitting}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                  >
                    Escalate to Legal/Risk
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision('APPROVED')}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow transition flex items-center space-x-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Approve for Recovery</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
