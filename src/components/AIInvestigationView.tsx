import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { RecoveryCase } from '../types';
import { formatINR, formatPercent, getStatusBadgeStyle, getRiskBadgeStyle } from '../utils/formatters';

interface AIInvestigationViewProps {
  cases: RecoveryCase[];
  onSelectCase: (c: RecoveryCase) => void;
  onRunInvestigation: (caseId: string) => Promise<void>;
}

export const AIInvestigationView: React.FC<AIInvestigationViewProps> = ({
  cases,
  onSelectCase,
  onRunInvestigation,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleAnalyze = async () => {
    if (!activeCase) return;
    setIsAnalyzing(true);
    try {
      await onRunInvestigation(activeCase.id);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!activeCase) {
    return (
      <div className="p-12 text-center text-[#E5E5E5]/40 font-serif italic text-lg">
        No active recovery cases available for AI investigation.
      </div>
    );
  }

  const statusStyle = getStatusBadgeStyle(activeCase.status);
  const riskStyle = getRiskBadgeStyle(activeCase.risk_level);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center space-x-2 text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Investigation & Strategic Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Decision Chain & Diagnostic Synthesis
          </h1>
          <p className="text-xs text-[#E5E5E5]/60 mt-1 font-light max-w-2xl">
            Inspect the verifiable chain from raw gateway failure to ML probability, generative diagnosis, policy bounds, and settled recovery.
          </p>
        </div>

        {/* Case Selector */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <label className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50">Active Case:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="bg-[#141414] border border-[#2A2A2A] text-white text-xs px-3 py-2 focus:outline-none focus:border-[#C5A059] font-mono"
          >
            {cases.slice(0, 30).map((c) => (
              <option key={c.id} value={c.id}>
                {c.customer.name} - {formatINR(c.amount)} ({c.failure_reason})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] transition flex items-center space-x-1.5"
          >
            <RotateCcw className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Run Gemini Analysis</span>
          </button>
        </div>
      </div>

      {/* Visual Decision Chain Pipeline (Horizontal Stepper) */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-6 shadow-sm overflow-x-auto">
        <div className="text-[9px] font-bold text-[#C5A059] uppercase tracking-[0.3em] mb-5">
          Autonomous Revenue Decision Flow
        </div>

        <div className="flex items-center justify-between min-w-[750px] relative py-2">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-[#2A2A2A] z-0" />

          {/* Stage 1: Payment Event */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="h-11 w-11 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#E5E5E5]/70">
              <CreditCard className="h-4 w-4 text-[#C5A059]" />
            </div>
            <div className="mt-2.5 text-xs font-serif italic text-white">1. Event Ingestion</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/60 mt-0.5">{activeCase.failure_reason}</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40">{formatINR(activeCase.amount)}</div>
          </div>

          <ChevronRight className="relative z-10 h-4 w-4 text-[#E5E5E5]/20" />

          {/* Stage 2: ML Prediction */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="h-11 w-11 bg-[#1A1A1A] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="mt-2.5 text-xs font-serif italic text-white">2. ML Scoring</div>
            <div className="text-[10px] font-mono text-[#C5A059] font-bold mt-0.5">
              {(activeCase.recovery_probability * 100).toFixed(0)}% Prob.
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40">ERV: {formatINR(activeCase.expected_recovery_value)}</div>
          </div>

          <ChevronRight className="relative z-10 h-4 w-4 text-[#E5E5E5]/20" />

          {/* Stage 3: AI Diagnosis */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="h-11 w-11 bg-[#1A1A1A] border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="mt-2.5 text-xs font-serif italic text-white">3. AI Diagnosis</div>
            <div className="text-[10px] font-mono text-[#00FF66] font-bold mt-0.5">
              {(activeCase.ai_confidence * 100).toFixed(0)}% Conf.
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 truncate max-w-[120px]">{activeCase.ai_recommended_action}</div>
          </div>

          <ChevronRight className="relative z-10 h-4 w-4 text-[#E5E5E5]/20" />

          {/* Stage 4: Deterministic Policy Gate */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className={`h-11 w-11 border flex items-center justify-center ${
                activeCase.policy_decision === 'ALLOW'
                  ? 'bg-[#1A1A1A] border-[#00FF66]/50 text-[#00FF66]'
                  : activeCase.policy_decision === 'HUMAN_REVIEW'
                  ? 'bg-[#1A1A1A] border-[#C5A059]/50 text-[#C5A059]'
                  : 'bg-[#1A1A1A] border-rose-500/50 text-rose-400'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="mt-2.5 text-xs font-serif italic text-white">4. Policy Guardrail</div>
            <div
              className={`text-[10px] font-mono uppercase tracking-wider font-bold mt-0.5 ${
                activeCase.policy_decision === 'ALLOW'
                  ? 'text-[#00FF66]'
                  : activeCase.policy_decision === 'HUMAN_REVIEW'
                  ? 'text-[#C5A059]'
                  : 'text-rose-400'
              }`}
            >
              {activeCase.policy_decision}
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40">{activeCase.policy_version || 'v1.4.0 Engine'}</div>
          </div>

          <ChevronRight className="relative z-10 h-4 w-4 text-[#E5E5E5]/20" />

          {/* Stage 5: Intervention & Settle */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <div
              className={`h-11 w-11 border flex items-center justify-center ${
                activeCase.outcome_status === 'RECOVERED'
                  ? 'bg-[#00FF66] text-[#0F0F0F] border-[#00FF66] font-bold'
                  : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#E5E5E5]/40'
              }`}
            >
              <Check className="h-4 w-4" />
            </div>
            <div className="mt-2.5 text-xs font-serif italic text-white">5. Outcome Settlement</div>
            <div className="text-[10px] font-mono text-[#00FF66] font-bold mt-0.5">
              {activeCase.outcome_status === 'RECOVERED' ? formatINR(activeCase.recovered_amount) : activeCase.status}
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40">Reconciled</div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: AI Diagnostic Evidence */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div className="font-serif italic text-lg text-white">AI Diagnostic Evidence & Hypothesis</div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#C5A059] border border-[#C5A059]/30 px-2 py-0.5">Gemini 3.8 Flash</span>
          </div>

          <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="text-[9px] text-[#C5A059] uppercase tracking-[0.25em] font-semibold">Executive Diagnosis:</div>
            <p className="text-sm font-serif italic text-white font-medium mt-1 leading-relaxed">
              "{activeCase.ai_diagnosis || 'Automated AI analysis complete.'}"
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-[9px] text-[#E5E5E5]/50 uppercase tracking-[0.25em] font-semibold">Contributing Factors & Reasoning:</div>
            <div className="space-y-2">
              {activeCase.ai_reasoning?.map((reason, idx) => (
                <div key={idx} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] text-xs flex items-start space-x-2.5">
                  <span className="h-1.5 w-1.5 bg-[#C5A059] shrink-0 mt-1.5" />
                  <span className="text-[#E5E5E5]/80 font-light">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50">Strategic Recommendation:</span>
              <div className="text-[#C5A059] font-mono font-bold mt-0.5">{activeCase.ai_recommended_action}</div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50">Requires Human Review:</span>
              <div className={`font-mono text-xs font-bold mt-0.5 ${activeCase.ai_requires_human_review ? 'text-[#C5A059]' : 'text-[#00FF66]'}`}>
                {activeCase.ai_requires_human_review ? 'YES (Flagged)' : 'NO (Automated)'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ground Truth & Telemetry Checklist */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div className="font-serif italic text-lg text-white">Telemetry & Machine Ground Truth</div>
            <button
              type="button"
              onClick={() => onSelectCase(activeCase)}
              className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] hover:text-[#D4B36D] font-bold"
            >
              Open Full Dossier →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] flex justify-between">
              <span className="text-[#E5E5E5]/50">Customer Identity:</span>
              <span className="text-white font-mono">{activeCase.customer.name} ({activeCase.customer.email})</span>
            </div>
            <div className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] flex justify-between">
              <span className="text-[#E5E5E5]/50">Customer Lifetime Value:</span>
              <span className="text-[#C5A059] font-serif font-semibold">{formatINR(activeCase.customer.lifetime_value)}</span>
            </div>
            <div className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] flex justify-between">
              <span className="text-[#E5E5E5]/50">Historical Payment Success Ratio:</span>
              <span className="text-white font-mono">
                {activeCase.customer.previous_successes} / {activeCase.customer.previous_successes + activeCase.customer.previous_failures} ({((activeCase.customer.previous_successes / Math.max(1, activeCase.customer.previous_successes + activeCase.customer.previous_failures)) * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] flex justify-between">
              <span className="text-[#E5E5E5]/50">Policy Verdict:</span>
              <span className="text-[#00FF66] font-mono font-semibold">{activeCase.policy_decision} ({activeCase.policy_reason})</span>
            </div>
            <div className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] flex justify-between">
              <span className="text-[#E5E5E5]/50">Execution Mode:</span>
              <span className="text-[#E5E5E5]/80 font-mono text-[11px]">IDEMPOTENT_GATEWAY_DISPATCH</span>
            </div>
          </div>

          {/* Architecture Callout */}
          <div className="p-4 bg-[#1A1A1A] border border-[#C5A059]/30 text-xs text-[#E5E5E5]/70 font-light">
            <div className="font-bold text-[#C5A059] text-[9px] uppercase tracking-[0.25em] mb-1">Financial Safety Guarantee</div>
            GenAI models are strictly forbidden from directly executing payments. Generative outputs are bounded by deterministic policy checks and require immutable audit logging before any API dispatch.
          </div>
        </div>
      </div>
    </div>
  );
};
