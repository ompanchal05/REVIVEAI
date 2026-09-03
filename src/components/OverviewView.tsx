import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Sparkles,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { DashboardMetrics, RecoveryCase } from '../types';
import { formatINR, formatPercent, formatTimeAgo, getStatusBadgeStyle, getRiskBadgeStyle } from '../utils/formatters';

interface OverviewViewProps {
  metrics: DashboardMetrics | null;
  cases: RecoveryCase[];
  onSelectCase: (caseItem: RecoveryCase) => void;
  onNavigateToQueue: () => void;
  onNavigateToExperiments: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  metrics,
  cases,
  onSelectCase,
  onNavigateToQueue,
  onNavigateToExperiments,
}) => {
  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-700 border-t-emerald-500 mb-4" />
        <p>Loading real-time revenue recovery metrics...</p>
      </div>
    );
  }

  const highPriorityCases = cases
    .filter((c) => c.status === 'AWAITING_HUMAN' || c.risk_level === 'CRITICAL' || c.amount > 25000)
    .slice(0, 5);

  const failureReasonColors = ['#C5A059', '#D4B36D', '#E0A84D', '#A38035', '#7A6026', '#E5E5E5', '#888888'];

  return (
    <div className="space-y-6">
      {/* Product Hero Banner */}
      <div className="bg-[#141414] border border-[#2A2A2A] p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A059] opacity-[0.03] pointer-events-none rounded-full blur-3xl" />
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="w-12 h-[1px] bg-[#C5A059] mb-4" />
            <div className="flex items-center space-x-2 text-[#C5A059] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
              <Zap className="h-3.5 w-3.5 text-[#C5A059]" />
              <span>Razorpay AI Revenue Recovery Controller</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif italic text-white tracking-tight leading-tight">
              Architecting Recovery. <span className="not-italic font-sans text-2xl font-light text-[#E5E5E5]/70 block sm:inline sm:ml-2">Prove every rupee.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#E5E5E5]/60 mt-3 max-w-3xl font-light leading-relaxed">
              Deterministic financial policy bounds ML predictions and generative AI recommendations. Every rupee recovered is reconciled with verified gateway settlement.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              type="button"
              id="view-all-cases-btn"
              onClick={onNavigateToQueue}
              className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-medium bg-[#1A1A1A] hover:bg-[#222222] text-[#E5E5E5] border border-[#2A2A2A] hover:border-[#C5A059]/50 transition"
            >
              View Queue ({metrics.active_cases} Active)
            </button>
            <button
              type="button"
              id="view-experiments-btn"
              onClick={onNavigateToExperiments}
              className="px-4 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold bg-[#C5A059] hover:bg-[#D4B36D] text-[#0F0F0F] border border-[#C5A059] shadow-lg transition"
            >
              Baseline vs AI Strategy
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (Hero metric: REVENUE RECOVERED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HERO METRIC: REVENUE RECOVERED */}
        <div className="bg-[#141414] border border-[#C5A059]/60 p-5 relative overflow-hidden shadow-md">
          <div className="absolute inset-0 bg-[#C5A059] opacity-[0.03] pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
              Hero Metric
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#1A1A1A] text-[#C5A059] border border-[#C5A059]/30">
              Verified Settlement
            </span>
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-medium">REVENUE RECOVERED</div>
            <div className="text-3xl font-serif text-white mt-1 tracking-tight">
              {formatINR(metrics.revenue_recovered)}
            </div>
            <div className="mt-2 flex items-center text-xs text-[#00FF66] space-x-1.5 font-mono">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+{formatINR(metrics.baseline_comparison.incremental_revenue)} vs Baseline</span>
            </div>
          </div>
        </div>

        {/* REVENUE AT RISK */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#E5E5E5]/50">
              Total Ingested
            </span>
            <AlertTriangle className="h-4 w-4 text-[#C5A059]" />
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-medium">Revenue At Risk</div>
            <div className="text-2xl font-serif text-white mt-1">
              {formatINR(metrics.revenue_at_risk)}
            </div>
            <div className="mt-2 text-[11px] text-[#E5E5E5]/40 font-light">
              Across failed payments & invoices
            </div>
          </div>
        </div>

        {/* RECOVERY RATE */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#E5E5E5]/50">
              Efficiency
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#00FF66]" />
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-medium">Recovery Rate</div>
            <div className="text-2xl font-serif text-[#C5A059] mt-1">
              {formatPercent(metrics.recovery_rate)}
            </div>
            <div className="mt-2 text-[11px] text-[#E5E5E5]/50 flex items-center space-x-1.5 font-mono">
              <span>Baseline: {formatPercent(metrics.baseline_comparison.baseline_recovery_rate)}</span>
              <span className="text-[#00FF66] font-semibold">(+{formatPercent(metrics.recovery_rate - metrics.baseline_comparison.baseline_recovery_rate)})</span>
            </div>
          </div>
        </div>

        {/* ACTIVE CASES & POLICY SAFEGUARDS */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#E5E5E5]/50">
              Active Control
            </span>
            <ShieldCheck className="h-4 w-4 text-[#C5A059]" />
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#E5E5E5]/50 font-medium">Active / Policy Blocked</div>
            <div className="text-2xl font-serif text-white mt-1">
              {metrics.active_cases} <span className="text-[#E5E5E5]/40 font-sans font-light text-base">/ {metrics.stopped_by_policy}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#E5E5E5]/40 font-light">
              {metrics.baseline_comparison.actions_avoided} disruptive attempts eliminated
            </div>
          </div>
        </div>
      </div>

      {/* AI vs Baseline Strategy Highlight Banner */}
      <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-9 w-9 bg-[#141414] border border-[#2A2A2A] text-[#C5A059] flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-[#C5A059]" />
          </div>
          <div>
            <div className="text-sm font-serif italic text-white">
              ReviveAI recovered <span className="text-[#C5A059] font-sans font-semibold not-italic">{formatINR(metrics.baseline_comparison.incremental_revenue)}</span> more than the baseline strategy
            </div>
            <div className="text-[11px] text-[#E5E5E5]/50 font-light mt-0.5">
              Based on empirical execution against blind 1x retry. Prevented {metrics.baseline_comparison.actions_avoided} redundant payment attempts while protecting customer goodwill.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onNavigateToExperiments}
          className="px-3.5 py-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#C5A059] hover:text-[#D4B36D] border border-[#C5A059]/40 hover:bg-[#C5A059]/10 transition shrink-0 flex items-center space-x-1.5"
        >
          <span>Inspect Methodology</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Charts Section: Recovery Trend & Recovery Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery Trend Area Chart */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-serif italic text-white">Revenue Recovery Performance</h2>
              <p className="text-[11px] text-[#E5E5E5]/50">Revenue at risk vs confirmed verified recoveries</p>
            </div>
            <div className="flex items-center space-x-4 text-[10px] uppercase tracking-wider font-mono">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-[#555555]" />
                <span className="text-[#E5E5E5]/60">At Risk</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-[#C5A059]" />
                <span className="text-[#C5A059] font-medium">Recovered</span>
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trends}>
                <defs>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAtRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A3A3A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3A3A3A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#555555" fontSize={10} fontStyle="italic" />
                <YAxis stroke="#555555" fontSize={10} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', color: '#E5E5E5' }}
                  formatter={(value: any) => [formatINR(Number(value)), '']}
                />
                <Area type="monotone" dataKey="revenue_at_risk" stroke="#555555" fillOpacity={1} fill="url(#colorAtRisk)" name="At Risk" />
                <Area type="monotone" dataKey="revenue_recovered" stroke="#C5A059" strokeWidth={2} fillOpacity={1} fill="url(#colorRecovered)" name="Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel: Stage-by-Stage Attrition */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-serif italic text-white">Recovery Stage Funnel</h2>
            <p className="text-[11px] text-[#E5E5E5]/50 mb-4">From detection to verified settlement</p>

            <div className="space-y-3.5">
              {metrics.recovery_funnel.map((f, idx) => {
                const pct = metrics.revenue_at_risk > 0 ? (f.amount / metrics.revenue_at_risk) * 100 : 0;
                return (
                  <div key={f.stage} className="text-xs">
                    <div className="flex justify-between text-[#E5E5E5]/80 mb-1 font-mono text-[11px]">
                      <span className="truncate uppercase tracking-wider">{f.stage}</span>
                      <span className="font-semibold text-white">{formatINR(f.amount, true)}</span>
                    </div>
                    <div className="w-full bg-[#1A1A1A] h-1.5 border border-[#2A2A2A] overflow-hidden">
                      <div
                        className={`h-full ${
                          idx === 4 ? 'bg-[#00FF66]' : idx === 3 ? 'bg-[#C5A059]' : 'bg-[#444444]'
                        }`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2A] text-[10px] uppercase tracking-widest text-[#E5E5E5]/40 mt-4">
            Deterministic policies gate actions before execution.
          </div>
        </div>
      </div>

      {/* Categorical Breakdowns: Failure Reason & Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery by Failure Reason */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm">
          <h2 className="text-sm font-serif italic text-white mb-1">Recovery by Failure Reason</h2>
          <p className="text-[11px] text-[#E5E5E5]/50 mb-4">Performance across transient vs structural payment errors</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.by_failure_reason.slice(0, 6)} layout="vertical">
                <XAxis type="number" stroke="#555555" fontSize={10} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <YAxis dataKey="reason" type="category" stroke="#555555" fontSize={10} width={130} tickFormatter={(str) => str.replace(/_/g, ' ')} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F0F0F', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', color: '#E5E5E5' }}
                  formatter={(value: any) => [formatINR(Number(value)), 'Recovered']}
                />
                <Bar dataKey="recovered" radius={0}>
                  {metrics.by_failure_reason.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={failureReasonColors[index % failureReasonColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recovery by Payment Method */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 shadow-sm">
          <h2 className="text-sm font-serif italic text-white mb-1">Recovery by Payment Instrument</h2>
          <p className="text-[11px] text-[#E5E5E5]/50 mb-4">Recovery success across UPI, Cards, Netbanking & Mandates</p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {metrics.by_payment_method.map((pm) => (
              <div key={pm.method} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif italic text-white">{pm.method}</span>
                  <span className="text-[#C5A059] font-mono font-bold">{pm.rate}%</span>
                </div>
                <div className="mt-2 text-[11px] text-[#E5E5E5]/50 font-mono">
                  <div>Recovered: <span className="text-white font-medium">{formatINR(pm.recovered)}</span></div>
                  <div>At Risk: <span className="text-[#E5E5E5]/40">{formatINR(pm.at_risk)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* High Priority Cases Queue Preview */}
      <div className="bg-[#141414] border border-[#2A2A2A] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#2A2A2A] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-serif italic text-white">High Priority Cases Requiring Review</h2>
            <p className="text-[11px] text-[#E5E5E5]/50">High-value, escalated, or critical recovery cases</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToQueue}
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#C5A059] hover:text-[#D4B36D] flex items-center space-x-1"
          >
            <span>Open Full Queue</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#E5E5E5]/80">
            <thead className="bg-[#1A1A1A] text-[#C5A059] uppercase text-[9px] tracking-[0.25em] border-b border-[#2A2A2A]">
              <tr>
                <th className="py-3 px-4 font-normal">Case / Customer</th>
                <th className="py-3 px-4 font-normal">Amount</th>
                <th className="py-3 px-4 font-normal">Failure Reason</th>
                <th className="py-3 px-4 font-normal">Probability</th>
                <th className="py-3 px-4 font-normal">Policy Decision</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 text-right font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {highPriorityCases.map((c) => {
                const statusBadge = getStatusBadgeStyle(c.status);
                const riskBadge = getRiskBadgeStyle(c.risk_level);
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c)}
                    className="hover:bg-[#1C1A14] cursor-pointer transition"
                  >
                    <td className="py-3 px-4">
                      <div className="font-serif text-white">{c.customer.name}</div>
                      <div className="text-[10px] font-mono text-[#E5E5E5]/40">{c.id} • {c.customer.segment}</div>
                    </td>
                    <td className="py-3 px-4 font-serif font-semibold text-white">
                      {formatINR(c.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#E5E5E5]/80">{c.failure_reason.replace(/_/g, ' ')}</span>
                      <div className="text-[10px] font-mono text-[#E5E5E5]/40">{c.payment_method}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold text-white">
                          {(c.recovery_probability * 100).toFixed(0)}%
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono ${riskBadge.bg}`}>
                          {c.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider ${
                          c.policy_decision === 'ALLOW'
                            ? 'bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30'
                            : c.policy_decision === 'HUMAN_REVIEW'
                            ? 'bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.policy_decision}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c);
                        }}
                        className="p-1 text-[#E5E5E5]/40 hover:text-white transition"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
