import React, { useState } from 'react';
import {
  X,
  ArrowDownToLine,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  Zap,
  Activity,
  Filter
} from 'lucide-react';
import { RecoveryCase } from '../types';

interface RazorpayDirectPullModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPullComplete: (newCases: RecoveryCase[], summary: any) => void;
  onSelectCase?: (c: RecoveryCase) => void;
  isDemoMode?: boolean;
}

export const RazorpayDirectPullModal: React.FC<RazorpayDirectPullModalProps> = ({
  isOpen,
  onClose,
  onPullComplete,
  onSelectCase,
  isDemoMode = true,
}) => {
  const [count, setCount] = useState<number>(25);
  const [statusFilter, setStatusFilter] = useState<string>('failed');
  const [timeWindow, setTimeWindow] = useState<'1h' | '24h' | '7d'>('24h');
  const [autoTriage, setAutoTriage] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'pull' | 'history'>('pull');

  // Result state
  const [pullResult, setPullResult] = useState<{
    pull_record: any;
    pulled_cases: RecoveryCase[];
  } | null>(null);

  // History state
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExecutePull = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/razorpay/direct-pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count,
          status: statusFilter,
          auto_triage: autoTriage,
          time_window: timeWindow
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPullResult(data);
        onPullComplete(data.pulled_cases || [], data.pull_record?.summary);
      } else {
        alert(data.error?.message || 'Failed to execute Razorpay direct pull.');
      }
    } catch (err: any) {
      alert(`Network error during Razorpay pull: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistory = async () => {
    setActiveTab('history');
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/razorpay/direct-pull/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Failed to load pull history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#0F0F0F] border border-[#2A2A2A] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden text-[#E5E5E5]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#00D2FF]">
              <ArrowDownToLine className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-serif italic text-white font-medium">
                  Razorpay Direct Pull Request
                </h2>
                <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-[#1A1A1A] text-[#00D2FF] border border-[#2A2A2A] font-mono">
                  GET /v1/payments
                </span>
                <span className={`text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 font-mono ${
                  isDemoMode ? 'bg-[#1F1B12] text-[#C5A059] border border-[#C5A059]/30' : 'bg-[#0F291E] text-[#00FF66] border border-[#00FF66]/30'
                }`}>
                  {isDemoMode ? 'Sandbox Simulator' : 'Live Gateway API'}
                </span>
              </div>
              <p className="text-xs text-[#E5E5E5]/60 mt-0.5">
                Fetch and reconcile failed transactions directly from Razorpay payment ledger into ReviveAI.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Switcher */}
            <div className="flex bg-[#1A1A1A] border border-[#2A2A2A] p-0.5 text-[10px] font-mono uppercase">
              <button
                type="button"
                onClick={() => setActiveTab('pull')}
                className={`px-3 py-1 transition ${
                  activeTab === 'pull' ? 'bg-[#0F0F0F] text-white font-semibold' : 'text-[#E5E5E5]/60 hover:text-white'
                }`}
              >
                Pull Request
              </button>
              <button
                type="button"
                onClick={handleLoadHistory}
                className={`px-3 py-1 transition ${
                  activeTab === 'history' ? 'bg-[#0F0F0F] text-white font-semibold' : 'text-[#E5E5E5]/60 hover:text-white'
                }`}
              >
                History ({history.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#E5E5E5]/60 hover:text-white hover:bg-[#1F1F1F] transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'pull' ? (
            <>
              {/* Configuration Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Batch Count */}
                <div className="p-3.5 bg-[#141414] border border-[#2A2A2A]">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/60 font-mono mb-2">
                    Batch Count to Pull
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 25, 50, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCount(num)}
                        className={`py-1.5 text-center font-mono text-xs border transition ${
                          count === num
                            ? 'bg-[#C5A059] text-[#0F0F0F] font-bold border-[#C5A059]'
                            : 'bg-[#1A1A1A] text-[#E5E5E5] border-[#2A2A2A] hover:border-[#E5E5E5]/40'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="p-3.5 bg-[#141414] border border-[#2A2A2A]">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/60 font-mono mb-2">
                    Razorpay Payment Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-2.5 py-1.5 text-xs font-mono focus:border-[#00D2FF] outline-none"
                  >
                    <option value="failed">failed (Failed Transactions)</option>
                    <option value="all">all (Full Ledger Scan)</option>
                    <option value="authorized">authorized (Uncaptured Timeouts)</option>
                  </select>
                </div>

                {/* Time Window */}
                <div className="p-3.5 bg-[#141414] border border-[#2A2A2A]">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/60 font-mono mb-2">
                    Time Window Filter
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: '1h', label: '1 Hour' },
                      { id: '24h', label: '24 Hours' },
                      { id: '7d', label: '7 Days' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTimeWindow(t.id as any)}
                        className={`py-1.5 text-center font-mono text-xs border transition ${
                          timeWindow === t.id
                            ? 'bg-[#00D2FF] text-[#0F0F0F] font-bold border-[#00D2FF]'
                            : 'bg-[#1A1A1A] text-[#E5E5E5] border-[#2A2A2A] hover:border-[#E5E5E5]/40'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live HTTP Direct Pull Request Blueprint */}
              <div className="bg-[#141414] border border-[#2A2A2A] p-4 font-mono text-[11px] relative overflow-hidden">
                <div className="flex items-center justify-between text-[#E5E5E5]/50 border-b border-[#2A2A2A] pb-2 mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#00FF66] font-bold">GET</span>
                    <span className="text-white">
                      https://api.razorpay.com/v1/payments?count={count}&status={statusFilter}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#00D2FF]">HTTP/1.1 Basic Auth</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-[#E5E5E5]/60">
                  <div>
                    <span className="text-[#E5E5E5]/40">Authorization:</span> Basic {isDemoMode ? 'rzp_test_simulator••••' : 'rzp_live••••••••'}
                  </div>
                  <div>
                    <span className="text-[#E5E5E5]/40">Target Pipeline:</span> ReviveAI Autonomous Ingestion Engine
                  </div>
                </div>

                {/* Auto Triage Option */}
                <div className="mt-3 pt-3 border-t border-[#2A2A2A] flex items-center justify-between">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoTriage}
                      onChange={(e) => setAutoTriage(e.target.checked)}
                      className="rounded-none bg-[#1A1A1A] border-[#2A2A2A] text-[#C5A059] focus:ring-0"
                    />
                    <span className="text-xs text-[#E5E5E5]">
                      Auto-Triage with ML Recovery Model on Pull (Score probability & assign policy action)
                    </span>
                  </label>

                  <button
                    type="button"
                    id="execute-razorpay-direct-pull-btn"
                    onClick={handleExecutePull}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-[#00D2FF] hover:bg-[#33DCFF] text-[#0F0F0F] font-bold text-xs uppercase tracking-[0.15em] transition shadow-lg disabled:opacity-50"
                  >
                    <ArrowDownToLine className={`h-4 w-4 ${isLoading ? 'animate-bounce' : ''}`} />
                    <span>{isLoading ? 'Executing Pull...' : `Pull ${count} Transactions`}</span>
                  </button>
                </div>
              </div>

              {/* Pull Results Section */}
              {pullResult && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#141414] border border-[#2A2A2A] p-4 font-mono">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#E5E5E5]/50">Status</div>
                      <div className="text-sm font-bold text-[#00FF66] flex items-center space-x-1 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>200 OK ({pullResult.pull_record?.request_metadata?.latency_ms}ms)</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#E5E5E5]/50">Failed Intercepted</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {pullResult.pull_record?.summary?.failed_intercepted} payments
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#E5E5E5]/50">Revenue At Risk</div>
                      <div className="text-sm font-bold text-[#C5A059] mt-0.5">
                        ₹{(pullResult.pull_record?.summary?.total_revenue_at_risk || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#E5E5E5]/50">Newly Ingested</div>
                      <div className="text-sm font-bold text-[#00D2FF] mt-0.5">
                        {pullResult.pull_record?.summary?.newly_ingested} cases triaged
                      </div>
                    </div>
                  </div>

                  {/* Pulled Cases Table */}
                  <div className="border border-[#2A2A2A] overflow-hidden bg-[#141414]">
                    <div className="px-4 py-2.5 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059]">
                        Intercepted Transactions from Razorpay ({pullResult.pulled_cases.length})
                      </span>
                      <span className="text-[10px] text-[#E5E5E5]/50 font-mono">
                        Saved to in-memory store & Firestore sync ready
                      </span>
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-[#2A2A2A]">
                      {pullResult.pulled_cases.map((c) => (
                        <div
                          key={c.id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-[#1A1A1A] transition text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-white font-semibold">{c.id}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#2A2A2A] text-[#E5E5E5]/80">
                                {c.payment_method}
                              </span>
                              <span className="text-[10px] font-mono text-rose-400">
                                {c.failure_reason}
                              </span>
                            </div>
                            <div className="text-[#E5E5E5]/60 text-[11px]">
                              {c.customer.name} ({c.customer.email})
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="font-serif text-sm font-medium text-white">
                                ₹{c.amount.toLocaleString('en-IN')}
                              </div>
                              <div className="text-[10px] font-mono text-[#00FF66]">
                                {(c.recovery_probability * 100).toFixed(0)}% recovery prob
                              </div>
                            </div>

                            {onSelectCase && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectCase(c);
                                  onClose();
                                }}
                                className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#1A1A1A] hover:bg-[#2A2A2A] text-[#C5A059] border border-[#2A2A2A] transition flex items-center space-x-1"
                              >
                                <span>Inspect</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Pull History Tab */
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="py-12 text-center text-[#E5E5E5]/50 font-mono text-xs">
                  Loading direct pull ledger records...
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-[#E5E5E5]/50 font-mono text-xs">
                  No direct pull requests executed yet in this session.
                </div>
              ) : (
                <div className="divide-y divide-[#2A2A2A] border border-[#2A2A2A] bg-[#141414]">
                  {history.map((rec) => (
                    <div key={rec.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 font-mono">
                          <span className="text-[#00D2FF] font-bold">PULL RECORD</span>
                          <span className="text-white">{rec.id}</span>
                          <span className="text-[#E5E5E5]/40">•</span>
                          <span className="text-[#E5E5E5]/60">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1A1A1A] text-[#00FF66] border border-[#2A2A2A]">
                          {rec.request_metadata?.latency_ms}ms latency
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-[#E5E5E5]/80">
                        <div>Scanned: {rec.summary?.total_scanned}</div>
                        <div>Ingested: {rec.summary?.newly_ingested} cases</div>
                        <div className="text-[#C5A059]">At Risk: ₹{rec.summary?.total_revenue_at_risk?.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#2A2A2A] bg-[#141414] flex items-center justify-between text-[11px] font-mono text-[#E5E5E5]/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00FF66]" />
            <span>Authenticated via Razorpay HMAC & Basic Credential Broker</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-[#222222] text-[#E5E5E5] border border-[#2A2A2A] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
