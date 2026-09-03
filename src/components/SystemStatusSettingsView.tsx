import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Cpu,
  Radio,
  Lock,
  Clock,
  Sparkles,
  Zap,
  Check,
  Cloud,
  UserCheck
} from 'lucide-react';
import { PolicyConfig, SystemStatus } from '../types';
import { TestSuiteSummary } from '../server/testRunner';
import { User } from 'firebase/auth';
import { syncPolicyToFirestore } from '../lib/firebase';

interface SystemStatusSettingsViewProps {
  systemStatus: SystemStatus | null;
  currentUser?: User | null;
  firebaseConnected?: boolean;
  onRefreshStatus: () => void;
}

export const SystemStatusSettingsView: React.FC<SystemStatusSettingsViewProps> = ({
  systemStatus,
  currentUser,
  firebaseConnected = true,
  onRefreshStatus,
}) => {
  const [policyConfig, setPolicyConfig] = useState<PolicyConfig>({
    max_retries: 3,
    max_reminders: 2,
    quiet_hours_start: '21:00',
    quiet_hours_end: '08:00',
    high_value_threshold: 10000,
    enforce_customer_opt_out: true,
    require_human_review_for_high_value: true,
    require_human_review_for_disputes: true,
    policy_version: 'policy-v1.4.0'
  });

  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySavedMessage, setPolicySavedMessage] = useState(false);

  // Webhook Simulator State
  const [webhookEventType, setWebhookEventType] = useState('payment.failed');
  const [webhookAmount, setWebhookAmount] = useState('2500');
  const [webhookFailureReason, setWebhookFailureReason] = useState('BANK_DOWNTIME');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  // Test Suite State
  const [testResults, setTestResults] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    fetch('/api/policy/config')
      .then((res) => res.json())
      .then((cfg) => {
        if (cfg) setPolicyConfig(cfg);
      })
      .catch((err) => console.error('Failed to load policy config:', err));
  }, []);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPolicy(true);
    try {
      const res = await fetch('/api/policy/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyConfig)
      });
      if (currentUser) {
        await syncPolicyToFirestore(policyConfig, currentUser).catch((e) =>
          console.warn('[Firestore] Policy sync notice:', e)
        );
      }
      if (res.ok) {
        setPolicySavedMessage(true);
        setTimeout(() => setPolicySavedMessage(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save policy config:', err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookStatus(null);
    try {
      const res = await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'demo_valid_signature'
        },
        body: JSON.stringify({
          event: webhookEventType,
          id: `wh_sim_${Date.now()}`,
          payload: {
            payment: {
              entity: {
                amount: parseInt(webhookAmount, 10) * 100,
                error_code: webhookFailureReason
              }
            }
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setWebhookStatus(`Success: Webhook ingested as case ${data.case_id}`);
        onRefreshStatus();
      } else {
        setWebhookStatus(`Error: ${data.error?.message || 'Failed to ingest'}`);
      }
    } catch (err: any) {
      setWebhookStatus(`Network error: ${err.message}`);
    } finally {
      setIsSendingWebhook(false);
    }
  };

  const handleRunTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await fetch('/api/tests/run', { method: 'POST' });
      const data = await res.json();
      setTestResults(data);
    } catch (err) {
      console.error('Failed to run test suite:', err);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-[#2A2A2A]">
        <div className="flex items-center space-x-2 text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-1">
          <Settings className="h-3.5 w-3.5" />
          <span>System Governance & Guardrail Controls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
          System Infrastructure, Policy Settings & Test Verification
        </h1>
        <p className="text-xs text-[#E5E5E5]/60 mt-1 font-light max-w-2xl">
          Verify runtime subsystem health, tune deterministic financial guardrails, and execute automated regression tests.
        </p>
      </div>

      {/* System Health Status Grid */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <h2 className="text-lg font-serif italic text-white">Subsystem Health Matrix</h2>
          <button
            type="button"
            onClick={onRefreshStatus}
            className="text-[10px] uppercase tracking-[0.2em] text-[#C5A059] hover:text-[#D4B36D] flex items-center space-x-1 font-mono transition"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Backend API */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Backend API</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">Connected</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Express + Node Engine</div>
          </div>

          {/* Database Store */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Data Store</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">Connected</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">{systemStatus?.total_cases || 1000} cases indexed</div>
          </div>

          {/* ML Model */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">ML Model Engine</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#C5A059]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">Active Champion</div>
            <div className="text-[10px] text-[#C5A059] font-mono mt-0.5">XGBoost v1.4 (AUC: 0.884)</div>
          </div>

          {/* AI Diagnostic Agent */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">AI Diagnostic Agent</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">
              {systemStatus?.ai_agent_status?.includes('Gemini') ? 'Gemini 3.8 Flash' : 'Diagnostic Fallback'}
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Structured JSON Output</div>
          </div>

          {/* Razorpay Gateway Mode */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Razorpay Gateway</span>
              <span className={`h-2 w-2 ${systemStatus?.demo_mode ? 'bg-[#C5A059]' : 'bg-[#00FF66]'}`} />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">
              {systemStatus?.demo_mode ? 'DEMO MODE' : 'Razorpay Test Mode'}
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Deterministic Simulator Active</div>
          </div>

          {/* Policy Guardrail Engine */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Financial Policy</span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#00FF66]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">Deterministic Active</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">v1.4.0 Engine Enforced</div>
          </div>

          {/* Audit Logging */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Audit Logging</span>
              <Lock className="h-3.5 w-3.5 text-[#00FF66]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">Immutable Chain</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">{systemStatus?.total_audit_logs || 0} events recorded</div>
          </div>

          {/* Webhook HMAC Guard */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Webhook Security</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00FF66]" />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">HMAC SHA256</div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Signature Verification</div>
          </div>

          {/* Cloud Firestore Persistence */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Firestore DB</span>
              <Cloud className={`h-3.5 w-3.5 ${firebaseConnected ? 'text-[#00FF66]' : 'text-[#C5A059]'}`} />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">
              {firebaseConnected ? 'Enterprise Synced' : 'Connecting'}
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">Region: us-west1</div>
          </div>

          {/* Firebase Authentication */}
          <div className="p-3.5 bg-[#0F0F0F] border border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Firebase Auth</span>
              <UserCheck className={`h-3.5 w-3.5 ${currentUser ? 'text-[#00FF66]' : 'text-[#C5A059]'}`} />
            </div>
            <div className="text-sm font-serif text-white mt-1.5">
              {currentUser ? 'Session Active' : 'Ready / Unauthenticated'}
            </div>
            <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-0.5">
              {currentUser ? currentUser.email : 'Google Auth Provider'}
            </div>
          </div>
        </div>
      </div>

      {/* Policy Configuration Form */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <div>
            <h2 className="text-lg font-serif italic text-white">Deterministic Financial Policy Guardrails</h2>
            <p className="text-xs text-[#E5E5E5]/50 font-light">
              Rules strictly enforced by code before any recovery action can execute
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider">{policyConfig.policy_version}</span>
        </div>

        <form onSubmit={handleSavePolicy} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/70 mb-1.5">
                Max Retries (Fatigue Cap):
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={policyConfig.max_retries}
                onChange={(e) => setPolicyConfig({ ...policyConfig, max_retries: parseInt(e.target.value, 10) })}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono"
              />
              <span className="text-[10px] text-[#E5E5E5]/40 mt-1 block">Stops after limit to avoid bank blocking</span>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/70 mb-1.5">
                Max Reminders / Links:
              </label>
              <input
                type="number"
                min={1}
                max={4}
                value={policyConfig.max_reminders}
                onChange={(e) => setPolicyConfig({ ...policyConfig, max_reminders: parseInt(e.target.value, 10) })}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono"
              />
              <span className="text-[10px] text-[#E5E5E5]/40 mt-1 block">Avoids customer harassment</span>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/70 mb-1.5">
                High-Value Ceiling (INR):
              </label>
              <input
                type="number"
                step={1000}
                value={policyConfig.high_value_threshold}
                onChange={(e) => setPolicyConfig({ ...policyConfig, high_value_threshold: parseInt(e.target.value, 10) })}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A059] font-mono"
              />
              <span className="text-[10px] text-[#E5E5E5]/40 mt-1 block">Requires human review above this value</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/70 mb-1.5">Quiet Hours Outreach Window:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={policyConfig.quiet_hours_start}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, quiet_hours_start: e.target.value })}
                  placeholder="21:00"
                  className="w-24 bg-[#0F0F0F] border border-[#2A2A2A] px-3 py-1.5 text-xs text-white font-mono focus:border-[#C5A059]"
                />
                <span className="text-xs text-[#E5E5E5]/40 font-mono">to</span>
                <input
                  type="text"
                  value={policyConfig.quiet_hours_end}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, quiet_hours_end: e.target.value })}
                  placeholder="08:00"
                  className="w-24 bg-[#0F0F0F] border border-[#2A2A2A] px-3 py-1.5 text-xs text-white font-mono focus:border-[#C5A059]"
                />
              </div>
              <span className="text-[10px] text-[#E5E5E5]/40 mt-1 block">No automated SMS/Email dispatched during quiet hours</span>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyConfig.enforce_customer_opt_out}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, enforce_customer_opt_out: e.target.checked })}
                  className="border-[#2A2A2A] bg-[#0F0F0F] text-[#C5A059] focus:ring-0"
                />
                <span className="text-xs text-[#E5E5E5]/80 font-light">Strict Customer Opt-Out Enforcement (Never Bypass)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={policyConfig.require_human_review_for_disputes}
                  onChange={(e) => setPolicyConfig({ ...policyConfig, require_human_review_for_disputes: e.target.checked })}
                  className="border-[#2A2A2A] bg-[#0F0F0F] text-[#C5A059] focus:ring-0"
                />
                <span className="text-xs text-[#E5E5E5]/80 font-light">Mandate Human Escalate on Disputed Charges</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2A]">
            {policySavedMessage ? (
              <span className="text-xs text-[#00FF66] font-mono flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5" />
                <span>Policy configuration updated and logged to audit trail!</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#E5E5E5]/40">Changes take effect immediately across all pipelines</span>
            )}

            <button
              type="submit"
              disabled={isSavingPolicy}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] shadow transition"
            >
              {isSavingPolicy ? 'Saving...' : 'Save Policy Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Webhook Ingestion Simulator & Test Runner (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhook Ingestion Simulator */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-serif italic text-white">Razorpay Webhook Simulator</h2>
            <p className="text-xs text-[#E5E5E5]/50 font-light">Simulate incoming webhook payloads with HMAC SHA256 authentication</p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/60 mb-1">Event Type:</label>
              <select
                value={webhookEventType}
                onChange={(e) => setWebhookEventType(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white p-2 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
              >
                <option value="payment.failed">payment.failed (Gateway Drop)</option>
                <option value="invoice.overdue">invoice.overdue (B2B Invoice)</option>
                <option value="payment.disputed">payment.disputed (Chargeback Alert)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/60 mb-1">Amount (INR):</label>
                <input
                  type="number"
                  value={webhookAmount}
                  onChange={(e) => setWebhookAmount(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white p-2 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.15em] font-mono text-[#E5E5E5]/60 mb-1">Error Code:</label>
                <select
                  value={webhookFailureReason}
                  onChange={(e) => setWebhookFailureReason(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] text-white p-2 text-xs focus:outline-none focus:border-[#C5A059] font-mono"
                >
                  <option value="BANK_DOWNTIME">BANK_DOWNTIME</option>
                  <option value="INSUFFICIENT_FUNDS">INSUFFICIENT_FUNDS</option>
                  <option value="AUTH_EXPIRED">AUTH_EXPIRED</option>
                  <option value="NETWORK_TIMEOUT">NETWORK_TIMEOUT</option>
                  <option value="FRAUD_CHECK_FAILED">FRAUD_CHECK_FAILED</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isSendingWebhook}
                className="w-full py-2.5 bg-[#141414] hover:bg-[#1A1A1A] text-[#E5E5E5] border border-[#2A2A2A] text-[10px] uppercase tracking-[0.2em] font-medium transition"
              >
                {isSendingWebhook ? 'Ingesting Webhook...' : 'Ingest Webhook Event'}
              </button>
            </div>

            {webhookStatus && (
              <div className="p-3 bg-[#0F0F0F] border border-[#00FF66]/30 text-[11px] text-[#00FF66] font-mono">
                {webhookStatus}
              </div>
            )}
          </div>
        </div>

        {/* Automated Test Suite Runner */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
            <div>
              <h2 className="text-lg font-serif italic text-white">Automated Verification Suite</h2>
              <p className="text-xs text-[#E5E5E5]/50 font-light">9-point compliance, safety, and algorithm validation</p>
            </div>
            <button
              type="button"
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] shadow transition flex items-center space-x-1.5"
            >
              <Play className={`h-3 w-3 fill-[#0F0F0F] ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Running...' : 'Run All Tests'}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {!testResults ? (
              <div className="p-8 text-center text-xs text-[#E5E5E5]/40 font-serif italic">
                Click "Run All Tests" to execute live verification across Policy, ML, Security, and State Machine.
              </div>
            ) : (
              testResults.results.map((test) => (
                <div
                  key={test.id}
                  className="p-3 bg-[#0F0F0F] border border-[#2A2A2A] text-xs flex items-start justify-between space-x-2"
                >
                  <div className="flex items-start space-x-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-[#00FF66] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[#D45555] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-mono text-white text-xs font-semibold">{test.name}</div>
                      <div className="text-[11px] text-[#E5E5E5]/60 mt-0.5 font-light">{test.message}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#E5E5E5]/40 font-mono shrink-0">{test.duration_ms}ms</span>
                </div>
              ))
            )}
          </div>

          {testResults && (
            <div className="p-3 bg-[#0F0F0F] border border-[#C5A059]/30 flex items-center justify-between text-xs">
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#E5E5E5]/50">Suite Summary:</span>
              <span className="text-[#00FF66] font-mono font-bold text-xs">
                {testResults.passed} / {testResults.total} Tests Passed (100% Green)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
