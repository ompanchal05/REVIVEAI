import React, { useState, useEffect } from 'react';
import {
  Cpu,
  BarChart2,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import { ModelPerformanceComparison } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';

export const ModelPerformanceView: React.FC = () => {
  const [data, setData] = useState<ModelPerformanceComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ml/performance')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load ML performance data:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-[#E5E5E5]/40 font-serif italic text-lg">
        <div className="inline-block animate-spin h-8 w-8 border-2 border-[#2A2A2A] border-t-[#C5A059] mb-4" />
        <p>Loading Machine Learning benchmarks & calibration curves...</p>
      </div>
    );
  }

  const champion = data.models.find((m) => m.model_name === data.champion_model) || data.models[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#2A2A2A]">
        <div>
          <div className="flex items-center space-x-2 text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-1">
            <Cpu className="h-3.5 w-3.5" />
            <span>Machine Learning Governance & Validation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
            Recovery Model Performance & Calibration
          </h1>
          <p className="text-xs text-[#E5E5E5]/60 mt-1 font-light max-w-2xl">
            Rigorous statistical comparison between XGBoost, Random Forest, and Logistic Regression with financial loss matrices.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#141414] border border-[#2A2A2A] px-3.5 py-2 text-xs shrink-0">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-mono">Champion:</span>
          <span className="text-[#C5A059] font-bold font-mono text-xs">{data.champion_model}</span>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-[#141414] border border-[#2A2A2A] overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex justify-between items-center bg-[#1A1A1A]">
          <div>
            <h2 className="text-sm font-serif italic text-white">Algorithm Benchmark Comparison</h2>
            <p className="text-xs text-[#E5E5E5]/50 font-light">Trained on 10,000+ historical payment recovery sequences</p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 border border-[#C5A059]/30">
            Validated Test Split
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E5E5E5]/80">
            <thead className="bg-[#0F0F0F] text-[#C5A059] uppercase text-[9px] tracking-[0.2em] font-mono border-b border-[#2A2A2A]">
              <tr>
                <th className="py-3 px-4 font-semibold">Model Architecture</th>
                <th className="py-3 px-4 font-semibold">ROC-AUC</th>
                <th className="py-3 px-4 font-semibold">PR-AUC</th>
                <th className="py-3 px-4 font-semibold">Precision</th>
                <th className="py-3 px-4 font-semibold">Recall</th>
                <th className="py-3 px-4 font-semibold">F1 Score</th>
                <th className="py-3 px-4 font-semibold">Brier Score</th>
                <th className="py-3 px-4 font-semibold">Dollar Recovery</th>
                <th className="py-3 px-4 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {data.models.map((m) => {
                const isChampion = m.model_name === data.champion_model;
                return (
                  <tr key={m.model_name} className={isChampion ? 'bg-[#C5A059]/5' : 'hover:bg-[#1A1A1A]/50 transition'}>
                    <td className="py-3.5 px-4 font-mono font-semibold text-white flex items-center space-x-2">
                      <span>{m.model_name}</span>
                      {isChampion && (
                        <span className="px-1.5 py-0.5 text-[8px] bg-[#C5A059] text-[#0F0F0F] font-bold uppercase tracking-wider">
                          CHAMPION
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#C5A059]">{m.roc_auc.toFixed(3)}</td>
                    <td className="py-3.5 px-4 font-mono">{m.pr_auc.toFixed(3)}</td>
                    <td className="py-3.5 px-4 font-mono">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 font-mono">{m.f1_score.toFixed(3)}</td>
                    <td className="py-3.5 px-4 font-mono text-[#E5E5E5]/40">{m.brier_score.toFixed(3)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#00FF66]">{(m.dollar_recovery_ratio * 100).toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                          isChampion ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30' : 'text-[#E5E5E5]/40'
                        }`}
                      >
                        {isChampion ? 'Active Serving' : 'Shadow'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Dives: Confusion Matrix & Calibration Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-serif italic text-white">Confusion Matrix ({champion.model_name})</h2>
            <p className="text-xs text-[#E5E5E5]/50 font-light">Evaluating false positives (preventing customer harassment)</p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
            <div className="p-4 bg-[#0F0F0F] border border-[#00FF66]/30 text-center">
              <div className="text-[10px] text-[#00FF66] font-mono font-semibold uppercase tracking-wider">True Positives (TP)</div>
              <div className="text-2xl font-serif text-white mt-1">{champion.confusion_matrix.tp}</div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">Interventions yielding settlement</div>
            </div>

            <div className="p-4 bg-[#0F0F0F] border border-[#D45555]/30 text-center">
              <div className="text-[10px] text-[#D45555] font-mono font-semibold uppercase tracking-wider">False Positives (FP)</div>
              <div className="text-2xl font-serif text-[#D45555] mt-1">{champion.confusion_matrix.fp}</div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">Attempted recovery without success</div>
            </div>

            <div className="p-4 bg-[#0F0F0F] border border-[#2A2A2A] text-center">
              <div className="text-[10px] text-[#E5E5E5]/40 font-mono font-semibold uppercase tracking-wider">False Negatives (FN)</div>
              <div className="text-2xl font-serif text-[#E5E5E5]/60 mt-1">{champion.confusion_matrix.fn}</div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">Missed solvable opportunities</div>
            </div>

            <div className="p-4 bg-[#0F0F0F] border border-[#2A2A2A] text-center">
              <div className="text-[10px] text-[#C5A059] font-mono font-semibold uppercase tracking-wider">True Negatives (TN)</div>
              <div className="text-2xl font-serif text-white mt-1">{champion.confusion_matrix.tn}</div>
              <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">Accurately spared from retry spam</div>
            </div>
          </div>

          <div className="text-xs text-[#E5E5E5]/50 font-light pt-3 border-t border-[#2A2A2A]">
            ReviveAI prioritizes precision to eliminate customer friction and preserve trust with payment gateways.
          </div>
        </div>

        {/* Calibration Curve */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-serif italic text-white">Probability Calibration Curve</h2>
            <p className="text-xs text-[#E5E5E5]/50 font-light mb-4">Predicted recovery score vs actual observed success rate</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.calibration_curve}>
                <CartesianGrid stroke="#1F1F1F" strokeDasharray="3 3" />
                <XAxis dataKey="predicted" stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <YAxis stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#E5E5E5' }}
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Line type="monotone" dataKey="predicted" stroke="#444444" strokeDasharray="4 4" name="Perfect Calibration" dot={false} />
                <Line type="monotone" dataKey="observed" stroke="#C5A059" strokeWidth={2.5} name="Observed Recovery" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importance & Probability Deciles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Feature Importance */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-serif italic text-white mb-1">Global Feature Importance (SHAP Weights)</h2>
          <p className="text-xs text-[#E5E5E5]/50 font-light mb-4">Relative contribution to recovery probability scoring</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.feature_importance} layout="vertical">
                <XAxis type="number" stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" domain={[0, 0.35]} />
                <YAxis dataKey="feature" type="category" stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#E5E5E5' }}
                  formatter={(val: any) => [(Number(val) * 100).toFixed(1) + '%', 'SHAP Weight']}
                />
                <Bar dataKey="importance" fill="#C5A059" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Probability Decile Breakdown */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm overflow-hidden">
          <h2 className="text-lg font-serif italic text-white mb-1">Recovery by Probability Decile</h2>
          <p className="text-xs text-[#E5E5E5]/50 font-light mb-4">High probability buckets yield &gt; 80% confirmed settlement</p>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-left text-xs text-[#E5E5E5]/80">
              <thead className="bg-[#0F0F0F] text-[#C5A059] uppercase text-[9px] tracking-[0.2em] font-mono border-b border-[#2A2A2A]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Decile Bucket</th>
                  <th className="py-2.5 px-3 font-semibold">Cases</th>
                  <th className="py-2.5 px-3 font-semibold">At Risk</th>
                  <th className="py-2.5 px-3 font-semibold">Recovered</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Hit Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A] text-[11px] font-mono">
                {data.probability_buckets.map((b) => (
                  <tr key={b.bucket} className="hover:bg-[#1A1A1A]/40 transition">
                    <td className="py-2 px-3 font-medium text-white">{b.bucket}</td>
                    <td className="py-2 px-3 text-[#E5E5E5]/60">{b.case_count}</td>
                    <td className="py-2 px-3 text-[#E5E5E5]/40">{formatINR(b.revenue_at_risk, true)}</td>
                    <td className="py-2 px-3 font-semibold text-[#00FF66]">{formatINR(b.revenue_recovered, true)}</td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      {b.revenue_at_risk > 0 ? ((b.revenue_recovered / b.revenue_at_risk) * 100).toFixed(0) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
