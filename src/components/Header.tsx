import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
  Activity,
  Layers,
  HelpCircle,
  CreditCard,
  Cloud,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { SystemStatus } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  currentUser: User | null;
  firebaseConnected: boolean;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onRunBatchDemo: () => void;
  onSeedData: () => void;
  onResetData: () => void;
  onSelectScenario: (num: number) => void;
  onOpenArchitectureInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  currentUser,
  firebaseConnected,
  onSignInWithGoogle,
  onSignOut,
  onRunBatchDemo,
  onSeedData,
  onResetData,
  onSelectScenario,
  onOpenArchitectureInfo,
}) => {
  const [scenarioMenuOpen, setScenarioMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    await onResetData();
    setTimeout(() => setIsResetting(false), 500);
  };

  const scenarios = [
    { num: 1, label: 'Scenario 1: Temporary Bank Clearing Failure', desc: 'Transient timeout -> Safe retry / link' },
    { num: 2, label: 'Scenario 2: Customer Explicit Opt-Out', desc: 'Privacy safeguard -> STOP outreach' },
    { num: 3, label: 'Scenario 3: Three Failed Prior Retries', desc: 'Retry fatigue safeguard -> STOP retry' },
    { num: 4, label: 'Scenario 4: High-Value Payment (₹45,000)', desc: 'Ceiling rule -> HUMAN REVIEW required' },
    { num: 5, label: 'Scenario 5: Chargeback Dispute Detected', desc: 'Fraud check -> Immediate Risk ESCALATION' },
    { num: 6, label: 'Scenario 6: Payment Already Succeeded', desc: 'Double billing block -> STOP' },
    { num: 7, label: 'Scenario 7: High Probability Instant Recovery', desc: '94% score -> Automated 1-click recovery' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#0F0F0F] border-b border-[#2A2A2A] text-[#E5E5E5] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Product Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#C5A059] opacity-10 group-hover:opacity-20 transition" />
              <Zap className="h-5 w-5 text-[#C5A059] relative z-10" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-[22px] font-serif italic tracking-tighter leading-none text-white">
                  Revive<span className="text-[#C5A059]">AI</span>
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 bg-[#1A1A1A] text-[#C5A059] border border-[#2A2A2A] font-mono">
                  Controller v1.0
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#E5E5E5]/40 font-medium">
                  Financial Recovery Lab
                </span>
                <span className="text-[#2A2A2A]">•</span>
                <span className="text-[10px] text-[#E5E5E5]/60 font-serif italic hidden md:inline">
                  Find revenue slipping away. Recover it intelligently. Prove the money.
                </span>
              </div>
            </div>
          </div>

          {/* Operational Status Badges */}
          <div className="hidden lg:flex items-center space-x-2.5 text-[10px] uppercase tracking-[0.15em] font-mono">
            {/* Mode Badge */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] border border-[#2A2A2A] ${
                systemStatus?.demo_mode
                  ? 'text-[#C5A059]'
                  : 'text-[#00FF66]'
              }`}
              title={systemStatus?.demo_mode ? 'Running with Realistic Synthetic Simulator' : 'Connected to Razorpay Test Mode'}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${systemStatus?.demo_mode ? 'bg-[#C5A059] animate-pulse' : 'bg-[#00FF66]'}`} />
              <span>{systemStatus?.demo_mode ? 'Demo Simulator' : 'Razorpay Live'}</span>
            </div>

            {/* AI Agent Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] text-[#E5E5E5]/70 border border-[#2A2A2A]">
              <Sparkles className="h-3 w-3 text-[#C5A059]" />
              <span>
                {systemStatus?.ai_agent_status?.includes('Gemini') ? 'Gemini 3.8 Flash' : 'Deterministic Fallback'}
              </span>
            </div>

            {/* Policy Guardrail Badge */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] text-[#00FF66] border border-[#2A2A2A]">
              <ShieldAlert className="h-3 w-3 text-[#00FF66]" />
              <span>Policy Guard: Active</span>
            </div>

            {/* Firestore Status */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] border border-[#2A2A2A] ${
                firebaseConnected ? 'text-[#00FF66]' : 'text-[#C5A059]'
              }`}
              title="Firebase Firestore Cloud Persistence"
            >
              <Cloud className="h-3 w-3" />
              <span>Firestore: {firebaseConnected ? 'Synced' : 'Connecting'}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-2">
            {/* Predefined Scenarios Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="scenario-menu-btn"
                onClick={() => setScenarioMenuOpen(!scenarioMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-medium bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] hover:border-[#C5A059]/40 transition"
              >
                <Layers className="h-3.5 w-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">Scenario</span>
                <ChevronDown className="h-3 w-3 text-[#E5E5E5]/50" />
              </button>

              {scenarioMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-[#2A2A2A] text-[9px] font-semibold text-[#C5A059] uppercase tracking-[0.25em]">
                    Predefined Test Scenarios
                  </div>
                  {scenarios.map((s) => (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => {
                        onSelectScenario(s.num);
                        setScenarioMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-[#1A1A1A] transition flex flex-col border-b border-[#1A1A1A]/40"
                    >
                      <span className="font-medium text-[#E5E5E5]">{s.label}</span>
                      <span className="text-[#E5E5E5]/40 text-[10px] tracking-wide mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Architecture Explainer Button */}
            <button
              type="button"
              id="architecture-info-btn"
              onClick={onOpenArchitectureInfo}
              className="p-2 text-[#E5E5E5]/60 hover:text-white bg-[#141414] border border-[#2A2A2A] hover:border-[#C5A059]/40 transition"
              title="Architecture & Governance Principle"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Reset / Seed Button */}
            <button
              type="button"
              id="reset-demo-btn"
              onClick={handleReset}
              disabled={isResetting}
              className="p-2 text-[#E5E5E5]/60 hover:text-white bg-[#141414] border border-[#2A2A2A] hover:border-[#C5A059]/40 transition"
              title="Reset to fresh synthetic dataset"
            >
              <RotateCcw className={`h-4 w-4 ${isResetting ? 'animate-spin text-[#C5A059]' : ''}`} />
            </button>

            {/* Firebase Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  id="user-profile-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 text-xs bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] transition"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="h-5 w-5 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-[#C5A059] text-[#0F0F0F] flex items-center justify-center text-[10px] font-bold">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[90px] truncate text-[11px] font-mono hidden md:inline">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-[#E5E5E5]/50" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl py-2 z-50">
                    <div className="px-3 py-2 border-b border-[#2A2A2A]">
                      <div className="text-xs font-semibold text-white truncate">{currentUser.displayName || 'Operator'}</div>
                      <div className="text-[10px] font-mono text-[#E5E5E5]/50 truncate">{currentUser.email}</div>
                      <div className="text-[9px] uppercase tracking-wider text-[#00FF66] mt-1 font-mono">Firebase Verified</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-[#1A1A1A] flex items-center space-x-2 transition"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="google-signin-btn"
                onClick={onSignInWithGoogle}
                className="flex items-center space-x-1.5 px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-medium bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] hover:border-[#C5A059]/40 transition"
                title="Authenticate with Google via Firebase Auth"
              >
                <LogIn className="h-3.5 w-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* HERO Action: Run 100-Case Demo Batch */}
            <button
              type="button"
              id="run-demo-batch-btn"
              onClick={onRunBatchDemo}
              className="flex items-center space-x-2 px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] shadow-lg transition"
            >
              <Play className="h-3.5 w-3.5 fill-[#0F0F0F]" />
              <span>Run 100-Case Demo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
