import React, { useState } from 'react';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronDown,
  Layers,
  HelpCircle,
  CreditCard,
  Cloud,
  LogIn,
  LogOut,
  ArrowDownToLine,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { SystemStatus } from '../types';
import { User } from 'firebase/auth';

interface HeaderProps {
  systemStatus: SystemStatus | null;
  currentUser: User | null;
  firebaseConnected: boolean;
  isWebsiteMode?: boolean;
  onToggleWebsiteMode?: (mode: 'website' | 'app') => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onRunBatchDemo: () => void;
  onSeedData: () => void;
  onResetData: () => void;
  onSelectScenario: (num: number) => void;
  onOpenArchitectureInfo: () => void;
  onOpenDirectPull: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  systemStatus,
  currentUser,
  firebaseConnected,
  isWebsiteMode = false,
  onToggleWebsiteMode,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
  onSignInWithGoogle,
  onSignOut,
  onRunBatchDemo,
  onResetData,
  onSelectScenario,
  onOpenArchitectureInfo,
  onOpenDirectPull,
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
    <header className="sticky top-0 z-30 bg-[#0F0F0F] border-b border-[#2A2A2A] text-[#E5E5E5] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[70px]">
          {/* Left: Mobile hamburger (in app mode) + Logo & Product Identity */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Mobile Hamburger toggle for console sidebar */}
            {!isWebsiteMode && onToggleMobileSidebar && (
              <button
                type="button"
                onClick={onToggleMobileSidebar}
                className="p-1.5 md:hidden text-[#E5E5E5]/70 hover:text-white bg-[#141414] border border-[#2A2A2A] transition"
                title="Toggle Navigation Menu"
              >
                {isMobileSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleWebsiteMode && onToggleWebsiteMode(isWebsiteMode ? 'app' : 'website')}
              className="flex items-center space-x-3 text-left group"
              title="Click to toggle Website / Console view"
            >
              <div className="h-9 w-9 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center relative overflow-hidden group-hover:border-[#C5A059]/60 transition shadow-inner">
                <div className="absolute inset-0 bg-[#C5A059] opacity-10 group-hover:opacity-25 transition" />
                <Zap className="h-4.5 w-4.5 text-[#C5A059] relative z-10" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl sm:text-[22px] font-serif italic tracking-tight text-white leading-none">
                    Revive<span className="text-[#C5A059]">AI</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.2em] px-1.5 py-0.5 bg-[#1A1A1A] text-[#C5A059] border border-[#2A2A2A] font-mono">
                    v1.0
                  </span>
                </div>
                <div className="hidden lg:flex items-center space-x-1.5 text-[10px] text-[#E5E5E5]/50 font-mono tracking-wide mt-0.5">
                  <span>Razorpay Revenue Recovery Controller</span>
                  <span className="text-[#2A2A2A]">•</span>
                  <span className="text-[#C5A059]/80 font-sans italic text-[10px]">Zero Unsolicited Actions</span>
                </div>
              </div>
            </button>

            {/* Mode Switcher: Website vs Console */}
            {onToggleWebsiteMode && (
              <div className="hidden sm:flex items-center bg-[#141414] border border-[#2A2A2A] p-0.5 ml-2 font-mono text-[10px] uppercase tracking-wider">
                <button
                  type="button"
                  id="viewmode-website-btn"
                  onClick={() => onToggleWebsiteMode('website')}
                  className={`flex items-center space-x-1 px-2.5 py-1 transition ${
                    isWebsiteMode
                      ? 'bg-[#C5A059] text-[#0F0F0F] font-bold shadow-sm'
                      : 'text-[#E5E5E5]/60 hover:text-white'
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  <span>Website</span>
                </button>
                <button
                  type="button"
                  id="viewmode-app-btn"
                  onClick={() => onToggleWebsiteMode('app')}
                  className={`flex items-center space-x-1 px-2.5 py-1 transition ${
                    !isWebsiteMode
                      ? 'bg-[#C5A059] text-[#0F0F0F] font-bold shadow-sm'
                      : 'text-[#E5E5E5]/60 hover:text-white'
                  }`}
                >
                  <Zap className="h-3 w-3" />
                  <span>Console</span>
                </button>
              </div>
            )}
          </div>

          {/* Center: System Telemetry Deck (Compact & Uncluttered) */}
          <div className="hidden xl:flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.12em]">
            {/* Gateway Mode */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] border border-[#2A2A2A] ${
                systemStatus?.demo_mode ? 'text-[#C5A059]' : 'text-[#00FF66]'
              }`}
              title={systemStatus?.demo_mode ? 'Running on Sandbox Simulator' : 'Connected to Live Gateway'}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${systemStatus?.demo_mode ? 'bg-[#C5A059] animate-pulse' : 'bg-[#00FF66]'}`} />
              <span>{systemStatus?.demo_mode ? 'Sandbox Simulator' : 'Razorpay Live'}</span>
            </div>

            {/* AI Agent Status */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] text-[#E5E5E5]/70 border border-[#2A2A2A]">
              <Sparkles className="h-3 w-3 text-[#C5A059]" />
              <span>{systemStatus?.ai_agent_status?.includes('Gemini') ? 'Gemini 3.8 Flash' : 'ML Engine'}</span>
            </div>

            {/* Policy Guard */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] text-[#00FF66] border border-[#2A2A2A]">
              <ShieldAlert className="h-3 w-3 text-[#00FF66]" />
              <span>Policy Guard</span>
            </div>

            {/* Cloud Firestore */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 bg-[#141414] border border-[#2A2A2A] ${
                firebaseConnected ? 'text-[#00FF66]' : 'text-[#C5A059]'
              }`}
            >
              <Cloud className="h-3 w-3" />
              <span>{firebaseConnected ? 'Firestore Synced' : 'Connecting'}</span>
            </div>
          </div>

          {/* Right: Operational Action Toolbar */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Mobile Mode Switcher Toggle */}
            {onToggleWebsiteMode && (
              <button
                type="button"
                onClick={() => onToggleWebsiteMode(isWebsiteMode ? 'app' : 'website')}
                className="sm:hidden px-2 py-1 text-[10px] font-mono bg-[#141414] border border-[#2A2A2A] text-[#C5A059]"
              >
                {isWebsiteMode ? '⚡ Console' : '🌐 Site'}
              </button>
            )}

            {/* Direct Pull Request from Razorpay */}
            <button
              type="button"
              id="razorpay-direct-pull-btn"
              onClick={onOpenDirectPull}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-mono bg-[#141414] hover:bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/40 hover:border-[#00D2FF] hover:shadow-[0_0_15px_rgba(0,210,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              title="Execute authenticated Direct Pull Request against Razorpay Payments API"
            >
              <ArrowDownToLine className="h-3.5 w-3.5 text-[#00D2FF]" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider font-semibold">Direct Pull</span>
              <span className="md:hidden text-[11px] font-bold">Pull</span>
            </button>

            {/* Test Scenarios Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="scenario-menu-btn"
                onClick={() => setScenarioMenuOpen(!scenarioMenuOpen)}
                className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] uppercase tracking-[0.12em] font-medium bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] hover:text-white border border-[#2A2A2A] hover:border-[#C5A059] hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                title="Inject predefined financial test scenarios"
              >
                <Layers className="h-3.5 w-3.5 text-[#C5A059]" />
                <span className="hidden lg:inline">Scenarios</span>
                <ChevronDown className="h-3 w-3 text-[#E5E5E5]/50" />
              </button>

              {scenarioMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-[#1A1A1A] hover:text-[#C5A059] transition flex flex-col border-b border-[#1A1A1A]/40 cursor-pointer"
                    >
                      <span className="font-medium text-[#E5E5E5]">{s.label}</span>
                      <span className="text-[#E5E5E5]/40 text-[10px] tracking-wide mt-0.5">{s.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hero Action: Run 100-Case Demo Batch */}
            <button
              type="button"
              id="run-demo-batch-btn"
              onClick={onRunBatchDemo}
              className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-[11px] uppercase tracking-[0.15em] font-semibold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] hover:shadow-[0_0_20px_rgba(197,160,89,0.35)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
              title="Simulate 100 failed payments through ML & Policy pipeline"
            >
              <Play className="h-3.5 w-3.5 fill-[#0F0F0F]" />
              <span className="hidden sm:inline">100-Case Demo</span>
              <span className="sm:hidden">100</span>
            </button>

            {/* Utility: Architecture Info */}
            <button
              type="button"
              id="architecture-info-btn"
              onClick={onOpenArchitectureInfo}
              className="p-1.5 sm:p-2 text-[#E5E5E5]/60 hover:text-white bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C5A059]/60 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Architecture & Governance Principles"
            >
              <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {/* Utility: Reset / Seed Data */}
            <button
              type="button"
              id="reset-demo-btn"
              onClick={handleReset}
              disabled={isResetting}
              className="p-1.5 sm:p-2 text-[#E5E5E5]/60 hover:text-white bg-[#141414] hover:bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#C5A059]/60 hover:scale-105 active:scale-95 transition cursor-pointer"
              title="Reset to fresh synthetic dataset"
            >
              <RotateCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isResetting ? 'animate-spin text-[#C5A059]' : ''}`} />
            </button>

            {/* Firebase Auth Profile */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  id="user-profile-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 text-xs bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] hover:border-[#C5A059] transition cursor-pointer"
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
                  <span className="max-w-[80px] truncate text-[11px] font-mono hidden md:inline">
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
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-[#1A1A1A] flex items-center space-x-2 transition cursor-pointer"
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
                className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:py-2 text-[11px] uppercase tracking-[0.12em] font-medium bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] hover:text-white border border-[#2A2A2A] hover:border-[#C5A059] hover:shadow-[0_0_15px_rgba(197,160,89,0.15)] hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                title="Authenticate with Google via Firebase Auth"
              >
                <LogIn className="h-3.5 w-3.5 text-[#C5A059]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

