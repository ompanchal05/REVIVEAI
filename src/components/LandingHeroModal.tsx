import React from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  Cpu,
  UserCheck,
  CheckCircle2,
  DollarSign,
  Radio
} from 'lucide-react';

interface LandingHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandingHeroModal: React.FC<LandingHeroModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ReviveAI — Architecture & Governance Axiom</h2>
              <p className="text-xs text-slate-400">Enterprise Revenue Recovery Controller for Razorpay</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {/* Core Philosophy Box */}
          <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl">
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-1">
              Core Architectural Principle
            </div>
            <div className="text-lg font-bold text-white leading-snug">
              "AI recommends. Policy controls. Humans oversee. Systems execute."
            </div>
            <p className="text-slate-400 mt-2 text-xs leading-relaxed">
              Financial systems cannot tolerate hallucinations, unauthorized outreach, or rogue retry loops.
              ReviveAI places deterministic safety code and human authorization gates between AI reasoning and real payment gateway execution.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 font-semibold">
                <Cpu className="h-4 w-4" />
                <span>1. Calibrated ML Probability</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                XGBoost and Random Forest models estimate true recovery probability (0 to 1) and calculate Expected Recovery Value (ERV) net of intervention costs.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>2. Generative AI Investigation</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Gemini 3.8 Flash synthesizes multi-dimensional failure context into explainable natural language diagnoses with structured recommendations.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>3. Deterministic Safety Policies</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Strict code guardrails guarantee customer opt-outs are 100% honored, retry fatigue caps are enforced (&le; 3), and quiet hours are observed.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2 text-blue-400 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>4. Outcome Proof & Reconciliation</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Every single rupee claimed as recovered is cross-verified against the Razorpay settlement ledger. No fake metrics, only proven capital.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow"
            >
              Enter Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
