import React from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  Sparkles,
  Cpu,
  DollarSign
} from 'lucide-react';

interface LandingHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandingHeroModal: React.FC<LandingHeroModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-[#1A1A1A] border border-[#C5A059]/40 text-[#C5A059] flex items-center justify-center">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-serif italic text-white">ReviveAI — Architecture & Governance Axiom</h2>
              <p className="text-xs text-[#E5E5E5]/50 font-mono">Enterprise Revenue Recovery Controller for Razorpay</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#E5E5E5]/50 hover:text-white bg-[#1A1A1A] border border-[#2A2A2A] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs text-[#E5E5E5]">
          {/* Core Philosophy Box */}
          <div className="p-5 bg-[#141414] border border-[#C5A059]/40">
            <div className="text-[#C5A059] font-mono font-bold uppercase tracking-[0.2em] text-[10px] mb-1">
              Core Architectural Principle
            </div>
            <div className="text-lg font-serif italic text-white leading-snug">
              "AI recommends. Policy controls. Humans oversee. Systems execute."
            </div>
            <p className="text-[#E5E5E5]/70 mt-2 text-xs leading-relaxed">
              Financial systems cannot tolerate hallucinations, unauthorized outreach, or rogue retry loops.
              ReviveAI places deterministic safety code and human authorization gates between AI reasoning and real payment gateway execution.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#141414] border border-[#2A2A2A] space-y-2">
              <div className="flex items-center space-x-2 text-[#C5A059] font-mono text-xs uppercase tracking-wider font-semibold">
                <Cpu className="h-4 w-4" />
                <span>1. Calibrated ML Probability</span>
              </div>
              <p className="text-[#E5E5E5]/60 leading-relaxed text-[11px]">
                XGBoost and Random Forest models estimate true recovery probability (0 to 1) and calculate Expected Recovery Value (ERV) net of intervention costs.
              </p>
            </div>

            <div className="p-4 bg-[#141414] border border-[#2A2A2A] space-y-2">
              <div className="flex items-center space-x-2 text-[#00FF66] font-mono text-xs uppercase tracking-wider font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>2. Generative AI Investigation</span>
              </div>
              <p className="text-[#E5E5E5]/60 leading-relaxed text-[11px]">
                Gemini 3.8 Flash synthesizes multi-dimensional failure context into explainable natural language diagnoses with structured recommendations.
              </p>
            </div>

            <div className="p-4 bg-[#141414] border border-[#2A2A2A] space-y-2">
              <div className="flex items-center space-x-2 text-[#C5A059] font-mono text-xs uppercase tracking-wider font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>3. Deterministic Safety Policies</span>
              </div>
              <p className="text-[#E5E5E5]/60 leading-relaxed text-[11px]">
                Strict code guardrails guarantee customer opt-outs are 100% honored, retry fatigue caps are enforced (&le; 3), and quiet hours are observed.
              </p>
            </div>

            <div className="p-4 bg-[#141414] border border-[#2A2A2A] space-y-2">
              <div className="flex items-center space-x-2 text-[#00D2FF] font-mono text-xs uppercase tracking-wider font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>4. Outcome Proof & Reconciliation</span>
              </div>
              <p className="text-[#E5E5E5]/60 leading-relaxed text-[11px]">
                Every single rupee claimed as recovered is cross-verified against the Razorpay settlement ledger. No fake metrics, only proven capital.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-mono uppercase tracking-wider font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] shadow transition"
            >
              Close Axiom Deck
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

