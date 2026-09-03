import React, { useState } from 'react';
import {
  Zap,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Lock,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowDownToLine,
  Play,
  RotateCcw,
  BarChart3,
  Users,
  Building2,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Ban,
  Check,
  X,
  PhoneOff,
  RefreshCw,
  Sliders,
  Send,
  Scale
} from 'lucide-react';
import { RecoveryCase } from '../types';

interface LandingPageViewProps {
  onEnterConsole: (tab?: string) => void;
  onOpenDirectPull: () => void;
  onRunBatchDemo: () => void;
  onSelectScenario: (num: number) => void;
  systemStatus: any;
}

interface SimulationScenario {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  amount: number;
  customer: string;
  phone: string;
  acquirer: string;
  errorCode: string;
  errorDesc: string;
  mlProb: number;
  mlLatency: string;
  erv: number;
  policyStatus: 'PASSED' | 'HUMAN_REQUIRED' | 'BLOCKED';
  policyReason: string;
  recommendedAction: string;
  actionType: 'retry' | 'link' | 'human' | 'block';
  idempotencyKey: string;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onEnterConsole,
  onOpenDirectPull,
  onRunBatchDemo,
  onSelectScenario,
  systemStatus,
}) => {
  // ROI Calculator interactive state
  const [monthlyGMV, setMonthlyGMV] = useState<number>(5000000); // ₹50 Lakhs default
  const [failureRate, setFailureRate] = useState<number>(12); // 12% default
  const [recoveryRate, setRecoveryRate] = useState<number>(72); // 72% default

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Simulation Playground State
  const simulationScenarios: SimulationScenario[] = [
    {
      id: 'sim_1',
      name: 'Bank Gateway Downtime',
      badge: 'Transient Acquirer Error',
      badgeColor: 'text-[#00D2FF] border-[#00D2FF]/30 bg-[#00D2FF]/10',
      amount: 3499,
      customer: 'Aditya Sharma',
      phone: '+91 98201 •••••',
      acquirer: 'HDFC Netbanking',
      errorCode: 'GATEWAY_TIMEOUT_504',
      errorDesc: 'Acquirer bank server timed out during authorization handshake.',
      mlProb: 0.89,
      mlLatency: '11.4 ms',
      erv: 3114,
      policyStatus: 'PASSED',
      policyReason: 'Retries: 1/3 • Time: 14:10 IST (Quiet hours safe) • Opt-out: NO',
      recommendedAction: 'Schedule Smart Gateway Retry in 18 minutes (post congestion peak)',
      actionType: 'retry',
      idempotencyKey: 'idemp_rzp_hdfc_3499_8109',
    },
    {
      id: 'sim_2',
      name: 'Customer OTP Timeout',
      badge: 'Checkout Drop-off',
      badgeColor: 'text-[#C5A059] border-[#C5A059]/30 bg-[#C5A059]/10',
      amount: 1850,
      customer: 'Priya Sundaram',
      phone: '+91 97411 •••••',
      acquirer: 'Razorpay UPI Intent',
      errorCode: 'CUSTOMER_AUTH_EXPIRED',
      errorDesc: 'User session expired during 2FA OTP prompt.',
      mlProb: 0.82,
      mlLatency: '9.8 ms',
      erv: 1517,
      policyStatus: 'PASSED',
      policyReason: 'High customer intent score (0.94) • Safe window • Opt-out: NO',
      recommendedAction: 'Generate 1-Click Dynamic WhatsApp Payment Link with prefilled UPI',
      actionType: 'link',
      idempotencyKey: 'idemp_rzp_upi_1850_4912',
    },
    {
      id: 'sim_3',
      name: 'High-Value Corporate Invoice',
      badge: 'Ceiling Threshold Rule',
      badgeColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
      amount: 48000,
      customer: 'Zenith Labs Pvt Ltd',
      phone: '+91 99002 •••••',
      acquirer: 'ICICI Corporate Card',
      errorCode: 'EXCEEDS_DAILY_LIMIT',
      errorDesc: 'Corporate card limit exceeded for single checkout debit.',
      mlProb: 0.64,
      mlLatency: '14.2 ms',
      erv: 30720,
      policyStatus: 'HUMAN_REQUIRED',
      policyReason: 'Amount ₹48,000 exceeds ₹25,000 automated ceiling rule.',
      recommendedAction: 'Escalate to Human Review Queue for dedicated account manager outreach',
      actionType: 'human',
      idempotencyKey: 'idemp_rzp_icici_48k_7710',
    },
    {
      id: 'sim_4',
      name: 'Customer Opted Out',
      badge: 'Privacy & Policy Hard Stop',
      badgeColor: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
      amount: 2200,
      customer: 'Rohan Mehra',
      phone: '+91 98110 •••••',
      acquirer: 'Axis Debit Card',
      errorCode: 'INSUFFICIENT_FUNDS',
      errorDesc: 'Card issuer returned insufficient account balance.',
      mlProb: 0.58,
      mlLatency: '10.1 ms',
      erv: 1276,
      policyStatus: 'BLOCKED',
      policyReason: 'Customer previously opted out via SMS. 100% outreach block enforced.',
      recommendedAction: 'Hard Stop: Suppress all automated retries & messages (RBI Compliant)',
      actionType: 'block',
      idempotencyKey: 'idemp_rzp_optout_2200_0001',
    },
  ];

  const [activeSim, setActiveSim] = useState<SimulationScenario>(simulationScenarios[0]);
  const [simExecuting, setSimExecuting] = useState<boolean>(false);
  const [simExecutedResult, setSimExecutedResult] = useState<string | null>(null);

  const handleRunSimulation = (sc: SimulationScenario) => {
    setActiveSim(sc);
    setSimExecuting(true);
    setSimExecutedResult(null);
    setTimeout(() => {
      setSimExecuting(false);
      if (sc.actionType === 'retry') {
        setSimExecutedResult('✅ Scheduled retry token created: next execution at 14:28 IST');
      } else if (sc.actionType === 'link') {
        setSimExecutedResult('✅ Dynamic Razorpay link generated: rzp.io/l/rev_priya_1850');
      } else if (sc.actionType === 'human') {
        setSimExecutedResult('⚠️ Routed to Human Review Queue Dossier #HR-48000');
      } else {
        setSimExecutedResult('🛑 Outreach Suppressed: Zero unsolicited communication dispatched');
      }
    }, 450);
  };

  // Calculated ROI values
  const failedRevenueMonthly = (monthlyGMV * failureRate) / 100;
  const recoverableMonthly = (failedRevenueMonthly * recoveryRate) / 100;
  const recoverableAnnual = recoverableMonthly * 12;
  const estimatedCostAnnual = Math.max(250000, recoverableAnnual * 0.045);
  const netROI = Math.round(((recoverableAnnual - estimatedCostAnnual) / estimatedCostAnnual) * 10) / 10;

  const faqs = [
    {
      q: 'How does ReviveAI eliminate customer harassment and retry fatigue?',
      a: 'ReviveAI operates on strict deterministic safety policies that cannot be bypassed by AI reasoning. Every customer profile has a mandatory anti-fatigue ceiling (maximum 3 retry attempts per cycle). If a customer explicitly opts out, their preference is immediately committed to persistent storage with an unassailable 100% block on automated outreach. Furthermore, quiet hours (9:00 PM – 9:00 AM IST) are hardcoded in compliance with RBI guidelines.'
    },
    {
      q: 'Does integrating ReviveAI require rewriting our Razorpay checkout code?',
      a: 'No code rewrites required. ReviveAI integrates as a non-invasive autonomous control plane. You can connect within minutes using standard Razorpay Webhooks (payment.failed, order.paid) or authorize authenticated Direct Pull requests (GET /v1/payments) to intercept failed transactions and trigger smart recovery workflows without touching your checkout frontend.'
    },
    {
      q: 'How do you prove that recovered revenue is real money and not fake analytics?',
      a: 'Every single rupee claimed as recovered is cross-verified against the official Razorpay settlement ledger with strict cryptographic idempotency keys. A case is only marked as "Verified Recovered" when the acquirer bank confirms captured funds and issues a settled transaction UTR. We generate auditable ledger reconciliation exports for finance controllers.'
    },
    {
      q: 'What is the exact division of labor between Machine Learning and Gemini Generative AI?',
      a: 'We implement specialized dual-intelligence: Calibrated statistical ML models (XGBoost & Random Forest) compute mathematical recovery probability (0 to 1) and Expected Recovery Value (ERV) in under 15ms. Gemini 3.8 Flash then synthesizes multi-dimensional telemetry (error codes, customer tenure, bank health, past retry logs) into human-readable diagnoses and structured mitigation plans for ops teams.'
    },
    {
      q: 'Can we test ReviveAI safely in Sandbox mode before connecting live credentials?',
      a: 'Yes! ReviveAI includes a complete enterprise Sandbox Simulator with zero external dependencies required. You can test 100-case automated batches, 7 predefined banking edge cases (timeouts, high-value limits, opt-outs, fraud disputes), and the Direct Pull ledger simulator right out of the box.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans selection:bg-[#C5A059]/30 selection:text-white">
      {/* Quick Jump Sub-Navigation Bar */}
      <div className="sticky top-16 sm:top-[70px] z-20 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-[#242424] hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10 text-[11px] font-mono tracking-wide">
          <div className="flex items-center space-x-6 text-[#8E8E8E]">
            <a href="#simulator" className="hover:text-[#C5A059] transition cursor-pointer">
              Interactive Lab
            </a>
            <a href="#calculator" className="hover:text-[#C5A059] transition cursor-pointer">
              ROI Calculator
            </a>
            <a href="#pillars" className="hover:text-[#C5A059] transition cursor-pointer">
              4 Pillars
            </a>
            <a href="#pipeline" className="hover:text-[#C5A059] transition cursor-pointer">
              Pipeline Flow
            </a>
            <a href="#comparison" className="hover:text-[#C5A059] transition cursor-pointer">
              Control vs Dumb Retries
            </a>
            <a href="#faq" className="hover:text-[#C5A059] transition cursor-pointer">
              FAQ
            </a>
          </div>

          <div className="flex items-center space-x-3 text-[10px]">
            <span className="text-[#00E65B] flex items-center space-x-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00E65B] animate-pulse" />
              <span>Razorpay API v1 Ready</span>
            </span>
            <span className="text-[#242424]">|</span>
            <button
              type="button"
              onClick={() => onEnterConsole('overview')}
              className="text-[#C5A059] hover:underline flex items-center space-x-1 cursor-pointer font-bold uppercase tracking-wider"
            >
              <span>Open Console</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-[#C5A059]/6 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto relative z-10 space-y-6">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#121212] border border-[#242424] text-[#C5A059] text-[11px] font-mono uppercase tracking-[0.2em] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#00E65B] animate-pulse" />
            <span>Autonomous Revenue Recovery Controller for Razorpay</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.08]">
            Find revenue slipping away.{' '}
            <span className="font-serif italic font-normal block text-3xl sm:text-5xl lg:text-6xl text-[#E5E5E5]/90 mt-2">
              Recover it intelligently. <span className="text-[#C5A059] font-medium not-italic font-display">Prove the money.</span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-[#8E8E8E] max-w-2xl mx-auto font-normal leading-relaxed">
            Deterministic financial policy bounds predictive machine learning and Gemini generative diagnostics.
            Zero customer spam. Zero double-charges. 100% verified settlement reconciliation.
          </p>

          {/* High-Craft Interactive CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              id="hero-launch-console-btn"
              onClick={() => onEnterConsole('overview')}
              className="group px-6 py-3.5 bg-[#C5A059] hover:bg-[#D8B570] text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center space-x-2.5"
            >
              <Zap className="h-4 w-4 fill-[#0A0A0A]" />
              <span>Launch Live Console</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              id="hero-direct-pull-btn"
              onClick={onOpenDirectPull}
              className="px-6 py-3.5 bg-[#121212] hover:bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/50 hover:border-[#00D2FF] hover:shadow-[0_0_20px_rgba(0,210,255,0.25)] hover:scale-[1.02] active:scale-[0.98] font-mono text-xs uppercase tracking-[0.15em] transition cursor-pointer flex items-center space-x-2"
            >
              <ArrowDownToLine className="h-4 w-4 text-[#00D2FF]" />
              <span>Razorpay Direct Pull</span>
            </button>

            <button
              type="button"
              id="hero-demo-batch-btn"
              onClick={onRunBatchDemo}
              className="px-6 py-3.5 bg-[#121212] hover:bg-[#1A1A1A] text-[#EDEDED] border border-[#242424] hover:border-[#C5A059] hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] hover:scale-[1.02] active:scale-[0.98] font-mono text-xs uppercase tracking-[0.15em] transition cursor-pointer flex items-center space-x-2"
            >
              <Play className="h-4 w-4 text-[#C5A059]" />
              <span>100-Case Simulation</span>
            </button>
          </div>

          {/* Telemetry Micro-Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-[#8E8E8E] border-t border-[#242424] max-w-3xl mx-auto">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#00E65B]" />
              <span>Deterministic Policy Guard</span>
            </div>
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-[#C5A059]" />
              <span>XGBoost & Random Forest ML</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-[#00D2FF]" />
              <span>Gemini 3.8 Flash Diagnostics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-[#EDEDED]/70" />
              <span>RBI & Idempotency Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Live Recovery Simulation Playground */}
      <section id="simulator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#242424]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2">
            Hands-On Interactive Experience
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Simulate Payment Interception in Real Time
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E8E] mt-2 font-normal leading-relaxed">
            Click any scenario below to see how ReviveAI’s dual-intelligence pipeline analyzes failures, evaluates policy rules, and determines the exact recovery intervention.
          </p>
        </div>

        {/* Scenario Selection Buttons with Distinct Hover Properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto mb-6">
          {simulationScenarios.map((sc) => {
            const isSelected = activeSim.id === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleRunSimulation(sc)}
                className={`p-4 text-left border transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#181818] border-[#C5A059] shadow-[0_0_20px_rgba(197,160,89,0.2)] scale-[1.02]'
                    : 'bg-[#121212] border-[#242424] hover:border-[#C5A059]/60 hover:bg-[#161616] hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">₹{sc.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-sm font-semibold text-white tracking-tight">{sc.name}</div>
                <div className="text-[11px] font-mono text-[#8E8E8E] mt-1">{sc.acquirer}</div>
              </button>
            );
          })}
        </div>

        {/* Active Simulation Visual Inspector Card */}
        <div className="max-w-5xl mx-auto bg-[#121212] border border-[#242424] p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-[#242424] gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono uppercase tracking-wider text-[#C5A059]">Active Failure Interception</span>
                <span className="text-xs text-[#242424]">•</span>
                <span className="text-xs font-mono text-[#8E8E8E]">{activeSim.errorCode}</span>
              </div>
              <h3 className="text-xl font-display font-bold text-white mt-1">
                {activeSim.customer} — ₹{activeSim.amount.toLocaleString('en-IN')} via {activeSim.acquirer}
              </h3>
              <p className="text-xs text-[#8E8E8E] mt-0.5">{activeSim.errorDesc}</p>
            </div>

            <button
              type="button"
              onClick={() => handleRunSimulation(activeSim)}
              disabled={simExecuting}
              className="px-4 py-2 bg-[#181818] hover:bg-[#202020] text-[#C5A059] border border-[#C5A059]/50 hover:border-[#C5A059] hover:shadow-[0_0_15px_rgba(197,160,89,0.2)] hover:scale-105 active:scale-95 text-xs font-mono uppercase tracking-wider transition cursor-pointer flex items-center space-x-2 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${simExecuting ? 'animate-spin' : ''}`} />
              <span>{simExecuting ? 'Evaluating Pipeline...' : 'Re-Run Evaluation'}</span>
            </button>
          </div>

          {/* 3 Pipeline Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Stage 1: ML Probability */}
            <div className="p-4 bg-[#0A0A0A] border border-[#242424] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#C5A059] flex items-center space-x-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>1. Calibrated ML Model</span>
                </span>
                <span className="text-[#8E8E8E] text-[10px]">{activeSim.mlLatency}</span>
              </div>
              <div>
                <div className="text-[10px] font-mono text-[#8E8E8E]">True Recovery Probability</div>
                <div className="text-2xl font-display font-bold text-white mt-0.5">
                  {(activeSim.mlProb * 100).toFixed(0)}%
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C5A059] h-full transition-all duration-500"
                    style={{ width: `${activeSim.mlProb * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] font-mono text-[#8E8E8E] pt-1">
                Expected Recovery Value (ERV): <span className="text-[#00E65B] font-bold">₹{activeSim.erv}</span>
              </div>
            </div>

            {/* Stage 2: Policy Guard Decision */}
            <div className="p-4 bg-[#0A0A0A] border border-[#242424] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#00E65B] flex items-center space-x-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>2. Policy Guardrail</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 uppercase ${
                    activeSim.policyStatus === 'PASSED'
                      ? 'bg-[#00E65B]/10 text-[#00E65B] border border-[#00E65B]/30'
                      : activeSim.policyStatus === 'HUMAN_REQUIRED'
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                      : 'bg-rose-400/10 text-rose-400 border border-rose-400/30'
                  }`}
                >
                  {activeSim.policyStatus}
                </span>
              </div>
              <div className="text-xs text-[#EDEDED] font-normal leading-relaxed">
                {activeSim.policyReason}
              </div>
              <div className="text-[10px] font-mono text-[#8E8E8E] border-t border-[#1F1F1F] pt-2">
                Idempotency Token: <span className="text-[#EDEDED]">{activeSim.idempotencyKey}</span>
              </div>
            </div>

            {/* Stage 3: Autonomous Action */}
            <div className="p-4 bg-[#0A0A0A] border border-[#242424] space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-1 text-xs font-mono text-[#00D2FF] mb-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>3. Action Output</span>
                </div>
                <div className="text-xs font-medium text-white leading-relaxed">
                  {activeSim.recommendedAction}
                </div>
              </div>

              {simExecutedResult ? (
                <div className="text-[11px] font-mono text-[#00E65B] p-2 bg-[#00E65B]/10 border border-[#00E65B]/20">
                  {simExecutedResult}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onEnterConsole('queue')}
                  className="w-full py-2 bg-[#C5A059] hover:bg-[#D8B570] text-[#0A0A0A] font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer text-center"
                >
                  View in Console Queue
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive ROI Recovery Calculator */}
      <section id="calculator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#242424]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2">
            Interactive Financial Model
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Calculate Your Recoverable Revenue
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E8E] mt-2 font-normal">
            Adjust your monthly GMV, payment failure rate, and recovery targets to see immediate capital yield projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#121212] border border-[#242424] p-6 sm:p-10 shadow-2xl">
          {/* Controls Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Slider 1: Monthly GMV */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.15em] font-mono text-[#EDEDED]">
                  Monthly Transaction Volume (GMV)
                </label>
                <span className="text-lg font-display font-bold text-white">
                  ₹{(monthlyGMV / 100000).toFixed(1)} Lakhs
                  <span className="text-xs font-mono text-[#8E8E8E] ml-1.5 font-normal">
                    (₹{monthlyGMV.toLocaleString('en-IN')})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={50000000}
                step={500000}
                value={monthlyGMV}
                onChange={(e) => setMonthlyGMV(Number(e.target.value))}
                className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#C5A059] transition-all hover:bg-[#303030]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8E8E8E]">
                <span>₹5 Lakhs</span>
                <span>₹2.5 Crores</span>
                <span>₹5 Crores</span>
              </div>
            </div>

            {/* Slider 2: Failure Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.15em] font-mono text-[#EDEDED]">
                  Average Payment Failure Rate
                </label>
                <span className="text-lg font-display font-bold text-[#C5A059]">
                  {failureRate}%
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                step={1}
                value={failureRate}
                onChange={(e) => setFailureRate(Number(e.target.value))}
                className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#C5A059] transition-all hover:bg-[#303030]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8E8E8E]">
                <span>3% (Optimized)</span>
                <span>12% (Industry Average)</span>
                <span>30% (High Velocity)</span>
              </div>
            </div>

            {/* Slider 3: Target Recovery Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-[0.15em] font-mono text-[#EDEDED]">
                  Autonomous Recovery Target
                </label>
                <span className="text-lg font-display font-bold text-[#00E65B]">
                  {recoveryRate}%
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={85}
                step={1}
                value={recoveryRate}
                onChange={(e) => setRecoveryRate(Number(e.target.value))}
                className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-[#00E65B] transition-all hover:bg-[#303030]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8E8E8E]">
                <span>50% (Conservative)</span>
                <span>72% (ReviveAI Benchmark)</span>
                <span>85% (Optimistic)</span>
              </div>
            </div>
          </div>

          {/* Outcome Metric Column */}
          <div className="lg:col-span-5 bg-[#0A0A0A] border border-[#242424] p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A059]">
                Annual Projected Return
              </div>

              {/* Big Hero Number */}
              <div>
                <div className="text-xs font-mono text-[#8E8E8E]">Estimated Annual Recovered Capital</div>
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#00E65B] mt-1">
                  ₹{Math.round(recoverableAnnual).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] font-mono text-[#8E8E8E] mt-1">
                  ≈ ₹{Math.round(recoverableMonthly).toLocaleString('en-IN')} / month in net rescued revenue
                </div>
              </div>

              <div className="pt-4 border-t border-[#242424] space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-[#8E8E8E]">
                  <span>Revenue At Risk per Year:</span>
                  <span className="text-white">₹{Math.round(failedRevenueMonthly * 12).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#8E8E8E]">
                  <span>Autonomous Recovery Rate:</span>
                  <span className="text-[#00E65B] font-bold">{recoveryRate}%</span>
                </div>
                <div className="flex justify-between text-[#8E8E8E]">
                  <span>Projected ROI Multiple:</span>
                  <span className="text-[#C5A059] font-bold">{netROI}x Net Return</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onEnterConsole('queue')}
              className="w-full py-3.5 bg-[#00E65B] hover:bg-[#33FF85] text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-[0_0_20px_rgba(0,230,91,0.35)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer text-center"
            >
              Deploy Recovery Controller
            </button>
          </div>
        </div>
      </section>

      {/* 4. The 4 Operational Pillars */}
      <section id="pillars" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#242424]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2">
            System Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Four Pillars of Enterprise Recovery
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E8E] mt-2 font-normal">
            "AI recommends. Policy controls. Humans oversee. Systems execute."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 bg-[#121212] border border-[#242424] hover:border-[#C5A059] hover:shadow-[0_0_20px_rgba(197,160,89,0.15)] hover:scale-[1.02] transition cursor-pointer space-y-3">
            <div className="h-10 w-10 bg-[#181818] border border-[#242424] flex items-center justify-center text-[#C5A059]">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-display font-bold text-white">
              1. Calibrated ML Probability
            </h3>
            <p className="text-xs text-[#8E8E8E] font-normal leading-relaxed">
              XGBoost and Random Forest models evaluate failure codes, customer tenure, and ticket size to compute exact probability (0 to 1) and net Expected Recovery Value.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#C5A059]">
              Latency &lt; 15ms • 0.88 ROC-AUC
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 bg-[#121212] border border-[#242424] hover:border-[#00D2FF] hover:shadow-[0_0_20px_rgba(0,210,255,0.15)] hover:scale-[1.02] transition cursor-pointer space-y-3">
            <div className="h-10 w-10 bg-[#181818] border border-[#242424] flex items-center justify-center text-[#00D2FF]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-display font-bold text-white">
              2. Generative AI Investigation
            </h3>
            <p className="text-xs text-[#8E8E8E] font-normal leading-relaxed">
              Gemini 3.8 Flash synthesizes multi-dimensional telemetry into explainable root-cause investigations, detailing acquirer bank health and customer risk.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#00D2FF]">
              Structured JSON • Explainable Reasoning
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 bg-[#121212] border border-[#242424] hover:border-[#00E65B] hover:shadow-[0_0_20px_rgba(0,230,91,0.15)] hover:scale-[1.02] transition cursor-pointer space-y-3">
            <div className="h-10 w-10 bg-[#181818] border border-[#242424] flex items-center justify-center text-[#00E65B]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-display font-bold text-white">
              3. Deterministic Safety Policies
            </h3>
            <p className="text-xs text-[#8E8E8E] font-normal leading-relaxed">
              Hardcoded policy guardrails enforce maximum 3 retries, zero outreach during quiet hours (9 PM - 9 AM IST), and strict adherence to customer opt-outs.
            </p>
            <div className="pt-2 text-[10px] font-mono text-[#00E65B]">
              Zero Hallucinations • RBI Compliant
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 bg-[#121212] border border-[#242424] hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-[1.02] transition cursor-pointer space-y-3">
            <div className="h-10 w-10 bg-[#181818] border border-[#242424] flex items-center justify-center text-white">
              <DollarSign className="h-5 w-5" />
            </div>
            <h3 className="text-base font-display font-bold text-white">
              4. Settlement Reconciliation
            </h3>
            <p className="text-xs text-[#8E8E8E] font-normal leading-relaxed">
              Every recovered transaction is cross-verified directly against Razorpay settlement ledgers using cryptographic idempotency. No vanity metrics.
            </p>
            <div className="pt-2 text-[10px] font-mono text-white">
              100% Ledger Verified • Audit Proof
            </div>
          </div>
        </div>
      </section>

      {/* 5. Comparison: ReviveAI vs Dumb Retries vs Manual Operations */}
      <section id="comparison" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#242424]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2">
            Competitive Benchmark
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Why Naive Cron Retries Fail vs ReviveAI
          </h2>
          <p className="text-xs sm:text-sm text-[#8E8E8E] mt-2 font-normal">
            A side-by-side comparison of recovery architecture across financial safety, customer fatigue, and real yield.
          </p>
        </div>

        <div className="overflow-x-auto border border-[#242424] bg-[#121212] shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#242424] bg-[#181818] text-[#8E8E8E] font-mono uppercase tracking-wider">
                <th className="p-4 sm:p-5">Capability / Requirement</th>
                <th className="p-4 sm:p-5 text-rose-400">Dumb Cron Retries</th>
                <th className="p-4 sm:p-5 text-amber-400">Manual Call Centers</th>
                <th className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">ReviveAI Controller</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424] text-[#EDEDED] font-normal">
              <tr className="hover:bg-[#161616] transition">
                <td className="p-4 sm:p-5 font-semibold text-white">Recovery Success Rate</td>
                <td className="p-4 sm:p-5 text-rose-300">18% – 25%</td>
                <td className="p-4 sm:p-5 text-amber-300">28% – 35%</td>
                <td className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">68% – 76% (Calibrated ML)</td>
              </tr>
              <tr className="hover:bg-[#161616] transition">
                <td className="p-4 sm:p-5 font-semibold text-white">Intervention Latency</td>
                <td className="p-4 sm:p-5 text-rose-300">Blind 1hr / 24hr cron</td>
                <td className="p-4 sm:p-5 text-amber-300">4 hours – 2 days later</td>
                <td className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">&lt; 120 seconds autonomous</td>
              </tr>
              <tr className="hover:bg-[#161616] transition">
                <td className="p-4 sm:p-5 font-semibold text-white">Customer Opt-Out Safeguard</td>
                <td className="p-4 sm:p-5 text-rose-300">❌ Ignored (Retries blast anyway)</td>
                <td className="p-4 sm:p-5 text-amber-300">⚠️ Manual spreadsheet tags</td>
                <td className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">✅ 100% Deterministic Hard Block</td>
              </tr>
              <tr className="hover:bg-[#161616] transition">
                <td className="p-4 sm:p-5 font-semibold text-white">RBI Quiet Hours Compliance</td>
                <td className="p-4 sm:p-5 text-rose-300">❌ Fires 24/7 indiscriminately</td>
                <td className="p-4 sm:p-5 text-amber-300">⚠️ Human scheduling errors</td>
                <td className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">✅ 9 PM – 9 AM IST Enforced in Code</td>
              </tr>
              <tr className="hover:bg-[#161616] transition">
                <td className="p-4 sm:p-5 font-semibold text-white">Double-Billing Prevention</td>
                <td className="p-4 sm:p-5 text-rose-300">❌ High risk on slow captures</td>
                <td className="p-4 sm:p-5 text-amber-300">⚠️ Accidental manual links</td>
                <td className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">✅ Cryptographic SHA-256 Idempotency</td>
              </tr>
              <tr className="hover:bg-[#161616] transition">
                <td className="p-4 sm:p-5 font-semibold text-white">Settlement Ledger Proof</td>
                <td className="p-4 sm:p-5 text-rose-300">❌ Vanity clicks / assumptions</td>
                <td className="p-4 sm:p-5 text-amber-300">❌ Manual CRM attribution</td>
                <td className="p-4 sm:p-5 text-[#00E65B] bg-[#00E65B]/5 font-bold">✅ Verified Bank UTR Settlement</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. End-to-End Pipeline Visualization */}
      <section id="pipeline" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#242424]">
        <div className="bg-[#121212] border border-[#242424] p-6 sm:p-10">
          <div className="max-w-3xl mb-8">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2">
              End-to-End Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              How ReviveAI Intercepts & Recovers Failed Payments
            </h2>
          </div>

          {/* 5-Step Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Intercept Failure',
                desc: 'Real-time webhook or GET /v1/payments direct pull captures acquirer error codes.'
              },
              {
                step: '02',
                title: 'ML Scoring',
                desc: 'XGBoost computes true recovery likelihood (0-100%) and Expected Recovery Value.'
              },
              {
                step: '03',
                title: 'Policy Guard',
                desc: 'Deterministic rules check opt-outs, retry caps, quiet hours, and high-value ceilings.'
              },
              {
                step: '04',
                title: 'Smart Execution',
                desc: 'Automated gateway retry, dynamic payment link, or human escalation routing.'
              },
              {
                step: '05',
                title: 'Reconcile Money',
                desc: 'Razorpay settlement confirmation verifies settled capital into merchant account.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#0A0A0A] border border-[#242424] hover:border-[#C5A059]/60 hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] hover:scale-[1.02] transition cursor-pointer space-y-2"
              >
                <div className="text-[10px] font-mono text-[#C5A059] font-bold">
                  STEP {item.step}
                </div>
                <div className="text-sm font-display font-bold text-white">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#8E8E8E] leading-relaxed font-normal">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Action Banner */}
          <div className="mt-8 pt-6 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#8E8E8E] font-mono">
              Ready to test real financial edge-cases in the sandbox?
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onSelectScenario(1)}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider bg-[#181818] hover:bg-[#222222] text-[#C5A059] border border-[#242424] hover:border-[#C5A059] hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Test Bank Timeout
              </button>
              <button
                type="button"
                onClick={() => onSelectScenario(4)}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider bg-[#181818] hover:bg-[#222222] text-rose-400 border border-[#242424] hover:border-rose-400 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Test ₹45,000 Ceiling
              </button>
              <button
                type="button"
                onClick={() => onEnterConsole('investigation')}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider bg-[#C5A059] hover:bg-[#D8B570] text-[#0A0A0A] font-bold hover:shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Explore AI Diagnostics
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (Accordion) */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[#242424]">
        <div className="text-center mb-12">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C5A059] mb-2">
            Clear Answers
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="divide-y divide-[#242424] border border-[#242424] bg-[#121212]">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="p-5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left flex items-center justify-between space-x-4 group cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white group-hover:text-[#C5A059] transition">
                    {faq.q}
                  </span>
                  <span className="text-[#8E8E8E] group-hover:text-white transition shrink-0">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs text-[#8E8E8E] leading-relaxed font-normal animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Bottom Hero Banner & Launch CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#242424]">
        <div className="bg-gradient-to-r from-[#121212] via-[#1A1A1A] to-[#121212] border border-[#242424] p-8 sm:p-12 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 text-[#C5A059] text-[10px] font-mono uppercase tracking-[0.3em]">
            <Zap className="h-3.5 w-3.5" />
            <span>Ready to turn payment failures into recovered revenue?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white max-w-2xl mx-auto tracking-tight">
            Experience the Enterprise Recovery Control Plane
          </h2>

          <p className="text-xs sm:text-sm text-[#8E8E8E] max-w-xl mx-auto font-normal">
            Switch between the public website and operational console with a single click. Inspect the live queue, AI investigations, and settlement proofs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onEnterConsole('overview')}
              className="px-8 py-3.5 bg-[#C5A059] hover:bg-[#D8B570] text-[#0A0A0A] font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer flex items-center space-x-2"
            >
              <span>Enter Live Console</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenDirectPull}
              className="px-6 py-3.5 bg-[#121212] hover:bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/40 hover:border-[#00D2FF] hover:shadow-[0_0_20px_rgba(0,210,255,0.25)] hover:scale-[1.02] active:scale-[0.98] font-mono text-xs uppercase tracking-[0.15em] transition cursor-pointer"
            >
              Test Direct Pull (GET /v1/payments)
            </button>
          </div>
        </div>
      </section>

      {/* 9. Global Website Footer */}
      <footer className="border-t border-[#242424] bg-[#080808] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-serif italic text-white">
                Revive<span className="text-[#C5A059]">AI</span>
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-[#121212] text-[#C5A059] border border-[#242424]">
                v1.0
              </span>
            </div>
            <p className="text-[#8E8E8E] leading-relaxed font-normal text-[11px]">
              Autonomous Razorpay Revenue Recovery Controller. Bounded by deterministic policy, powered by calibrated ML and Gemini AI.
            </p>
            <div className="text-[10px] font-mono text-[#00E65B]">
              ● All Systems Operational (Sandbox Simulator Active)
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059]">Platform</div>
            <ul className="space-y-1.5 text-[#8E8E8E] font-normal text-[11px]">
              <li>
                <button type="button" onClick={() => onEnterConsole('overview')} className="hover:text-white transition cursor-pointer">
                  Overview Dashboard
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onEnterConsole('queue')} className="hover:text-white transition cursor-pointer">
                  Live Recovery Queue
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onEnterConsole('investigation')} className="hover:text-white transition cursor-pointer">
                  Gemini AI Investigation
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onEnterConsole('human_review')} className="hover:text-white transition cursor-pointer">
                  Human Review Queue
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059]">Analytics & ML</div>
            <ul className="space-y-1.5 text-[#8E8E8E] font-normal text-[11px]">
              <li>
                <button type="button" onClick={() => onEnterConsole('analytics')} className="hover:text-white transition cursor-pointer">
                  Revenue Analytics
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onEnterConsole('model_performance')} className="hover:text-white transition cursor-pointer">
                  XGBoost ROC-AUC & Confusion Matrix
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onEnterConsole('experiments')} className="hover:text-white transition cursor-pointer">
                  A/B Experimentation Suite
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onEnterConsole('audit')} className="hover:text-white transition cursor-pointer">
                  Cryptographic Audit Trail
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059]">Compliance & Security</div>
            <p className="text-[#8E8E8E] leading-relaxed font-normal text-[11px]">
              Compliant with RBI Fair Practices Code for Digital Lending & Collections. 100% Opt-out enforcement. Idempotent payment links.
            </p>
            <div className="text-[10px] font-mono text-[#8E8E8E]/60 pt-2">
              © {new Date().getFullYear()} ReviveAI Technologies Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
