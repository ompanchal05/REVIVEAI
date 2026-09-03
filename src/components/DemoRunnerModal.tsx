import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { formatINR, formatPercent } from '../utils/formatters';

interface DemoRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export const DemoRunnerModal: React.FC<DemoRunnerModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
}) => {
  if (!isOpen) return null;

  const [batchSize, setBatchSize] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>('Ready to start');
  const [result, setResult] = useState<any | null>(null);

  const startBatch = async () => {
    setIsRunning(true);
    setProgress(15);
    setStage('Ingesting failed transaction batch from Razorpay...');

    setTimeout(() => {
      setProgress(40);
      setStage('Running XGBoost ML probability estimation...');
    }, 400);

    setTimeout(() => {
      setProgress(70);
      setStage('Evaluating deterministic safety policies & opt-out rules...');
    }, 800);

    try {
      const res = await fetch('/api/demo/run-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_size: batchSize })
      });
      const data = await res.json();
      setProgress(100);
      setStage('Completed: Outcomes verified with gateway ledger');
      setResult(data);
      onCompleted();
    } catch (err) {
      console.error('Failed to run batch demo:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Autonomous Revenue Recovery Simulator</h2>
              <p className="text-xs text-slate-400">Run an automated cohort through the entire 5-stage pipeline</p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {!result ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">What this batch simulation does:</strong>
                <ol className="list-decimal pl-4 mt-2 space-y-1.5 text-slate-400">
                  <li>Ingests 100 realistic payment failures (UPI drops, card declines, mandate timeouts).</li>
                  <li>Generates XGBoost probability scores and SHAP feature attribution weights.</li>
                  <li>Applies deterministic financial policies (stops opted-out customers, caps retries, flags high-value &gt; ₹10k).</li>
                  <li>Simulates bounded Razorpay intervention dispatches (payment links, scheduled retries).</li>
                  <li>Verifies outcomes against real gateway settlement ledgers to prove recovered money.</li>
                </ol>
              </div>

              {isRunning && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-medium text-emerald-400">{stage}</span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  id="start-demo-batch-btn"
                  onClick={startBatch}
                  disabled={isRunning}
                  className="px-6 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 rounded-lg shadow-lg transition flex items-center space-x-2"
                >
                  <Play className={`h-4 w-4 fill-slate-950 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Processing Batch Pipeline...' : 'Start 100-Case Simulation'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Completed Results Banner */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                <h3 className="text-lg font-extrabold text-white">Batch Recovery Simulation Completed</h3>
                <p className="text-xs text-slate-300 mt-1">
                  100 cases processed through ML scoring, deterministic policy validation, and gateway reconciliation.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Revenue At Risk</div>
                  <div className="text-base font-bold text-white mt-1">{formatINR(result.revenue_at_risk)}</div>
                </div>

                <div className="p-3 bg-emerald-950/30 rounded-lg border border-emerald-500/30 text-center">
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold">Revenue Recovered</div>
                  <div className="text-base font-bold text-white mt-1">{formatINR(result.revenue_recovered)}</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Recovery Rate</div>
                  <div className="text-base font-bold text-teal-400 mt-1">{result.recovery_rate}%</div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Incremental Lift</div>
                  <div className="text-base font-bold text-emerald-400 mt-1">+{formatINR(result.incremental_revenue)}</div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Policy Safeguard Impact:</span>
                  <div className="font-semibold text-white mt-0.5">
                    {result.stopped_by_policy} cases safely stopped • {result.human_escalations} routed to human review
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Disruptive Retries Avoided:</span>
                  <div className="font-bold text-amber-400 mt-0.5">{result.actions_avoided}</div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setProgress(0);
                  }}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  Run Another Batch
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow"
                >
                  Inspect Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
